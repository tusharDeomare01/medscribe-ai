"use client";

import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Brain,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import SpotlightCard from "@/components/SpotlightCard";
import Counter from "@/components/Counter";
import AnimatedContent from "@/components/AnimatedContent";

const monthlyData = [
  { month: "Sep", patients: 32, notes: 78, reports: 45 },
  { month: "Oct", patients: 41, notes: 92, reports: 58 },
  { month: "Nov", patients: 38, notes: 85, reports: 52 },
  { month: "Dec", patients: 45, notes: 110, reports: 67 },
  { month: "Jan", patients: 52, notes: 134, reports: 78 },
  { month: "Feb", patients: 48, notes: 156, reports: 89 },
];

const entityDistribution = [
  { name: "Medications", value: 35, color: "#0ea5e9" },
  { name: "Diagnoses", value: 25, color: "#8b5cf6" },
  { name: "Symptoms", value: 20, color: "#f43f5e" },
  { name: "Procedures", value: 12, color: "#10b981" },
  { name: "Lab Results", value: 8, color: "#f59e0b" },
];

const noteTypeData = [
  { type: "Progress", count: 68 },
  { type: "Admission", count: 23 },
  { type: "Discharge", count: 31 },
  { type: "Consultation", count: 19 },
  { type: "Procedure", count: 15 },
];

const aiPerformance = [
  { metric: "NER Accuracy", value: 95 },
  { metric: "SOAP Quality", value: 88 },
  { metric: "ICD-10 Match", value: 82 },
  { metric: "Report Analysis", value: 91 },
  { metric: "Response Time", value: 96 },
  { metric: "User Satisfaction", value: 94 },
];

const statCards = [
  { label: "Avg Notes/Day", value: 22, icon: FileText, change: "+15%", spotlight: "rgba(14, 165, 233, 0.15)" },
  { label: "AI Accuracy", value: 95, suffix: "%", icon: Brain, change: "+3%", spotlight: "rgba(139, 92, 246, 0.15)" },
  { label: "Active Patients", value: 48, icon: Users, change: "+8%", spotlight: "rgba(16, 185, 129, 0.15)" },
  { label: "Avg Response", value: 1.2, suffix: "s", icon: Clock, change: "-18%", spotlight: "rgba(245, 158, 11, 0.15)" },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <AnimatedContent distance={30} duration={0.6}>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" /> Analytics
          </h1>
          <p className="text-muted-foreground mt-1">Platform usage insights and AI performance metrics.</p>
        </div>
      </AnimatedContent>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <AnimatedContent key={stat.label} distance={40} delay={i * 0.1} duration={0.6}>
            <SpotlightCard
              className="border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/20 transition-colors duration-300"
              spotlightColor={stat.spotlight as `rgba(${number}, ${number}, ${number}, ${number})`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <div className="mt-1 flex items-baseline gap-0.5">
                    <Counter
                      value={stat.value}
                      fontSize={28}
                      fontWeight={700}
                      textColor="hsl(var(--foreground))"
                      gradientFrom="transparent"
                      gradientTo="transparent"
                    />
                    {stat.suffix && (
                      <span className="text-lg font-bold text-foreground">{stat.suffix}</span>
                    )}
                  </div>
                </div>
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span className="text-xs text-emerald-400">{stat.change}</span>
              </div>
            </SpotlightCard>
          </AnimatedContent>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <AnimatedContent distance={40} delay={0.2} duration={0.6}>
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base">Monthly Trend</CardTitle>
              <CardDescription>Patients, notes, and reports over 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="gPatients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gNotes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Area type="monotone" dataKey="notes" stroke="#8b5cf6" fill="url(#gNotes)" strokeWidth={2} />
                  <Area type="monotone" dataKey="patients" stroke="#0ea5e9" fill="url(#gPatients)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </AnimatedContent>

        {/* Entity Distribution */}
        <AnimatedContent distance={40} delay={0.3} duration={0.6}>
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base">Entity Distribution</CardTitle>
              <CardDescription>Types of medical entities extracted</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={entityDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    dataKey="value"
                    stroke="none"
                  >
                    {entityDistribution.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 -mt-4">
                {entityDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                    <span className="text-xs text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedContent>

        {/* Note Types */}
        <AnimatedContent distance={40} delay={0.4} duration={0.6}>
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base">Clinical Note Types</CardTitle>
              <CardDescription>Distribution by note category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={noteTypeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="type" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </AnimatedContent>

        {/* AI Performance Radar */}
        <AnimatedContent distance={40} delay={0.5} duration={0.6}>
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base">AI Performance</CardTitle>
              <CardDescription>Quality metrics across different capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={aiPerformance}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="hsl(199, 89%, 48%)"
                    fill="hsl(199, 89%, 48%)"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </AnimatedContent>
      </div>
    </div>
  );
}
