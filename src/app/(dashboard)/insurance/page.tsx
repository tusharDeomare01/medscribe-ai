"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ShieldCheck, Search, AlertCircle, CheckCircle, Clock, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import AnimatedContent from "@/components/AnimatedContent";
import SpotlightCard from "@/components/SpotlightCard";

interface VerificationResult {
  status: string;
  coverageSummary: string;
  eligibleServices: { service: string; covered: boolean; copay: number; notes: string }[];
  deductible: { total: number; met: number; remaining: number };
  outOfPocketMax: { total: number; met: number; remaining: number };
  preAuthRequired: string[];
  warnings: string[];
  recommendedActions: string[];
}

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle; color: string; bg: string }> = {
  verified: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  needs_review: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  denied: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
};

export default function InsurancePage() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [form, setForm] = useState({ patientName: "", providerName: "", policyNumber: "", groupNumber: "" });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".ins-header", { y: -20, opacity: 0, duration: 0.5, ease: "power3.out" });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleVerify = async () => {
    if (!form.providerName || !form.policyNumber) return;
    setLoading(true);
    setResult(null);
    try {
      const token = getToken();
      const res = await fetch("/api/ai/verify-insurance", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) setResult(data.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const statusConfig = result ? STATUS_CONFIG[result.status] || STATUS_CONFIG.needs_review : null;

  return (
    <div ref={containerRef} className="flex flex-col gap-4">
      <AnimatedContent distance={30} duration={0.6}>
        <div className="ins-header">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-teal-500" />
            Insurance Verification
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">AI-powered instant insurance eligibility and coverage verification</p>
        </div>
      </AnimatedContent>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Form */}
        <div className="space-y-4">
          <Card data-tour-id="insurance-form" className="p-6 border-border/50 space-y-4">
            <h3 className="font-semibold text-base">Patient Insurance Details</h3>
            <div className="space-y-3">
              <div><Label htmlFor="patientName">Patient Name</Label><Input id="patientName" placeholder="John Doe" value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} /></div>
              <div><Label htmlFor="provider">Insurance Provider</Label><Input id="provider" placeholder="Blue Cross Blue Shield" value={form.providerName} onChange={(e) => setForm({ ...form, providerName: e.target.value })} /></div>
              <div><Label htmlFor="policy">Policy Number</Label><Input id="policy" placeholder="BCB-123456789" value={form.policyNumber} onChange={(e) => setForm({ ...form, policyNumber: e.target.value })} /></div>
              <div><Label htmlFor="group">Group Number (Optional)</Label><Input id="group" placeholder="GRP-001" value={form.groupNumber} onChange={(e) => setForm({ ...form, groupNumber: e.target.value })} /></div>
            </div>
            <Button className="w-full bg-teal-600 hover:bg-teal-700 gap-2" onClick={handleVerify} disabled={loading || !form.providerName || !form.policyNumber}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {loading ? "Verifying..." : "Verify with AI"}
            </Button>
          </Card>

          <Card className="p-4 border-border/50">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Quick Fill (Demo)</h4>
            <div className="space-y-2">
              {[
                { name: "Sarah Johnson", provider: "Blue Cross Blue Shield", policy: "BCB-987654321", group: "GRP-100" },
                { name: "Michael Chen", provider: "Aetna", policy: "AET-456789012", group: "GRP-200" },
                { name: "Emily Davis", provider: "UnitedHealth", policy: "UHC-111222333", group: "" },
              ].map((preset) => (
                <button key={preset.policy} className="w-full text-left p-2 rounded-lg hover:bg-muted/50 transition-colors text-sm" onClick={() => setForm({ patientName: preset.name, providerName: preset.provider, policyNumber: preset.policy, groupNumber: preset.group })}>
                  <span className="font-medium">{preset.name}</span> — <span className="text-muted-foreground">{preset.provider}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Results */}
        <ScrollArea data-tour-id="insurance-results" className="max-h-[calc(100vh-250px)]">
          {!result && !loading && (
            <Card className="border-border/50 min-h-[400px] flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-8 h-8 text-teal-500/40" />
                </div>
                <p className="text-sm text-muted-foreground">Enter insurance details and click verify to see results</p>
              </div>
            </Card>
          )}

          {loading && (
            <Card className="border-border/50 min-h-[400px] flex items-center justify-center">
              <div className="text-center space-y-3">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">Verifying insurance coverage...</p>
              </div>
            </Card>
          )}

          {result && statusConfig && (
            <div className="space-y-4">
              <AnimatedContent distance={20} duration={0.4}>
                <SpotlightCard spotlightColor="rgba(20, 184, 166, 0.15)">
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Verification Status</h3>
                      <Badge className={`${statusConfig.bg} ${statusConfig.color} border gap-1`}>
                        <statusConfig.icon className="w-3 h-3" />
                        {result.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm">{result.coverageSummary}</p>
                  </div>
                </SpotlightCard>
              </AnimatedContent>

              {/* Deductible & OOP */}
              <div className="grid grid-cols-2 gap-4">
                <AnimatedContent distance={20} duration={0.4} delay={0.1}>
                  <Card className="p-4 border-border/50">
                    <p className="text-xs text-muted-foreground mb-2">Deductible</p>
                    <div className="flex justify-between text-sm mb-1">
                      <span>${result.deductible.met.toLocaleString()} met</span>
                      <span>${result.deductible.total.toLocaleString()}</span>
                    </div>
                    <Progress value={(result.deductible.met / result.deductible.total) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">${result.deductible.remaining.toLocaleString()} remaining</p>
                  </Card>
                </AnimatedContent>
                <AnimatedContent distance={20} duration={0.4} delay={0.15}>
                  <Card className="p-4 border-border/50">
                    <p className="text-xs text-muted-foreground mb-2">Out-of-Pocket Max</p>
                    <div className="flex justify-between text-sm mb-1">
                      <span>${result.outOfPocketMax.met.toLocaleString()} met</span>
                      <span>${result.outOfPocketMax.total.toLocaleString()}</span>
                    </div>
                    <Progress value={(result.outOfPocketMax.met / result.outOfPocketMax.total) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">${result.outOfPocketMax.remaining.toLocaleString()} remaining</p>
                  </Card>
                </AnimatedContent>
              </div>

              {/* Eligible Services */}
              {result.eligibleServices?.length > 0 && (
                <AnimatedContent distance={20} duration={0.4} delay={0.2}>
                  <Card className="border-border/50">
                    <div className="p-4 border-b border-border/50"><h4 className="font-semibold text-sm">Eligible Services</h4></div>
                    <div className="divide-y divide-border/30">
                      {result.eligibleServices.map((svc, i) => (
                        <div key={i} className="flex items-center justify-between px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            {svc.covered ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                            <span className="text-sm">{svc.service}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {svc.copay > 0 && <Badge variant="outline" className="text-xs">${svc.copay} copay</Badge>}
                            <Badge variant={svc.covered ? "default" : "destructive"} className="text-xs">{svc.covered ? "Covered" : "Not Covered"}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </AnimatedContent>
              )}

              {/* Pre-Auth & Warnings */}
              {result.preAuthRequired?.length > 0 && (
                <AnimatedContent distance={20} duration={0.4} delay={0.25}>
                  <Card className="p-4 border-border/50 border-yellow-500/20 bg-yellow-500/5">
                    <h4 className="text-sm font-medium text-yellow-600 mb-2">Pre-Authorization Required</h4>
                    <ul className="space-y-1">{result.preAuthRequired.map((item, i) => <li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-yellow-500 mt-2 shrink-0" />{item}</li>)}</ul>
                  </Card>
                </AnimatedContent>
              )}

              {result.warnings?.length > 0 && (
                <AnimatedContent distance={20} duration={0.4} delay={0.3}>
                  <Card className="p-4 border-border/50 border-red-500/20 bg-red-500/5">
                    <h4 className="text-sm font-medium text-red-500 mb-2">Warnings</h4>
                    <ul className="space-y-1">{result.warnings.map((w, i) => <li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><AlertCircle className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />{w}</li>)}</ul>
                  </Card>
                </AnimatedContent>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
