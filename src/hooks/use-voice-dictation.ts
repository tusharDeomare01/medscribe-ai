"use client";

import { useState, useRef, useCallback, useEffect } from "react";

/* ── Web Speech API type shims (not in all TS libs) ─────────────── */
/* eslint-disable @typescript-eslint/no-explicit-any */
type SpeechRecognitionType = any;
type SpeechRecognitionEventType = any;
type SpeechRecognitionErrorEventType = any;
type SpeechRecognitionResultType = any;
/* eslint-enable @typescript-eslint/no-explicit-any */

/* ── Types ───────────────────────────────────────────────────────── */

interface VoiceDictationOptions {
  /** Language / locale — default "en-US" */
  lang?: string;
  /** Pick best from N alternatives (1–5) — default 3 */
  maxAlternatives?: number;
  /** Auto-restart on transient errors — default true */
  autoRestart?: boolean;
  /** Max consecutive restart attempts before giving up — default 5 */
  maxRestarts?: number;
  /** Callback fired every time new text is produced */
  onTranscript?: (text: string) => void;
  /** Callback fired on final (committed) transcript chunk */
  onFinalChunk?: (chunk: string) => void;
  /** Callback when an error occurs */
  onError?: (error: string) => void;
}

interface VoiceDictationReturn {
  /** Whether currently recording */
  isListening: boolean;
  /** The live transcript (final + interim combined) */
  liveTranscript: string;
  /** Elapsed seconds since recording started */
  elapsed: number;
  /** Rough volume level 0–1 (from AudioContext analyser) */
  volume: number;
  /** Whether the browser supports Web Speech API */
  isSupported: boolean;
  /** Start recording. Pass existing text to prepend. */
  start: (existingText?: string) => void;
  /** Stop recording and return the final combined text */
  stop: () => string;
}

/* ── Best-alternative picker ─────────────────────────────────────── */

function pickBestAlternative(result: SpeechRecognitionResultType): string {
  let best = result[0].transcript;
  let bestConf = result[0].confidence || 0;

  for (let a = 1; a < result.length; a++) {
    const alt = result[a];
    if (alt.confidence > bestConf) {
      bestConf = alt.confidence;
      best = alt.transcript;
    }
  }
  return best;
}

/* ── Auto-punctuation heuristic ──────────────────────────────────── */

const SENTENCE_END_WORDS = /\b(period|full stop|comma|question mark|exclamation mark|new line|new paragraph)\b/gi;
const PUNCTUATION_MAP: Record<string, string> = {
  period: ".",
  "full stop": ".",
  comma: ",",
  "question mark": "?",
  "exclamation mark": "!",
  "new line": "\n",
  "new paragraph": "\n\n",
};

function applyVoicePunctuation(text: string): string {
  return text.replace(SENTENCE_END_WORDS, (match) => {
    return PUNCTUATION_MAP[match.toLowerCase()] || match;
  });
}

/* ── Hook ─────────────────────────────────────────────────────────── */

export function useVoiceDictation(
  options: VoiceDictationOptions = {}
): VoiceDictationReturn {
  const {
    lang = "en-US",
    maxAlternatives = 3,
    autoRestart = true,
    maxRestarts = 5,
    onTranscript,
    onFinalChunk,
    onError,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [volume, setVolume] = useState(0);

  // Refs to survive re-renders
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const textBeforeRef = useRef("");
  const finalChunksRef = useRef("");
  const restartCountRef = useRef(0);
  const intentionalStopRef = useRef(false);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Audio analyser for volume meter
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  // Stable callback refs
  const onTranscriptRef = useRef(onTranscript);
  const onFinalChunkRef = useRef(onFinalChunk);
  const onErrorRef = useRef(onError);
  useEffect(() => { onTranscriptRef.current = onTranscript; }, [onTranscript]);
  useEffect(() => { onFinalChunkRef.current = onFinalChunk; }, [onFinalChunk]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const SpeechRecognitionApi =
    typeof window !== "undefined"
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const isSupported = !!SpeechRecognitionApi;

  /* ── Volume analyser loop ── */
  const startVolumeAnalyser = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        analyser.getByteFrequencyData(dataArray);
        // Average of frequency bins → normalised 0-1
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setVolume(Math.min(avg / 128, 1));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      // Microphone access may already be granted via SpeechRecognition;
      // volume meter is a nice-to-have, not critical
    }
  }, []);

  const stopVolumeAnalyser = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    setVolume(0);
  }, []);

  /* ── Start ── */
  const start = useCallback(
    (existingText = "") => {
      if (!SpeechRecognitionApi) {
        onErrorRef.current?.("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
        return;
      }

      // Clean up any previous session
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* noop */ }
      }

      textBeforeRef.current = existingText;
      finalChunksRef.current = "";
      restartCountRef.current = 0;
      intentionalStopRef.current = false;

      const recognition: SpeechRecognitionType = new SpeechRecognitionApi();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;
      recognition.maxAlternatives = maxAlternatives;

      recognition.onresult = (event: SpeechRecognitionEventType) => {
        restartCountRef.current = 0; // Successful result → reset restart counter

        let finalAccumulated = "";
        let interimAccumulated = "";

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          const best = pickBestAlternative(result);

          if (result.isFinal) {
            const punctuated = applyVoicePunctuation(best);
            finalAccumulated += punctuated;
          } else {
            interimAccumulated += best;
          }
        }

        // Track final chunks for the stop() return value
        if (finalAccumulated && finalAccumulated !== finalChunksRef.current) {
          const newChunk = finalAccumulated.slice(finalChunksRef.current.length);
          if (newChunk.trim()) onFinalChunkRef.current?.(newChunk);
        }
        finalChunksRef.current = finalAccumulated;

        // Build the full live text
        const base = textBeforeRef.current;
        const sep = base && (finalAccumulated || interimAccumulated) ? " " : "";
        const fullText = base + sep + finalAccumulated + (interimAccumulated ? interimAccumulated : "");

        setLiveTranscript(fullText);
        onTranscriptRef.current?.(fullText);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEventType) => {
        const err = event.error;

        // Non-recoverable errors
        if (err === "not-allowed" || err === "service-not-allowed") {
          onErrorRef.current?.("Microphone access denied. Please enable microphone permissions in your browser settings.");
          intentionalStopRef.current = true;
          setIsListening(false);
          stopVolumeAnalyser();
          return;
        }
        if (err === "audio-capture") {
          onErrorRef.current?.("No microphone detected. Please connect a microphone and try again.");
          intentionalStopRef.current = true;
          setIsListening(false);
          stopVolumeAnalyser();
          return;
        }

        // Transient errors — let onend handle restart
        if (err === "network" || err === "aborted" || err === "no-speech") {
          // no-speech is common during pauses — silently allow restart
          if (err !== "no-speech") {
            onErrorRef.current?.(`Speech recognition error: ${err}. Attempting to reconnect...`);
          }
        }
      };

      recognition.onend = () => {
        if (intentionalStopRef.current) return;

        // Auto-restart if still supposed to be listening
        if (autoRestart && restartCountRef.current < maxRestarts) {
          restartCountRef.current++;
          try {
            recognition.start();
          } catch {
            setIsListening(false);
            stopVolumeAnalyser();
          }
        } else if (restartCountRef.current >= maxRestarts) {
          onErrorRef.current?.("Voice dictation stopped after multiple retries. Please try again.");
          setIsListening(false);
          stopVolumeAnalyser();
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
      setElapsed(0);

      // Elapsed timer
      elapsedTimerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);

      // Start volume analyser (non-blocking, best-effort)
      startVolumeAnalyser();
    },
    [SpeechRecognitionApi, lang, maxAlternatives, autoRestart, maxRestarts, startVolumeAnalyser, stopVolumeAnalyser]
  );

  /* ── Stop ── */
  const stop = useCallback((): string => {
    intentionalStopRef.current = true;

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* noop */ }
      recognitionRef.current = null;
    }

    // Elapsed timer
    if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = null;
    }

    stopVolumeAnalyser();
    setIsListening(false);

    // Build final text
    const base = textBeforeRef.current;
    const final = finalChunksRef.current;
    const sep = base && final ? " " : "";
    const result = base + sep + final;

    return result;
  }, [stopVolumeAnalyser]);

  /* ── Cleanup on unmount ── */
  useEffect(() => {
    return () => {
      intentionalStopRef.current = true;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* noop */ }
      }
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      stopVolumeAnalyser();
    };
  }, [stopVolumeAnalyser]);

  return {
    isListening,
    liveTranscript,
    elapsed,
    volume,
    isSupported,
    start,
    stop,
  };
}
