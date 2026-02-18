"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ClipboardList,
  FileText,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  Calendar,
  Shield,
  Heart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import AnimatedContent from "@/components/AnimatedContent";
import SpotlightCard from "@/components/SpotlightCard";
import { toast } from "sonner";

interface VisitDetail {
  id: string;
  visitType: string;
  status: string;
  preScreening: {
    chiefComplaint?: string;
    symptoms?: string[];
    vitals?: Record<string, string>;
    duration?: string;
  } | null;
  summary: string | null;
  careInstructions: string | null;
  followUpDate: string | null;
  createdAt: string;
  patient: {
    id: string;
    name: string;
    age: number;
    gender: string;
  };
  clinicalNote: {
    id: string;
    rawText: string;
    soapNote: Record<string, string> | null;
  } | null;
}

interface PreScreeningForm {
  chiefComplaint: string;
  symptoms: string;
  duration: string;
  temperature: string;
  bloodPressure: string;
  heartRate: string;
  additionalNotes: string;
}

export default function VisitDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getToken } = useAuth();
  const [visit, setVisit] = useState<VisitDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [screeningStep, setScreeningStep] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [screeningResult, setScreeningResult] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<PreScreeningForm>({
    chiefComplaint: "",
    symptoms: "",
    duration: "",
    temperature: "",
    bloodPressure: "",
    heartRate: "",
    additionalNotes: "",
  });

  useEffect(() => {
    fetchVisit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchVisit = async () => {
    try {
      const token = getToken();
      const res = await fetch(`/api/visit-summaries/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setVisit(data.data);
    } catch {
      toast.error("Failed to load visit");
    } finally {
      setLoading(false);
    }
  };

  const submitPreScreening = async () => {
    if (!form.chiefComplaint) {
      toast.error("Chief complaint is required");
      return;
    }
    setAnalyzing(true);
    try {
      const token = getToken();
      const screeningData = {
        chiefComplaint: form.chiefComplaint,
        symptoms: form.symptoms.split(",").map((s) => s.trim()).filter(Boolean),
        duration: form.duration,
        vitals: {
          temperature: form.temperature,
          bloodPressure: form.bloodPressure,
          heartRate: form.heartRate,
        },
        additionalNotes: form.additionalNotes,
      };

      // Save pre-screening to visit
      await fetch(`/api/visit-summaries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ preScreening: screeningData, status: "in-progress" }),
      });

      // AI analysis
      const aiRes = await fetch("/api/ai/pre-screening", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ screeningData }),
      });
      const aiData = await aiRes.json();

      if (aiData.success) {
        setScreeningResult(aiData.data);
        toast.success("Pre-screening analysis complete");
        fetchVisit();
      }
    } catch {
      toast.error("Failed to analyze screening");
    } finally {
      setAnalyzing(false);
    }
  };

  const generateVisitSummary = async () => {
    if (!visit?.clinicalNote) {
      toast.error("Link a clinical note first");
      return;
    }
    setGeneratingSummary(true);
    try {
      const token = getToken();
      const aiRes = await fetch("/api/ai/generate-visit-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          clinicalNoteText: visit.clinicalNote.rawText,
          soapNote: visit.clinicalNote.soapNote,
        }),
      });
      const aiData = await aiRes.json();

      if (aiData.success) {
        const summaryText = aiData.data.patientSummary || JSON.stringify(aiData.data, null, 2);
        const instructions = [
          ...(aiData.data.followUpInstructions || []),
          ...(aiData.data.warningSign || []).map((w: string) => `Warning: ${w}`),
        ].join("\n- ");

        await fetch(`/api/visit-summaries/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            summary: summaryText,
            careInstructions: instructions ? `- ${instructions}` : null,
            status: "completed",
          }),
        });

        toast.success("Visit summary generated!");
        fetchVisit();
      }
    } catch {
      toast.error("Failed to generate summary");
    } finally {
      setGeneratingSummary(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Visit not found</p>
        <Button onClick={() => router.push("/visits")} className="mt-4">
          Back to Visits
        </Button>
      </div>
    );
  }

  const steps = ["Chief Complaint", "Symptoms & Duration", "Vitals"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <AnimatedContent distance={30} duration={0.6}>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/visits")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              Visit — {visit.patient.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {visit.visitType === "telehealth" ? "Telehealth" : "In-Person"} &middot;{" "}
              {new Date(visit.createdAt).toLocaleDateString()} &middot;{" "}
              <Badge variant="outline" className="text-[10px] ml-1">{visit.status}</Badge>
            </p>
          </div>
        </div>
      </AnimatedContent>

      {/* Tabs */}
      <Tabs defaultValue="pre-screening">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pre-screening" className="gap-1.5">
            <ClipboardList className="w-3.5 h-3.5" /> Pre-Screening
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Visit Notes
          </TabsTrigger>
          <TabsTrigger value="summary" className="gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Summary
          </TabsTrigger>
        </TabsList>

        {/* Pre-Screening Tab */}
        <TabsContent value="pre-screening" className="mt-4 space-y-4">
          {visit.preScreening ? (
            <div className="space-y-4">
              <SpotlightCard spotlightColor="rgba(16, 185, 129, 0.12)">
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-semibold">Pre-Screening Completed</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Chief Complaint</p>
                      <p className="text-sm">{visit.preScreening.chiefComplaint || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Duration</p>
                      <p className="text-sm">{visit.preScreening.duration || "N/A"}</p>
                    </div>
                    {visit.preScreening.symptoms && (
                      <div className="col-span-2">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Symptoms</p>
                        <div className="flex flex-wrap gap-1">
                          {visit.preScreening.symptoms.map((s: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {visit.preScreening.vitals && (
                      <div className="col-span-2">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Vitals</p>
                        <div className="flex gap-4">
                          {Object.entries(visit.preScreening.vitals).map(([key, val]) => (
                            val && (
                              <span key={key} className="text-xs">
                                <span className="text-muted-foreground capitalize">{key}: </span>
                                <span className="font-medium">{val as string}</span>
                              </span>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </SpotlightCard>

              {screeningResult && (
                <AnimatedContent distance={20} duration={0.4}>
                  <SpotlightCard spotlightColor="rgba(139, 92, 246, 0.12)">
                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-violet-500" />
                        <h3 className="font-semibold">AI Analysis</h3>
                      </div>
                      <p className="text-sm">{(screeningResult as { summary?: string }).summary}</p>
                      {(screeningResult as { suggestedQuestions?: string[] }).suggestedQuestions && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Suggested Questions</p>
                          <ul className="space-y-1">
                            {((screeningResult as { suggestedQuestions: string[] }).suggestedQuestions).map((q: string, i: number) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <Stethoscope className="w-3 h-3 mt-1 text-violet-500 shrink-0" />
                                {q}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </SpotlightCard>
                </AnimatedContent>
              )}
            </div>
          ) : (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-primary" />
                  Pre-Visit Screening
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  {steps.map((step, i) => (
                    <div key={step} className="flex items-center gap-1">
                      <div
                        className={`w-6 h-6 rounded-full text-[10px] flex items-center justify-center font-bold ${
                          i <= screeningStep
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <span className="text-[10px] text-muted-foreground hidden sm:inline">{step}</span>
                      {i < 2 && <div className="w-8 h-px bg-border" />}
                    </div>
                  ))}
                </div>
                <Progress value={((screeningStep + 1) / 3) * 100} className="h-1 mt-2" />
              </CardHeader>
              <CardContent className="space-y-4">
                {screeningStep === 0 && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Chief Complaint *</Label>
                      <Textarea
                        placeholder="What is the main reason for this visit?"
                        value={form.chiefComplaint}
                        onChange={(e) => setForm({ ...form, chiefComplaint: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <Button
                      onClick={() => form.chiefComplaint && setScreeningStep(1)}
                      disabled={!form.chiefComplaint}
                    >
                      Next
                    </Button>
                  </div>
                )}

                {screeningStep === 1 && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Symptoms (comma-separated)</Label>
                      <Input
                        placeholder="e.g., headache, fatigue, nausea"
                        value={form.symptoms}
                        onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Duration</Label>
                      <Input
                        placeholder="e.g., 3 days, 2 weeks"
                        value={form.duration}
                        onChange={(e) => setForm({ ...form, duration: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Additional Notes</Label>
                      <Textarea
                        placeholder="Any other relevant information..."
                        value={form.additionalNotes}
                        onChange={(e) => setForm({ ...form, additionalNotes: e.target.value })}
                        rows={2}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setScreeningStep(0)}>Back</Button>
                      <Button onClick={() => setScreeningStep(2)}>Next</Button>
                    </div>
                  </div>
                )}

                {screeningStep === 2 && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label>Temperature</Label>
                        <Input
                          placeholder="98.6 F"
                          value={form.temperature}
                          onChange={(e) => setForm({ ...form, temperature: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Blood Pressure</Label>
                        <Input
                          placeholder="120/80"
                          value={form.bloodPressure}
                          onChange={(e) => setForm({ ...form, bloodPressure: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Heart Rate</Label>
                        <Input
                          placeholder="72 bpm"
                          value={form.heartRate}
                          onChange={(e) => setForm({ ...form, heartRate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setScreeningStep(1)}>Back</Button>
                      <Button onClick={submitPreScreening} disabled={analyzing} className="gap-2">
                        {analyzing ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                        ) : (
                          <><Sparkles className="w-4 h-4" /> Submit & Analyze</>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Visit Notes Tab */}
        <TabsContent value="notes" className="mt-4 space-y-4">
          {visit.clinicalNote ? (
            <SpotlightCard spotlightColor="rgba(59, 130, 246, 0.12)">
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    Linked Clinical Note
                  </h3>
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={generateVisitSummary}
                    disabled={generatingSummary}
                  >
                    {generatingSummary ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</>
                    ) : (
                      <><Sparkles className="w-3.5 h-3.5" /> Generate Summary</>
                    )}
                  </Button>
                </div>
                <div className="text-sm bg-muted/30 p-4 rounded-lg border border-border/30">
                  <p className="whitespace-pre-wrap line-clamp-10">{visit.clinicalNote.rawText}</p>
                </div>
                {visit.clinicalNote.soapNote && (
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(visit.clinicalNote.soapNote).map(([key, value]) => (
                      <div key={key} className="p-3 rounded-lg border border-border/30 bg-muted/20">
                        <p className="text-xs font-medium text-primary uppercase mb-1">{key}</p>
                        <p className="text-xs text-muted-foreground">{value as string}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </SpotlightCard>
          ) : (
            <Card className="p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No clinical note linked</h3>
              <p className="text-sm text-muted-foreground">
                Create a clinical note for this patient to link it to this visit
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="mt-4 space-y-4">
          {visit.summary ? (
            <div className="space-y-4">
              <AnimatedContent distance={20} duration={0.4}>
                <SpotlightCard spotlightColor="rgba(16, 185, 129, 0.12)">
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-500" />
                      <h3 className="font-semibold">Visit Summary</h3>
                      <Badge variant="outline" className="text-[10px] gap-0.5 ml-auto">
                        <Sparkles className="w-2.5 h-2.5" /> AI Generated
                      </Badge>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <MarkdownRenderer content={visit.summary} />
                    </div>
                  </div>
                </SpotlightCard>
              </AnimatedContent>

              {visit.careInstructions && (
                <AnimatedContent distance={20} duration={0.4} delay={0.1}>
                  <Card className="border-emerald-500/20 bg-emerald-500/5">
                    <CardContent className="p-5 space-y-2">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        Care Instructions
                      </h3>
                      <div className="text-sm whitespace-pre-wrap">
                        <MarkdownRenderer content={visit.careInstructions} />
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedContent>
              )}

              {visit.followUpDate && (
                <div className="flex items-center gap-2 text-sm p-3 rounded-lg border border-blue-500/20 bg-blue-500/5">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>Follow-up: {new Date(visit.followUpDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No summary yet</h3>
              <p className="text-sm text-muted-foreground">
                Link a clinical note and generate an AI-powered visit summary
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Disclaimer */}
      <div className="flex items-center gap-2 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 text-xs text-muted-foreground">
        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
        AI-generated summaries are for reference only. Always verify with clinical judgment.
      </div>
    </div>
  );
}
