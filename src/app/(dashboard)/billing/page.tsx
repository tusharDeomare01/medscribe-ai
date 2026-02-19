"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import {
  Receipt, Send, Bot, User, AlertCircle, Square, Copy, Check, Sparkles,
  DollarSign, TrendingUp, Clock, Ban, Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useSSE } from "@/hooks/use-sse";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import AnimatedContent from "@/components/AnimatedContent";
import SpotlightCard from "@/components/SpotlightCard";
import Counter from "@/components/Counter";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const MOCK_CLAIMS = [
  { id: "CLM-001", patient: "Sarah Johnson", amount: 1250, status: "paid", date: "2024-01-15" },
  { id: "CLM-002", patient: "Michael Chen", amount: 890, status: "pending", date: "2024-01-16" },
  { id: "CLM-003", patient: "Emily Davis", amount: 2100, status: "denied", date: "2024-01-14" },
  { id: "CLM-004", patient: "James Wilson", amount: 450, status: "submitted", date: "2024-01-17" },
  { id: "CLM-005", patient: "Lisa Martinez", amount: 1800, status: "paid", date: "2024-01-13" },
];

const STATUS_COLORS: Record<string, string> = {
  paid: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  denied: "bg-red-500/10 text-red-500 border-red-500/30",
  submitted: "bg-blue-500/10 text-blue-500 border-blue-500/30",
};

const BILLING_CHIPS = [
  "Explain my bill",
  "What is a deductible?",
  "Payment plan options",
  "Why was my claim denied?",
];

export default function BillingPage() {
  const { getToken } = useAuth();
  const { streamedText, isStreaming, error, startStream, stopStream, reset } = useSSE();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats] = useState({ totalRevenue: 128450, outstanding: 12, denialRate: 8.5, avgDays: 22 });
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".billing-header", { y: -20, opacity: 0, duration: 0.5, ease: "power3.out" });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setStatsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [messages, streamedText]);

  const sendMessage = useCallback(
    async (text?: string) => {
      const msg = text || input.trim();
      if (!msg || isStreaming) return;
      const userMessage: Message = { id: Date.now().toString(), role: "user", content: msg, timestamp: new Date() };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      reset();
      const fullText = await startStream("/api/ai/financial-guidance", {
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
    <div ref={containerRef} className="flex flex-col gap-4">
      <AnimatedContent distance={30} duration={0.6}>
        <div className="billing-header">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Receipt className="w-6 h-6 text-sky-500" />
            Billing &amp; Revenue
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Revenue dashboard and AI-powered financial guidance</p>
        </div>
      </AnimatedContent>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Revenue Dashboard</TabsTrigger>
          <TabsTrigger value="guidance">Financial Guidance</TabsTrigger>
        </TabsList>

        {/* Tab 1: Revenue Dashboard */}
        <TabsContent value="dashboard" className="mt-4 space-y-4">
          <div data-tour-id="billing-kpis" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Revenue", value: stats.totalRevenue, prefix: "$", color: "rgba(34, 197, 94, 0.15)", icon: DollarSign },
              { label: "Outstanding Claims", value: stats.outstanding, color: "rgba(245, 158, 11, 0.15)", icon: Clock },
              { label: "Denial Rate", value: stats.denialRate, suffix: "%", color: "rgba(239, 68, 68, 0.15)", icon: Ban },
              { label: "Avg Days to Payment", value: stats.avgDays, color: "rgba(56, 189, 248, 0.15)", icon: TrendingUp },
            ].map((kpi, i) => (
              <AnimatedContent key={kpi.label} distance={20} duration={0.4} delay={i * 0.08}>
                <SpotlightCard spotlightColor={kpi.color}>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-muted-foreground">{kpi.label}</p>
                      <kpi.icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    {statsLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    ) : (
                      <div className="flex items-end gap-1">
                        {kpi.prefix && <span className="text-lg font-bold">{kpi.prefix}</span>}
                        <Counter value={kpi.value} fontSize={28} gradientFrom="transparent" gradientTo="transparent" />
                        {kpi.suffix && <span className="text-lg font-bold mb-0.5">{kpi.suffix}</span>}
                      </div>
                    )}
                  </div>
                </SpotlightCard>
              </AnimatedContent>
            ))}
          </div>

          <Card data-tour-id="billing-claims" className="border-border/50">
            <div className="p-4 border-b border-border/50">
              <h3 className="font-semibold">Recent Claims</h3>
            </div>
            <div className="divide-y divide-border/30">
              {MOCK_CLAIMS.map((claim) => (
                <div key={claim.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-mono">{claim.id.slice(-3)}</div>
                    <div>
                      <p className="text-sm font-medium">{claim.patient}</p>
                      <p className="text-xs text-muted-foreground">{claim.id} &middot; {claim.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">${claim.amount.toLocaleString()}</span>
                    <Badge className={`${STATUS_COLORS[claim.status]} border text-xs`}>{claim.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Tab 2: Financial Guidance Chat */}
        <TabsContent value="guidance" className="mt-4">
          <Card className="h-[calc(100vh-320px)] flex flex-col border-border/50 overflow-hidden">
            <ScrollArea ref={scrollRef} className="flex-1 p-6">
              {showEmptyState ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                  <div className="w-16 h-16 rounded-2xl bg-sky-500/10 flex items-center justify-center mb-4">
                    <DollarSign className="w-8 h-8 text-sky-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Billing Assistance</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md">Ask about your bill, insurance coverage, payment options, and more.</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {BILLING_CHIPS.map((chip) => (
                      <button key={chip} className="text-xs px-3 py-1.5 rounded-full border border-border/50 bg-muted/30 hover:bg-muted/60 transition-colors" onClick={() => sendMessage(chip)}>
                        {chip}
                      </button>
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
                            <div className="bg-sky-600 text-white rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed"><p className="whitespace-pre-wrap">{msg.content}</p></div>
                            <p className="text-[10px] text-muted-foreground/50 mt-1.5 text-right">{formatTime(msg.timestamp)}</p>
                          </div>
                          <Avatar className="w-8 h-8 shrink-0 mt-1"><AvatarFallback className="bg-secondary text-xs"><User className="w-4 h-4" /></AvatarFallback></Avatar>
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <Avatar className="w-8 h-8 shrink-0 mt-1"><AvatarFallback className="bg-sky-500/10 text-sky-500 text-xs"><Bot className="w-4 h-4" /></AvatarFallback></Avatar>
                          <div className="max-w-[85%] group">
                            <div className="rounded-2xl rounded-tl-sm bg-muted/40 border border-border/30 px-5 py-4 text-sm"><MarkdownRenderer content={msg.content} /></div>
                            <div className="flex items-center gap-3 mt-1.5">
                              <p className="text-[10px] text-muted-foreground/50">{formatTime(msg.timestamp)}</p>
                              <button onClick={() => copyMessage(msg.id, msg.content)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/50 hover:text-muted-foreground">
                                {copiedId === msg.id ? <Check className="w-3 h-3 text-sky-400" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {isStreaming && streamedText && (
                    <div className="flex gap-3">
                      <Avatar className="w-8 h-8 shrink-0 mt-1"><AvatarFallback className="bg-sky-500/10 text-sky-500 text-xs"><Bot className="w-4 h-4" /></AvatarFallback></Avatar>
                      <div className="max-w-[85%]"><div className="rounded-2xl rounded-tl-sm bg-muted/40 border border-border/30 px-5 py-4 text-sm"><MarkdownRenderer content={streamedText} /><span className="inline-block w-1.5 h-4 bg-sky-500 rounded-sm ml-0.5 animate-pulse align-middle" /></div></div>
                    </div>
                  )}
                  {isStreaming && !streamedText && (
                    <div className="flex gap-3 items-start">
                      <Avatar className="w-8 h-8 shrink-0 mt-1"><AvatarFallback className="bg-sky-500/10 text-sky-500 text-xs"><Bot className="w-4 h-4" /></AvatarFallback></Avatar>
                      <div className="rounded-2xl rounded-tl-sm bg-muted/40 border border-border/30 px-5 py-4"><div className="flex items-center gap-3"><div className="flex gap-1"><span className="w-2 h-2 rounded-full bg-sky-500/60 animate-bounce" style={{ animationDelay: "0ms" }} /><span className="w-2 h-2 rounded-full bg-sky-500/60 animate-bounce" style={{ animationDelay: "150ms" }} /><span className="w-2 h-2 rounded-full bg-sky-500/60 animate-bounce" style={{ animationDelay: "300ms" }} /></div><span className="text-xs text-muted-foreground">Reviewing billing info...</span></div></div>
                    </div>
                  )}
                  {error && <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</div>}
                </div>
              )}
            </ScrollArea>
            <div className="border-t border-border/50 p-4">
              <div className="flex items-center gap-2 p-2.5 rounded-lg border border-sky-500/20 bg-sky-500/5 text-xs text-muted-foreground mb-3">
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-sky-500" />
                <span>This is <strong>billing education only</strong>. Contact billing department for actual account changes.</span>
              </div>
              <div className="flex gap-3 items-end">
                <Textarea placeholder="Ask about your bill..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} rows={1} className="resize-none min-h-[44px] max-h-[120px]" />
                {isStreaming ? (
                  <Button variant="destructive" size="icon" className="h-11 w-11 shrink-0" onClick={stopStream}><Square className="w-4 h-4" /></Button>
                ) : (
                  <Button size="icon" className="h-11 w-11 shrink-0 bg-sky-600 hover:bg-sky-700" onClick={() => sendMessage()} disabled={!input.trim()}><Send className="w-4 h-4" /></Button>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
