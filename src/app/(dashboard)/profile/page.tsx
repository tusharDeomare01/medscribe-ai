"use client";

import { useState, useEffect, useRef, useMemo, memo } from "react";
import gsap from "gsap";
import { motion } from "motion/react";
import {
  User,
  Mail,
  Stethoscope,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Save,
  Loader2,
  CheckCircle,
  Calendar,
  FileText,
  Users,
  ClipboardList,
  Heart,
  Camera,
  Pencil,
  KeyRound,
} from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import SpotlightCard from "@/components/SpotlightCard";
import Counter from "@/components/Counter";

/* ── Types ────────────────────────────────────────────────────────── */

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  specialization: string | null;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    patients: number;
    clinicalNotes: number;
    reports: number;
    carePlans: number;
  };
}

/* ── Constants ────────────────────────────────────────────────────── */

const ROLE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  doctor: {
    label: "Doctor",
    color: "text-sky-500",
    bg: "bg-sky-500/10 border-sky-500/30",
  },
  admin: {
    label: "Administrator",
    color: "text-violet-500",
    bg: "bg-violet-500/10 border-violet-500/30",
  },
  patient: {
    label: "Patient",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/30",
  },
};

const AVATAR_COLORS = [
  "from-sky-500 to-indigo-600",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
];

const STAT_CONFIGS = [
  { key: "patients" as const, label: "Patients", icon: Users, color: "rgba(14, 165, 233, 0.12)" },
  { key: "clinicalNotes" as const, label: "Clinical Notes", icon: FileText, color: "rgba(139, 92, 246, 0.12)" },
  { key: "reports" as const, label: "Reports", icon: ClipboardList, color: "rgba(245, 158, 11, 0.12)" },
  { key: "carePlans" as const, label: "Care Plans", icon: Heart, color: "rgba(16, 185, 129, 0.12)" },
];

/* ── Stat Card (memoized) ─────────────────────────────────────────── */

const StatCard = memo(function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <SpotlightCard
      spotlightColor={color}
      className="border-border/50 bg-card/80 backdrop-blur-sm"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            {label}
          </p>
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <Counter
          value={value}
          fontSize={32}
          gradientFrom="transparent"
          gradientTo="transparent"
        />
      </div>
    </SpotlightCard>
  );
});

/* ── Gradient Name (pure CSS, no styled-jsx) ──────────────────────── */

const GradientName = memo(function GradientName({ name }: { name: string }) {
  return (
    <span
      className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent"
      style={{
        backgroundImage: "linear-gradient(90deg, #6366f1, #8b5cf6, #0ea5e9, #6366f1)",
        backgroundSize: "200% 100%",
        animation: "profile-gradient-shift 6s ease infinite",
      }}
    >
      {name}
    </span>
  );
});

/* ── Main Page ────────────────────────────────────────────────────── */

export default function ProfilePage() {
  const { getToken } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formSpec, setFormSpec] = useState("");

  // Password change
  const [pwDialogOpen, setPwDialogOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const pageRef = useRef<HTMLDivElement>(null);
  const gsapInitRef = useRef(false);

  // ── Fetch profile (runs once on mount) ──────────────────────────
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const token = getToken();
    fetch("/api/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProfile(data.data);
          setFormName(data.data.name);
          setFormEmail(data.data.email);
          setFormSpec(data.data.specialization || "");
        }
      })
      .catch(() => {
        toast.error("Failed to load profile");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── GSAP entrance + idle animations (runs once after loading completes) ──
  useEffect(() => {
    if (loading || !pageRef.current || gsapInitRef.current) return;
    gsapInitRef.current = true;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Avatar entrance
      tl.from(
        ".profile-avatar",
        { scale: 0, opacity: 0, duration: 0.7, ease: "back.out(2)" },
        0.2
      );

      // Name and role
      tl.from(".profile-name", { y: 20, opacity: 0, duration: 0.5 }, 0.4);
      tl.from(".profile-role", { scale: 0.8, opacity: 0, duration: 0.4 }, 0.6);

      // Meta items
      tl.from(
        ".profile-meta-item",
        { y: 10, opacity: 0, duration: 0.4, stagger: 0.08 },
        0.7
      );

      // Cards stagger
      tl.from(
        ".profile-card",
        { y: 30, opacity: 0, duration: 0.5, stagger: 0.1, ease: "back.out(1.2)" },
        0.9
      );

      // Idle: avatar floating
      gsap.to(".profile-avatar", {
        y: -6,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 2,
      });
    }, pageRef);

    return () => ctx.revert();
  }, [loading]);

  // ── Save profile ───────────────────────────────────────────────
  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!formEmail.trim() || !formEmail.includes("@")) {
      toast.error("Valid email is required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: formName.trim(),
          email: formEmail.trim(),
          specialization: formSpec.trim() || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.data));
        if (data.token) localStorage.setItem("token", data.token);

        setProfile((prev) => (prev ? { ...prev, ...data.data } : prev));
        setEditMode(false);
        toast.success("Profile updated successfully!");
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // ── Change password ────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!currentPw) {
      toast.error("Enter your current password");
      return;
    }
    if (newPw.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPw !== confirmPw) {
      toast.error("Passwords do not match");
      return;
    }

    setChangingPw(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          currentPassword: currentPw,
          newPassword: newPw,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.token) localStorage.setItem("token", data.token);
        toast.success("Password changed successfully!");
        setPwDialogOpen(false);
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
      } else {
        toast.error(data.error || "Failed to change password");
      }
    } catch {
      toast.error("Failed to change password");
    } finally {
      setChangingPw(false);
    }
  };

  // ── Memoized computed values ─────────────────────────────────
  const initials = useMemo(
    () =>
      profile?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U",
    [profile?.name]
  );

  const avatarGradient = useMemo(
    () => AVATAR_COLORS[(profile?.name?.charCodeAt(0) || 0) % AVATAR_COLORS.length],
    [profile?.name]
  );

  const roleCfg = useMemo(
    () => ROLE_CONFIG[profile?.role || "doctor"] || ROLE_CONFIG.doctor,
    [profile?.role]
  );

  const memberSince = useMemo(
    () =>
      profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })
        : "",
    [profile?.createdAt]
  );

  const profileStrength = useMemo(() => {
    let score = 0;
    if (profile?.name) score += 25;
    if (profile?.email) score += 25;
    if (profile?.specialization) score += 25;
    if (profile?.avatar) score += 25;
    return score;
  }, [profile?.name, profile?.email, profile?.specialization, profile?.avatar]);

  const passwordStrength = useMemo(() => {
    if (newPw.length >= 12) return { value: 100, label: "Strong" };
    if (newPw.length >= 8) return { value: 75, label: "Good" };
    if (newPw.length >= 6) return { value: 50, label: "Fair" };
    return { value: 25, label: "Too short" };
  }, [newPw]);

  const createdDate = useMemo(
    () => (profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : ""),
    [profile?.createdAt]
  );

  const updatedDate = useMemo(
    () => (profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : "N/A"),
    [profile?.updatedAt]
  );

  // ── Loading state ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Failed to load profile data.</p>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="space-y-6 pb-8">
      {/* CSS keyframes for gradient animation */}
      <style>{`
        @keyframes profile-gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* ══════════════ Header Banner ══════════════ */}
      <div data-tour-id="profile-info" className="relative">
        <SpotlightCard
          className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden"
          spotlightColor="rgba(99, 102, 241, 0.12)"
        >
          {/* Subtle gradient bg */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5 pointer-events-none" />

          <div className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <motion.div
                className="profile-avatar relative group"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div
                  className={`w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center shadow-lg shadow-primary/15`}
                >
                  <span className="text-3xl md:text-4xl font-bold text-white select-none">
                    {initials}
                  </span>
                </div>
                {/* Camera overlay */}
                <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                {/* Status dot */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-card" />
              </motion.div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left space-y-3">
                <div className="profile-name">
                  <GradientName name={profile.name} />
                </div>

                <div className="profile-role">
                  <Badge
                    variant="outline"
                    className={`${roleCfg.bg} ${roleCfg.color} text-xs font-semibold`}
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    {roleCfg.label}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                  <span className="profile-meta-item flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    {profile.email}
                  </span>
                  {profile.specialization && (
                    <span className="profile-meta-item flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5" />
                      {profile.specialization}
                    </span>
                  )}
                  <span className="profile-meta-item flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Member since {memberSince}
                  </span>
                </div>
              </div>

              {/* Edit button */}
              <div className="shrink-0">
                <Button
                  variant={editMode ? "destructive" : "outline"}
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    if (editMode) {
                      setFormName(profile.name);
                      setFormEmail(profile.email);
                      setFormSpec(profile.specialization || "");
                    }
                    setEditMode(!editMode);
                  }}
                >
                  <Pencil className="w-4 h-4" />
                  {editMode ? "Cancel" : "Edit Profile"}
                </Button>
              </div>
            </div>

            {/* Profile completion */}
            <div className="mt-6 pt-4 border-t border-border/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-medium">
                  Profile Completion
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {profileStrength}%
                </span>
              </div>
              <Progress value={profileStrength} className="h-1.5" />
            </div>
          </div>
        </SpotlightCard>
      </div>

      {/* ══════════════ Stats Row ══════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 profile-card">
        {STAT_CONFIGS.map((stat) => (
          <StatCard
            key={stat.key}
            label={stat.label}
            value={profile._count[stat.key]}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* ══════════════ Form + Security Cards ══════════════ */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Personal Information ── */}
        <div className="lg:col-span-2">
          <SpotlightCard
            className="profile-card border-border/50 bg-card/80 backdrop-blur-sm"
            spotlightColor="rgba(99, 102, 241, 0.1)"
          >
            <CardHeader className="px-0 pt-0 pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0 space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Full Name
                </Label>
                {editMode ? (
                  <Input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Your full name"
                    className="h-10"
                  />
                ) : (
                  <p className="text-sm font-medium text-foreground py-2 px-3 rounded-lg bg-muted/30">
                    {profile.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Email Address
                </Label>
                {editMode ? (
                  <Input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="h-10"
                  />
                ) : (
                  <p className="text-sm font-medium text-foreground py-2 px-3 rounded-lg bg-muted/30">
                    {profile.email}
                  </p>
                )}
              </div>

              {/* Specialization */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Specialization
                </Label>
                {editMode ? (
                  <Input
                    value={formSpec}
                    onChange={(e) => setFormSpec(e.target.value)}
                    placeholder="e.g., Cardiology, Internal Medicine"
                    className="h-10"
                  />
                ) : (
                  <p className="text-sm font-medium text-foreground py-2 px-3 rounded-lg bg-muted/30">
                    {profile.specialization || (
                      <span className="text-muted-foreground italic">
                        Not set
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Role (read-only) */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Role
                </Label>
                <p className="text-sm font-medium text-foreground py-2 px-3 rounded-lg bg-muted/30 flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                  {roleCfg.label}
                  <Badge variant="outline" className="text-[10px] ml-auto">
                    Read only
                  </Badge>
                </p>
              </div>

              {/* Save button */}
              {editMode && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="pt-2"
                >
                  <Button
                    className="gap-2 w-full sm:w-auto"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </SpotlightCard>
        </div>

        {/* ── Security & Account ── */}
        <div data-tour-id="profile-settings" className="space-y-4">
          <SpotlightCard
            className="profile-card border-border/50 bg-card/80 backdrop-blur-sm"
            spotlightColor="rgba(239, 68, 68, 0.08)"
          >
            <CardHeader className="px-0 pt-0 pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0 space-y-4">
              {/* Password */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <KeyRound className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Password</p>
                    <p className="text-xs text-muted-foreground">
                      Last updated {updatedDate}
                    </p>
                  </div>
                </div>
                <Dialog open={pwDialogOpen} onOpenChange={setPwDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs">
                      Change
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Lock className="w-4 h-4" /> Change Password
                      </DialogTitle>
                      <DialogDescription>
                        Enter your current password and choose a new one.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label>Current Password</Label>
                        <div className="relative">
                          <Input
                            type={showCurrentPw ? "text" : "password"}
                            value={currentPw}
                            onChange={(e) => setCurrentPw(e.target.value)}
                            placeholder="Enter current password"
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPw(!showCurrentPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showCurrentPw ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>New Password</Label>
                        <div className="relative">
                          <Input
                            type={showNewPw ? "text" : "password"}
                            value={newPw}
                            onChange={(e) => setNewPw(e.target.value)}
                            placeholder="At least 6 characters"
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPw(!showNewPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showNewPw ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {newPw && (
                          <div className="space-y-1">
                            <Progress value={passwordStrength.value} className="h-1" />
                            <p className="text-[10px] text-muted-foreground">
                              {passwordStrength.label}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Confirm New Password</Label>
                        <Input
                          type="password"
                          value={confirmPw}
                          onChange={(e) => setConfirmPw(e.target.value)}
                          placeholder="Re-enter new password"
                        />
                        {confirmPw && newPw !== confirmPw && (
                          <p className="text-[11px] text-red-500">
                            Passwords do not match
                          </p>
                        )}
                        {confirmPw &&
                          newPw === confirmPw &&
                          newPw.length >= 6 && (
                            <p className="text-[11px] text-emerald-500 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Passwords
                              match
                            </p>
                          )}
                      </div>
                      <Button
                        className="w-full gap-2"
                        onClick={handleChangePassword}
                        disabled={
                          changingPw ||
                          !currentPw ||
                          newPw.length < 6 ||
                          newPw !== confirmPw
                        }
                      >
                        {changingPw ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                        {changingPw ? "Changing..." : "Update Password"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Separator />

              {/* Account Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span className="text-xs">{createdDate}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="text-xs">{updatedDate}</span>
                </div>
              </div>
            </CardContent>
          </SpotlightCard>

          {/* Quick Actions */}
          <div className="profile-card border border-border/50 bg-card/80 backdrop-blur-sm rounded-3xl p-6 space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 text-xs"
                onClick={() => setEditMode(true)}
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit Profile
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 text-xs"
                onClick={() => setPwDialogOpen(true)}
              >
                <KeyRound className="w-3.5 h-3.5" />
                Change Password
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
