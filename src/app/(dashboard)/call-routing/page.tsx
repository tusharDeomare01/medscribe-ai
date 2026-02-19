"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import {
  Phone, Send, Bot, User, AlertCircle, Square, Copy, Check, Sparkles,
  Stethoscope, Calendar, Pill, FlaskConical, CreditCard, HelpCircle,
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

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface RoutingResult {
  route: string;
  urgency: string;
  summary: string;
  estimatedWait: string;
  department: string;
}

const CALL_CATEGORIES = [
  { label: "Medical Issue", icon: Stethoscope, color: "rgba(239, 68, 68, 0.15)" },
  { label: "Appointment", icon: Calendar, color: "rgba(56, 189, 248, 0.15)" },
  { label: "Prescription Refill", icon: Pill, color: "rgba(34, 197, 94, 0.15)" },
  { label: "Lab Results", icon: FlaskConical, color: "rgba(168, 85, 247, 0.15)" },
  { label: "Billing Question", icon: CreditCard, color: "rgba(245, 158, 11, 0.15)" },
  { label: "Other", icon: HelpCircle, color: "rgba(107, 114, 128, 0.15)" },
];

const URGENCY_CONFIG: Record<string, { color: string; text: string; bg: string }> = {
  routine: { color: "bg-emerald-500", text: "text-emerald-500", bg: "bg-emerald-500/10" },
  priority: { color: "bg-yellow-500", text: "text-yellow-500", bg: "bg-yellow-500/10" },
  urgent: { color: "bg-orange-500", text: "text-orange-500", bg: "bg-orange-500/10" },
  emergency: { color: "bg-red-500", text: "text-red-500", bg: "bg-red-500/10" },
};

function parseRoutingResult(text: string): RoutingResult | null {
  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) return JSON.parse(jsonMatch[1]);
    const braceMatch = text.match(/\{[\s\S]*"route"[\s\S]*\}/);
    if (braceMatch) return JSON.parse(braceMatch[0]);
  } catch { /* ignore */ }
  return null;
}

export default function CallRoutingPage() {
  const { getToken } = useAuth();
  const { streamedText, isStreaming, error, startStream, stopStream, reset } = useSSE();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [routingResult, setRoutingResult] = useState<RoutingResult | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".call-header", { y: -20, opacity: 0, duration: 0.5, ease: "power3.out" });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [messages, streamedText]);

  useEffect(() => {
    if (!isStreaming && messages.length > 0) {
      const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
      if (lastAssistant) {
        const result = parseRoutingResult(lastAssistant.content);
        if (result && !routingResult) {
          setRoutingResult(result);
          setTimeout(() => {
            if (resultRef.current) {
              gsap.from(resultRef.current, { scale: 0.9, opacity: 0, duration: 0.6, ease: "back.out(1.7)" });
            }
          }, 100);
        }
      }
    }
  }, [isStreaming, messages, routingResult]);

  const sendMessage = useCallback(
    async (text?: string) => {
      const msg = text || input.trim();
      if (!msg || isStreaming) return;

      const userMessage: Message = { id: Date.now().toString(), role: "user", content: msg, timestamp: new Date() };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      reset();

      const fullText = await startStream("/api/ai/call-routing", {
        message: msg,
        history: messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
      }, getToken());

      if (fullText) {
        setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: fullText, timestamp: new Date() }]);
        reset();
      }
    },
    [input, isStreaming, messages, getToken, startStream, reset]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const showEmptyState = messages.length === 0 && !isStreaming;

  return (
    <div ref={containerRef} className="h-[calc(100vh-160px)] flex flex-col">
      <AnimatedContent distance={30} duration={0.6}>
        <div className="call-header flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Phone className="w-6 h-6 text-indigo-500" />
              Intelligent Call Routing
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">AI-powered phone triage that routes calls to the right department</p>
          </div>
        </div>
      </AnimatedContent>

      <Card data-tour-id="call-chat" className="flex-1 flex flex-col border-border/50 overflow-hidden">
        <ScrollArea ref={scrollRef} className="flex-1 p-6">
          {showEmptyState ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
                <Phone className="w-8 h-8 text-indigo-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">How can we help you today?</h3>
              <p className="text-sm text-muted-foreground mb-8 max-w-md">Select the reason for your call and our AI will route you to the right department.</p>
              <div data-tour-id="call-categories" className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg w-full">
                {CALL_CATEGORIES.map((cat, i) => (
                  <AnimatedContent key={cat.label} distance={20} duration={0.4} delay={i * 0.05}>
                    <SpotlightCard spotlightColor={cat.color} className="cursor-pointer hover:scale-[1.02] transition-transform">
                      <button className="w-full p-3 flex flex-col items-center gap-2" onClick={() => sendMessage(`I'm calling about: ${cat.label}`)}>
                        <cat.icon className="w-5 h-5 text-muted-foreground" />
                        <span className="text-xs font-medium">{cat.label}</span>
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
                        <div className="bg-indigo-600 text-white rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed">
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground/50 mt-1.5 text-right">{formatTime(msg.timestamp)}</p>
                      </div>
                      <Avatar className="w-8 h-8 shrink-0 mt-1"><AvatarFallback className="bg-secondary text-xs"><User className="w-4 h-4" /></AvatarFallback></Avatar>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <Avatar className="w-8 h-8 shrink-0 mt-1"><AvatarFallback className="bg-indigo-500/10 text-indigo-500 text-xs"><Bot className="w-4 h-4" /></AvatarFallback></Avatar>
                      <div className="max-w-[85%] group">
                        <div className="rounded-2xl rounded-tl-sm bg-muted/40 border border-border/30 px-5 py-4 text-sm">
                          <MarkdownRenderer content={msg.content.replace(/```json[\s\S]*?```/g, "").trim()} />
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <p className="text-[10px] text-muted-foreground/50">{formatTime(msg.timestamp)}</p>
                          <button onClick={() => copyMessage(msg.id, msg.content)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/50 hover:text-muted-foreground">
                            {copiedId === msg.id ? <Check className="w-3 h-3 text-indigo-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isStreaming && streamedText && (
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8 shrink-0 mt-1"><AvatarFallback className="bg-indigo-500/10 text-indigo-500 text-xs"><Bot className="w-4 h-4" /></AvatarFallback></Avatar>
                  <div className="max-w-[85%]">
                    <div className="rounded-2xl rounded-tl-sm bg-muted/40 border border-border/30 px-5 py-4 text-sm">
                      <MarkdownRenderer content={streamedText.replace(/```json[\s\S]*?```/g, "").trim()} />
                      <span className="inline-block w-1.5 h-4 bg-indigo-500 rounded-sm ml-0.5 animate-pulse align-middle" />
                    </div>
                  </div>
                </div>
              )}
              {isStreaming && !streamedText && (
                <div className="flex gap-3 items-start">
                  <Avatar className="w-8 h-8 shrink-0 mt-1"><AvatarFallback className="bg-indigo-500/10 text-indigo-500 text-xs"><Bot className="w-4 h-4" /></AvatarFallback></Avatar>
                  <div className="rounded-2xl rounded-tl-sm bg-muted/40 border border-border/30 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-500/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 rounded-full bg-indigo-500/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 rounded-full bg-indigo-500/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                      <span className="text-xs text-muted-foreground">Processing your call...</span>
                    </div>
                  </div>
                </div>
              )}
              {error && <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</div>}
              {routingResult && (
                <div ref={resultRef}>
                  <SpotlightCard spotlightColor="rgba(99, 102, 241, 0.2)" className="mt-4">
                    <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-base flex items-center gap-2"><Phone className="w-5 h-5" /> Call Routed</h3>
                        <Badge className={`${URGENCY_CONFIG[routingResult.urgency]?.bg || "bg-muted"} ${URGENCY_CONFIG[routingResult.urgency]?.text || ""} border`}>
                          <span className={`w-2 h-2 rounded-full ${URGENCY_CONFIG[routingResult.urgency]?.color || "bg-muted"} mr-1.5 animate-pulse`} />
                          {routingResult.urgency}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><p className="text-xs text-muted-foreground">Department</p><p className="font-medium">{routingResult.department}</p></div>
                        <div><p className="text-xs text-muted-foreground">Est. Wait</p><p className="font-medium">{routingResult.estimatedWait}</p></div>
                      </div>
                      <div><p className="text-xs text-muted-foreground mb-1">Summary</p><p className="text-sm">{routingResult.summary}</p></div>
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Transfer Call</Button>
                    </div>
                  </SpotlightCard>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
        <div className="border-t border-border/50 p-4">
          <div className="flex items-center gap-2 p-2.5 rounded-lg border border-indigo-500/20 bg-indigo-500/5 text-xs text-muted-foreground mb-3">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
            <span>AI call routing is a <strong>demo simulation</strong>. No actual calls are being placed.</span>
          </div>
          <div className="flex gap-3 items-end">
            <Textarea placeholder="Describe why you're calling..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} rows={1} className="resize-none min-h-[44px] max-h-[120px]" />
            {isStreaming ? (
              <Button variant="destructive" size="icon" className="h-11 w-11 shrink-0" onClick={stopStream}><Square className="w-4 h-4" /></Button>
            ) : (
              <Button size="icon" className="h-11 w-11 shrink-0 bg-indigo-600 hover:bg-indigo-700" onClick={() => sendMessage()} disabled={!input.trim()}><Send className="w-4 h-4" /></Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
