"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import {
  Send, Bot, User, AlertCircle, Square, Copy, Check, Sparkles,
  CalendarCheck, Clock, Users, BarChart3, QrCode, ShieldCheck, PartyPopper,
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

const QUICK_ACTIONS = [
  { label: "Book Appointment", icon: CalendarCheck, color: "rgba(56, 189, 248, 0.15)" },
  { label: "Reschedule", icon: Clock, color: "rgba(168, 85, 247, 0.15)" },
  { label: "Check Availability", icon: Users, color: "rgba(34, 197, 94, 0.15)" },
  { label: "Update Info", icon: ShieldCheck, color: "rgba(245, 158, 11, 0.15)" },
];

const MOCK_APPOINTMENTS = [
  { id: "1", patient: "Sarah Johnson", time: "09:00 AM", type: "in-person", risk: 0.12, reason: "Follow-up" },
  { id: "2", patient: "Michael Chen", time: "09:30 AM", type: "telehealth", risk: 0.45, reason: "New Patient" },
  { id: "3", patient: "Emily Davis", time: "10:00 AM", type: "in-person", risk: 0.72, reason: "Lab Review" },
  { id: "4", patient: "James Wilson", time: "10:30 AM", type: "in-person", risk: 0.08, reason: "Check-up" },
  { id: "5", patient: "Lisa Martinez", time: "11:00 AM", type: "telehealth", risk: 0.55, reason: "Medication Review" },
  { id: "6", patient: "Robert Taylor", time: "11:30 AM", type: "in-person", risk: 0.31, reason: "Follow-up" },
];

function getRiskBadge(risk: number) {
  if (risk >= 0.6) return { label: "High", className: "bg-red-500/10 text-red-500 border-red-500/30" };
  if (risk >= 0.3) return { label: "Medium", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" };
  return { label: "Low", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" };
}

export default function SchedulingPage() {
  const { getToken } = useAuth();
  const { streamedText, isStreaming, error, startStream, stopStream, reset } = useSSE();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [kioskStep, setKioskStep] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".sched-header", { y: -20, opacity: 0, duration: 0.5, ease: "power3.out" });
    }, containerRef);
    return () => ctx.revert();
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

      const fullText = await startStream("/api/ai/scheduling-bot", {
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
        <div className="sched-header">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-sky-500" />
            Smart Scheduling
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">AI-powered appointment management, no-show prediction, and virtual check-in</p>
        </div>
      </AnimatedContent>

      <Tabs data-tour-id="scheduling-tabs" defaultValue="scheduler" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scheduler">AI Scheduler</TabsTrigger>
          <TabsTrigger value="noshow">No-Show Predictions</TabsTrigger>
          <TabsTrigger value="kiosk">Virtual Kiosk</TabsTrigger>
        </TabsList>

        {/* Tab 1: AI Scheduler Chat */}
        <TabsContent value="scheduler" className="mt-4">
          <Card className="h-[calc(100vh-300px)] flex flex-col border-border/50 overflow-hidden">
            <ScrollArea ref={scrollRef} className="flex-1 p-6">
              {showEmptyState ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[350px] text-center">
                  <div className="w-16 h-16 rounded-2xl bg-sky-500/10 flex items-center justify-center mb-4">
                    <CalendarCheck className="w-8 h-8 text-sky-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">AI Scheduling Assistant</h3>
                  <p className="text-sm text-muted-foreground mb-8 max-w-md">Book, reschedule, or manage appointments using natural language.</p>
                  <div data-tour-id="scheduling-actions" className="grid grid-cols-2 gap-3 max-w-md w-full">
                    {QUICK_ACTIONS.map((action, i) => (
                      <AnimatedContent key={action.label} distance={20} duration={0.4} delay={i * 0.05}>
                        <SpotlightCard spotlightColor={action.color} className="cursor-pointer hover:scale-[1.02] transition-transform">
                          <button className="w-full p-3 flex flex-col items-center gap-2" onClick={() => sendMessage(`I want to ${action.label.toLowerCase()}`)}>
                            <action.icon className="w-5 h-5 text-muted-foreground" />
                            <span className="text-xs font-medium">{action.label}</span>
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
                            <div className="bg-sky-600 text-white rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed">
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                            <p className="text-[10px] text-muted-foreground/50 mt-1.5 text-right">{formatTime(msg.timestamp)}</p>
                          </div>
                          <Avatar className="w-8 h-8 shrink-0 mt-1"><AvatarFallback className="bg-secondary text-xs"><User className="w-4 h-4" /></AvatarFallback></Avatar>
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <Avatar className="w-8 h-8 shrink-0 mt-1"><AvatarFallback className="bg-sky-500/10 text-sky-500 text-xs"><Bot className="w-4 h-4" /></AvatarFallback></Avatar>
                          <div className="max-w-[85%] group">
                            <div className="rounded-2xl rounded-tl-sm bg-muted/40 border border-border/30 px-5 py-4 text-sm">
                              <MarkdownRenderer content={msg.content.replace(/```json[\s\S]*?```/g, "").trim()} />
                            </div>
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
                      <div className="max-w-[85%]">
                        <div className="rounded-2xl rounded-tl-sm bg-muted/40 border border-border/30 px-5 py-4 text-sm">
                          <MarkdownRenderer content={streamedText.replace(/```json[\s\S]*?```/g, "").trim()} />
                          <span className="inline-block w-1.5 h-4 bg-sky-500 rounded-sm ml-0.5 animate-pulse align-middle" />
                        </div>
                      </div>
                    </div>
                  )}
                  {isStreaming && !streamedText && (
                    <div className="flex gap-3 items-start">
                      <Avatar className="w-8 h-8 shrink-0 mt-1"><AvatarFallback className="bg-sky-500/10 text-sky-500 text-xs"><Bot className="w-4 h-4" /></AvatarFallback></Avatar>
                      <div className="rounded-2xl rounded-tl-sm bg-muted/40 border border-border/30 px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 rounded-full bg-sky-500/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-2 h-2 rounded-full bg-sky-500/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-2 h-2 rounded-full bg-sky-500/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                          <span className="text-xs text-muted-foreground">Checking schedule...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {error && <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</div>}
                </div>
              )}
            </ScrollArea>
            <div className="border-t border-border/50 p-4">
              <div className="flex gap-3 items-end">
                <Textarea placeholder="e.g. Book an appointment for tomorrow at 2pm..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} rows={1} className="resize-none min-h-[44px] max-h-[120px]" />
                {isStreaming ? (
                  <Button variant="destructive" size="icon" className="h-11 w-11 shrink-0" onClick={stopStream}><Square className="w-4 h-4" /></Button>
                ) : (
                  <Button size="icon" className="h-11 w-11 shrink-0 bg-sky-600 hover:bg-sky-700" onClick={() => sendMessage()} disabled={!input.trim()}><Send className="w-4 h-4" /></Button>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 2: No-Show Predictions */}
        <TabsContent value="noshow" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Today's Appointments", value: 18, color: "rgba(56, 189, 248, 0.15)", icon: CalendarCheck },
              { label: "Predicted No-Shows", value: 3, color: "rgba(239, 68, 68, 0.15)", icon: AlertCircle },
              { label: "Avg No-Show Rate", value: 14, color: "rgba(245, 158, 11, 0.15)", icon: BarChart3 },
              { label: "Wait-List Fills", value: 5, color: "rgba(34, 197, 94, 0.15)", icon: Users },
            ].map((kpi, i) => (
              <AnimatedContent key={kpi.label} distance={20} duration={0.4} delay={i * 0.08}>
                <SpotlightCard spotlightColor={kpi.color}>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-muted-foreground">{kpi.label}</p>
                      <kpi.icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-end gap-1">
                      <Counter value={kpi.value} fontSize={28} gradientFrom="transparent" gradientTo="transparent" />
                      {kpi.label === "Avg No-Show Rate" && <span className="text-lg font-bold mb-0.5">%</span>}
                    </div>
                  </div>
                </SpotlightCard>
              </AnimatedContent>
            ))}
          </div>

          <Card className="border-border/50">
            <div className="p-4 border-b border-border/50">
              <h3 className="font-semibold">Upcoming Appointments — Risk Analysis</h3>
            </div>
            <div className="divide-y divide-border/30">
              {MOCK_APPOINTMENTS.map((apt) => {
                const badge = getRiskBadge(apt.risk);
                return (
                  <div key={apt.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        {apt.patient.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{apt.patient}</p>
                        <p className="text-xs text-muted-foreground">{apt.time} &middot; {apt.reason}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">{apt.type}</Badge>
                      <Badge className={`${badge.className} border text-xs`}>{badge.label} ({Math.round(apt.risk * 100)}%)</Badge>
                      <Button variant="outline" size="sm" className="text-xs h-7">Send Reminder</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* Tab 3: Virtual Kiosk */}
        <TabsContent value="kiosk" className="mt-4">
          <Card className="border-border/50 min-h-[500px] flex items-center justify-center">
            <div className="max-w-md w-full p-8 text-center">
              <AnimatedContent distance={30} duration={0.5} key={kioskStep}>
                {kioskStep === 0 && (
                  <div className="space-y-6">
                    <div className="w-20 h-20 rounded-2xl bg-sky-500/10 flex items-center justify-center mx-auto">
                      <QrCode className="w-10 h-10 text-sky-500" />
                    </div>
                    <h3 className="text-xl font-semibold">Welcome to Virtual Check-In</h3>
                    <p className="text-sm text-muted-foreground">Scan your QR code or tap below to begin the check-in process.</p>
                    <div className="w-40 h-40 mx-auto rounded-xl border-2 border-dashed border-sky-500/30 flex items-center justify-center bg-sky-500/5">
                      <QrCode className="w-16 h-16 text-sky-500/50" />
                    </div>
                    <Button className="bg-sky-600 hover:bg-sky-700" onClick={() => setKioskStep(1)}>Simulate QR Scan</Button>
                  </div>
                )}
                {kioskStep === 1 && (
                  <div className="space-y-6">
                    <div className="w-20 h-20 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto">
                      <ShieldCheck className="w-10 h-10 text-violet-500" />
                    </div>
                    <h3 className="text-xl font-semibold">Verify Your Identity</h3>
                    <p className="text-sm text-muted-foreground">Confirming patient: <strong>Sarah Johnson</strong></p>
                    <div className="space-y-2 text-left bg-muted/30 rounded-lg p-4">
                      <p className="text-sm"><span className="text-muted-foreground">DOB:</span> March 15, 1985</p>
                      <p className="text-sm"><span className="text-muted-foreground">Appointment:</span> 09:00 AM — Follow-up</p>
                      <p className="text-sm"><span className="text-muted-foreground">Provider:</span> Dr. Smith</p>
                    </div>
                    <div className="flex gap-3 justify-center">
                      <Button variant="outline" onClick={() => setKioskStep(0)}>Back</Button>
                      <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => setKioskStep(2)}>Confirm &amp; Check In</Button>
                    </div>
                  </div>
                )}
                {kioskStep === 2 && (
                  <div className="space-y-6">
                    <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto">
                      <PartyPopper className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-emerald-500">Check-In Complete!</h3>
                    <p className="text-sm text-muted-foreground">You&apos;re all set. Please take a seat and we&apos;ll call you shortly.</p>
                    <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/20">
                      <p className="text-sm font-medium text-emerald-600">Estimated wait time: ~5 minutes</p>
                    </div>
                    <Button variant="outline" onClick={() => setKioskStep(0)}>New Check-In</Button>
                  </div>
                )}
              </AnimatedContent>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Disclaimer */}
      <div className="flex items-center gap-2 p-2.5 rounded-lg border border-sky-500/20 bg-sky-500/5 text-xs text-muted-foreground">
        <Sparkles className="w-3.5 h-3.5 shrink-0 text-sky-500" />
        <span>AI scheduling is for <strong>demo purposes</strong>. Actual bookings require integration with your practice management system.</span>
      </div>
    </div>
  );
}
