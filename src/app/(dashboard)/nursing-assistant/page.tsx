"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { Stethoscope, Mic, MicOff, Loader2, CheckCircle, AlertCircle, Pill, Heart, Clipboard } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { useVoiceDictation } from "@/hooks/use-voice-dictation";
import AnimatedContent from "@/components/AnimatedContent";
import SpotlightCard from "@/components/SpotlightCard";
import Counter from "@/components/Counter";

interface NursingResult {
  taskType: string;
  title: string;
  description: string;
  priority: string;
  medications: { name: string; dose: string; route: string; time: string }[];
  vitals: { heartRate: number | null; systolic: number | null; diastolic: number | null; temperature: number | null; spo2: number | null; respRate: number | null };
  chartUpdate: string;
  reminders: { task: string; dueIn: string }[];
  flags: string[];
}

const QUICK_CHIPS = [
  { label: "Log Vitals", icon: Heart },
  { label: "Medication Given", icon: Pill },
  { label: "Patient Assessment", icon: Clipboard },
  { label: "Task Note", icon: Stethoscope },
];

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-emerald-500/10 text-emerald-500",
  normal: "bg-blue-500/10 text-blue-500",
  high: "bg-orange-500/10 text-orange-500",
  urgent: "bg-red-500/10 text-red-500",
};

export default function NursingAssistantPage() {
  const { getToken } = useAuth();
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NursingResult | null>(null);
  const [tasks, setTasks] = useState<{ id: string; title: string; status: string; priority: string }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const { isListening, liveTranscript, elapsed, volume, isSupported, start, stop } = useVoiceDictation({
    onTranscript: (text) => setTranscript(text),
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".nursing-header", { y: -20, opacity: 0, duration: 0.5, ease: "power3.out" });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleProcess = async () => {
    const text = transcript.trim() || liveTranscript.trim();
    if (!text) return;
    setLoading(true);
    setResult(null);
    try {
      const token = getToken();
      const res = await fetch("/api/ai/nursing-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ voiceText: text, patientName: "Current Patient" }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        setTasks((prev) => [...prev, { id: Date.now().toString(), title: data.data.title, status: "pending", priority: data.data.priority }]);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status: t.status === "pending" ? "completed" : "pending" } : t));
  };

  const formatElapsed = (secs: number) => `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, "0")}`;

  const completedCount = tasks.filter((t) => t.status === "completed").length;

  return (
    <div ref={containerRef} className="flex flex-col gap-4">
      <AnimatedContent distance={30} duration={0.6}>
        <div className="nursing-header">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-rose-500" />
            AI Nursing Assistant
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Voice-powered task logging with AI parsing of medications, vitals, and assessments</p>
        </div>
      </AnimatedContent>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tasks Today", value: tasks.length, color: "rgba(244, 63, 94, 0.15)", icon: Clipboard },
          { label: "Completed", value: completedCount, color: "rgba(34, 197, 94, 0.15)", icon: CheckCircle },
          { label: "Overdue", value: 0, color: "rgba(239, 68, 68, 0.15)", icon: AlertCircle },
          { label: "Meds Due", value: 3, color: "rgba(168, 85, 247, 0.15)", icon: Pill },
        ].map((kpi, i) => (
          <AnimatedContent key={kpi.label} distance={20} duration={0.4} delay={i * 0.08}>
            <SpotlightCard spotlightColor={kpi.color}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">{kpi.label}</p><kpi.icon className="w-4 h-4 text-muted-foreground" /></div>
                <Counter value={kpi.value} fontSize={28} gradientFrom="transparent" gradientTo="transparent" />
              </div>
            </SpotlightCard>
          </AnimatedContent>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Voice Input */}
        <div data-tour-id="nursing-voice" className="space-y-4">
          <Card className="p-6 border-border/50 space-y-4">
            <h3 className="font-semibold">Voice Input</h3>
            <div className="flex flex-col items-center gap-4">
              <button
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isListening ? "bg-rose-500 shadow-lg shadow-rose-500/30 scale-110" : "bg-muted hover:bg-muted/80"}`}
                onClick={() => isListening ? (setTranscript(stop())) : start(transcript)}
                disabled={!isSupported}
              >
                {isListening ? <MicOff className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-muted-foreground" />}
              </button>
              {isListening && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-muted-foreground">{formatElapsed(elapsed)}</span>
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full transition-all" style={{ width: `${volume * 100}%` }} />
                  </div>
                </div>
              )}
              {!isSupported && <p className="text-xs text-destructive">Voice input not supported in this browser</p>}
            </div>
            <Textarea placeholder="Or type your notes here..." value={isListening ? liveTranscript : transcript} onChange={(e) => setTranscript(e.target.value)} rows={4} className="resize-none" />
            <div className="flex flex-wrap gap-2">
              {QUICK_CHIPS.map((chip) => (
                <button key={chip.label} className="text-xs px-3 py-1.5 rounded-full border border-border/50 bg-muted/30 hover:bg-muted/60 transition-colors flex items-center gap-1" onClick={() => setTranscript((prev) => `${prev} ${chip.label}: `)}>
                  <chip.icon className="w-3 h-3" /> {chip.label}
                </button>
              ))}
            </div>
            <Button className="w-full bg-rose-600 hover:bg-rose-700 gap-2" onClick={handleProcess} disabled={loading || (!transcript.trim() && !liveTranscript.trim())}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Stethoscope className="w-4 h-4" />}
              {loading ? "Processing..." : "Process with AI"}
            </Button>
          </Card>
        </div>

        {/* Right: Results & Task Feed */}
        <ScrollArea data-tour-id="nursing-results" className="max-h-[calc(100vh-300px)]">
          <div className="space-y-4">
            {result && (
              <AnimatedContent distance={20} duration={0.4}>
                <SpotlightCard spotlightColor="rgba(244, 63, 94, 0.15)">
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{result.title}</h3>
                      <Badge className={`${PRIORITY_COLORS[result.priority] || ""} border`}>{result.priority}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{result.description}</p>

                    {result.medications?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Medications</p>
                        <div className="space-y-1">
                          {result.medications.map((med, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm bg-muted/30 rounded-lg px-3 py-2">
                              <Pill className="w-4 h-4 text-violet-500" />
                              <span className="font-medium">{med.name}</span>
                              <span className="text-muted-foreground">{med.dose} &middot; {med.route} &middot; {med.time}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.vitals && Object.values(result.vitals).some((v) => v !== null) && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Extracted Vitals</p>
                        <div className="grid grid-cols-3 gap-2">
                          {result.vitals.heartRate && <div className="bg-muted/30 rounded-lg p-2 text-center"><p className="text-xs text-muted-foreground">HR</p><p className="text-sm font-medium">{result.vitals.heartRate}</p></div>}
                          {result.vitals.systolic && <div className="bg-muted/30 rounded-lg p-2 text-center"><p className="text-xs text-muted-foreground">BP</p><p className="text-sm font-medium">{result.vitals.systolic}/{result.vitals.diastolic}</p></div>}
                          {result.vitals.temperature && <div className="bg-muted/30 rounded-lg p-2 text-center"><p className="text-xs text-muted-foreground">Temp</p><p className="text-sm font-medium">{result.vitals.temperature}&deg;F</p></div>}
                          {result.vitals.spo2 && <div className="bg-muted/30 rounded-lg p-2 text-center"><p className="text-xs text-muted-foreground">SpO2</p><p className="text-sm font-medium">{result.vitals.spo2}%</p></div>}
                          {result.vitals.respRate && <div className="bg-muted/30 rounded-lg p-2 text-center"><p className="text-xs text-muted-foreground">RR</p><p className="text-sm font-medium">{result.vitals.respRate}</p></div>}
                        </div>
                      </div>
                    )}

                    {result.chartUpdate && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Chart Update</p>
                        <div className="bg-muted/30 rounded-lg p-3 text-sm">{result.chartUpdate}</div>
                      </div>
                    )}

                    {result.flags?.length > 0 && (
                      <div className="border-t border-border/30 pt-3">
                        {result.flags.map((flag, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-destructive"><AlertCircle className="w-4 h-4" />{flag}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </SpotlightCard>
              </AnimatedContent>
            )}

            {tasks.length > 0 && (
              <Card className="border-border/50">
                <div className="p-4 border-b border-border/50"><h4 className="font-semibold text-sm">Task Feed</h4></div>
                <div className="divide-y divide-border/30">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleTask(task.id)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${task.status === "completed" ? "bg-emerald-500 border-emerald-500" : "border-muted-foreground/30"}`}>
                          {task.status === "completed" && <CheckCircle className="w-3 h-3 text-white" />}
                        </button>
                        <span className={`text-sm ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>{task.title}</span>
                      </div>
                      <Badge className={`${PRIORITY_COLORS[task.priority] || ""} text-xs`}>{task.priority}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {!result && !loading && tasks.length === 0 && (
              <Card className="border-border/50 min-h-[300px] flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto"><Stethoscope className="w-8 h-8 text-rose-500/40" /></div>
                  <p className="text-sm text-muted-foreground">Dictate or type nursing notes to get AI-parsed results</p>
                </div>
              </Card>
            )}

            {loading && (
              <Card className="border-border/50 p-8 flex items-center justify-center">
                <div className="text-center space-y-3"><Loader2 className="w-8 h-8 text-rose-500 animate-spin mx-auto" /><p className="text-sm text-muted-foreground">Processing voice input...</p></div>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
