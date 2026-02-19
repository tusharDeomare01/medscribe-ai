"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { FileCode, AlertCircle, CheckCircle, Loader2, BarChart3, DollarSign, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import AnimatedContent from "@/components/AnimatedContent";
import SpotlightCard from "@/components/SpotlightCard";
import Counter from "@/components/Counter";

interface CodingResult {
  icdCodes: { code: string; description: string; confidence: number; isPrimary?: boolean }[];
  cptCodes: { code: string; description: string; confidence: number; fee: number; units: number }[];
  modifiers: { code: string; description: string; appliesTo: string }[];
  totalEstimatedCharge: number;
  codingNotes: string;
  complianceFlags: string[];
}

interface AuditResult {
  overallRisk: string;
  denialProbability: number;
  issues: { severity: string; category: string; description: string; suggestion: string }[];
  missedOpportunities: { code: string; description: string; estimatedRevenue: number; reason: string }[];
  optimizedCodes: { original: string; suggested: string; reason: string }[];
  estimatedRevenueImpact: number;
}

export default function MedicalCodingPage() {
  const { getToken } = useAuth();
  const [noteText, setNoteText] = useState("");
  const [codingResult, setCodingResult] = useState<CodingResult | null>(null);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [loadingCodes, setLoadingCodes] = useState(false);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [auditInput, setAuditInput] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".coding-header", { y: -20, opacity: 0, duration: 0.5, ease: "power3.out" });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleGenerateCodes = async () => {
    if (!noteText.trim()) return;
    setLoadingCodes(true);
    setCodingResult(null);
    try {
      const token = getToken();
      const res = await fetch("/api/ai/suggest-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ noteText }),
      });
      const data = await res.json();
      if (data.success) setCodingResult(data.data);
    } catch { /* ignore */ }
    setLoadingCodes(false);
  };

  const handleAudit = async () => {
    if (!auditInput.trim() && !codingResult) return;
    setLoadingAudit(true);
    setAuditResult(null);
    try {
      const token = getToken();
      const claimData = auditInput.trim() ? JSON.parse(auditInput) : codingResult;
      const res = await fetch("/api/ai/audit-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ claimData }),
      });
      const data = await res.json();
      if (data.success) setAuditResult(data.data);
    } catch { /* ignore */ }
    setLoadingAudit(false);
  };

  const RISK_CONFIG: Record<string, { color: string; bg: string }> = {
    low: { color: "text-emerald-500", bg: "bg-emerald-500/10" },
    medium: { color: "text-yellow-500", bg: "bg-yellow-500/10" },
    high: { color: "text-red-500", bg: "bg-red-500/10" },
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-4">
      <AnimatedContent distance={30} duration={0.6}>
        <div className="coding-header">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileCode className="w-6 h-6 text-violet-500" />
            Medical Coding &amp; Claims Audit
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">AI-powered ICD-10, CPT code suggestion and claims audit</p>
        </div>
      </AnimatedContent>

      <Tabs defaultValue="codes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="codes">Code Suggestion</TabsTrigger>
          <TabsTrigger value="audit">Claims Audit</TabsTrigger>
        </TabsList>

        {/* Tab 1: Code Suggestion */}
        <TabsContent value="codes" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-4">
              <Card data-tour-id="coding-input" className="p-6 border-border/50 space-y-4">
                <h3 className="font-semibold">Clinical Note</h3>
                <Textarea placeholder="Paste clinical note text here..." value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={10} className="resize-none" />
                <Button className="w-full bg-violet-600 hover:bg-violet-700 gap-2" onClick={handleGenerateCodes} disabled={loadingCodes || !noteText.trim()}>
                  {loadingCodes ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCode className="w-4 h-4" />}
                  {loadingCodes ? "Generating..." : "Generate Codes"}
                </Button>
                <button className="text-xs text-muted-foreground hover:text-foreground transition-colors" onClick={() => setNoteText("Patient is a 55-year-old male presenting with chest pain and shortness of breath. Vital signs: BP 150/95, HR 92, Temp 98.6F, SpO2 96%. EKG shows ST elevation. Troponin levels elevated at 2.5 ng/mL. Started on aspirin 325mg, nitroglycerin sublingual. Ordered cardiac catheterization. Diagnosis: Acute STEMI. Plan: Transfer to cath lab for emergent PCI.")}>
                  Load sample note
                </button>
              </Card>
            </div>

            <ScrollArea data-tour-id="coding-results" className="max-h-[calc(100vh-300px)]">
              {!codingResult && !loadingCodes && (
                <Card className="border-border/50 min-h-[400px] flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto"><FileCode className="w-8 h-8 text-violet-500/40" /></div>
                    <p className="text-sm text-muted-foreground">Paste a clinical note and generate codes</p>
                  </div>
                </Card>
              )}
              {loadingCodes && (
                <Card className="border-border/50 min-h-[400px] flex items-center justify-center">
                  <div className="text-center space-y-3"><Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto" /><p className="text-sm text-muted-foreground">Analyzing clinical note...</p></div>
                </Card>
              )}
              {codingResult && (
                <div className="space-y-4">
                  <SpotlightCard spotlightColor="rgba(139, 92, 246, 0.15)">
                    <div className="p-4 flex items-center justify-between">
                      <div><p className="text-xs text-muted-foreground">Total Estimated Charge</p><div className="flex items-center gap-1"><DollarSign className="w-5 h-5 text-emerald-500" /><Counter value={codingResult.totalEstimatedCharge} fontSize={24} gradientFrom="transparent" gradientTo="transparent" /></div></div>
                      <Badge className="bg-violet-500/10 text-violet-500 border-violet-500/30 border">{codingResult.icdCodes.length + codingResult.cptCodes.length} Codes</Badge>
                    </div>
                  </SpotlightCard>

                  <Card className="border-border/50">
                    <div className="p-4 border-b border-border/50"><h4 className="font-semibold text-sm">ICD-10 Codes</h4></div>
                    <div className="divide-y divide-border/30">
                      {codingResult.icdCodes.map((code, i) => (
                        <div key={i} className="px-4 py-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {code.isPrimary && <Badge className="bg-violet-500/10 text-violet-500 text-[10px]">Primary</Badge>}
                            <span className="font-mono text-sm font-medium">{code.code}</span>
                            <span className="text-sm text-muted-foreground">{code.description}</span>
                          </div>
                          <Progress value={code.confidence * 100} className="w-16 h-1.5" />
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="border-border/50">
                    <div className="p-4 border-b border-border/50"><h4 className="font-semibold text-sm">CPT Codes</h4></div>
                    <div className="divide-y divide-border/30">
                      {codingResult.cptCodes.map((code, i) => (
                        <div key={i} className="px-4 py-2.5 flex items-center justify-between">
                          <div><span className="font-mono text-sm font-medium">{code.code}</span><span className="text-sm text-muted-foreground ml-2">{code.description}</span></div>
                          <Badge variant="outline" className="text-xs">${code.fee}</Badge>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {codingResult.complianceFlags?.length > 0 && (
                    <Card className="p-4 border-border/50 border-yellow-500/20 bg-yellow-500/5">
                      <h4 className="text-sm font-medium text-yellow-600 mb-2 flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Compliance Flags</h4>
                      <ul className="space-y-1">{codingResult.complianceFlags.map((flag, i) => <li key={i} className="text-sm text-muted-foreground">{flag}</li>)}</ul>
                    </Card>
                  )}

                  <p className="text-xs text-muted-foreground">{codingResult.codingNotes}</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </TabsContent>

        {/* Tab 2: Claims Audit */}
        <TabsContent value="audit" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-6 border-border/50 space-y-4">
              <h3 className="font-semibold">Claim Data</h3>
              <p className="text-xs text-muted-foreground">{codingResult ? "Use the generated codes above, or paste custom JSON:" : "Paste claim data as JSON:"}</p>
              {codingResult && (
                <Button variant="outline" className="w-full gap-2" onClick={() => { setAuditInput(""); handleAudit(); }}>
                  <BarChart3 className="w-4 h-4" /> Audit Generated Codes
                </Button>
              )}
              <Textarea placeholder='{"icdCodes": [...], "cptCodes": [...]}' value={auditInput} onChange={(e) => setAuditInput(e.target.value)} rows={8} className="resize-none font-mono text-xs" />
              <Button className="w-full bg-violet-600 hover:bg-violet-700 gap-2" onClick={handleAudit} disabled={loadingAudit || (!auditInput.trim() && !codingResult)}>
                {loadingAudit ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
                {loadingAudit ? "Auditing..." : "Audit Claim"}
              </Button>
            </Card>

            <ScrollArea className="max-h-[calc(100vh-300px)]">
              {!auditResult && !loadingAudit && (
                <Card className="border-border/50 min-h-[300px] flex items-center justify-center">
                  <div className="text-center space-y-3"><BarChart3 className="w-8 h-8 text-violet-500/40 mx-auto" /><p className="text-sm text-muted-foreground">Submit claim data for audit</p></div>
                </Card>
              )}
              {loadingAudit && (
                <Card className="border-border/50 min-h-[300px] flex items-center justify-center">
                  <div className="text-center space-y-3"><Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto" /><p className="text-sm text-muted-foreground">Auditing claim...</p></div>
                </Card>
              )}
              {auditResult && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <SpotlightCard spotlightColor="rgba(139, 92, 246, 0.15)">
                      <div className="p-4">
                        <p className="text-xs text-muted-foreground mb-1">Overall Risk</p>
                        <Badge className={`${RISK_CONFIG[auditResult.overallRisk]?.bg || ""} ${RISK_CONFIG[auditResult.overallRisk]?.color || ""} border`}>{auditResult.overallRisk}</Badge>
                      </div>
                    </SpotlightCard>
                    <SpotlightCard spotlightColor="rgba(239, 68, 68, 0.15)">
                      <div className="p-4">
                        <p className="text-xs text-muted-foreground mb-1">Denial Probability</p>
                        <div className="flex items-end gap-1"><Counter value={Math.round(auditResult.denialProbability * 100)} fontSize={24} gradientFrom="transparent" gradientTo="transparent" /><span className="text-sm mb-0.5">%</span></div>
                      </div>
                    </SpotlightCard>
                  </div>

                  {auditResult.issues?.length > 0 && (
                    <Card className="border-border/50">
                      <div className="p-4 border-b border-border/50"><h4 className="font-semibold text-sm">Issues Found</h4></div>
                      <div className="divide-y divide-border/30">
                        {auditResult.issues.map((issue, i) => (
                          <div key={i} className="px-4 py-3">
                            <div className="flex items-center gap-2 mb-1">
                              {issue.severity === "error" ? <AlertCircle className="w-4 h-4 text-red-500" /> : issue.severity === "warning" ? <AlertTriangle className="w-4 h-4 text-yellow-500" /> : <CheckCircle className="w-4 h-4 text-blue-500" />}
                              <Badge variant="outline" className="text-[10px]">{issue.category}</Badge>
                            </div>
                            <p className="text-sm">{issue.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">{issue.suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {auditResult.missedOpportunities?.length > 0 && (
                    <Card className="border-border/50 border-emerald-500/20">
                      <div className="p-4 border-b border-border/50"><h4 className="font-semibold text-sm text-emerald-600">Missed Revenue Opportunities</h4></div>
                      <div className="divide-y divide-border/30">
                        {auditResult.missedOpportunities.map((opp, i) => (
                          <div key={i} className="px-4 py-2.5 flex items-center justify-between">
                            <div><span className="font-mono text-sm">{opp.code}</span><span className="text-sm text-muted-foreground ml-2">{opp.description}</span></div>
                            <Badge className="bg-emerald-500/10 text-emerald-500 border">${opp.estimatedRevenue}</Badge>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  <SpotlightCard spotlightColor="rgba(34, 197, 94, 0.15)">
                    <div className="p-4 flex items-center justify-between">
                      <p className="text-sm font-medium">Estimated Revenue Impact</p>
                      <div className="flex items-center gap-1"><DollarSign className="w-4 h-4 text-emerald-500" /><Counter value={auditResult.estimatedRevenueImpact} fontSize={20} gradientFrom="transparent" gradientTo="transparent" /></div>
                    </div>
                  </SpotlightCard>
                </div>
              )}
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
