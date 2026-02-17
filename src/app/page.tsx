"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FileText,
  Brain,
  Mic,
  Upload,
  MessageSquare,
  Activity,
  Shield,
  Zap,
  Stethoscope,
  Heart,
  ChevronDown,
  Sparkles,
  Check,
  Play,
  BarChart3,
  Clock,
  Users,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import SpotlightCard from "@/components/SpotlightCard";
import Counter from "@/components/Counter";
import AnimatedContent from "@/components/AnimatedContent";
import ShinyText from "@/components/ShinyText";
import StarBorder from "@/components/StarBorder";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Mic,
    title: "Voice-to-SOAP Notes",
    description:
      "Dictate clinical notes and let AI convert them into structured SOAP format instantly with medical terminology recognition.",
    color: "#0ea5e9",
    spotlight: "rgba(14, 165, 233, 0.15)",
  },
  {
    icon: Brain,
    title: "Medical NER Extraction",
    description:
      "Auto-detect medications, diagnoses, procedures, symptoms, and lab results with color-coded entity highlighting.",
    color: "#8b5cf6",
    spotlight: "rgba(139, 92, 246, 0.15)",
  },
  {
    icon: Upload,
    title: "Report Intelligence",
    description:
      "Upload lab reports — AI extracts values, flags abnormals, and explains findings in plain English for patients.",
    color: "#10b981",
    spotlight: "rgba(16, 185, 129, 0.15)",
  },
  {
    icon: MessageSquare,
    title: "AI Clinical Assistant",
    description:
      "Chat with an AI that understands medical context. Get instant answers with real-time streaming responses.",
    color: "#f59e0b",
    spotlight: "rgba(245, 158, 11, 0.15)",
  },
  {
    icon: Activity,
    title: "Analytics Dashboard",
    description:
      "Interactive charts tracking patient records, note processing, entity extraction stats, and AI performance metrics.",
    color: "#ef4444",
    spotlight: "rgba(239, 68, 68, 0.15)",
  },
  {
    icon: Shield,
    title: "Secure & Compliant",
    description:
      "JWT-based authentication, role-based access control, and audit-ready design for healthcare data protection.",
    color: "#06b6d4",
    spotlight: "rgba(6, 182, 212, 0.15)",
  },
];

const stats = [
  { value: 107, suffix: "+", label: "Medical Entity Types", icon: Brain, spotlight: "rgba(139, 92, 246, 0.15)" },
  { value: 2, suffix: "hrs", label: "Saved Per Doctor/Day", icon: Clock, spotlight: "rgba(14, 165, 233, 0.15)" },
  { value: 98, suffix: "%", label: "NER Accuracy", icon: BarChart3, spotlight: "rgba(16, 185, 129, 0.15)" },
  { value: 500, suffix: "ms", label: "Avg Response Time", icon: Zap, spotlight: "rgba(245, 158, 11, 0.15)" },
];

const workflows = [
  { step: "01", title: "Input", desc: "Type or dictate clinical notes using voice recognition", icon: Mic },
  { step: "02", title: "Process", desc: "AI extracts entities, generates SOAP notes & ICD codes", icon: Brain },
  { step: "03", title: "Review", desc: "Color-coded highlights for medications, diagnoses & more", icon: FileText },
  { step: "04", title: "Analyze", desc: "Upload reports for AI-powered lab value interpretation", icon: BarChart3 },
];

const navItems = [
  { name: "Features", link: "#features" },
  { name: "How It Works", link: "#workflow" },
  { name: "Demo", link: "#demo" },
];

export default function LandingPage() {
  const mainRef = useRef<HTMLDivElement>(null);
  const [activeFeature, setActiveFeature] = useState(0);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!mainRef.current) return;

    const ctx = gsap.context(() => {
      // --- HERO ---
      const heroTl = gsap.timeline({ delay: 0.3 });

      heroTl
        .fromTo(
          ".hero-badge",
          { scale: 0.5, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" }
        )
        .fromTo(
          ".hero-title-line",
          { y: 80, opacity: 0, skewY: 3 },
          { y: 0, opacity: 1, skewY: 0, duration: 0.9, stagger: 0.15, ease: "power4.out" },
          "-=0.2"
        )
        .fromTo(
          ".hero-subtitle",
          { y: 30, opacity: 0, filter: "blur(10px)" },
          { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.8, ease: "power2.out" },
          "-=0.4"
        )
        .fromTo(
          ".hero-cta",
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: "power3.out" },
          "-=0.3"
        )
        .fromTo(
          ".hero-trust",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
          "-=0.2"
        );

      // Floating orbs
      gsap.to(".orb-1", {
        y: -30,
        x: 20,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(".orb-2", {
        y: 20,
        x: -30,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(".orb-3", {
        y: -20,
        x: -15,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Scroll indicator bounce
      gsap.to(".scroll-arrow", {
        y: 8,
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });

      // --- FEATURES ---
      gsap.fromTo(
        ".features-heading",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: ".features-section", start: "top 80%" },
        }
      );

      // --- WORKFLOW ---
      gsap.fromTo(
        ".workflow-heading",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: ".workflow-section", start: "top 80%" },
        }
      );

      // --- DEMO PREVIEW ---
      gsap.fromTo(
        ".demo-heading",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: ".demo-section", start: "top 80%" },
        }
      );

      gsap.fromTo(
        ".demo-card",
        { y: 80, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: ".demo-card", start: "top 85%" },
        }
      );

      // NER entity typewriter highlight
      gsap.fromTo(
        ".ner-entity",
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          stagger: 0.15,
          ease: "back.out(1.7)",
          scrollTrigger: { trigger: ".demo-card", start: "top 75%" },
        }
      );

      // SOAP note slide in
      gsap.fromTo(
        ".soap-section",
        { x: 30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: { trigger: ".soap-container", start: "top 80%" },
        }
      );

      // --- CTA ---
      gsap.fromTo(
        ".cta-content",
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: ".cta-section", start: "top 80%" },
        }
      );
    }, mainRef);

    return () => ctx.revert();
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={mainRef} className="min-h-screen overflow-x-hidden">
      {/* ======= NAVIGATION — Resizable Navbar ======= */}
      <Navbar>
        <NavBody>
          <NavbarLogo
            logo={
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
                <Stethoscope className="w-4 h-4 text-white" />
              </div>
            }
            name="MedScribe AI"
          />
          <NavItems items={navItems} />
          <div className="flex items-center gap-2">
            <NavbarButton href="/login" variant="secondary">
              Log in
            </NavbarButton>
            <NavbarButton href="/register" variant="gradient" className="bg-gradient-to-b from-primary to-primary/80">
              Get Started
            </NavbarButton>
          </div>
        </NavBody>

        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo
              logo={
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-white" />
                </div>
              }
              name="MedScribe AI"
            />
            <MobileNavToggle
              isOpen={isMobileNavOpen}
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            />
          </MobileNavHeader>
          <MobileNavMenu isOpen={isMobileNavOpen}>
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.link}
                onClick={() => setIsMobileNavOpen(false)}
                className="w-full text-neutral-600 dark:text-neutral-300 text-sm"
              >
                {item.name}
              </a>
            ))}
            <div className="flex w-full flex-col gap-2">
              <NavbarButton href="/login" variant="primary" className="w-full">
                Log in
              </NavbarButton>
              <NavbarButton href="/register" variant="gradient" className="w-full bg-gradient-to-b from-primary to-primary/80">
                Get Started
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      {/* ======= HERO ======= */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="orb-1 absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />
          <div className="orb-2 absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-[100px]" />
          <div className="orb-3 absolute bottom-1/4 left-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[140px]" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Badge with StarBorder */}
          <div className="hero-badge mb-8 flex justify-center">
            <StarBorder
              as="div"
              color="hsl(var(--primary))"
              speed="6s"
              className="px-4 py-2 text-sm font-medium"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-primary">AI-Powered Healthcare Innovation</span>
              </div>
            </StarBorder>
          </div>

          {/* Title */}
          <div className="space-y-2 mb-8">
            <h1 className="hero-title-line text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05]">
              Clinical Documentation
            </h1>
            <h1 className="hero-title-line text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05]">
              <span className="bg-gradient-to-r from-primary via-violet-400 to-primary bg-[length:200%_100%] bg-clip-text text-transparent"
                style={{ animation: "gradient-shift 4s ease infinite" }}
              >
                Reimagined with AI
              </span>
            </h1>
          </div>

          {/* Subtitle with ShinyText */}
          <div className="hero-subtitle max-w-2xl mx-auto mb-10">
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Transform clinical notes into structured SOAP formats, extract medical entities
              automatically, and analyze lab reports — saving doctors{" "}
            </p>
            <ShinyText
              text="2+ hours daily per clinician"
              speed={4}
              className="text-lg md:text-xl font-semibold inline-block mt-1"
            />
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/register" className="hero-cta">
              <Button
                size="lg"
                className="text-base px-8 h-13 gap-2 w-full sm:w-auto shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-300"
              >
                <Zap className="w-4 h-4" /> Start Free Demo
              </Button>
            </Link>
            <a href="#demo" className="hero-cta">
              <Button
                variant="outline"
                size="lg"
                className="text-base px-8 h-13 gap-2 w-full sm:w-auto border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
              >
                <Play className="w-4 h-4" /> See How It Works
              </Button>
            </a>
          </div>

          {/* Trust indicators */}
          <div className="hero-trust flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>HIPAA-aware design</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Powered by Gemini AI</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground/60 uppercase tracking-widest">Scroll</span>
          <ChevronDown className="scroll-arrow w-5 h-5 text-muted-foreground/40" />
        </div>
      </section>

      {/* ======= STATS with SpotlightCard + Counter ======= */}
      <section className="stats-section py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.02] to-background pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, i) => (
              <AnimatedContent key={stat.label} distance={50} delay={i * 0.1} duration={0.7}>
                <SpotlightCard
                  className="border-border/50 bg-card/30 backdrop-blur-sm hover:border-primary/30 transition-all duration-500 text-center"
                  spotlightColor={stat.spotlight as `rgba(${number}, ${number}, ${number}, ${number})`}
                >
                  <stat.icon className="w-5 h-5 text-primary/60 mx-auto mb-3" />
                  <div className="flex items-baseline justify-center gap-0.5 mb-1">
                    <Counter
                      value={stat.value}
                      fontSize={36}
                      fontWeight={700}
                      textColor="hsl(var(--foreground))"
                      gradientFrom="transparent"
                      gradientTo="transparent"
                    />
                    <span className="text-xl text-primary font-bold">{stat.suffix}</span>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
                </SpotlightCard>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* ======= FEATURES with SpotlightCard ======= */}
      <section id="features" className="features-section py-24 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="features-heading text-center mb-16">
            <StarBorder
              as="div"
              color="hsl(var(--primary))"
              speed="8s"
              className="inline-flex mb-4 px-3 py-1 text-xs"
            >
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-primary" /> <span className="text-primary">Core Features</span>
              </div>
            </StarBorder>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Everything Clinicians Need
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              One platform to document, analyze, and understand — powered by Google Gemini AI
            </p>
          </div>

          <div className="features-grid grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <AnimatedContent key={feature.title} distance={60} delay={i * 0.1} duration={0.7}>
                <SpotlightCard
                  className={`border-border/50 bg-card/30 backdrop-blur-sm hover:border-opacity-60 transition-all duration-500 cursor-default ${
                    activeFeature === i ? "border-primary/40 bg-card/50" : ""
                  }`}
                  spotlightColor={feature.spotlight as `rgba(${number}, ${number}, ${number}, ${number})`}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 hover:scale-110"
                    style={{ backgroundColor: `${feature.color}15` }}
                    onMouseEnter={() => setActiveFeature(i)}
                  >
                    <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </SpotlightCard>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* ======= HOW IT WORKS with AnimatedContent ======= */}
      <section id="workflow" className="workflow-section py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.02] to-background pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="workflow-heading text-center mb-16">
            <Badge variant="outline" className="mb-4 px-3 py-1 text-xs border-primary/20 bg-primary/5 text-primary">
              <Zap className="w-3 h-3 mr-1" /> Workflow
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From voice dictation to structured clinical documentation in seconds
            </p>
          </div>

          <div className="workflow-grid grid md:grid-cols-4 gap-6 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-1/2 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-y-1/2 z-0" />

            {workflows.map((w, i) => (
              <AnimatedContent key={w.step} distance={50} delay={i * 0.15} duration={0.6} direction="horizontal">
                <div className="relative z-10">
                  <SpotlightCard
                    className="border-border/50 bg-card/30 backdrop-blur-sm hover:border-primary/30 transition-all duration-500 text-center"
                    spotlightColor="rgba(99, 102, 241, 0.12)"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 hover:scale-110 transition-all duration-300">
                      <w.icon className="w-7 h-7 text-primary" />
                    </div>
                    <div className="text-xs font-mono text-primary/60 mb-2">STEP {w.step}</div>
                    <h3 className="text-lg font-semibold mb-2">{w.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{w.desc}</p>
                  </SpotlightCard>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* ======= DEMO PREVIEW ======= */}
      <section id="demo" className="demo-section py-24 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="demo-heading text-center mb-16">
            <Badge variant="outline" className="mb-4 px-3 py-1 text-xs border-primary/20 bg-primary/5 text-primary">
              <Play className="w-3 h-3 mr-1" /> Live Preview
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              See It In Action
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Watch how MedScribe AI transforms raw clinical text into structured, actionable data
            </p>
          </div>

          {/* Demo Card */}
          <div className="demo-card relative rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/10">
            {/* Window Chrome */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/50 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
                <div className="hidden sm:flex items-center gap-2 ml-3 px-3 py-1 rounded-md bg-muted/30 text-xs text-muted-foreground">
                  <Stethoscope className="w-3 h-3" />
                  MedScribe AI — Clinical Notes
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                  AI Processing
                </Badge>
              </div>
            </div>

            {/* Demo Content */}
            <div className="p-6 md:p-10">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left: Input with NER */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <FileText className="w-4 h-4 text-primary" /> Clinical Note Input
                  </h4>
                  <div className="rounded-xl bg-background/50 border border-border/50 p-5 font-mono text-[13px] leading-7">
                    <p className="text-muted-foreground">
                      Patient presents with{" "}
                      <span className="ner-entity inline-block px-1.5 py-0.5 rounded-md text-rose-300 bg-rose-500/15 border border-rose-500/20 font-medium">
                        chest pain
                      </span>{" "}
                      and{" "}
                      <span className="ner-entity inline-block px-1.5 py-0.5 rounded-md text-rose-300 bg-rose-500/15 border border-rose-500/20 font-medium">
                        shortness of breath
                      </span>
                      . Started on{" "}
                      <span className="ner-entity inline-block px-1.5 py-0.5 rounded-md text-sky-300 bg-sky-500/15 border border-sky-500/20 font-medium">
                        Aspirin 325mg
                      </span>{" "}
                      and{" "}
                      <span className="ner-entity inline-block px-1.5 py-0.5 rounded-md text-sky-300 bg-sky-500/15 border border-sky-500/20 font-medium">
                        Metoprolol 50mg
                      </span>
                      .{" "}
                      <span className="ner-entity inline-block px-1.5 py-0.5 rounded-md text-emerald-300 bg-emerald-500/15 border border-emerald-500/20 font-medium">
                        ECG
                      </span>{" "}
                      shows ST elevation.{" "}
                      <span className="ner-entity inline-block px-1.5 py-0.5 rounded-md text-violet-300 bg-violet-500/15 border border-violet-500/20 font-medium">
                        Acute MI
                      </span>{" "}
                      suspected.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge variant="outline" className="text-xs border-sky-500/30 text-sky-400 bg-sky-500/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-sky-400 mr-1.5" />
                      Medications
                    </Badge>
                    <Badge variant="outline" className="text-xs border-rose-500/30 text-rose-400 bg-rose-500/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5" />
                      Symptoms
                    </Badge>
                    <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
                      Procedures
                    </Badge>
                    <Badge variant="outline" className="text-xs border-violet-500/30 text-violet-400 bg-violet-500/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mr-1.5" />
                      Diagnoses
                    </Badge>
                  </div>
                </div>

                {/* Right: SOAP Output */}
                <div className="soap-container">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <Brain className="w-4 h-4 text-primary" /> AI-Generated SOAP Note
                  </h4>
                  <div className="space-y-3">
                    {[
                      {
                        letter: "S",
                        label: "Subjective",
                        text: "Patient reports acute onset chest pain and difficulty breathing.",
                        color: "from-sky-500",
                      },
                      {
                        letter: "O",
                        label: "Objective",
                        text: "ECG demonstrates ST elevation. Vitals pending review.",
                        color: "from-emerald-500",
                      },
                      {
                        letter: "A",
                        label: "Assessment",
                        text: "Acute myocardial infarction (I21.9) — high priority.",
                        color: "from-amber-500",
                      },
                      {
                        letter: "P",
                        label: "Plan",
                        text: "Continue Aspirin 325mg, Metoprolol 50mg. Urgent cardiology consult.",
                        color: "from-violet-500",
                      },
                    ].map((s) => (
                      <div
                        key={s.letter}
                        className="soap-section rounded-xl bg-background/50 border border-border/50 p-4 flex gap-4 hover:border-primary/20 transition-colors duration-300"
                      >
                        <div
                          className={`shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${s.color} to-transparent/20 flex items-center justify-center`}
                        >
                          <span className="text-sm font-bold text-white">{s.letter}</span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-primary mb-1">{s.label}</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {s.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======= CTA ======= */}
      <section className="cta-section py-24 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-primary/8 blur-[120px]" />
        </div>

        <div className="cta-content relative z-10 max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-8">
            <Heart className="w-4 h-4 fill-current" />
            Built for the Thinkitive AI Healthcare Competition
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Ready to Transform
            <br />
            <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
              Clinical Documentation?
            </span>
          </h2>
          <p className="text-lg text-muted-foreground mb-4 max-w-xl mx-auto">
            Join the future of healthcare AI. Start documenting smarter, not harder.
          </p>
          <div className="mb-10">
            <ShinyText
              text="Powered by cutting-edge Gemini AI technology"
              speed={3}
              className="text-sm"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="text-base px-10 h-13 gap-2 shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-300"
              >
                <Zap className="w-4 h-4" /> Get Started Now
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="text-base px-10 h-13 gap-2 border-border/50 hover:border-primary/30 transition-all duration-300"
              >
                <Users className="w-4 h-4" /> Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ======= FOOTER ======= */}
      <footer className="border-t border-border/50 py-8 bg-muted/5">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm">MedScribe AI</span>
          </div>
          <p className="text-xs text-muted-foreground text-center max-w-md">
            AI-generated content is for informational purposes only. Not a substitute for professional medical advice, diagnosis, or treatment.
          </p>
          <p className="text-xs text-muted-foreground">&copy; 2026 Thinkitive Technologies</p>
        </div>
      </footer>
    </div>
  );
}
