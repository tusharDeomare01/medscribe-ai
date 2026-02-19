"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import {
  Stethoscope,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Briefcase,
  Home,
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(DrawSVGPlugin);
}
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { fireConfetti } from "@/lib/confetti";
import { MedicalIllustrationLogin, MedicalIllustrationRegister } from "./medical-illustration";

interface AuthPageProps {
  initialMode: "login" | "register";
}

/* ── Shared input class with proper focus ring ── */
const inputBase =
  "h-11 bg-background/50 border-border/40 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/50 transition-all duration-200";
const inputWithIconLeft = `${inputBase} pl-10`;
const inputWithIconBoth = `${inputBase} pl-10 pr-10`;

export default function AuthPage({ initialMode }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [name, setName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [role, setRole] = useState("doctor");
  const [specialization, setSpecialization] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const isLogin = mode === "login";

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error("Please enter your email address");
      return;
    }
    setForgotLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();

      if (data.success) {
        if (data.resetUrl) {
          // Demo mode — open the reset link directly
          toast.success("Reset link generated! Redirecting...", { duration: 2000 });
          setTimeout(() => {
            window.location.href = data.resetUrl;
          }, 1000);
        } else {
          toast.success("If that email is registered, a reset link has been sent.");
        }
        setShowForgot(false);
        setForgotEmail("");
      } else {
        toast.error(data.error || "Something went wrong");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  // Premium entrance animation
  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.1 });

      // ── Home button drops in ──────────────────────────────────
      tl.fromTo(
        ".auth-home-btn",
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
        0
      );

      // ── Container scale-in ────────────────────────────────────
      tl.fromTo(
        ".auth-container",
        { scale: 0.92, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
        0.05
      );

      // ── Desktop: Overlay panel slides in ──────────────────────
      tl.fromTo(
        ".auth-overlay-panel",
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: "power2.out" },
        0.3
      );

      // ── Overlay glow pulses ───────────────────────────────────
      tl.fromTo(
        ".auth-overlay-glow",
        { scale: 0.6, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: "power2.out" },
        0.4
      );

      // ── Logo entrance ─────────────────────────────────────────
      tl.fromTo(
        ".auth-logo",
        { scale: 0.5, opacity: 0, rotate: -10 },
        { scale: 1, opacity: 1, rotate: 0, duration: 0.5, ease: "back.out(1.4)" },
        0.25
      );

      // ── Heading slides up ─────────────────────────────────────
      tl.fromTo(
        ".auth-heading",
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
        0.35
      );
      tl.fromTo(
        ".auth-subheading",
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
        0.42
      );

      // ── Form fields stagger up ────────────────────────────────
      tl.fromTo(
        ".auth-field",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: "power2.out" },
        0.45
      );

      // ── Submit button scales in ───────────────────────────────
      tl.fromTo(
        ".auth-submit-btn",
        { y: 15, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.2)" },
        0.7
      );

      // ── Bottom links fade in ──────────────────────────────────
      tl.fromTo(
        ".auth-bottom-link",
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, stagger: 0.06, ease: "power2.out" },
        0.8
      );

      // ── Overlay stats counter animation ───────────────────────
      const statEls = containerRef.current?.querySelectorAll(".auth-stat-value");
      if (statEls && statEls.length > 0) {
        tl.fromTo(
          statEls,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: "power2.out" },
          0.6
        );
      }

      // ── SVG illustration DrawSVG self-draw ────────────────────
      const illustrationStrokes = containerRef.current?.querySelectorAll(".illust-draw");
      if (illustrationStrokes && illustrationStrokes.length > 0) {
        gsap.set(illustrationStrokes, { drawSVG: "0%", opacity: 1 });
        tl.to(
          illustrationStrokes,
          { drawSVG: "100%", duration: 0.6, stagger: 0.04, ease: "power2.out" },
          0.5
        );
      }

      // ── SVG illustration fills fade in ────────────────────────
      const illustrationFills = containerRef.current?.querySelectorAll(".illust-fill");
      if (illustrationFills && illustrationFills.length > 0) {
        gsap.set(illustrationFills, { opacity: 0 });
        tl.to(
          illustrationFills,
          { opacity: 1, duration: 0.4, stagger: 0.03, ease: "power2.out" },
          0.7
        );
      }

      // ── NER badges float in ───────────────────────────────────
      const badges = containerRef.current?.querySelectorAll(".illust-badge");
      if (badges && badges.length > 0) {
        gsap.set(badges, { x: 30, opacity: 0 });
        tl.to(
          badges,
          { x: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: "power2.out" },
          0.9
        );
      }

      // ── Floating particles gentle pulse (infinite) ────────────
      gsap.to(".illust-particle", {
        scale: 1.4,
        opacity: 0.8,
        duration: 2,
        stagger: { each: 0.4, repeat: -1, yoyo: true },
        ease: "sine.inOut",
      });

      // ── Dotted border frame draw ──────────────────────────────
      const frameRect = containerRef.current?.querySelector(".auth-frame-border");
      if (frameRect) {
        gsap.set(frameRect, { drawSVG: "0%" });
        tl.to(frameRect, { drawSVG: "100%", duration: 1.2, ease: "power2.inOut" }, 0.5);
      }
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const switchMode = useCallback(
    (newMode: "login" | "register") => {
      if (newMode === mode || isTransitioning) return;
      setIsTransitioning(true);

      const tl = gsap.timeline({
        onComplete: () => {
          setMode(newMode);
          setIsTransitioning(false);
          window.history.replaceState(null, "", newMode === "login" ? "/login" : "/register");

          requestAnimationFrame(() => {
            const enterTl = gsap.timeline();
            // Logo pop
            enterTl.fromTo(
              ".auth-logo",
              { scale: 0.8, opacity: 0 },
              { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.2)" },
              0
            );
            // Heading
            enterTl.fromTo(
              ".auth-heading",
              { y: 15, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" },
              0.05
            );
            enterTl.fromTo(
              ".auth-subheading",
              { y: 10, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.25, ease: "power2.out" },
              0.1
            );
            // Fields
            enterTl.fromTo(
              ".auth-field",
              { y: 15, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.3, stagger: 0.04, ease: "power2.out" },
              0.12
            );
            // Button
            enterTl.fromTo(
              ".auth-submit-btn",
              { y: 10, opacity: 0, scale: 0.95 },
              { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.1)" },
              0.3
            );
            // Bottom link
            enterTl.fromTo(
              ".auth-bottom-link",
              { opacity: 0 },
              { opacity: 1, duration: 0.25, ease: "power2.out" },
              0.35
            );
          });
        },
      });

      // Exit animation — fields slide out
      tl.to(".auth-field, .auth-submit-btn, .auth-bottom-link", {
        y: -12,
        opacity: 0,
        duration: 0.2,
        stagger: 0.02,
        ease: "power2.in",
      });
      tl.to(".auth-heading, .auth-subheading, .auth-logo", {
        y: -8,
        opacity: 0,
        duration: 0.15,
        stagger: 0.02,
        ease: "power2.in",
      }, "-=0.1");
    },
    [mode, isTransitioning]
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoginLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Login successful!");
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setTimeout(() => router.push("/dashboard"), 500);
      } else {
        toast.error(data.error || "Invalid credentials");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !regEmail || !regPassword) {
      toast.error("Please fill in all required fields");
      return;
    }
    setRegLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: regEmail, password: regPassword, role, specialization }),
      });
      const data = await res.json();

      if (data.success) {
        fireConfetti();
        toast.success("Account created! Redirecting...");
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setTimeout(() => router.push("/dashboard"), 800);
      } else {
        toast.error(data.error || "Registration failed");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setRegLoading(false);
    }
  };

  /* ─── Icon helper — vertically centered, focus-aware via group ─── */
  const inputIcon = "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 transition-colors duration-200 group-focus-within:text-primary/70 pointer-events-none";
  const eyeBtn = "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors duration-200 focus:outline-none";

  return (
    <div ref={containerRef} className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      {/* Home button */}
      <Link
        href="/"
        className="auth-home-btn fixed top-5 left-5 z-50 flex items-center gap-2 px-3.5 py-2 rounded-full bg-card/60 backdrop-blur-md border border-border/40 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-card/80 transition-all duration-300 group shadow-sm"
      >
        <Home className="w-4 h-4 group-hover:text-primary transition-colors duration-200" />
        <span className="hidden sm:inline text-xs font-medium">Back to Home</span>
      </Link>

      {/* ===== MOBILE LAYOUT (< lg) ===== */}
      <div className="lg:hidden auth-container w-full max-w-md">
        <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm shadow-2xl shadow-black/20 p-6 sm:p-8">
          {isLogin ? (
            /* ── LOGIN FORM (mobile) ── */
            <div className="w-full space-y-6">
              <div className="auth-logo flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                  <Stethoscope className="w-[18px] h-[18px] text-white" />
                </div>
                <span className="text-lg font-bold tracking-tight">
                  MedScribe <span className="text-primary">AI</span>
                </span>
              </div>

              <div className="space-y-1">
                <h1 className="auth-heading text-2xl font-bold text-foreground tracking-tight">Welcome back!</h1>
                <p className="auth-subheading text-sm text-muted-foreground">Sign in to your clinical dashboard</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="auth-field space-y-2">
                  <Label htmlFor="m-login-email" className="text-sm font-medium text-foreground/80">Email</Label>
                  <div className="relative group">
                    <Mail className={inputIcon} />
                    <Input id="m-login-email" type="email" placeholder="doctor@hospital.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className={inputWithIconLeft} />
                  </div>
                </div>
                <div className="auth-field space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="m-login-pw" className="text-sm font-medium text-foreground/80">Password</Label>
                    <button type="button" onClick={() => { setShowForgot(true); setForgotEmail(loginEmail); }} className="text-xs text-primary hover:underline font-medium">Forgot password?</button>
                  </div>
                  <div className="relative group">
                    <Lock className={inputIcon} />
                    <Input id="m-login-pw" type={showLoginPassword ? "text" : "password"} placeholder="Enter your password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className={inputWithIconBoth} />
                    <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className={eyeBtn}>{showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                </div>
                <div className="auth-submit-btn">
                  <Button type="submit" className="w-full h-11 gap-2 text-sm font-semibold mt-2" disabled={loginLoading}>
                    {loginLoading ? <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <>Sign in <ArrowRight className="w-4 h-4" /></>}
                  </Button>
                </div>
              </form>

              <div className="auth-bottom-link p-3 rounded-xl bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground text-center"><strong className="text-foreground">Demo:</strong> doctor@medscribe.ai / password123</p>
              </div>

              <p className="auth-bottom-link text-sm text-muted-foreground text-center">
                Don&apos;t have an account?{" "}
                <button onClick={() => switchMode("register")} className="text-primary hover:underline font-medium">Sign up</button>
              </p>
            </div>
          ) : (
            /* ── REGISTER FORM (mobile) ── */
            <div className="w-full space-y-5">
              <div className="auth-logo flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                  <Stethoscope className="w-[18px] h-[18px] text-white" />
                </div>
                <span className="text-lg font-bold tracking-tight">
                  MedScribe <span className="text-primary">AI</span>
                </span>
              </div>

              <div className="space-y-1">
                <h1 className="auth-heading text-2xl font-bold text-foreground tracking-tight">Create an account</h1>
                <p className="auth-subheading text-sm text-muted-foreground">Join the future of clinical documentation</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-3.5">
                <div className="auth-field space-y-1.5">
                  <Label htmlFor="m-reg-name" className="text-sm font-medium text-foreground/80">Full name</Label>
                  <div className="relative group">
                    <User className={inputIcon} />
                    <Input id="m-reg-name" placeholder="Dr. Jane Smith" value={name} onChange={(e) => setName(e.target.value)} className={inputWithIconLeft} />
                  </div>
                </div>
                <div className="auth-field space-y-1.5">
                  <Label htmlFor="m-reg-email" className="text-sm font-medium text-foreground/80">Email</Label>
                  <div className="relative group">
                    <Mail className={inputIcon} />
                    <Input id="m-reg-email" type="email" placeholder="doctor@hospital.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className={inputWithIconLeft} />
                  </div>
                </div>
                <div className="auth-field space-y-1.5">
                  <Label htmlFor="m-reg-pw" className="text-sm font-medium text-foreground/80">Password</Label>
                  <div className="relative group">
                    <Lock className={inputIcon} />
                    <Input id="m-reg-pw" type={showRegPassword ? "text" : "password"} placeholder="Min 6 characters" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className={inputWithIconBoth} />
                    <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className={eyeBtn}>{showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                </div>
                <div className="auth-field space-y-1.5">
                  <Label className="text-sm font-medium text-foreground/80">Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="h-11 bg-background/50 border-border/40 focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all duration-200">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="patient">Patient</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {role === "doctor" && (
                  <div className="auth-field space-y-1.5">
                    <Label htmlFor="m-spec" className="text-sm font-medium text-foreground/80">Specialization</Label>
                    <div className="relative group">
                      <Briefcase className={inputIcon} />
                      <Input id="m-spec" placeholder="e.g., Cardiology" value={specialization} onChange={(e) => setSpecialization(e.target.value)} className={inputWithIconLeft} />
                    </div>
                  </div>
                )}
                <div className="auth-submit-btn">
                  <Button type="submit" className="w-full h-11 gap-2 text-sm font-semibold mt-1" disabled={regLoading}>
                    {regLoading ? <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <>Sign Up <ArrowRight className="w-4 h-4" /></>}
                  </Button>
                </div>
              </form>

              <p className="auth-bottom-link text-sm text-muted-foreground text-center">
                Already have an account?{" "}
                <button onClick={() => switchMode("login")} className="text-primary hover:underline font-medium">Sign in</button>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT (>= lg) — sliding panel ===== */}
      <div className="auth-container hidden lg:block relative w-full max-w-[1020px] h-[860px] rounded-2xl overflow-hidden border border-border/40 bg-card/40 backdrop-blur-sm shadow-2xl shadow-black/20">
        {/* Forms layer */}
        <div className="relative w-full h-full flex">

          {/* ── Left half ── */}
          <div className="w-1/2 h-full flex items-center justify-center px-12 xl:px-16">
            {isLogin ? (
              <div className="w-full max-w-[360px] space-y-7">
                {/* Logo */}
                <div className="auth-logo flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                    <Stethoscope className="w-[18px] h-[18px] text-white" />
                  </div>
                  <span className="text-lg font-bold tracking-tight">
                    MedScribe <span className="text-primary">AI</span>
                  </span>
                </div>

                {/* Header */}
                <div className="space-y-1.5">
                  <h1 className="auth-heading text-[26px] font-bold text-foreground tracking-tight leading-tight">Welcome back!</h1>
                  <p className="auth-subheading text-[13px] text-muted-foreground leading-relaxed">
                    Sign in to continue to your clinical dashboard
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="auth-field space-y-2">
                    <Label htmlFor="d-login-email" className="text-[13px] font-medium text-foreground/80">Email</Label>
                    <div className="relative group">
                      <Mail className={inputIcon} />
                      <Input
                        id="d-login-email"
                        type="email"
                        placeholder="doctor@hospital.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className={inputWithIconLeft}
                      />
                    </div>
                  </div>

                  <div className="auth-field space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="d-login-pw" className="text-[13px] font-medium text-foreground/80">Password</Label>
                      <button type="button" onClick={() => { setShowForgot(true); setForgotEmail(loginEmail); }} className="text-xs text-primary hover:underline font-medium">Forgot password?</button>
                    </div>
                    <div className="relative group">
                      <Lock className={inputIcon} />
                      <Input
                        id="d-login-pw"
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className={inputWithIconBoth}
                      />
                      <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className={eyeBtn}>
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="auth-submit-btn">
                    <Button type="submit" className="w-full h-11 gap-2 text-sm font-semibold shadow-lg shadow-primary/15 hover:shadow-primary/25 transition-all duration-300" disabled={loginLoading}>
                      {loginLoading ? (
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      ) : (
                        <>Sign in <ArrowRight className="w-4 h-4" /></>
                      )}
                    </Button>
                  </div>
                </form>

                {/* Divider */}
                <div className="auth-bottom-link flex items-center gap-3">
                  <div className="h-px flex-1 bg-border/40" />
                  <span className="text-[11px] text-muted-foreground/60 uppercase tracking-wider font-medium">or use demo</span>
                  <div className="h-px flex-1 bg-border/40" />
                </div>

                {/* Demo credentials */}
                <div className="auth-bottom-link p-3.5 rounded-xl bg-muted/15 border border-border/30">
                  <p className="text-xs text-muted-foreground text-center leading-relaxed">
                    <strong className="text-foreground font-semibold">Demo credentials:</strong><br />
                    doctor@medscribe.ai / password123
                  </p>
                </div>

                <p className="auth-bottom-link text-[13px] text-muted-foreground text-center">
                  Don&apos;t have an account?{" "}
                  <button onClick={() => switchMode("register")} className="text-primary hover:underline font-semibold transition-colors">
                    Sign up
                  </button>
                </p>
              </div>
            ) : (
              <div className="w-full max-w-[360px]" />
            )}
          </div>

          {/* ── Right half ── */}
          <div className="w-1/2 h-full flex items-center justify-center px-12 xl:px-16">
            {!isLogin ? (
              <div className="w-full max-w-[360px] space-y-5">
                {/* Logo */}
                <div className="auth-logo flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                    <Stethoscope className="w-[18px] h-[18px] text-white" />
                  </div>
                  <span className="text-lg font-bold tracking-tight">
                    MedScribe <span className="text-primary">AI</span>
                  </span>
                </div>

                {/* Header */}
                <div className="space-y-1.5">
                  <h1 className="auth-heading text-[26px] font-bold text-foreground tracking-tight leading-tight">Create an account</h1>
                  <p className="auth-subheading text-[13px] text-muted-foreground leading-relaxed">
                    Join MedScribe AI — the future of clinical docs
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div className="auth-field space-y-1.5">
                    <Label htmlFor="d-reg-name" className="text-[13px] font-medium text-foreground/80">Full name</Label>
                    <div className="relative group">
                      <User className={inputIcon} />
                      <Input id="d-reg-name" placeholder="Dr. Jane Smith" value={name} onChange={(e) => setName(e.target.value)} className={inputWithIconLeft} />
                    </div>
                  </div>

                  <div className="auth-field space-y-1.5">
                    <Label htmlFor="d-reg-email" className="text-[13px] font-medium text-foreground/80">Email</Label>
                    <div className="relative group">
                      <Mail className={inputIcon} />
                      <Input id="d-reg-email" type="email" placeholder="doctor@hospital.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className={inputWithIconLeft} />
                    </div>
                  </div>

                  <div className="auth-field space-y-1.5">
                    <Label htmlFor="d-reg-pw" className="text-[13px] font-medium text-foreground/80">Password</Label>
                    <div className="relative group">
                      <Lock className={inputIcon} />
                      <Input id="d-reg-pw" type={showRegPassword ? "text" : "password"} placeholder="Min 6 characters" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className={inputWithIconBoth} />
                      <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className={eyeBtn}>
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="auth-field space-y-1.5">
                    <Label className="text-[13px] font-medium text-foreground/80">Role</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger className="h-11 bg-background/50 border-border/40 focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all duration-200">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="doctor">Doctor</SelectItem>
                        <SelectItem value="patient">Patient</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {role === "doctor" && (
                    <div className="auth-field space-y-1.5">
                      <Label htmlFor="d-spec" className="text-[13px] font-medium text-foreground/80">Specialization</Label>
                      <div className="relative group">
                        <Briefcase className={inputIcon} />
                        <Input id="d-spec" placeholder="e.g., Cardiology" value={specialization} onChange={(e) => setSpecialization(e.target.value)} className={inputWithIconLeft} />
                      </div>
                    </div>
                  )}

                  <div className="auth-submit-btn">
                    <Button type="submit" className="w-full h-11 gap-2 text-sm font-semibold shadow-lg shadow-primary/15 hover:shadow-primary/25 transition-all duration-300 mt-1" disabled={regLoading}>
                      {regLoading ? (
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      ) : (
                        <>Sign Up <ArrowRight className="w-4 h-4" /></>
                      )}
                    </Button>
                  </div>
                </form>

                <p className="auth-bottom-link text-[13px] text-muted-foreground text-center">
                  Already have an account?{" "}
                  <button onClick={() => switchMode("login")} className="text-primary hover:underline font-semibold transition-colors">
                    Sign in
                  </button>
                </p>
              </div>
            ) : (
              <div className="w-full max-w-[360px]" />
            )}
          </div>
        </div>

        {/* ===== SLIDING OVERLAY PANEL ===== */}
        <div
          style={{ transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)" }}
          className={`auth-overlay-panel absolute top-0 h-full w-1/2 transition-transform duration-700 z-20 ${
            isLogin ? "translate-x-full" : "translate-x-0"
          }`}
        >
          <div className="relative w-full h-full overflow-hidden">
            {/* Dark gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900" />

            {/* Glow effects */}
            <div className="auth-overlay-glow absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 blur-[120px] rounded-full" />
              <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-violet-500/10 blur-[100px] rounded-full" />
            </div>

            {/* DrawSVG border frame */}
            <svg className="absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <rect
                className="auth-frame-border"
                x="0.5" y="0.5" width="99" height="99" rx="4"
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="0.3"
                strokeDasharray="2 1.5"
              />
            </svg>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-10 py-8 text-center">
              {/* Illustration */}
              <div className="mb-8 w-full flex justify-center">
                {isLogin ? <MedicalIllustrationLogin /> : <MedicalIllustrationRegister />}
              </div>

              {/* Text */}
              <h2 className="text-xl font-bold text-white mb-2 tracking-tight">
                {isLogin ? "AI-Powered Clinical Docs" : "Join the Healthcare Revolution"}
              </h2>
              <p className="text-sm text-neutral-400 max-w-[280px] leading-relaxed mb-8">
                {isLogin
                  ? "Transform clinical notes into structured SOAP formats with intelligent NER extraction"
                  : "Create your account and start documenting smarter with AI-powered tools"
                }
              </p>

              {/* Stats */}
              <div className="flex gap-10">
                <div className="auth-stat-value text-center">
                  <p className="text-2xl font-bold text-white">98%</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Accuracy</p>
                </div>
                <div className="auth-stat-value text-center">
                  <p className="text-2xl font-bold text-white">2hrs+</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Saved Daily</p>
                </div>
                <div className="auth-stat-value text-center">
                  <p className="text-2xl font-bold text-white">500ms</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Response</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== FORGOT PASSWORD MODAL ===== */}
      {showForgot && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForgot(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-border/40 bg-card shadow-2xl shadow-black/30 p-6 sm:p-8 space-y-5">
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-foreground tracking-tight">Forgot your password?</h2>
              <p className="text-sm text-muted-foreground">
                Enter your email and we&apos;ll generate a reset link for you.
              </p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email" className="text-sm font-medium text-foreground/80">Email</Label>
                <div className="relative group">
                  <Mail className={inputIcon} />
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="doctor@hospital.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className={inputWithIconLeft}
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11"
                  onClick={() => setShowForgot(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-11 gap-2"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>Send Reset Link <ArrowRight className="w-4 h-4" /></>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
