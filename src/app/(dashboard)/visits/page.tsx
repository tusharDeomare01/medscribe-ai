"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import {
  Video,
  Plus,
  Calendar,
  ChevronRight,
  Loader2,
  User as UserIcon,
  Building2,
  Search,
  ClipboardCheck,
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

interface Visit {
  id: string;
  visitType: string;
  status: string;
  summary: string | null;
  preScreening: Record<string, unknown> | null;
  followUpDate: string | null;
  createdAt: string;
  patient: { name: string; age: number; gender: string };
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  scheduled: { bg: "bg-gray-500/10", text: "text-gray-500", dot: "bg-gray-400" },
  "in-progress": { bg: "bg-blue-500/10", text: "text-blue-500", dot: "bg-blue-500" },
  completed: { bg: "bg-emerald-500/10", text: "text-emerald-500", dot: "bg-emerald-500" },
};

export default function VisitsPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [visitType, setVisitType] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.from(".visit-card", {
          x: -30,
          opacity: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "power3.out",
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading]);

  const fetchData = async () => {
    try {
      const token = getToken();
      const [visitsRes, patientsRes] = await Promise.all([
        fetch("/api/visit-summaries", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/patients", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const visitsData = await visitsRes.json();
      const patientsData = await patientsRes.json();

      if (visitsData.success) setVisits(visitsData.data);
      if (patientsData.success) setPatients(patientsData.data);
    } catch {
      toast.error("Failed to load visits");
    } finally {
      setLoading(false);
    }
  };

  const createVisit = async () => {
    if (!selectedPatient || !visitType) {
      toast.error("Please select a patient and visit type");
      return;
    }
    setCreating(true);
    try {
      const token = getToken();
      const res = await fetch("/api/visit-summaries", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patientId: selectedPatient,
          visitType,
          followUpDate: followUpDate || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Visit scheduled!");
        setDialogOpen(false);
        setSelectedPatient("");
        setVisitType("");
        setFollowUpDate("");
        fetchData();
      }
    } catch {
      toast.error("Failed to create visit");
    } finally {
      setCreating(false);
    }
  };

  const filteredVisits = visits.filter(
    (v) => v.patient.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <AnimatedContent distance={30} duration={0.6}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Video className="w-6 h-6 text-primary" />
              Visit Management
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Schedule visits, pre-screen patients, and generate AI summaries
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> New Visit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule New Visit</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Patient</Label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
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
                  <Label>Visit Type</Label>
                  <Select value={visitType} onValueChange={setVisitType}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-person">In-Person</SelectItem>
                      <SelectItem value="telehealth">Telehealth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Follow-up Date (optional)</Label>
                  <Input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                  />
                </div>
                <Button className="w-full gap-2" onClick={createVisit} disabled={creating}>
                  {creating ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                  ) : (
                    <><Calendar className="w-4 h-4" /> Schedule Visit</>
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
            placeholder="Search visits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </AnimatedContent>

      {/* Timeline */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6"><Skeleton className="h-4 w-3/4 mb-2" /><Skeleton className="h-3 w-full" /></Card>
          ))}
        </div>
      ) : filteredVisits.length === 0 ? (
        <Card className="p-12 text-center">
          <ClipboardCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No visits scheduled</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Schedule a visit to start pre-screening and generating summaries
          </p>
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Schedule First Visit
          </Button>
        </Card>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border/50 hidden md:block" />

          <div className="space-y-4">
            {filteredVisits.map((visit) => {
              const statusStyle = STATUS_CONFIG[visit.status] || STATUS_CONFIG.scheduled;
              return (
                <div key={visit.id} className="visit-card relative">
                  {/* Timeline dot */}
                  <div className="absolute left-[18px] top-6 w-3 h-3 rounded-full border-2 border-background z-10 hidden md:block">
                    <div className={`w-full h-full rounded-full ${statusStyle.dot} ${visit.status === "in-progress" ? "animate-pulse" : ""}`} />
                  </div>

                  <div className="md:ml-14">
                    <SpotlightCard spotlightColor="rgba(59, 130, 246, 0.1)">
                      <button
                        className="w-full p-4 text-left"
                        onClick={() => router.push(`/visits/${visit.id}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <UserIcon className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-sm">{visit.patient.name}</h3>
                              <p className="text-xs text-muted-foreground">
                                {visit.patient.age}y, {visit.patient.gender}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${statusStyle.bg} ${statusStyle.text} text-[10px]`}>
                              {visit.status}
                            </Badge>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            {visit.visitType === "telehealth" ? (
                              <Video className="w-3 h-3" />
                            ) : (
                              <Building2 className="w-3 h-3" />
                            )}
                            {visit.visitType === "telehealth" ? "Telehealth" : "In-Person"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(visit.createdAt).toLocaleDateString()}
                          </span>
                          {visit.summary && (
                            <Badge variant="outline" className="text-[9px] gap-0.5">
                              Summary Ready
                            </Badge>
                          )}
                          {visit.preScreening && (
                            <Badge variant="outline" className="text-[9px] gap-0.5">
                              Pre-screened
                            </Badge>
                          )}
                        </div>
                      </button>
                    </SpotlightCard>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
