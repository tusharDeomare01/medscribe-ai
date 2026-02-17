"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  Calendar,
  MoreVertical,
  Pill,
  AlertTriangle,
} from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import SpotlightCard from "@/components/SpotlightCard";
import AnimatedContent from "@/components/AnimatedContent";

interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup?: string;
  phone?: string;
  email?: string;
  allergies: string[];
  currentMedications: string[];
  createdAt: string;
}

export default function PatientsPage() {
  const { getToken } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // New patient form
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "male",
    bloodGroup: "",
    phone: "",
    email: "",
    allergies: "",
    currentMedications: "",
  });

  const fetchPatients = async () => {
    try {
      const res = await fetch("/api/patients", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) setPatients(data.data);
    } catch {
      toast.error("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.age) {
      toast.error("Name and age are required");
      return;
    }

    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          ...form,
          age: parseInt(form.age),
          allergies: form.allergies ? form.allergies.split(",").map((s) => s.trim()) : [],
          currentMedications: form.currentMedications
            ? form.currentMedications.split(",").map((s) => s.trim())
            : [],
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Patient added successfully!");
        setDialogOpen(false);
        setForm({ name: "", age: "", gender: "male", bloodGroup: "", phone: "", email: "", allergies: "", currentMedications: "" });
        fetchPatients();
      } else {
        toast.error(data.error || "Failed to add patient");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const SPOTLIGHT_COLORS = [
    "rgba(14, 165, 233, 0.12)",
    "rgba(139, 92, 246, 0.12)",
    "rgba(16, 185, 129, 0.12)",
    "rgba(245, 158, 11, 0.12)",
    "rgba(244, 63, 94, 0.12)",
    "rgba(99, 102, 241, 0.12)",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <AnimatedContent distance={30} duration={0.6}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" /> Patients
            </h1>
            <p className="text-muted-foreground mt-1">Manage your patient records</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Patient</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Age *</Label>
                    <Input
                      type="number"
                      placeholder="45"
                      value={form.age}
                      onChange={(e) => setForm({ ...form, age: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Blood Group</Label>
                    <Input
                      placeholder="O+"
                      value={form.bloodGroup}
                      onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      placeholder="patient@email.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Allergies (comma-separated)</Label>
                  <Input
                    placeholder="Penicillin, Sulfa drugs"
                    value={form.allergies}
                    onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Current Medications (comma-separated)</Label>
                  <Textarea
                    placeholder="Metformin 500mg, Lisinopril 10mg"
                    value={form.currentMedications}
                    onChange={(e) => setForm({ ...form, currentMedications: e.target.value })}
                    rows={2}
                  />
                </div>
                <Button type="submit" className="w-full">Create Patient</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </AnimatedContent>

      {/* Search */}
      <AnimatedContent distance={20} delay={0.15} duration={0.5}>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </AnimatedContent>

      {/* Patient Cards */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-3xl border border-border/50 bg-card/80 backdrop-blur-sm p-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <AnimatedContent distance={30} duration={0.5}>
          <div className="rounded-3xl border-2 border-dashed border-border/50 bg-card/80 backdrop-blur-sm p-8">
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No patients found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {search ? "Try a different search term" : "Add your first patient to get started"}
              </p>
            </CardContent>
          </div>
        </AnimatedContent>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((patient, i) => (
            <AnimatedContent key={patient._id} distance={40} delay={i * 0.08} duration={0.5}>
              <SpotlightCard
                className="border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/20 transition-colors duration-300 cursor-pointer"
                spotlightColor={SPOTLIGHT_COLORS[i % SPOTLIGHT_COLORS.length] as `rgba(${number}, ${number}, ${number}, ${number})`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{patient.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {patient.age}y • {patient.gender} {patient.bloodGroup ? `• ${patient.bloodGroup}` : ""}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>

                <div className="mt-4 space-y-2">
                  {patient.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-3.5 h-3.5" /> {patient.phone}
                    </div>
                  )}
                  {patient.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-3.5 h-3.5" /> {patient.email}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    Added {new Date(patient.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {(patient.allergies?.length > 0 || patient.currentMedications?.length > 0) && (
                  <div className="mt-4 pt-3 border-t border-border/50">
                    <div className="flex flex-wrap gap-1.5">
                      {patient.allergies?.map((a) => (
                        <Badge key={a} variant="outline" className="text-[10px] text-rose-400 border-rose-400/30">
                          <AlertTriangle className="w-2.5 h-2.5 mr-1" /> {a}
                        </Badge>
                      ))}
                      {patient.currentMedications?.slice(0, 2).map((m) => (
                        <Badge key={m} variant="outline" className="text-[10px] text-sky-400 border-sky-400/30">
                          <Pill className="w-2.5 h-2.5 mr-1" /> {m}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </SpotlightCard>
            </AnimatedContent>
          ))}
        </div>
      )}
    </div>
  );
}
