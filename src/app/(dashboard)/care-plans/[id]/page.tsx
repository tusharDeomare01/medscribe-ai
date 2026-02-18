"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Target,
  Pill,
  Activity,
  Utensils,
  CheckCircle2,
  Circle,
  Clock,
  Heart,
  Footprints,
  Moon,
  Gauge,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import AnimatedContent from "@/components/AnimatedContent";
import SpotlightCard from "@/components/SpotlightCard";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Goal {
  goal: string;
  target: string;
  deadline: string;
  status: string;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  notes?: string;
}

interface Exercise {
  activity: string;
  duration: string;
  frequency: string;
  intensity?: string;
}

interface DietItem {
  meal: string;
  items: string[];
  notes?: string;
}

interface CarePlanDetail {
  id: string;
  title: string;
  condition: string;
  goals: Goal[];
  medications: Medication[];
  exercises: Exercise[];
  dietPlan: DietItem[] | null;
  status: string;
  createdAt: string;
  patient: {
    name: string;
    age: number;
    gender: string;
  };
}

function generateMockWearableData() {
  const now = new Date();
  return Array.from({ length: 24 }, (_, i) => {
    const hour = (now.getHours() - 23 + i + 24) % 24;
    return {
      time: `${hour.toString().padStart(2, "0")}:00`,
      steps: Math.floor(200 + Math.random() * 800 * (hour >= 7 && hour <= 21 ? 1 : 0.1)),
      heartRate: Math.floor(62 + Math.random() * 25 + (hour >= 8 && hour <= 18 ? 10 : 0)),
      sleep: hour >= 22 || hour <= 6 ? Math.round((0.7 + Math.random() * 0.3) * 10) / 10 : 0,
    };
  });
}

export default function CarePlanDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getToken } = useAuth();
  const [plan, setPlan] = useState<CarePlanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingGoal, setUpdatingGoal] = useState<number | null>(null);

  const wearableData = useMemo(() => generateMockWearableData(), []);
  const totalSteps = useMemo(() => wearableData.reduce((s, d) => s + d.steps, 0), [wearableData]);
  const avgHeartRate = useMemo(
    () => Math.round(wearableData.reduce((s, d) => s + d.heartRate, 0) / wearableData.length),
    [wearableData]
  );
  const totalSleep = useMemo(
    () => Math.round(wearableData.reduce((s, d) => s + d.sleep, 0) * 10) / 10,
    [wearableData]
  );

  useEffect(() => {
    fetchPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPlan = async () => {
    try {
      const token = getToken();
      const res = await fetch(`/api/care-plans/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setPlan(data.data);
    } catch {
      toast.error("Failed to load care plan");
    } finally {
      setLoading(false);
    }
  };

  const toggleGoal = async (index: number) => {
    if (!plan) return;
    setUpdatingGoal(index);

    const updatedGoals = [...plan.goals];
    updatedGoals[index] = {
      ...updatedGoals[index],
      status: updatedGoals[index].status === "completed" ? "pending" : "completed",
    };

    try {
      const token = getToken();
      const res = await fetch(`/api/care-plans/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ goals: updatedGoals }),
      });
      const data = await res.json();
      if (data.success) {
        setPlan({ ...plan, goals: updatedGoals });
        if (updatedGoals[index].status === "completed") {
          toast.success("Goal completed!");
        }
      }
    } catch {
      toast.error("Failed to update goal");
    } finally {
      setUpdatingGoal(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-32 mb-4" />
              <Skeleton className="h-32 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Care plan not found</p>
        <Button onClick={() => router.push("/care-plans")} className="mt-4">
          Back to Care Plans
        </Button>
      </div>
    );
  }

  const progress = plan.goals.length
    ? Math.round((plan.goals.filter((g) => g.status === "completed").length / plan.goals.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <AnimatedContent distance={30} duration={0.6}>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/care-plans")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{plan.title}</h1>
              <Badge variant="outline" className="gap-1">
                <Sparkles className="w-3 h-3" /> AI Generated
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {plan.patient.name} &middot; {plan.condition} &middot; {plan.patient.age}y {plan.patient.gender}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{progress}%</p>
            <p className="text-xs text-muted-foreground">Complete</p>
          </div>
        </div>
      </AnimatedContent>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Goals & Milestones */}
        <AnimatedContent distance={30} duration={0.5} delay={0.1}>
          <SpotlightCard spotlightColor="rgba(16, 185, 129, 0.12)">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-500" />
                Goals & Milestones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {plan.goals.filter((g) => g.status === "completed").length} of {plan.goals.length} completed
              </p>
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {plan.goals.map((goal, i) => (
                  <button
                    key={i}
                    className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left"
                    onClick={() => toggleGoal(i)}
                    disabled={updatingGoal === i}
                  >
                    {updatingGoal === i ? (
                      <Loader2 className="w-4 h-4 mt-0.5 animate-spin text-primary shrink-0" />
                    ) : goal.status === "completed" ? (
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 mt-0.5 text-muted-foreground/40 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${goal.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                        {goal.goal}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {goal.target && (
                          <span className="text-[10px] text-muted-foreground">{goal.target}</span>
                        )}
                        {goal.deadline && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" /> {goal.deadline}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </SpotlightCard>
        </AnimatedContent>

        {/* Medication Schedule */}
        <AnimatedContent distance={30} duration={0.5} delay={0.2}>
          <SpotlightCard spotlightColor="rgba(59, 130, 246, 0.12)">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Pill className="w-4 h-4 text-blue-500" />
                Medication Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {plan.medications.map((med, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/30 bg-muted/20"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Pill className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{med.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {med.dosage} &middot; {med.frequency}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    <Clock className="w-2.5 h-2.5 mr-1" />
                    {med.time}
                  </Badge>
                </div>
              ))}
              {plan.medications.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No medications prescribed
                </p>
              )}
            </CardContent>
          </SpotlightCard>
        </AnimatedContent>

        {/* Wearable Data */}
        <AnimatedContent distance={30} duration={0.5} delay={0.3}>
          <SpotlightCard spotlightColor="rgba(139, 92, 246, 0.12)">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-violet-500" />
                Health Metrics
                <Badge variant="outline" className="text-[10px] ml-auto">Live</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-muted/30 border border-border/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Footprints className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[10px] text-muted-foreground">Steps</span>
                  </div>
                  <p className="text-lg font-bold">{totalSteps.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="w-3.5 h-3.5 text-red-500" />
                    <span className="text-[10px] text-muted-foreground">Heart Rate</span>
                  </div>
                  <p className="text-lg font-bold">{avgHeartRate} <span className="text-xs font-normal text-muted-foreground">bpm</span></p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Moon className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-[10px] text-muted-foreground">Sleep</span>
                  </div>
                  <p className="text-lg font-bold">{totalSleep} <span className="text-xs font-normal text-muted-foreground">hrs</span></p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Gauge className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[10px] text-muted-foreground">BP</span>
                  </div>
                  <p className="text-lg font-bold">120<span className="text-xs font-normal text-muted-foreground">/80</span></p>
                </div>
              </div>

              <div className="h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={wearableData}>
                    <defs>
                      <linearGradient id="stepsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={5} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                    />
                    <Area type="monotone" dataKey="steps" stroke="#8b5cf6" fill="url(#stepsGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </SpotlightCard>
        </AnimatedContent>

        {/* Exercise & Diet */}
        <AnimatedContent distance={30} duration={0.5} delay={0.4}>
          <SpotlightCard spotlightColor="rgba(245, 158, 11, 0.12)">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-500" />
                Exercise & Diet Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[340px] overflow-y-auto pr-1">
              {/* Exercises */}
              {plan.exercises.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exercises</p>
                  {plan.exercises.map((ex, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/30 bg-muted/20">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                        <Activity className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{ex.activity}</p>
                        <p className="text-xs text-muted-foreground">
                          {ex.duration} &middot; {ex.frequency}
                          {ex.intensity && ` &middot; ${ex.intensity}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Diet */}
              {plan.dietPlan && (plan.dietPlan as DietItem[]).length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Utensils className="w-3 h-3" /> Diet Plan
                  </p>
                  {(plan.dietPlan as DietItem[]).map((meal, i) => (
                    <div key={i} className="p-2.5 rounded-lg border border-border/30 bg-muted/20">
                      <p className="text-xs font-medium text-primary mb-1">{meal.meal}</p>
                      <p className="text-sm">{meal.items?.join(", ")}</p>
                      {meal.notes && <p className="text-xs text-muted-foreground mt-0.5">{meal.notes}</p>}
                    </div>
                  ))}
                </div>
              )}

              {plan.exercises.length === 0 && (!plan.dietPlan || (plan.dietPlan as DietItem[]).length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No exercises or diet plan specified
                </p>
              )}
            </CardContent>
          </SpotlightCard>
        </AnimatedContent>
      </div>
    </div>
  );
}
