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

export interface WordSegment {
  word: string;
  confidence: number;
  isFinal: boolean;
  timestamp: number;
}

interface VoiceDictationOptions {
  /** Language / locale — default "en-US" */
  lang?: string;
  /** Pick best from N alternatives (1–5) — default 3 */
  maxAlternatives?: number;
  /** Auto-restart on transient errors — default true */
  autoRestart?: boolean;
  /** Max consecutive restart attempts before giving up — default 5 */
  maxRestarts?: number;
  /** Enable medical terminology correction — default false */
  medicalMode?: boolean;
  /** Minimum confidence threshold (0-1) — default 0.0 (accept all) */
  confidenceThreshold?: number;
  /** Callback fired every time new text is produced */
  onTranscript?: (text: string) => void;
  /** Callback fired on final (committed) transcript chunk */
  onFinalChunk?: (chunk: string, confidence: number) => void;
  /** Callback when an error occurs */
  onError?: (error: string) => void;
  /** Callback for real-time word segments */
  onWordSegment?: (segment: WordSegment) => void;
}

interface VoiceDictationReturn {
  /** Whether currently recording */
  isListening: boolean;
  /** The live transcript (final + interim combined) */
  liveTranscript: string;
  /** Only the interim (unconfirmed) portion of current speech */
  interimText: string;
  /** Only the final (confirmed) text so far */
  finalText: string;
  /** Elapsed seconds since recording started */
  elapsed: number;
  /** Rough volume level 0–1 (from AudioContext analyser) */
  volume: number;
  /** Whether the browser supports Web Speech API */
  isSupported: boolean;
  /** Average confidence of all final results (0-1) */
  avgConfidence: number;
  /** Word segments with individual confidence */
  wordSegments: WordSegment[];
  /** Total word count of finalized text */
  wordCount: number;
  /** Start recording. Pass existing text to prepend. */
  start: (existingText?: string) => void;
  /** Stop recording and return the final combined text */
  stop: () => string;
}

/* ── Best-alternative picker ─────────────────────────────────────── */

function pickBestAlternative(result: SpeechRecognitionResultType): { text: string; confidence: number } {
  let best = result[0].transcript;
  let bestConf: number = result[0].confidence || 0;

  for (let a = 1; a < result.length; a++) {
    const alt = result[a];
    if (alt.confidence > bestConf) {
      bestConf = alt.confidence;
      best = alt.transcript;
    }
  }
  return { text: best, confidence: bestConf };
}

/* ── Auto-punctuation heuristic ──────────────────────────────────── */

const SENTENCE_END_WORDS = /\b(period|full stop|comma|question mark|exclamation mark|new line|new paragraph|colon|semicolon|open parenthesis|close parenthesis|dash|hyphen)\b/gi;
const PUNCTUATION_MAP: Record<string, string> = {
  period: ".",
  "full stop": ".",
  comma: ",",
  "question mark": "?",
  "exclamation mark": "!",
  "new line": "\n",
  "new paragraph": "\n\n",
  colon: ":",
  semicolon: ";",
  "open parenthesis": "(",
  "close parenthesis": ")",
  dash: "—",
  hyphen: "-",
};

function applyVoicePunctuation(text: string): string {
  return text.replace(SENTENCE_END_WORDS, (match) => {
    return PUNCTUATION_MAP[match.toLowerCase()] || match;
  });
}

/* ── Medical terminology correction ──────────────────────────────── */

const MEDICAL_CORRECTIONS: Record<string, string> = {
  // Common misrecognitions of drug names
  "aspirine": "Aspirin",
  "asprin": "Aspirin",
  "metropolol": "Metoprolol",
  "metoperal": "Metoprolol",
  "lisinopril": "Lisinopril",
  "amlodipine": "Amlodipine",
  "omeprazol": "Omeprazole",
  "atorvastatin": "Atorvastatin",
  "amoxicillin": "Amoxicillin",
  "metformin": "Metformin",
  "gabapenten": "Gabapentin",
  "losartan": "Losartan",
  "hydrochlorothiazide": "Hydrochlorothiazide",
  "prednisone": "Prednisone",
  "warfarin": "Warfarin",
  "cloppidogrel": "Clopidogrel",
  "clopidogrel": "Clopidogrel",

  // Common medical abbreviations misheard
  "st elevation": "ST elevation",
  "st depression": "ST depression",
  "troponin": "Troponin",
  "tropinine": "Troponin",
  "hemoglobin": "Hemoglobin",
  "haemoglobin": "Hemoglobin",
  "hematocrit": "Hematocrit",
  "creatinine": "Creatinine",
  "creatinin": "Creatinine",
  "bilirubin": "Bilirubin",
  "billiruben": "Bilirubin",

  // Common conditions
  "myocardial infarction": "Myocardial Infarction",
  "mi": "MI",
  "hypertension": "Hypertension",
  "diabetes mellitus": "Diabetes Mellitus",
  "atrial fibrillation": "Atrial Fibrillation",
  "a fib": "AFib",
  "afib": "AFib",
  "pneumonia": "Pneumonia",
  "copd": "COPD",
  "congestive heart failure": "Congestive Heart Failure",
  "chf": "CHF",
  "dvt": "DVT",
  "pulmonary embolism": "Pulmonary Embolism",
  "pe": "PE",

  // Vitals & measurements
  "millimeters of mercury": "mmHg",
  "milligrams": "mg",
  "micrograms": "mcg",
  "milliliters": "mL",
  "milligrams per deciliter": "mg/dL",
  "nanograms per ml": "ng/mL",
  "beats per minute": "bpm",
  "breaths per minute": "breaths/min",
  "degrees fahrenheit": "°F",
  "degrees celsius": "°C",

  // Common medical terms
  "ecg": "ECG",
  "ekg": "EKG",
  "cbc": "CBC",
  "bmp": "BMP",
  "cmp": "CMP",
  "ct scan": "CT scan",
  "mri": "MRI",
  "bmi": "BMI",
  "icd": "ICD",
  "cpt": "CPT",
  "soap": "SOAP",
  "prn": "PRN",
  "bid": "BID",
  "tid": "TID",
  "qid": "QID",
  "po": "PO",
  "iv": "IV",
  "im": "IM",
  "sub q": "SubQ",
  "sublingual": "Sublingual",
};

function applyMedicalCorrections(text: string): string {
  let corrected = text;
  for (const [wrong, right] of Object.entries(MEDICAL_CORRECTIONS)) {
    const regex = new RegExp(`\\b${wrong}\\b`, "gi");
    corrected = corrected.replace(regex, right);
  }
  return corrected;
}

/* ── Capitalize sentence starts ──────────────────────────────────── */

function capitalizeSentences(text: string): string {
  return text.replace(/(^|[.!?\n]\s*)([a-z])/g, (_match, prefix, letter) => {
    return prefix + letter.toUpperCase();
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
    medicalMode = false,
    confidenceThreshold = 0.0,
    onTranscript,
    onFinalChunk,
    onError,
    onWordSegment,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [finalText, setFinalText] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [volume, setVolume] = useState(0);
  const [avgConfidence, setAvgConfidence] = useState(0);
  const [wordSegments, setWordSegments] = useState<WordSegment[]>([]);
  const [wordCount, setWordCount] = useState(0);

  // Refs to survive re-renders
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const textBeforeRef = useRef("");
  const finalChunksRef = useRef("");
  const restartCountRef = useRef(0);
  const intentionalStopRef = useRef(false);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const confidenceSumRef = useRef(0);
  const confidenceCountRef = useRef(0);

  // Audio analyser for volume meter
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  // Stable callback refs
  const onTranscriptRef = useRef(onTranscript);
  const onFinalChunkRef = useRef(onFinalChunk);
  const onErrorRef = useRef(onError);
  const onWordSegmentRef = useRef(onWordSegment);
  useEffect(() => { onTranscriptRef.current = onTranscript; }, [onTranscript]);
  useEffect(() => { onFinalChunkRef.current = onFinalChunk; }, [onFinalChunk]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);
  useEffect(() => { onWordSegmentRef.current = onWordSegment; }, [onWordSegment]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const SpeechRecognitionApi =
    typeof window !== "undefined"
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const isSupported = !!SpeechRecognitionApi;

  /* ── Post-process text ── */
  const postProcess = useCallback((text: string): string => {
    let result = applyVoicePunctuation(text);
    if (medicalMode) {
      result = applyMedicalCorrections(result);
    }
    result = capitalizeSentences(result);
    return result;
  }, [medicalMode]);

  /* ── Volume analyser loop ── */
  const startVolumeAnalyser = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        analyser.getByteFrequencyData(dataArray);
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
      confidenceSumRef.current = 0;
      confidenceCountRef.current = 0;

      setInterimText("");
      setFinalText(existingText);
      setWordSegments([]);
      setWordCount(existingText ? existingText.trim().split(/\s+/).length : 0);
      setAvgConfidence(0);

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
          const { text: best, confidence } = pickBestAlternative(result);

          if (result.isFinal) {
            // Skip low-confidence results if threshold is set
            if (confidence > 0 && confidence < confidenceThreshold) {
              continue;
            }

            const punctuated = postProcess(best);
            finalAccumulated += punctuated;

            // Track confidence
            if (confidence > 0) {
              confidenceSumRef.current += confidence;
              confidenceCountRef.current++;
              setAvgConfidence(
                confidenceSumRef.current / confidenceCountRef.current
              );
            }

            // Emit word segments
            const words = punctuated.trim().split(/\s+/);
            const now = Date.now();
            words.forEach((word) => {
              if (word) {
                const segment: WordSegment = {
                  word,
                  confidence,
                  isFinal: true,
                  timestamp: now,
                };
                setWordSegments((prev) => [...prev, segment]);
                onWordSegmentRef.current?.(segment);
              }
            });
          } else {
            interimAccumulated += best;

            // Emit interim word segments
            const words = best.trim().split(/\s+/);
            const now = Date.now();
            words.forEach((word) => {
              if (word) {
                onWordSegmentRef.current?.({
                  word,
                  confidence,
                  isFinal: false,
                  timestamp: now,
                });
              }
            });
          }
        }

        // Track final chunks for the stop() return value
        if (finalAccumulated && finalAccumulated !== finalChunksRef.current) {
          const newChunk = finalAccumulated.slice(finalChunksRef.current.length);
          if (newChunk.trim()) {
            const avgConf = confidenceCountRef.current > 0
              ? confidenceSumRef.current / confidenceCountRef.current
              : 0;
            onFinalChunkRef.current?.(newChunk, avgConf);
          }
        }
        finalChunksRef.current = finalAccumulated;

        // Build the full live text
        const base = textBeforeRef.current;
        const sep = base && (finalAccumulated || interimAccumulated) ? " " : "";
        const fullText = base + sep + finalAccumulated + (interimAccumulated ? interimAccumulated : "");

        setLiveTranscript(fullText);
        setInterimText(interimAccumulated);
        setFinalText(base + (base && finalAccumulated ? " " : "") + finalAccumulated);
        setWordCount(fullText.trim() ? fullText.trim().split(/\s+/).length : 0);
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
    [SpeechRecognitionApi, lang, maxAlternatives, autoRestart, maxRestarts, confidenceThreshold, postProcess, startVolumeAnalyser, stopVolumeAnalyser]
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
    interimText,
    finalText,
    elapsed,
    volume,
    isSupported,
    avgConfidence,
    wordSegments,
    wordCount,
    start,
    stop,
  };
}
