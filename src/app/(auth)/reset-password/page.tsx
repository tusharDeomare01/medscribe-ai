"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Stethoscope,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Home,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const inputBase =
  "h-11 bg-background/50 border-border/40 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/50 transition-all duration-200";
const inputWithIconBoth = `${inputBase} pl-10 pr-10`;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const inputIcon =
    "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 transition-colors duration-200 group-focus-within:text-primary/70 pointer-events-none";
  const eyeBtn =
    "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors duration-200 focus:outline-none";

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm shadow-2xl shadow-black/20 p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6 text-destructive" />
          </div>
          <h1 className="text-xl font-bold">Invalid Reset Link</h1>
          <p className="text-sm text-muted-foreground">
            This password reset link is invalid or missing a token. Please request a new one.
          </p>
          <Link href="/login">
            <Button className="gap-2 mt-2">
              Back to Sign In <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm shadow-2xl shadow-black/20 p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
          <h1 className="text-xl font-bold">Password Reset!</h1>
          <p className="text-sm text-muted-foreground">
            Your password has been updated successfully. You can now sign in with your new password.
          </p>
          <Link href="/login">
            <Button className="gap-2 mt-2">
              Sign In <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please fill in both fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        toast.success("Password reset successfully!");
      } else {
        toast.error(data.error || "Failed to reset password");
        if (data.error?.includes("expired")) {
          setTimeout(() => router.push("/login"), 2000);
        }
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <Link
        href="/"
        className="fixed top-5 left-5 z-50 flex items-center gap-2 px-3.5 py-2 rounded-full bg-card/60 backdrop-blur-md border border-border/40 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-card/80 transition-all duration-300 group shadow-sm"
      >
        <Home className="w-4 h-4 group-hover:text-primary transition-colors duration-200" />
        <span className="hidden sm:inline text-xs font-medium">Back to Home</span>
      </Link>

      <div className="w-full max-w-md rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm shadow-2xl shadow-black/20 p-8 space-y-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
            <Stethoscope className="w-[18px] h-[18px] text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            MedScribe <span className="text-primary">AI</span>
          </span>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Reset your password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your new password below. Must be at least 6 characters.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-pw" className="text-sm font-medium text-foreground/80">
              New Password
            </Label>
            <div className="relative group">
              <Lock className={inputIcon} />
              <Input
                id="new-pw"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputWithIconBoth}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={eyeBtn}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-pw" className="text-sm font-medium text-foreground/80">
              Confirm Password
            </Label>
            <div className="relative group">
              <Lock className={inputIcon} />
              <Input
                id="confirm-pw"
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputWithIconBoth}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className={eyeBtn}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 gap-2 text-sm font-semibold mt-2"
            disabled={loading}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>Reset Password <ArrowRight className="w-4 h-4" /></>
            )}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center">
          Remember your password?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
