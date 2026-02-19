"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  Trophy,
  Flame,
  Star,
  Lock,
  Search,
  Heart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import AnimatedContent from "@/components/AnimatedContent";
import SpotlightCard from "@/components/SpotlightCard";
import { toast } from "sonner";
import { fireConfetti } from "@/lib/confetti";

interface Patient {
  id: string;
  name: string;
  gamificationPoints: number;
  streakDays: number;
}

interface EducationItem {
  id: string;
  condition: string;
  title: string;
  content: string;
  simplifiedContent: string | null;
  category: string;
  readTime: number | null;
  createdAt: string;
  patient: { name: string } | null;
}

interface AchievementItem {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  earnedAt: string;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  explainer: { bg: "bg-blue-500/10", text: "text-blue-500", label: "Explainer" },
  lifestyle: { bg: "bg-emerald-500/10", text: "text-emerald-500", label: "Lifestyle" },
  medication: { bg: "bg-violet-500/10", text: "text-violet-500", label: "Medication" },
  faq: { bg: "bg-amber-500/10", text: "text-amber-500", label: "FAQ" },
};

const CONDITIONS = [
  "Type 2 Diabetes",
  "Hypertension",
  "Asthma",
  "COPD",
  "Heart Failure",
  "Anxiety",
  "Depression",
  "Arthritis",
  "Migraine",
  "Obesity",
];

const ALL_ACHIEVEMENTS = [
  { type: "streak", title: "First Check-in", icon: "🎯", points: 10, description: "Complete your first health check" },
  { type: "streak", title: "7-Day Streak", icon: "🔥", points: 50, description: "Maintain a 7-day activity streak" },
  { type: "completion", title: "Care Plan Completed", icon: "✅", points: 100, description: "Complete all goals in a care plan" },
  { type: "engagement", title: "Education Explorer", icon: "📚", points: 25, description: "Read 5 education articles" },
  { type: "milestone", title: "Medication Adherent", icon: "💊", points: 75, description: "Follow medication schedule for 30 days" },
  { type: "milestone", title: "Health Champion", icon: "🏆", points: 200, description: "Earn 500 total points" },
];

export default function EducationPage() {
  const { getToken } = useAuth();
  const [content, setContent] = useState<EducationItem[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.from(".edu-card", {
          y: 20,
          opacity: 0,
          duration: 0.4,
          stagger: 0.06,
          ease: "power3.out",
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading]);

  const fetchData = async () => {
    try {
      const token = getToken();
      const [contentRes, patientsRes] = await Promise.all([
        fetch("/api/education", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/patients", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const contentData = await contentRes.json();
      const patientsData = await patientsRes.json();

      if (contentData.success) setContent(contentData.data);
      if (patientsData.success) {
        setPatients(patientsData.data);
        // Load achievements for first patient if available
        if (patientsData.data.length > 0) {
          const achRes = await fetch(`/api/achievements?patientId=${patientsData.data[0].id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const achData = await achRes.json();
          if (achData.success) {
            setAchievements(achData.data.achievements);
            setTotalPoints(achData.data.points);
            setStreakDays(achData.data.streakDays);
          }
        }
      }
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const generateContent = async () => {
    if (!selectedCondition) {
      toast.error("Please select a condition");
      return;
    }
    setGenerating(true);
    try {
      const token = getToken();

      const aiRes = await fetch("/api/ai/generate-education", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ condition: selectedCondition }),
      });
      const aiData = await aiRes.json();

      if (!aiData.success) {
        toast.error("Failed to generate content");
        return;
      }

      const wordCount = aiData.data.content.split(/\s+/).length;
      const readTime = Math.max(1, Math.round(wordCount / 200));

      const saveRes = await fetch("/api/education", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          condition: selectedCondition,
          title: `Understanding ${selectedCondition}`,
          content: aiData.data.content,
          category: "explainer",
          readTime,
          patientId: selectedPatient || null,
        }),
      });
      const saveData = await saveRes.json();

      if (saveData.success) {
        toast.success("Education content generated!");
        setDialogOpen(false);
        setSelectedCondition("");
        setSelectedPatient("");
        fetchData();
      }
    } catch {
      toast.error("Failed to generate content");
    } finally {
      setGenerating(false);
    }
  };

  const awardAchievement = async (achievement: typeof ALL_ACHIEVEMENTS[0]) => {
    if (!patients[0]) return;
    try {
      const token = getToken();
      const res = await fetch("/api/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patientId: patients[0].id,
          ...achievement,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fireConfetti();
        toast.success(`Achievement unlocked: ${achievement.title}!`);
        setTotalPoints((p) => p + achievement.points);
        setAchievements((prev) => [data.data, ...prev]);
      }
    } catch {
      toast.error("Failed to award achievement");
    }
  };

  const filteredContent = content.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.condition.toLowerCase().includes(search.toLowerCase())
  );

  const earnedTitles = new Set(achievements.map((a) => a.title));
  const levelProgress = Math.min(100, (totalPoints % 100));
  const currentLevel = Math.floor(totalPoints / 100) + 1;

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <AnimatedContent distance={30} duration={0.6}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-primary" />
              Health Education
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              AI-generated educational content and patient engagement
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> Generate Content
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Generate Education Content
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
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
                <div className="space-y-2">
                  <Label>For Patient (optional)</Label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger>
                      <SelectValue placeholder="All patients" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full gap-2" onClick={generateContent} disabled={generating}>
                  {generating ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Generate</>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </AnimatedContent>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Content Feed */}
        <div data-tour-id="education-content" className="lg:col-span-2 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6"><Skeleton className="h-4 w-3/4 mb-2" /><Skeleton className="h-3 w-full" /></Card>
              ))}
            </div>
          ) : filteredContent.length === 0 ? (
            <Card className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No content yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Generate AI-powered education materials for conditions
              </p>
              <Button onClick={() => setDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" /> Create Content
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredContent.map((item) => {
                const catStyle = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.explainer;
                const isExpanded = expandedId === item.id;

                return (
                  <div key={item.id} className="edu-card">
                    <SpotlightCard spotlightColor="rgba(59, 130, 246, 0.1)">
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className={`${catStyle.bg} ${catStyle.text} text-[10px]`}>
                              {catStyle.label}
                            </Badge>
                            {item.readTime && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" /> {item.readTime} min read
                              </span>
                            )}
                          </div>
                          <Badge variant="outline" className="text-[10px] gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" /> AI Generated
                          </Badge>
                        </div>

                        <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                        <p className="text-xs text-muted-foreground mb-2">
                          {item.condition}
                          {item.patient && ` • For: ${item.patient.name}`}
                        </p>

                        {!isExpanded && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.content.slice(0, 150)}...
                          </p>
                        )}

                        {isExpanded && (
                          <div className="mt-3 prose prose-sm dark:prose-invert max-w-none">
                            <MarkdownRenderer content={item.content} />
                          </div>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 gap-1 text-xs"
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        >
                          {isExpanded ? (
                            <><ChevronUp className="w-3 h-3" /> Show Less</>
                          ) : (
                            <><ChevronDown className="w-3 h-3" /> Read More</>
                          )}
                        </Button>
                      </div>
                    </SpotlightCard>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Gamification Panel */}
        <div data-tour-id="education-achievements" className="space-y-4">
          <AnimatedContent distance={30} duration={0.5} delay={0.2}>
            <SpotlightCard spotlightColor="rgba(245, 158, 11, 0.12)">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  Gamification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Points & Level */}
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                  <p className="text-3xl font-bold text-amber-500">{totalPoints}</p>
                  <p className="text-xs text-muted-foreground">Total Points</p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                      <span>Level {currentLevel}</span>
                      <span>Level {currentLevel + 1}</span>
                    </div>
                    <Progress value={levelProgress} className="h-1.5" />
                  </div>
                </div>

                {/* Streak */}
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border/30 bg-muted/20">
                  <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{streakDays}</p>
                    <p className="text-xs text-muted-foreground">Day Streak</p>
                  </div>
                </div>

                {/* Achievements */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Achievements
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {ALL_ACHIEVEMENTS.map((ach) => {
                      const earned = earnedTitles.has(ach.title);
                      return (
                        <button
                          key={ach.title}
                          className={`p-2 rounded-lg border text-center transition-all ${
                            earned
                              ? "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10"
                              : "border-border/30 bg-muted/10 opacity-50"
                          }`}
                          onClick={() => !earned && awardAchievement(ach)}
                          title={`${ach.title}: ${ach.description} (${ach.points} pts)`}
                        >
                          <span className="text-xl">{ach.icon}</span>
                          <p className="text-[9px] font-medium mt-0.5 line-clamp-1">{ach.title}</p>
                          {!earned && <Lock className="w-2.5 h-2.5 mx-auto mt-0.5 text-muted-foreground/40" />}
                          {earned && <Star className="w-2.5 h-2.5 mx-auto mt-0.5 text-amber-500" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </SpotlightCard>
          </AnimatedContent>

          {/* Recent Achievements */}
          {achievements.length > 0 && (
            <AnimatedContent distance={20} duration={0.4} delay={0.3}>
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Heart className="w-3.5 h-3.5 text-pink-500" />
                    Recent Awards
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {achievements.slice(0, 5).map((ach) => (
                    <div key={ach.id} className="flex items-center gap-2 text-sm">
                      <span>{ach.icon}</span>
                      <span className="flex-1 text-xs">{ach.title}</span>
                      <Badge variant="outline" className="text-[9px]">+{ach.points}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </AnimatedContent>
          )}
        </div>
      </div>
    </div>
  );
}
