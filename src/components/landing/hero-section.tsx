"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";
import { Zap, Play, Check, Sparkles, Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";
import StarBorder from "@/components/StarBorder";
import { HeroSvgNetwork } from "./hero-svg-network";
import { usePitch } from "@/components/pitch/pitch-provider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, SplitText, ScrambleTextPlugin, Physics2DPlugin);
}

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const particleContainerRef = useRef<HTMLDivElement>(null);
  const { startPitch } = usePitch();

  useEffect(() => {
    if (!sectionRef.current || typeof window === "undefined") return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });

      // ── Badge entrance (starts first, subtle) ─────────────────
      tl.fromTo(
        ".hero-badge-inner",
        { scale: 0.7, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.2)" },
        0
      );

      // ── SplitText heading reveal ──────────────────────────────
      if (titleRef.current) {
        const split = new SplitText(titleRef.current, {
          type: "lines",
          mask: "lines",
        });

        gsap.set(split.lines, { y: 60, opacity: 0 });
        tl.to(
          split.lines,
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.08,
            ease: "power3.out",
          },
          0.15
        );
      }

      // ── ScrambleText subtitle (faster decode) ─────────────────
      if (subtitleRef.current) {
        const originalText = subtitleRef.current.textContent || "";
        gsap.set(subtitleRef.current, { opacity: 1 });
        tl.fromTo(
          subtitleRef.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
          "-=0.3"
        );
        tl.to(
          subtitleRef.current,
          {
            scrambleText: {
              text: originalText,
              chars: "01!<>{}/_\\",
              speed: 0.6,
            },
            duration: 0.8,
            ease: "power2.inOut",
          },
          "<"
        );
      }

      // ── CTA buttons (clear visual separation) ─────────────────
      tl.fromTo(
        ".hero-cta-btn",
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.12,
          ease: "power3.out",
        },
        "-=0.2"
      );

      // ── Trust indicators (sequenced after buttons) ────────────
      tl.fromTo(
        ".hero-trust-item",
        { y: 15, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.08,
          ease: "power2.out",
        },
        "-=0.1"
      );

      // ── Physics2D particle burst (tighter spread) ─────────────
      if (particleContainerRef.current) {
        const container = particleContainerRef.current;

        tl.call(
          () => {
            for (let i = 0; i < 25; i++) {
              const dot = document.createElement("div");
              dot.className = "absolute w-1.5 h-1.5 rounded-full bg-primary/50";
              dot.style.left = "50%";
              dot.style.top = "50%";
              container.appendChild(dot);

              gsap.to(dot, {
                physics2D: {
                  velocity: 250 + Math.random() * 150,
                  angle: Math.random() * 360,
                  gravity: 80,
                },
                opacity: 0,
                duration: 1.2 + Math.random() * 0.4,
                ease: "power2.out",
                onComplete: () => dot.remove(),
              });
            }
          },
          [],
          "-=0.5"
        );
      }

      // ── Scroll indicator (starts sooner, faster pulse) ────────
      gsap.to(".scroll-indicator", {
        y: 6,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 0.8,
      });

      // ── Hero parallax on scroll-out ───────────────────────────
      gsap.to(".hero-text-content", {
        y: -60,
        opacity: 0.3,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden"
    >
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Text Content */}
        <div className="hero-text-content">
          {/* Badge */}
          <div className="hero-badge-inner mb-8">
            <StarBorder
              as="div"
              color="hsl(var(--primary))"
              speed="6s"
              className="inline-flex px-4 py-2 text-sm font-medium"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-primary">
                  AI-Powered Healthcare Innovation
                </span>
              </div>
            </StarBorder>
          </div>

          {/* Title */}
          <h1
            ref={titleRef}
            className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.08] mb-8"
          >
            Clinical Documentation{" "}
            <span className="bg-gradient-to-r from-primary via-violet-400 to-primary bg-[length:200%_100%] bg-clip-text text-transparent animate-[gradient-shift_4s_ease_infinite]">
              Reimagined with AI
            </span>
          </h1>

          {/* Subtitle */}
          <p
            ref={subtitleRef}
            className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mb-10 opacity-0"
          >
            Transform clinical notes into structured SOAP formats, extract
            medical entities automatically, and analyze lab reports — saving
            doctors 2+ hours daily per clinician.
          </p>

          {/* Particle burst container */}
          <div
            ref={particleContainerRef}
            className="absolute inset-0 pointer-events-none overflow-hidden"
          />

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <Link href="/register" className="hero-cta-btn">
              <Button
                size="lg"
                className="text-base px-8 h-13 gap-2 w-full sm:w-auto shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-300"
              >
                <Zap className="w-4 h-4" /> Start Free Demo
              </Button>
            </Link>
            <div className="hero-cta-btn">
              <Button
                variant="outline"
                size="lg"
                onClick={startPitch}
                className="text-base px-8 h-13 gap-2 w-full sm:w-auto border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary/60 transition-all duration-300"
              >
                <Presentation className="w-4 h-4" /> Pitch This App
              </Button>
            </div>
            <a href="#demo" className="hero-cta-btn">
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
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            {[
              "No credit card required",
              "HIPAA-aware design",
              "Powered by Gemini AI",
            ].map((text) => (
              <div key={text} className="hero-trust-item flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Neural Network SVG */}
        <div className="hidden lg:block" data-speed="1.1">
          <div className="relative w-full aspect-[5/4]">
            <HeroSvgNetwork />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-xs text-muted-foreground/60 uppercase tracking-widest">
          Scroll
        </span>
        <svg
          className="scroll-indicator w-5 h-5 text-muted-foreground/40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </section>
  );
}
