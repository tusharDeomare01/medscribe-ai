"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { Activity, Heart, Thermometer, Wind, AlertTriangle, Loader2, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { useVitalsSimulator, VitalPoint } from "@/hooks/use-vitals-simulator";
import AnimatedContent from "@/components/AnimatedContent";
import SpotlightCard from "@/components/SpotlightCard";
import Counter from "@/components/Counter";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface AnalysisResult {
  alertLevel: string;
  newsScore: number;
  assessments: { condition: string; risk: string; score: number; reasoning: string }[];
  recommendations: string[];
  trending: { improving: string[]; worsening: string[]; stable: string[] };
  summary: string;
}

const ALERT_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  normal: { color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  warning: { color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  critical: { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30" },
};

export default function PatientMonitoringPage() {
  const { getToken } = useAuth();
  const { data, current, triggerDeterioration, resetBaselines } = useVitalsSimulator(2000);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [isDeteriorating, setIsDeteriorating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".monitor-header", { y: -20, opacity: 0, duration: 0.5, ease: "power3.out" });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleAnalyze = async () => {
    if (!data.length) return;
    setAnalyzing(true);
    try {
      const token = getToken();
      const res = await fetch("/api/ai/analyze-vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ vitals: data.slice(-10), patientInfo: { name: "Demo Patient", age: 65 } }),
      });
      const d = await res.json();
      if (d.success) setAnalysis(d.data);
    } catch { /* ignore */ }
    setAnalyzing(false);
  };

  const handleTriggerAlert = () => {
    triggerDeterioration();
    setIsDeteriorating(true);
    setAnalysis(null);
  };

  const handleReset = () => {
    resetBaselines();
    setIsDeteriorating(false);
    setAnalysis(null);
  };

  const isAbnormal = (key: keyof VitalPoint, val: number) => {
    if (key === "heartRate") return val > 100 || val < 60;
    if (key === "systolic") return val > 140 || val < 90;
    if (key === "spo2") return val < 94;
    if (key === "temperature") return val > 100.4 || val < 96;
    if (key === "respRate") return val > 20 || val < 12;
    return false;
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-4">
      <AnimatedContent distance={30} duration={0.6}>
        <div className="monitor-header flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="w-6 h-6 text-cyan-500" />
              Patient Monitoring
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">Real-time vital signs monitoring with AI-powered deterioration detection</p>
          </div>
          <div className="flex gap-2">
            {!isDeteriorating ? (
              <Button variant="destructive" size="sm" onClick={handleTriggerAlert} className="gap-1">
                <AlertTriangle className="w-4 h-4" /> Simulate Alert
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
                <RotateCcw className="w-4 h-4" /> Reset
              </Button>
            )}
            <Button size="sm" onClick={handleAnalyze} disabled={analyzing} className="gap-1 bg-cyan-600 hover:bg-cyan-700">
              {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
              Analyze
            </Button>
          </div>
        </div>
      </AnimatedContent>

      {/* Vital KPIs */}
      <div data-tour-id="monitoring-vitals" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {current && [
          { label: "Heart Rate", value: current.heartRate, unit: "bpm", key: "heartRate" as keyof VitalPoint, icon: Heart, color: "rgba(239, 68, 68, 0.15)" },
          { label: "Blood Pressure", value: current.systolic, unit: `/${current.diastolic}`, key: "systolic" as keyof VitalPoint, icon: Activity, color: "rgba(56, 189, 248, 0.15)" },
          { label: "SpO2", value: current.spo2, unit: "%", key: "spo2" as keyof VitalPoint, icon: Wind, color: "rgba(34, 197, 94, 0.15)" },
          { label: "Temperature", value: current.temperature, unit: "°F", key: "temperature" as keyof VitalPoint, icon: Thermometer, color: "rgba(245, 158, 11, 0.15)" },
        ].map((kpi, i) => (
          <AnimatedContent key={kpi.label} distance={20} duration={0.4} delay={i * 0.08}>
            <SpotlightCard spotlightColor={kpi.color}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <kpi.icon className={`w-4 h-4 ${isAbnormal(kpi.key, kpi.value) ? "text-red-500 animate-pulse" : "text-muted-foreground"}`} />
                </div>
                <div className="flex items-end gap-1">
                  <Counter value={kpi.value} fontSize={28} gradientFrom="transparent" gradientTo="transparent" />
                  <span className="text-xs text-muted-foreground mb-1">{kpi.unit}</span>
                </div>
              </div>
            </SpotlightCard>
          </AnimatedContent>
        ))}
      </div>

      {/* Charts Grid */}
      <div data-tour-id="monitoring-charts" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4 border-border/50">
          <h4 className="text-sm font-medium mb-3">Heart Rate</h4>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data}>
              <defs><linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis domain={[40, 160]} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="heartRate" stroke="#ef4444" fill="url(#hrGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4 border-border/50">
          <h4 className="text-sm font-medium mb-3">Blood Pressure</h4>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis domain={[40, 200]} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="systolic" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="diastolic" stroke="#93c5fd" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4 border-border/50">
          <h4 className="text-sm font-medium mb-3">SpO2 &amp; Respiratory Rate</h4>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis yAxisId="spo2" domain={[80, 100]} tick={{ fontSize: 10 }} />
              <YAxis yAxisId="rr" orientation="right" domain={[8, 40]} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Line yAxisId="spo2" type="monotone" dataKey="spo2" stroke="#22c55e" strokeWidth={2} dot={false} />
              <Line yAxisId="rr" type="monotone" dataKey="respRate" stroke="#06b6d4" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4 border-border/50">
          <h4 className="text-sm font-medium mb-3">Temperature</h4>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data}>
              <defs><linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis domain={[95, 106]} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="temperature" stroke="#f59e0b" fill="url(#tempGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* AI Analysis */}
      {analysis && (
        <AnimatedContent distance={20} duration={0.4}>
          <ScrollArea className="max-h-[400px]">
            <SpotlightCard spotlightColor={analysis.alertLevel === "critical" ? "rgba(239, 68, 68, 0.2)" : analysis.alertLevel === "warning" ? "rgba(234, 179, 8, 0.2)" : "rgba(34, 197, 94, 0.2)"}>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-base">AI Analysis</h3>
                  <div className="flex items-center gap-2">
                    <Badge className={`${ALERT_CONFIG[analysis.alertLevel]?.bg || ""} ${ALERT_CONFIG[analysis.alertLevel]?.color || ""} ${ALERT_CONFIG[analysis.alertLevel]?.border || ""} border`}>
                      {analysis.alertLevel}
                    </Badge>
                    <Badge variant="outline">NEWS2: {analysis.newsScore}</Badge>
                  </div>
                </div>
                <p className="text-sm">{analysis.summary}</p>

                {analysis.assessments?.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {analysis.assessments.map((a, i) => (
                      <Card key={i} className="p-3 border-border/50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{a.condition}</span>
                          <Badge variant="outline" className="text-xs">{a.risk}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{a.reasoning}</p>
                      </Card>
                    ))}
                  </div>
                )}

                {analysis.recommendations?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Recommendations</p>
                    <ul className="space-y-1">{analysis.recommendations.map((r, i) => <li key={i} className="text-sm flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-cyan-500 mt-2 shrink-0" />{r}</li>)}</ul>
                  </div>
                )}
              </div>
            </SpotlightCard>
          </ScrollArea>
        </AnimatedContent>
      )}
    </div>
  );
}
