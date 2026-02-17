"use client";

import { useState, useRef } from "react";
import {
  Upload,
  FileText,
  Brain,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowUpFromLine,
} from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import SpotlightCard from "@/components/SpotlightCard";
import AnimatedContent from "@/components/AnimatedContent";
import DecryptedText from "@/components/DecryptedText";

interface LabValue {
  test: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag: "normal" | "high" | "low" | "critical";
}

interface ReportResult {
  labValues: LabValue[];
  findings: string[];
  recommendations: string[];
  explanation: string;
}

const FLAG_STYLES = {
  normal: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10", label: "Normal" },
  high: { icon: ArrowUpFromLine, color: "text-amber-400", bg: "bg-amber-400/10", label: "High" },
  low: { icon: AlertTriangle, color: "text-sky-400", bg: "bg-sky-400/10", label: "Low" },
  critical: { icon: XCircle, color: "text-red-400", bg: "bg-red-400/10", label: "Critical" },
};

export default function ReportsPage() {
  const { getToken } = useAuth();
  const [reportText, setReportText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ReportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      toast.success(`File "${f.name}" selected`);
    }
  };

  const analyzeReport = async () => {
    if (!reportText.trim() && !file) {
      toast.error("Please enter report text or upload a file");
      return;
    }

    setProcessing(true);
    setResult(null);

    try {
      let body: Record<string, unknown> = {};

      if (file) {
        const base64 = await fileToBase64(file);
        body = { fileBase64: base64, mimeType: file.type };
      } else {
        body = { text: reportText };
      }

      const res = await fetch("/api/ai/analyze-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        toast.success("Report analyzed successfully!");
      } else {
        toast.error(data.error || "Analysis failed");
      }
    } catch {
      toast.error("Failed to analyze report. Check your API key configuration.");
    } finally {
      setProcessing(false);
    }
  };

  const fileToBase64 = (f: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });

  const abnormalCount = result?.labValues?.filter((v) => v.flag !== "normal").length || 0;

  return (
    <div className="space-y-6">
      <AnimatedContent distance={30} duration={0.6}>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Upload className="w-6 h-6 text-primary" /> Report Analysis
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload or paste lab reports — AI extracts values, flags abnormals, and explains results.
          </p>
        </div>
      </AnimatedContent>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <AnimatedContent distance={40} delay={0.1} duration={0.6}>
            <SpotlightCard
              className="border-border/50 bg-card/80 backdrop-blur-sm"
              spotlightColor="rgba(14, 165, 233, 0.12)"
            >
              <CardHeader className="px-0 pt-0 pb-3">
                <CardTitle className="text-base">Upload or Paste Report</CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-0 space-y-4">
                {/* File Upload */}
                <div
                  className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center hover:border-primary/30 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Upload className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  {file ? (
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium">Drop a file or click to upload</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF or image (max 10MB)</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">OR</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                {/* Text Input */}
                <Textarea
                  placeholder="Paste lab report text here...&#10;&#10;Example:&#10;Complete Blood Count (CBC)&#10;WBC: 11.2 x10^3/uL (Ref: 4.5-11.0)&#10;RBC: 4.8 x10^6/uL (Ref: 4.7-6.1)&#10;Hemoglobin: 10.8 g/dL (Ref: 13.5-17.5)&#10;Platelet: 245 x10^3/uL (Ref: 150-400)"
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  rows={8}
                  className="resize-none"
                />

                <Button className="w-full gap-2" onClick={analyzeReport} disabled={processing}>
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4" /> Analyze with AI
                    </>
                  )}
                </Button>
              </CardContent>
            </SpotlightCard>
          </AnimatedContent>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {processing ? (
            <AnimatedContent distance={30} duration={0.5}>
              <SpotlightCard
                className="border-border/50 bg-card/80 backdrop-blur-sm"
                spotlightColor="rgba(139, 92, 246, 0.12)"
              >
                <div className="py-16 text-center">
                  <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
                  <div className="font-semibold text-lg">
                    <DecryptedText
                      text="Analyzing lab report..."
                      animateOn="view"
                      speed={40}
                      sequential
                      revealDirection="start"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Extracting lab values and generating explanations</p>
                  <Progress value={66} className="max-w-xs mx-auto mt-4" />
                </div>
              </SpotlightCard>
            </AnimatedContent>
          ) : result ? (
            <>
              {/* Summary Badge */}
              {result.labValues?.length > 0 && (
                <AnimatedContent distance={20} duration={0.4}>
                  <div className="flex gap-3">
                    <Badge className="bg-emerald-400/10 text-emerald-400 border-emerald-400/30">
                      {result.labValues.length - abnormalCount} Normal
                    </Badge>
                    {abnormalCount > 0 && (
                      <Badge className="bg-amber-400/10 text-amber-400 border-amber-400/30">
                        {abnormalCount} Abnormal
                      </Badge>
                    )}
                  </div>
                </AnimatedContent>
              )}

              {/* Lab Values */}
              {result.labValues?.length > 0 && (
                <AnimatedContent distance={30} delay={0.1} duration={0.5}>
                  <SpotlightCard
                    className="border-border/50 bg-card/80 backdrop-blur-sm"
                    spotlightColor="rgba(16, 185, 129, 0.12)"
                  >
                    <CardHeader className="px-0 pt-0 pb-3">
                      <CardTitle className="text-base">Lab Values</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 pb-0 space-y-2">
                      {result.labValues.map((lab, i) => {
                        const style = FLAG_STYLES[lab.flag] || FLAG_STYLES.normal;
                        return (
                          <AnimatedContent key={i} distance={20} delay={i * 0.06} duration={0.4}>
                            <div className={`flex items-center justify-between p-3 rounded-lg ${style.bg} transition-colors`}>
                              <div className="flex items-center gap-3">
                                <style.icon className={`w-4 h-4 ${style.color}`} />
                                <div>
                                  <p className="text-sm font-medium">{lab.test}</p>
                                  <p className="text-xs text-muted-foreground">Ref: {lab.referenceRange}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`text-sm font-bold ${style.color}`}>
                                  {lab.value} {lab.unit}
                                </p>
                                <Badge variant="outline" className={`text-[10px] ${style.color} border-current/30`}>
                                  {style.label}
                                </Badge>
                              </div>
                            </div>
                          </AnimatedContent>
                        );
                      })}
                    </CardContent>
                  </SpotlightCard>
                </AnimatedContent>
              )}

              {/* Explanation */}
              {result.explanation && (
                <AnimatedContent distance={30} delay={0.3} duration={0.5}>
                  <SpotlightCard
                    className="border-border/50 bg-card/80 backdrop-blur-sm"
                    spotlightColor="rgba(245, 158, 11, 0.12)"
                  >
                    <CardHeader className="px-0 pt-0 pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" /> Plain-English Explanation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 pb-0">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {result.explanation}
                      </p>
                    </CardContent>
                  </SpotlightCard>
                </AnimatedContent>
              )}

              {/* Disclaimer */}
              <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-400/20 bg-amber-400/5 text-sm">
                <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <p className="text-muted-foreground">
                  AI-generated analysis. Lab values and interpretations must be verified by a licensed
                  healthcare professional.
                </p>
              </div>
            </>
          ) : (
            <AnimatedContent distance={40} delay={0.2} duration={0.6}>
              <SpotlightCard
                className="border-border/50 border-dashed bg-card/80 backdrop-blur-sm"
                spotlightColor="rgba(99, 102, 241, 0.12)"
              >
                <div className="py-16 text-center">
                  <Upload className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">Analysis Results</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload or paste a lab report to see AI-powered analysis with flagged abnormal values.
                  </p>
                </div>
              </SpotlightCard>
            </AnimatedContent>
          )}
        </div>
      </div>
    </div>
  );
}
