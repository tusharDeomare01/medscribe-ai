"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { CalendarDays, Loader2, Users, BarChart3, AlertTriangle, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import AnimatedContent from "@/components/AnimatedContent";
import SpotlightCard from "@/components/SpotlightCard";
import Counter from "@/components/Counter";

interface OptimizationResult {
  assignments: { staffId: string; name: string; role: string; station: string; patients: number; reason: string }[];
  skillMixScore: number;
  coverageScore: number;
  alerts: string[];
  suggestions: string[];
  summary: string;
}

const MOCK_STAFF = [
  { id: "S1", name: "Sarah R.", role: "RN", avatar: "SR" },
  { id: "S2", name: "Mike L.", role: "RN", avatar: "ML" },
  { id: "S3", name: "Emily T.", role: "RN", avatar: "ET" },
  { id: "S4", name: "Jason K.", role: "LPN", avatar: "JK" },
  { id: "S5", name: "Anna M.", role: "LPN", avatar: "AM" },
  { id: "S6", name: "David W.", role: "CNA", avatar: "DW" },
  { id: "S7", name: "Lisa P.", role: "CNA", avatar: "LP" },
  { id: "S8", name: "Tom H.", role: "RN", avatar: "TH" },
  { id: "S9", name: "Rachel S.", role: "CNA", avatar: "RS" },
  { id: "S10", name: "Chris B.", role: "LPN", avatar: "CB" },
];

const SHIFTS = ["Morning", "Afternoon", "Night"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const ROLE_COLORS: Record<string, string> = {
  RN: "bg-blue-500",
  LPN: "bg-emerald-500",
  CNA: "bg-amber-500",
};

function generateSchedule() {
  const schedule: Record<string, Record<string, string[]>> = {};
  DAYS.forEach((day) => {
    schedule[day] = {};
    SHIFTS.forEach((shift) => {
      const count = shift === "Night" ? 2 : 3;
      const shuffled = [...MOCK_STAFF].sort(() => Math.random() - 0.5);
      schedule[day][shift] = shuffled.slice(0, count).map((s) => s.id);
    });
  });
  return schedule;
}

export default function ShiftSchedulingPage() {
  const { getToken } = useAuth();
  const [schedule] = useState(() => generateSchedule());
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".shift-header", { y: -20, opacity: 0, duration: 0.5, ease: "power3.out" });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleOptimize = async () => {
    setOptimizing(true);
    try {
      const token = getToken();
      const res = await fetch("/api/ai/optimize-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          date: new Date().toISOString().split("T")[0],
          department: "General Medicine",
          availableStaff: MOCK_STAFF,
          predictedLoad: { morning: 24, afternoon: 20, night: 12 },
        }),
      });
      const data = await res.json();
      if (data.success) setOptimization(data.data);
    } catch { /* ignore */ }
    setOptimizing(false);
  };

  const getStaff = (id: string) => MOCK_STAFF.find((s) => s.id === id);

  return (
    <div ref={containerRef} className="flex flex-col gap-4">
      <AnimatedContent distance={30} duration={0.6}>
        <div className="shift-header flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-amber-500" />
              Smart Shift Scheduling
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">AI-optimized staff scheduling with skill mix and coverage analysis</p>
          </div>
          <Button size="sm" onClick={handleOptimize} disabled={optimizing} className="gap-1 bg-amber-600 hover:bg-amber-700">
            {optimizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Optimize with AI
          </Button>
        </div>
      </AnimatedContent>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500" /> RN</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500" /> LPN</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500" /> CNA</div>
      </div>

      {/* Weekly Grid */}
      <Card className="border-border/50 overflow-x-auto">
        <div className="min-w-[700px]">
          <div className="grid grid-cols-8 border-b border-border/50">
            <div className="p-3 text-xs font-medium text-muted-foreground">Shift</div>
            {DAYS.map((day) => (
              <div key={day} className="p-3 text-xs font-medium text-center">{day}</div>
            ))}
          </div>
          {SHIFTS.map((shift) => (
            <div key={shift} className="grid grid-cols-8 border-b border-border/30 last:border-0">
              <div className="p-3 text-xs font-medium text-muted-foreground flex items-center">{shift}</div>
              {DAYS.map((day) => {
                const staffIds = schedule[day]?.[shift] || [];
                return (
                  <div key={day} className="p-2 flex flex-wrap gap-1 justify-center">
                    {staffIds.map((id) => {
                      const s = getStaff(id);
                      if (!s) return null;
                      return (
                        <div key={id} className="group relative" title={`${s.name} (${s.role})`}>
                          <div className={`w-8 h-8 rounded-full ${ROLE_COLORS[s.role]} flex items-center justify-center text-white text-[10px] font-medium cursor-default`}>
                            {s.avatar}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Card>

      {/* AI Optimization Results */}
      {optimization && (
        <AnimatedContent distance={20} duration={0.4}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <SpotlightCard spotlightColor="rgba(245, 158, 11, 0.15)">
                <div className="p-5 space-y-3">
                  <h3 className="font-semibold">AI Optimization Summary</h3>
                  <p className="text-sm">{optimization.summary}</p>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Skill Mix:</span>
                      <Counter value={optimization.skillMixScore} fontSize={18} gradientFrom="transparent" gradientTo="transparent" />
                      <span className="text-xs text-muted-foreground">%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Coverage:</span>
                      <Counter value={optimization.coverageScore} fontSize={18} gradientFrom="transparent" gradientTo="transparent" />
                      <span className="text-xs text-muted-foreground">%</span>
                    </div>
                  </div>
                </div>
              </SpotlightCard>

              {optimization.assignments?.length > 0 && (
                <Card className="border-border/50">
                  <div className="p-4 border-b border-border/50"><h4 className="font-semibold text-sm">Suggested Assignments</h4></div>
                  <ScrollArea className="max-h-[300px]">
                    <div className="divide-y divide-border/30">
                      {optimization.assignments.map((a, i) => (
                        <div key={i} className="flex items-center justify-between px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${ROLE_COLORS[a.role] || "bg-muted"} flex items-center justify-center text-white text-[10px] font-medium`}>
                              {a.name.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{a.name}</p>
                              <p className="text-xs text-muted-foreground">{a.station} &middot; {a.patients} patients</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">{a.role}</Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              )}
            </div>

            <div className="space-y-4">
              {optimization.alerts?.length > 0 && (
                <Card className="p-4 border-border/50 border-red-500/20 bg-red-500/5">
                  <h4 className="text-sm font-medium text-red-500 mb-2 flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Alerts</h4>
                  <ul className="space-y-1">{optimization.alerts.map((a, i) => <li key={i} className="text-sm text-muted-foreground">{a}</li>)}</ul>
                </Card>
              )}
              {optimization.suggestions?.length > 0 && (
                <Card className="p-4 border-border/50">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1"><Sparkles className="w-4 h-4 text-amber-500" /> Suggestions</h4>
                  <ul className="space-y-1">{optimization.suggestions.map((s, i) => <li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-amber-500 mt-2 shrink-0" />{s}</li>)}</ul>
                </Card>
              )}
            </div>
          </div>
        </AnimatedContent>
      )}
    </div>
  );
}
