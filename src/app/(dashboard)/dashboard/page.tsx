"use client";

import { useEffect, useState } from "react";
import {
  Users,
  FileText,
  Upload,
  Brain,
  Activity,
  TrendingUp,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import SpotlightCard from "@/components/SpotlightCard";
import Counter from "@/components/Counter";
import AnimatedContent from "@/components/AnimatedContent";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const weeklyData = [
  { day: "Mon", notes: 12, analyses: 8 },
  { day: "Tue", notes: 19, analyses: 14 },
  { day: "Wed", notes: 15, analyses: 11 },
  { day: "Thu", notes: 22, analyses: 18 },
  { day: "Fri", notes: 17, analyses: 13 },
  { day: "Sat", notes: 8, analyses: 5 },
  { day: "Sun", notes: 5, analyses: 3 },
];

const entityData = [
  { entity: "Medications", count: 245 },
  { entity: "Diagnoses", count: 189 },
  { entity: "Procedures", count: 132 },
  { entity: "Symptoms", count: 278 },
  { entity: "Lab Results", count: 156 },
];

const recentActivity = [
  { id: 1, type: "note", text: "Clinical note created for Patient #1247", time: "2 min ago", icon: FileText },
  { id: 2, type: "report", text: "Lab report analyzed — 3 abnormal values flagged", time: "15 min ago", icon: Upload },
  { id: 3, type: "ai", text: "AI chat session — Medication interaction query", time: "32 min ago", icon: Brain },
  { id: 4, type: "patient", text: "New patient registered — Sarah Johnson", time: "1 hr ago", icon: Users },
  { id: 5, type: "note", text: "SOAP note signed for Patient #1190", time: "2 hrs ago", icon: FileText },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ patients: 0, notes: 0, reports: 0, analyses: 0 });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/stats", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((data) => {
          if (data.success) setStats(data.data);
        })
        .catch(() => {});
    }
  }, []);

  const kpiCards = [
    {
      title: "Total Patients",
      value: stats.patients || 48,
      change: "+12%",
      icon: Users,
      color: "text-sky-400",
      bg: "bg-sky-400/10",
      spotlight: "rgba(14, 165, 233, 0.15)",
    },
    {
      title: "Clinical Notes",
      value: stats.notes || 156,
      change: "+8%",
      icon: FileText,
      color: "text-violet-400",
      bg: "bg-violet-400/10",
      spotlight: "rgba(139, 92, 246, 0.15)",
    },
    {
      title: "Reports Analyzed",
      value: stats.reports || 89,
      change: "+23%",
      icon: Upload,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      spotlight: "rgba(16, 185, 129, 0.15)",
    },
    {
      title: "AI Analyses",
      value: stats.analyses || 312,
      change: "+18%",
      icon: Brain,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      spotlight: "rgba(245, 158, 11, 0.15)",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <AnimatedContent distance={30} duration={0.6}>
        <div>
          <h1 className="text-2xl font-bold">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, Dr.{" "}
            {user?.name?.split(" ").pop()}
          </h1>
          <p className="text-muted-foreground mt-1">Here&apos;s an overview of your clinical activity.</p>
        </div>
      </AnimatedContent>

      {/* KPI Cards */}
      <div data-tour-id="dashboard-kpis" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => (
          <AnimatedContent key={kpi.title} distance={40} delay={i * 0.1} duration={0.6}>
            <SpotlightCard
              className="border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/20 transition-colors duration-300"
              spotlightColor={kpi.spotlight as `rgba(${number}, ${number}, ${number}, ${number})`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <div className="mt-1 flex items-baseline gap-1">
                    <Counter
                      value={kpi.value}
                      fontSize={30}
                      fontWeight={700}
                      textColor="hsl(var(--foreground))"
                      gradientFrom="transparent"
                      gradientTo="transparent"
                    />
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs text-emerald-400 font-medium">{kpi.change}</span>
                    <span className="text-xs text-muted-foreground">this week</span>
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </div>
            </SpotlightCard>
          </AnimatedContent>
        ))}
      </div>

      {/* Charts Row */}
      <div data-tour-id="dashboard-charts" className="grid lg:grid-cols-2 gap-6">
        <AnimatedContent distance={40} delay={0.2}>
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base">Weekly Activity</CardTitle>
              <CardDescription>Clinical notes and AI analyses this week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="gradientNotes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradientAnalyses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(252, 56%, 57%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(252, 56%, 57%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Area type="monotone" dataKey="notes" stroke="hsl(199, 89%, 48%)" fill="url(#gradientNotes)" strokeWidth={2} />
                  <Area type="monotone" dataKey="analyses" stroke="hsl(252, 56%, 57%)" fill="url(#gradientAnalyses)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </AnimatedContent>

        <AnimatedContent distance={40} delay={0.35}>
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base">Entity Extraction Summary</CardTitle>
              <CardDescription>Medical entities detected this month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={entityData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis dataKey="entity" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={90} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(199, 89%, 48%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </AnimatedContent>
      </div>

      {/* Recent Activity */}
      <AnimatedContent distance={40} delay={0.4}>
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Recent Activity</CardTitle>
                <CardDescription>Latest actions across the platform</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                <Activity className="w-3 h-3 mr-1" /> Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="activity-item flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{item.text}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Clock className="w-3 h-3" />
                    {item.time}
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground/50" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </AnimatedContent>
    </div>
  );
}
