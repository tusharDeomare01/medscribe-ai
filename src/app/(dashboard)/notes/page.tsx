"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import {
  FileText,
  Mic,
  MicOff,
  Brain,
  Loader2,
  Save,
  Sparkles,
  AlertCircle,
  Timer,
} from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useVoiceDictation } from "@/hooks/use-voice-dictation";
import SpotlightCard from "@/components/SpotlightCard";
import AnimatedContent from "@/components/AnimatedContent";
import DecryptedText from "@/components/DecryptedText";

interface Entity {
  text: string;
  type: string;
  category: string;
  confidence: number;
  startOffset: number;
  endOffset: number;
}

interface Entities {
  medications: Entity[];
  diagnoses: Entity[];
  procedures: Entity[];
  symptoms: Entity[];
  labResults: Entity[];
}

interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

interface ICDCode {
  code: string;
  description: string;
  confidence: number;
}

const ENTITY_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  medications: { text: "text-sky-400", bg: "bg-sky-400/10", border: "border-sky-400/30" },
  diagnoses: { text: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/30" },
  procedures: { text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30" },
  symptoms: { text: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/30" },
  labResults: { text: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/30" },
};

const SOAP_COLORS = {
  subjective: "rgba(14, 165, 233, 0.12)",
  objective: "rgba(139, 92, 246, 0.12)",
  assessment: "rgba(16, 185, 129, 0.12)",
  plan: "rgba(245, 158, 11, 0.12)",
};

export default function ClinicalNotesPage() {
  const { getToken } = useAuth();
  const [rawText, setRawText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [entities, setEntities] = useState<Entities | null>(null);
  const [soapNote, setSOAPNote] = useState<SOAPNote | null>(null);
  const [icdCodes, setICDCodes] = useState<ICDCode[]>([]);
  const [noteType, setNoteType] = useState("progress_note");
  const [selectedPatient] = useState("");
  const toastShownRef = useRef(false);

  // Voice dictation hook — handles all speech recognition logic
  const {
    isListening,
    liveTranscript,
    elapsed,
    volume,
    isSupported: voiceSupported,
    start: startVoice,
    stop: stopVoice,
  } = useVoiceDictation({
    lang: "en-US",
    maxAlternatives: 3,
    autoRestart: true,
    maxRestarts: 5,
    onTranscript: useCallback((text: string) => {
      setRawText(text);
    }, []),
    onError: useCallback((err: string) => {
      toast.error(err);
    }, []),
  });

  // Sync live transcript → rawText while listening
  useEffect(() => {
    if (isListening && liveTranscript) {
      setRawText(liveTranscript);
    }
  }, [isListening, liveTranscript]);

  // Animate results when they appear
  useEffect(() => {
    if (soapNote || entities) {
      gsap.from(".result-card", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "back.out(1.2)",
      });
    }
  }, [soapNote, entities]);

  // Format elapsed time as mm:ss
  const formatElapsed = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const toggleVoice = () => {
    if (isListening) {
      const finalText = stopVoice();
      setRawText(finalText);
      toastShownRef.current = false;
      return;
    }

    if (!voiceSupported) {
      toast.error("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    startVoice(rawText);
    if (!toastShownRef.current) {
      toast.success("Listening... Start dictating your clinical note. Say \"period\", \"comma\" etc. for punctuation.");
      toastShownRef.current = true;
    }
  };

  const processNote = async () => {
    if (!rawText.trim()) {
      toast.error("Please enter or dictate a clinical note first");
      return;
    }

    setProcessing(true);
    setEntities(null);
    setSOAPNote(null);
    setICDCodes([]);

    try {
      const res = await fetch("/api/ai/process-note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ text: rawText }),
      });

      const data = await res.json();

      if (data.success) {
        setEntities(data.data.entities);
        setSOAPNote(data.data.soapNote);
        setICDCodes(data.data.icdCodes || []);
        toast.success("Note processed successfully!");
      } else {
        toast.error(data.error || "Processing failed");
      }
    } catch {
      toast.error("Failed to process note. Check your API key configuration.");
    } finally {
      setProcessing(false);
    }
  };

  const saveNote = async () => {
    if (!soapNote) {
      toast.error("Process the note first before saving");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          patientId: selectedPatient || undefined,
          noteType,
          rawText,
          entities,
          soapNote,
          icdCodes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Clinical note saved!");
      } else {
        toast.error(data.error || "Failed to save");
      }
    } catch {
      toast.error("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  // Render text with entity highlighting
  const renderHighlightedText = () => {
    if (!entities || !rawText) return rawText;

    const allEntities: (Entity & { color: typeof ENTITY_COLORS.medications })[] = [];
    for (const [category, ents] of Object.entries(entities)) {
      const color = ENTITY_COLORS[category] || ENTITY_COLORS.medications;
      for (const e of ents) {
        allEntities.push({ ...e, color });
      }
    }

    allEntities.sort((a, b) => a.startOffset - b.startOffset);

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    for (const entity of allEntities) {
      if (entity.startOffset > lastIndex) {
        parts.push(rawText.slice(lastIndex, entity.startOffset));
      }
      parts.push(
        <span
          key={`${entity.startOffset}-${entity.text}`}
          className={`${entity.color.text} ${entity.color.bg} px-1 py-0.5 rounded text-sm font-medium`}
          title={`${entity.type} (${(entity.confidence * 100).toFixed(0)}%)`}
        >
          {entity.text}
        </span>
      );
      lastIndex = entity.endOffset;
    }

    if (lastIndex < rawText.length) {
      parts.push(rawText.slice(lastIndex));
    }

    return parts.length > 0 ? parts : rawText;
  };

  const totalEntities = entities
    ? Object.values(entities).reduce((sum, arr) => sum + arr.length, 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <AnimatedContent distance={30} duration={0.6}>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" /> Clinical Notes
          </h1>
          <p className="text-muted-foreground mt-1">
            Dictate or type clinical notes — AI extracts entities and generates SOAP notes.
          </p>
        </div>
      </AnimatedContent>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <AnimatedContent distance={40} delay={0.1} duration={0.6}>
            <SpotlightCard
              className="border-border/50 bg-card/80 backdrop-blur-sm"
              spotlightColor="rgba(14, 165, 233, 0.12)"
            >
              <CardHeader className="px-0 pt-0 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Note Input</CardTitle>
                  <Select value={noteType} onValueChange={setNoteType}>
                    <SelectTrigger className="w-[160px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="progress_note">Progress Note</SelectItem>
                      <SelectItem value="admission">Admission</SelectItem>
                      <SelectItem value="discharge_summary">Discharge Summary</SelectItem>
                      <SelectItem value="consultation">Consultation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="px-0 pb-0 space-y-4">
                <div className="relative">
                  <Textarea
                    placeholder="Type or dictate your clinical note here...&#10;&#10;Example: Patient presents with chest pain radiating to left arm. Started on Aspirin 325mg and Metoprolol 50mg. ECG shows ST elevation. Troponin elevated at 2.4 ng/mL. Suspected acute MI."
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    rows={10}
                    className="resize-none pr-12"
                    readOnly={isListening}
                  />
                  {isListening && (
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[11px] font-medium text-red-500">REC</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Voice status bar — visible when recording */}
                {isListening && (
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-red-500/5 border border-red-500/15">
                    {/* Volume meter bars */}
                    <div className="flex items-end gap-0.5 h-4">
                      {[0.15, 0.3, 0.45, 0.6, 0.75].map((threshold, i) => (
                        <div
                          key={i}
                          className="w-1 rounded-full transition-all duration-100"
                          style={{
                            height: volume > threshold ? `${12 + i * 2}px` : "4px",
                            backgroundColor:
                              volume > threshold
                                ? "hsl(var(--destructive))"
                                : "hsl(var(--muted-foreground) / 0.3)",
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">Listening...</span>
                    <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Timer className="w-3 h-3" />
                      {formatElapsed(elapsed)}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant={isListening ? "destructive" : "outline"}
                    className="gap-2"
                    onClick={toggleVoice}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-4 h-4" /> Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" /> Voice Dictation
                      </>
                    )}
                  </Button>

                  <Button
                    className="gap-2 flex-1"
                    onClick={processNote}
                    disabled={processing || !rawText.trim() || isListening}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4" /> Process with AI
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </SpotlightCard>
          </AnimatedContent>

          {/* Entity Highlighted Text */}
          {entities && (
            <SpotlightCard
              className="result-card border-border/50 bg-card/80 backdrop-blur-sm"
              spotlightColor="rgba(139, 92, 246, 0.12)"
            >
              <CardHeader className="px-0 pt-0 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" /> Detected Entities
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {totalEntities} found
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <div className="bg-muted/30 rounded-lg p-4 text-sm leading-relaxed font-mono">
                  {renderHighlightedText()}
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {Object.entries(ENTITY_COLORS).map(([key, color]) => {
                    const count = entities[key as keyof Entities]?.length || 0;
                    if (count === 0) return null;
                    return (
                      <Badge key={key} variant="outline" className={`text-xs ${color.text} ${color.border}`}>
                        {key} ({count})
                      </Badge>
                    );
                  })}
                </div>
              </CardContent>
            </SpotlightCard>
          )}
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          {processing ? (
            <AnimatedContent distance={30} duration={0.5}>
              <SpotlightCard
                className="border-border/50 bg-card/80 backdrop-blur-sm"
                spotlightColor="rgba(99, 102, 241, 0.12)"
              >
                <div className="py-10 text-center space-y-4">
                  <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
                  <div className="text-lg font-semibold">
                    <DecryptedText
                      text="Extracting medical entities..."
                      animateOn="view"
                      speed={40}
                      sequential
                      revealDirection="start"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">Analyzing clinical text with AI</p>
                </div>
              </SpotlightCard>
            </AnimatedContent>
          ) : soapNote ? (
            <>
              <SpotlightCard
                className="result-card border-border/50 bg-card/80 backdrop-blur-sm"
                spotlightColor="rgba(16, 185, 129, 0.12)"
              >
                <CardHeader className="px-0 pt-0 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Brain className="w-4 h-4 text-primary" /> SOAP Note
                    </CardTitle>
                    <Button size="sm" className="gap-2 h-8" onClick={saveNote} disabled={saving}>
                      {saving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      Save Note
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-0 pb-0 space-y-4">
                  {(["subjective", "objective", "assessment", "plan"] as const).map((section, i) => (
                    <AnimatedContent key={section} distance={25} delay={i * 0.12} direction="horizontal" duration={0.5}>
                      <div className="rounded-lg border border-border/30 overflow-hidden">
                        <div className="flex items-center gap-2 px-3 py-1.5" style={{ background: SOAP_COLORS[section] }}>
                          <span className="text-xs font-bold text-primary uppercase tracking-wider">
                            {section}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed p-3">
                          {soapNote[section] || "No data available"}
                        </p>
                      </div>
                    </AnimatedContent>
                  ))}
                </CardContent>
              </SpotlightCard>

              {/* ICD-10 Codes */}
              {icdCodes.length > 0 && (
                <AnimatedContent distance={30} delay={0.5} duration={0.5}>
                  <SpotlightCard
                    className="result-card border-border/50 bg-card/80 backdrop-blur-sm"
                    spotlightColor="rgba(245, 158, 11, 0.12)"
                  >
                    <CardHeader className="px-0 pt-0 pb-3">
                      <CardTitle className="text-base">Suggested ICD-10 Codes</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 pb-0">
                      <div className="space-y-2">
                        {icdCodes.map((code, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Badge className="font-mono text-xs">{code.code}</Badge>
                              <span className="text-sm">{code.description}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {(code.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </SpotlightCard>
                </AnimatedContent>
              )}

              {/* Disclaimer */}
              <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-400/20 bg-amber-400/5 text-sm">
                <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <p className="text-muted-foreground">
                  AI-generated content. All SOAP notes, entity extractions, and ICD-10 suggestions
                  must be reviewed and verified by a licensed healthcare professional before clinical use.
                </p>
              </div>
            </>
          ) : (
            <AnimatedContent distance={40} delay={0.2} duration={0.6}>
              <SpotlightCard
                className="border-border/50 border-dashed bg-card/80 backdrop-blur-sm"
                spotlightColor="rgba(99, 102, 241, 0.12)"
              >
                <div className="py-16 text-center">
                  <Brain className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">AI Analysis Results</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter a clinical note and click &quot;Process with AI&quot; to see NER extraction, SOAP
                    notes, and ICD-10 suggestions.
                  </p>
                </div>
              </SpotlightCard>
            </AnimatedContent>
          )}
        </div>
      </div>
    </div>
  );
}
