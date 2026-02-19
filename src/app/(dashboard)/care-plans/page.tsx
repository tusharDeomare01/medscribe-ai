"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import {
  ClipboardList,
  Plus,
  Sparkles,
  Activity,
  Pill,
  Target,
  ChevronRight,
  Loader2,
  Search,
  Heart,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import AnimatedContent from "@/components/AnimatedContent";
import SpotlightCard from "@/components/SpotlightCard";
import { toast } from "sonner";

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
}

interface CarePlan {
  id: string;
  title: string;
  condition: string;
  goals: Array<{ goal: string; status: string }>;
  medications: Array<{ name: string }>;
  exercises: Array<{ activity: string }>;
  status: string;
  createdAt: string;
  patient: { name: string; age: number; gender: string };
}

const SPOT_COLORS = [
  "rgba(16, 185, 129, 0.15)",
  "rgba(59, 130, 246, 0.15)",
  "rgba(139, 92, 246, 0.15)",
  "rgba(236, 72, 153, 0.15)",
  "rgba(245, 158, 11, 0.15)",
  "rgba(6, 182, 212, 0.15)",
];

const CONDITIONS = [
  "Type 2 Diabetes",
  "Hypertension",
  "Asthma",
  "COPD",
  "Heart Failure",
  "Chronic Kidney Disease",
  "Obesity",
  "Arthritis",
  "Depression",
  "Anxiety",
  "Back Pain",
  "Migraine",
];

export default function CarePlansPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCarePlans();
    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.from(".plan-card", {
          y: 30,
          opacity: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "back.out(1.2)",
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading]);

  const fetchCarePlans = async () => {
    try {
      const token = getToken();
      const res = await fetch("/api/care-plans", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setCarePlans(data.data);
    } catch {
      toast.error("Failed to load care plans");
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const token = getToken();
      const res = await fetch("/api/patients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setPatients(data.data);
    } catch {
      // silent
    }
  };

  const generateCarePlan = async () => {
    if (!selectedPatient || !selectedCondition) {
      toast.error("Please select a patient and condition");
      return;
    }

    setGenerating(true);
    try {
      const token = getToken();
      const patient = patients.find((p) => p.id === selectedPatient);

      // Generate AI care plan
      const aiRes = await fetch("/api/ai/generate-care-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          condition: selectedCondition,
          patientInfo: patient ? { name: patient.name, age: patient.age, gender: patient.gender } : {},
        }),
      });
      const aiData = await aiRes.json();

      if (!aiData.success) {
        toast.error("Failed to generate care plan");
        return;
      }

      // Save to DB
      const saveRes = await fetch("/api/care-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: aiData.data.title || `Care Plan for ${selectedCondition}`,
          condition: selectedCondition,
          goals: aiData.data.goals || [],
          medications: aiData.data.medications || [],
          exercises: aiData.data.exercises || [],
          dietPlan: aiData.data.dietPlan || null,
          patientId: selectedPatient,
        }),
      });
      const saveData = await saveRes.json();

      if (saveData.success) {
        toast.success("Care plan generated successfully!");
        setDialogOpen(false);
        setSelectedPatient("");
        setSelectedCondition("");
        fetchCarePlans();
      }
    } catch {
      toast.error("Failed to generate care plan");
    } finally {
      setGenerating(false);
    }
  };

  const filteredPlans = carePlans.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.condition.toLowerCase().includes(search.toLowerCase()) ||
      p.patient.name.toLowerCase().includes(search.toLowerCase())
  );

  const getProgress = (goals: Array<{ status: string }>) => {
    if (!goals || goals.length === 0) return 0;
    const completed = goals.filter((g) => g.status === "completed").length;
    return Math.round((completed / goals.length) * 100);
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <AnimatedContent distance={30} duration={0.6}>
        <div data-tour-id="care-plans-header" className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-primary" />
              Care Plans
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              AI-generated personalized care plans for your patients
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Generate Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Generate AI Care Plan
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Patient</Label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} ({p.age}y, {p.gender})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Condition</Label>
                  <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITIONS.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full gap-2"
                  onClick={generateCarePlan}
                  disabled={generating || !selectedPatient || !selectedCondition}
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Care Plan
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </AnimatedContent>

      {/* Search */}
      <AnimatedContent distance={20} duration={0.4} delay={0.1}>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search care plans..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </AnimatedContent>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 space-y-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </Card>
          ))}
        </div>
      ) : filteredPlans.length === 0 ? (
        <Card className="p-12 text-center">
          <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No care plans yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Generate an AI-powered care plan for your patients
          </p>
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Create First Plan
          </Button>
        </Card>
      ) : (
        <div data-tour-id="care-plans-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlans.map((plan, i) => {
            const progress = getProgress(plan.goals as Array<{ status: string }>);
            return (
              <div key={plan.id} className="plan-card">
                <SpotlightCard spotlightColor={SPOT_COLORS[i % SPOT_COLORS.length]}>
                  <button
                    className="w-full p-5 text-left space-y-4"
                    onClick={() => router.push(`/care-plans/${plan.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-sm line-clamp-1">{plan.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {plan.patient.name} &middot; {plan.condition}
                        </p>
                      </div>
                      <Badge
                        variant={plan.status === "active" ? "default" : "secondary"}
                        className="text-[10px]"
                      >
                        {plan.status}
                      </Badge>
                    </div>

                    {/* Progress Ring */}
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14">
                        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                          <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/30" />
                          <circle
                            cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="3"
                            className="text-primary"
                            strokeDasharray={`${2 * Math.PI * 24}`}
                            strokeDashoffset={`${2 * Math.PI * 24 * (1 - progress / 100)}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                          {progress}%
                        </span>
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Target className="w-3 h-3" />
                          {(plan.goals as Array<{ goal: string }>)?.length || 0} goals
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Pill className="w-3 h-3" />
                          {(plan.medications as Array<{ name: string }>)?.length || 0} medications
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Activity className="w-3 h-3" />
                          {(plan.exercises as Array<{ activity: string }>)?.length || 0} exercises
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/30">
                      <span>{new Date(plan.createdAt).toLocaleDateString()}</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>
                </SpotlightCard>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
