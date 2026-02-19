"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { GraduationCap, Loader2, BookOpen, Brain, CheckCircle, XCircle, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { useSSE } from "@/hooks/use-sse";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import AnimatedContent from "@/components/AnimatedContent";
import SpotlightCard from "@/components/SpotlightCard";
import Counter from "@/components/Counter";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface TrainingModule {
  id: string;
  topic: string;
  type: string;
  difficulty: string;
  content: string;
  quiz: QuizQuestion[];
  createdAt: Date;
}

const TOPICS = [
  "Sepsis Recognition & Management",
  "Pressure Injury Prevention",
  "Fall Prevention Strategies",
  "Medication Safety",
  "Infection Control",
  "Pain Assessment & Management",
  "Hand Hygiene Compliance",
  "Patient Communication",
];

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-emerald-500/10 text-emerald-500",
  intermediate: "bg-yellow-500/10 text-yellow-500",
  advanced: "bg-red-500/10 text-red-500",
};

const TYPE_COLORS: Record<string, string> = {
  lesson: "bg-blue-500/10 text-blue-500",
  quiz: "bg-violet-500/10 text-violet-500",
  "case-study": "bg-amber-500/10 text-amber-500",
};

function parseQuiz(content: string): QuizQuestion[] {
  try {
    const match = content.match(/```quiz\s*([\s\S]*?)\s*```/);
    if (match) return JSON.parse(match[1]);
  } catch { /* ignore */ }
  return [];
}

export default function StaffTrainingPage() {
  const { getToken } = useAuth();
  const { streamedText, isStreaming, startStream, reset } = useSSE();
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, Record<number, number>>>({});
  const [quizRevealed, setQuizRevealed] = useState<Record<string, Set<number>>>({});
  const [form, setForm] = useState({ topic: TOPICS[0], type: "lesson", difficulty: "intermediate", department: "Nursing" });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".training-header", { y: -20, opacity: 0, duration: 0.5, ease: "power3.out" });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleGenerate = useCallback(async () => {
    if (isStreaming) return;
    reset();
    const fullText = await startStream("/api/ai/generate-training", {
      topic: form.topic,
      type: form.type,
      difficulty: form.difficulty,
      department: form.department,
    }, getToken());

    if (fullText) {
      const quiz = parseQuiz(fullText);
      const newModule: TrainingModule = {
        id: Date.now().toString(),
        topic: form.topic,
        type: form.type,
        difficulty: form.difficulty,
        content: fullText.replace(/```quiz[\s\S]*?```/g, "").trim(),
        quiz,
        createdAt: new Date(),
      };
      setModules((prev) => [newModule, ...prev]);
      setExpandedId(newModule.id);
      reset();
    }
  }, [form, isStreaming, getToken, startStream, reset]);

  const selectAnswer = (moduleId: string, qIdx: number, aIdx: number) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [moduleId]: { ...(prev[moduleId] || {}), [qIdx]: aIdx },
    }));
  };

  const revealAnswer = (moduleId: string, qIdx: number) => {
    setQuizRevealed((prev) => {
      const set = new Set(prev[moduleId] || []);
      set.add(qIdx);
      return { ...prev, [moduleId]: set };
    });
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-4 min-h-0">
      <AnimatedContent distance={30} duration={0.6}>
        <div className="training-header">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-violet-500" />
            Staff Training &amp; Education
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">AI-generated training modules, quizzes, and case studies for healthcare staff</p>
        </div>
      </AnimatedContent>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Modules Created", value: modules.length, color: "rgba(139, 92, 246, 0.15)", icon: BookOpen },
          { label: "Topics Covered", value: new Set(modules.map((m) => m.topic)).size, color: "rgba(34, 197, 94, 0.15)", icon: Brain },
          { label: "Quizzes Available", value: modules.filter((m) => m.quiz.length > 0).length, color: "rgba(56, 189, 248, 0.15)", icon: CheckCircle },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {/* Left: Module Feed */}
        <div data-tour-id="training-modules" className="lg:col-span-2 min-h-0">
          <ScrollArea className="h-[calc(100vh-320px)]">
            <div className="space-y-4">
              {/* Streaming preview */}
              {isStreaming && streamedText && (
                <Card className="border-border/50 border-violet-500/20 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                    <span className="text-sm font-medium">Generating training content...</span>
                  </div>
                  <div className="text-sm">
                    <MarkdownRenderer content={streamedText.replace(/```quiz[\s\S]*?```/g, "").trim()} />
                    <span className="inline-block w-1.5 h-4 bg-violet-500 rounded-sm ml-0.5 animate-pulse align-middle" />
                  </div>
                </Card>
              )}

              {modules.map((mod) => (
                <AnimatedContent key={mod.id} distance={20} duration={0.4}>
                  <Card className="border-border/50">
                    <button className="w-full p-4 text-left flex items-center justify-between" onClick={() => setExpandedId(expandedId === mod.id ? null : mod.id)}>
                      <div className="flex items-center gap-3">
                        <GraduationCap className="w-5 h-5 text-violet-500" />
                        <div>
                          <p className="font-medium text-sm">{mod.topic}</p>
                          <p className="text-xs text-muted-foreground">{new Date(mod.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${TYPE_COLORS[mod.type] || ""} text-xs`}>{mod.type}</Badge>
                        <Badge className={`${DIFFICULTY_COLORS[mod.difficulty] || ""} text-xs`}>{mod.difficulty}</Badge>
                        {mod.quiz.length > 0 && <Badge variant="outline" className="text-xs">{mod.quiz.length} Q</Badge>}
                      </div>
                    </button>
                    {expandedId === mod.id && (
                      <div className="px-4 pb-4 border-t border-border/30 pt-4 space-y-4">
                        <div className="text-sm"><MarkdownRenderer content={mod.content} /></div>
                        {mod.quiz.length > 0 && (
                          <div className="space-y-4 border-t border-border/30 pt-4">
                            <h4 className="font-semibold text-sm flex items-center gap-2"><Brain className="w-4 h-4 text-violet-500" /> Quiz</h4>
                            {mod.quiz.map((q, qIdx) => {
                              const selected = quizAnswers[mod.id]?.[qIdx];
                              const revealed = quizRevealed[mod.id]?.has(qIdx);
                              return (
                                <div key={qIdx} className="space-y-2">
                                  <p className="text-sm font-medium">{qIdx + 1}. {q.question}</p>
                                  <div className="space-y-1">
                                    {q.options.map((opt, oIdx) => {
                                      const isCorrect = oIdx === q.correctAnswer;
                                      const isSelected = selected === oIdx;
                                      let bg = "bg-muted/30 hover:bg-muted/50";
                                      if (revealed && isCorrect) bg = "bg-emerald-500/10 border-emerald-500/30";
                                      else if (revealed && isSelected && !isCorrect) bg = "bg-red-500/10 border-red-500/30";
                                      else if (isSelected) bg = "bg-violet-500/10 border-violet-500/30";
                                      return (
                                        <button key={oIdx} className={`w-full text-left px-3 py-2 rounded-lg text-sm border border-transparent transition-colors ${bg}`} onClick={() => selectAnswer(mod.id, qIdx, oIdx)} disabled={revealed}>
                                          <div className="flex items-center gap-2">
                                            {revealed && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                                            {revealed && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-500" />}
                                            {!revealed && <span className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center text-[10px]">{String.fromCharCode(65 + oIdx)}</span>}
                                            {opt}
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                  {!revealed && selected !== undefined && (
                                    <Button variant="outline" size="sm" className="text-xs" onClick={() => revealAnswer(mod.id, qIdx)}>Reveal Answer</Button>
                                  )}
                                  {revealed && <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-2">{q.explanation}</p>}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                </AnimatedContent>
              ))}

              {modules.length === 0 && !isStreaming && (
                <Card className="border-border/50 min-h-[300px] flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto"><GraduationCap className="w-8 h-8 text-violet-500/40" /></div>
                    <p className="text-sm text-muted-foreground">Generate your first training module using the form</p>
                  </div>
                </Card>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right: Generation Form */}
        <div className="space-y-4 lg:max-h-[calc(100vh-320px)] lg:overflow-y-auto lg:scrollbar-none">
          <Card data-tour-id="training-generate" className="p-6 border-border/50 space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4 text-violet-500" /> Generate Training</h3>
            <div className="space-y-3">
              <div>
                <Label>Topic</Label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}>
                  {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <Label>Type</Label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="lesson">Lesson</option>
                  <option value="quiz">Quiz</option>
                  <option value="case-study">Case Study</option>
                </select>
              </div>
              <div>
                <Label>Difficulty</Label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <Label>Department</Label>
                <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g., Nursing, Emergency" />
              </div>
            </div>
            <Button className="w-full bg-violet-600 hover:bg-violet-700 gap-2" onClick={handleGenerate} disabled={isStreaming}>
              {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isStreaming ? "Generating..." : "Generate Module"}
            </Button>
          </Card>

          <Card className="p-4 border-border/50">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Quick Topics</h4>
            <div className="flex flex-wrap gap-1">
              {TOPICS.map((topic) => (
                <button key={topic} className="text-xs px-2 py-1 rounded-full border border-border/50 bg-muted/30 hover:bg-muted/60 transition-colors" onClick={() => setForm({ ...form, topic })}>
                  {topic.split(" ").slice(0, 2).join(" ")}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
