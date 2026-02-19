"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import {
  HeartPulse,
  Send,
  Bot,
  User,
  AlertCircle,
  Square,
  Copy,
  Check,
  Sparkles,
  Shield,
  Thermometer,
  Brain,
  Bone,
  Wind,
  Frown,
  Zap,
  Eye,
  Activity,
  Stethoscope,
  Save,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useSSE } from "@/hooks/use-sse";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import AnimatedContent from "@/components/AnimatedContent";
import SpotlightCard from "@/components/SpotlightCard";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface TriageResult {
  severity: "low" | "moderate" | "high" | "emergency";
  recommendation: string;
  redFlags: string[];
  suggestedSpecialty: string;
}

const SYMPTOM_CHIPS = [
  { label: "Headache", icon: Brain, color: "rgba(139, 92, 246, 0.15)" },
  { label: "Chest Pain", icon: HeartPulse, color: "rgba(239, 68, 68, 0.15)" },
  { label: "Fever", icon: Thermometer, color: "rgba(245, 158, 11, 0.15)" },
  { label: "Cough", icon: Wind, color: "rgba(59, 130, 246, 0.15)" },
  { label: "Fatigue", icon: Zap, color: "rgba(234, 179, 8, 0.15)" },
  { label: "Nausea", icon: Frown, color: "rgba(16, 185, 129, 0.15)" },
  { label: "Back Pain", icon: Bone, color: "rgba(168, 85, 247, 0.15)" },
  { label: "Dizziness", icon: Activity, color: "rgba(236, 72, 153, 0.15)" },
  { label: "Shortness of Breath", icon: Wind, color: "rgba(6, 182, 212, 0.15)" },
  { label: "Abdominal Pain", icon: Stethoscope, color: "rgba(249, 115, 22, 0.15)" },
  { label: "Joint Pain", icon: Bone, color: "rgba(34, 197, 94, 0.15)" },
  { label: "Skin Rash", icon: Eye, color: "rgba(244, 63, 94, 0.15)" },
];

const SEVERITY_CONFIG = {
  low: { color: "bg-emerald-500", text: "text-emerald-500", bg: "bg-emerald-500/10", label: "Low Risk", border: "border-emerald-500/30" },
  moderate: { color: "bg-yellow-500", text: "text-yellow-500", bg: "bg-yellow-500/10", label: "Moderate", border: "border-yellow-500/30" },
  high: { color: "bg-orange-500", text: "text-orange-500", bg: "bg-orange-500/10", label: "High Priority", border: "border-orange-500/30" },
  emergency: { color: "bg-red-500", text: "text-red-500", bg: "bg-red-500/10", label: "Emergency", border: "border-red-500/30" },
};

function parseTriageResult(text: string): TriageResult | null {
  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    const braceMatch = text.match(/\{[\s\S]*"severity"[\s\S]*\}/);
    if (braceMatch) {
      return JSON.parse(braceMatch[0]);
    }
  } catch {
    // ignore parse errors
  }
  return null;
}

export default function HealthAssistantPage() {
  const { getToken } = useAuth();
  const { streamedText, isStreaming, error, startStream, stopStream, reset } = useSSE();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [saving, setSaving] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".health-header", { y: -20, opacity: 0, duration: 0.5, ease: "power3.out" });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [messages, streamedText]);

  // Check for triage result after streaming completes
  useEffect(() => {
    if (!isStreaming && messages.length > 0) {
      const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
      if (lastAssistant) {
        const result = parseTriageResult(lastAssistant.content);
        if (result && !triageResult) {
          setTriageResult(result);
          setTimeout(() => {
            if (resultRef.current) {
              gsap.from(resultRef.current, {
                scale: 0.9,
                opacity: 0,
                duration: 0.6,
                ease: "back.out(1.7)",
              });
            }
          }, 100);
        }
      }
    }
  }, [isStreaming, messages, triageResult]);

  const sendMessage = useCallback(
    async (text?: string) => {
      const msg = text || input.trim();
      if (!msg || isStreaming) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: msg,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      reset();

      const fullText = await startStream(
        "/api/ai/triage",
        {
          message: msg,
          history: messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        },
        getToken()
      );

      if (fullText) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: fullText,
            timestamp: new Date(),
          },
        ]);
        reset();
      }
    },
    [input, isStreaming, messages, getToken, startStream, reset]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const saveSession = async () => {
    if (!triageResult) return;
    setSaving(true);
    try {
      const token = getToken();
      const res = await fetch("/api/triage-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          symptoms: messages.filter((m) => m.role === "user").map((m) => m.content),
          conversation: messages.map((m) => ({ role: m.role, content: m.content, timestamp: m.timestamp })),
          severity: triageResult.severity,
          recommendation: triageResult.recommendation,
          triageResult,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Triage session saved successfully");
      } else {
        toast.error("Failed to save session");
      }
    } catch {
      toast.error("Failed to save session");
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const showEmptyState = messages.length === 0 && !isStreaming;

  return (
    <div ref={containerRef} className="h-[calc(100vh-160px)] flex flex-col">
      {/* Header */}
      <AnimatedContent distance={30} duration={0.6}>
        <div className="health-header flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <HeartPulse className="w-6 h-6 text-emerald-500" />
              Health Assistant
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Describe your symptoms for an AI-powered urgency assessment
            </p>
          </div>
          {triageResult && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={saveSession}
              disabled={saving}
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Session"}
            </Button>
          )}
        </div>
      </AnimatedContent>

      {/* Chat Area */}
      <Card data-tour-id="health-chat" className="flex-1 flex flex-col border-border/50 overflow-hidden">
        <ScrollArea ref={scrollRef} className="flex-1 p-6">
          {showEmptyState ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
                <HeartPulse className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">How are you feeling?</h3>
              <p className="text-sm text-muted-foreground mb-8 max-w-md">
                Select a symptom below or describe how you&apos;re feeling. I&apos;ll ask follow-up
                questions to help assess the urgency.
              </p>

              {/* Symptom Grid */}
              <div data-tour-id="health-symptoms" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-w-2xl w-full">
                {SYMPTOM_CHIPS.map((chip, i) => (
                  <AnimatedContent key={chip.label} distance={20} duration={0.4} delay={i * 0.05}>
                    <SpotlightCard
                      spotlightColor={chip.color}
                      className="cursor-pointer hover:scale-[1.02] transition-transform duration-200"
                    >
                      <button
                        className="w-full p-3 flex flex-col items-center gap-2 text-center"
                        onClick={() => sendMessage(`I'm experiencing ${chip.label.toLowerCase()}`)}
                      >
                        <chip.icon className="w-5 h-5 text-muted-foreground" />
                        <span className="text-xs font-medium">{chip.label}</span>
                      </button>
                    </SpotlightCard>
                  </AnimatedContent>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => (
                <div key={msg.id}>
                  {msg.role === "user" ? (
                    <div className="flex gap-3 justify-end">
                      <div className="max-w-[75%]">
                        <div className="bg-emerald-600 text-white rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed">
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground/50 mt-1.5 text-right">
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                      <Avatar className="w-8 h-8 shrink-0 mt-1">
                        <AvatarFallback className="bg-secondary text-xs">
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <Avatar className="w-8 h-8 shrink-0 mt-1">
                        <AvatarFallback className="bg-emerald-500/10 text-emerald-500 text-xs">
                          <Bot className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="max-w-[85%] group">
                        <div className="rounded-2xl rounded-tl-sm bg-muted/40 border border-border/30 px-5 py-4 text-sm">
                          <MarkdownRenderer content={msg.content.replace(/```json[\s\S]*?```/g, "").trim()} />
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <p className="text-[10px] text-muted-foreground/50">
                            {formatTime(msg.timestamp)}
                          </p>
                          <button
                            onClick={() => copyMessage(msg.id, msg.content)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/50 hover:text-muted-foreground"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Streaming response */}
              {isStreaming && streamedText && (
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8 shrink-0 mt-1">
                    <AvatarFallback className="bg-emerald-500/10 text-emerald-500 text-xs">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="max-w-[85%]">
                    <div className="rounded-2xl rounded-tl-sm bg-muted/40 border border-border/30 px-5 py-4 text-sm">
                      <MarkdownRenderer content={streamedText.replace(/```json[\s\S]*?```/g, "").trim()} />
                      <span className="inline-block w-1.5 h-4 bg-emerald-500 rounded-sm ml-0.5 animate-pulse align-middle" />
                    </div>
                  </div>
                </div>
              )}

              {/* Thinking indicator */}
              {isStreaming && !streamedText && (
                <div className="flex gap-3 items-start">
                  <Avatar className="w-8 h-8 shrink-0 mt-1">
                    <AvatarFallback className="bg-emerald-500/10 text-emerald-500 text-xs">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-2xl rounded-tl-sm bg-muted/40 border border-border/30 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 rounded-full bg-emerald-500/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 rounded-full bg-emerald-500/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                      <span className="text-xs text-muted-foreground">Analyzing symptoms...</span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              {/* Triage Result Card */}
              {triageResult && (
                <div ref={resultRef}>
                  <SpotlightCard
                    spotlightColor={
                      triageResult.severity === "emergency"
                        ? "rgba(239, 68, 68, 0.2)"
                        : triageResult.severity === "high"
                        ? "rgba(249, 115, 22, 0.2)"
                        : triageResult.severity === "moderate"
                        ? "rgba(234, 179, 8, 0.2)"
                        : "rgba(16, 185, 129, 0.2)"
                    }
                    className="mt-4"
                  >
                    <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-muted-foreground" />
                          <h3 className="font-semibold text-base">Triage Assessment</h3>
                        </div>
                        <Badge
                          className={`${SEVERITY_CONFIG[triageResult.severity].bg} ${SEVERITY_CONFIG[triageResult.severity].text} ${SEVERITY_CONFIG[triageResult.severity].border} border`}
                        >
                          <span className={`w-2 h-2 rounded-full ${SEVERITY_CONFIG[triageResult.severity].color} mr-1.5 animate-pulse`} />
                          {SEVERITY_CONFIG[triageResult.severity].label}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Recommendation</p>
                          <p className="text-sm">{triageResult.recommendation}</p>
                        </div>

                        {triageResult.suggestedSpecialty && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Suggested Specialty</p>
                            <Badge variant="outline" className="gap-1">
                              <Stethoscope className="w-3 h-3" />
                              {triageResult.suggestedSpecialty}
                            </Badge>
                          </div>
                        )}

                        {triageResult.redFlags && triageResult.redFlags.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-destructive mb-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Warning Signs
                            </p>
                            <ul className="space-y-1">
                              {triageResult.redFlags.map((flag, i) => (
                                <li key={i} className="text-sm text-destructive/80 flex items-start gap-2">
                                  <span className="w-1 h-1 rounded-full bg-destructive mt-2 shrink-0" />
                                  {flag}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </SpotlightCard>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="border-t border-border/50 p-4">
          <div className="flex items-center gap-2 p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-xs text-muted-foreground mb-3">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-500" />
            <span>
              This is <strong>not a medical diagnosis</strong>. If you feel your condition is
              worsening, seek immediate medical attention.
            </span>
          </div>

          <div className="flex gap-3 items-end">
            <Textarea
              placeholder="Describe your symptoms..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              className="resize-none min-h-[44px] max-h-[120px]"
            />
            {isStreaming ? (
              <Button
                variant="destructive"
                size="icon"
                className="h-11 w-11 shrink-0"
                onClick={stopStream}
              >
                <Square className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                size="icon"
                className="h-11 w-11 shrink-0 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => sendMessage()}
                disabled={!input.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      {!showEmptyState && !triageResult && messages.length > 0 && messages.length < 8 && (
        <div className="mt-3 flex gap-2 flex-wrap">
          {["It's getting worse", "I also have a fever", "It started yesterday", "The pain is 7/10"].map(
            (quick) => (
              <button
                key={quick}
                className="text-xs px-3 py-1.5 rounded-full border border-border/50 bg-muted/30 hover:bg-muted/60 transition-colors"
                onClick={() => sendMessage(quick)}
                disabled={isStreaming}
              >
                {quick}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
