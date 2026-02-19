"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { PitchSlide } from "../pitch-slides";
import { STETHOSCOPE_LOGO } from "../pitch-svg-paths";
import { Mic, Brain, FileText } from "lucide-react";

interface SlideProps {
  slide: PitchSlide;
  isActive: boolean;
}

export function SlideSolution({ slide, isActive }: SlideProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);
  const burstTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const burstElementsRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    ctxRef.current?.revert();
    if (burstTimerRef.current) clearTimeout(burstTimerRef.current);
    burstElementsRef.current.forEach((el) => el.remove());
    burstElementsRef.current = [];

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Logo DrawSVG self-draw
      tl.fromTo(".logo-stroke", { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.8, ease: "power2.out" }, 0);
      tl.fromTo(".logo-fill", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.7);

      // 3-pass ScrambleText decode
      tl.to(".solution-title", {
        duration: 0.6,
        scrambleText: { text: "MedScribe AI", chars: "░▒▓█▄▀▐▌", speed: 0.2, rightToLeft: true },
      }, 0.3);
      tl.to(".solution-title", {
        duration: 0.5,
        scrambleText: { text: "MedScribe AI", chars: "ACGT01", speed: 0.4 },
      }, 0.9);
      tl.to(".solution-title", {
        duration: 0.4,
        scrambleText: { text: "MedScribe AI", chars: "upperCase", speed: 0.8 },
      }, 1.4);

      // Tagline
      tl.fromTo(".solution-tagline", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }, 1.8);

      // Three pillars
      tl.fromTo(
        ".pillar-icon",
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, stagger: 0.2, ease: "back.out(2)" },
        2.0
      );
      tl.fromTo(
        ".pillar-arrow",
        { drawSVG: "0%" },
        { drawSVG: "100%", duration: 0.4, stagger: 0.15, ease: "power2.out" },
        2.3
      );
      tl.fromTo(
        ".pillar-label",
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, stagger: 0.15, ease: "power2.out" },
        2.5
      );
    }, containerRef);

    ctxRef.current = ctx;

    // Celebration burst — outside gsap.context, managed by ref for cleanup
    burstTimerRef.current = setTimeout(() => {
      if (!containerRef.current) return;
      const burstContainer = containerRef.current.querySelector(".solution-burst");
      if (!burstContainer) return;

      for (let i = 0; i < 25; i++) {
        const dot = document.createElement("div");
        dot.className = "absolute w-1.5 h-1.5 rounded-full";
        dot.style.backgroundColor = slide.accentColor;
        dot.style.left = "50%";
        dot.style.top = "30%";
        burstContainer.appendChild(dot);
        burstElementsRef.current.push(dot);

        gsap.to(dot, {
          physics2D: { velocity: 200 + Math.random() * 200, angle: Math.random() * 360, gravity: 0 },
          opacity: 0, duration: 2,
          onComplete: () => {
            dot.remove();
            burstElementsRef.current = burstElementsRef.current.filter((e) => e !== dot);
          },
        });
      }
    }, 3000);

    return () => {
      ctx.revert();
      if (burstTimerRef.current) {
        clearTimeout(burstTimerRef.current);
        burstTimerRef.current = null;
      }
      burstElementsRef.current.forEach((el) => {
        gsap.killTweensOf(el);
        el.remove();
      });
      burstElementsRef.current = [];
    };
  }, [isActive, slide.accentColor]);

  return (
    <div ref={containerRef} className="w-full max-w-4xl mx-auto flex flex-col items-center gap-8 relative">
      <div className="solution-burst absolute inset-0 pointer-events-none overflow-hidden" />

      <svg viewBox="0 0 48 48" className="w-20 h-20">
        <path className="logo-stroke" d={STETHOSCOPE_LOGO} fill="none" stroke={slide.accentColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path className="logo-fill" d={STETHOSCOPE_LOGO} fill={slide.accentColor} opacity="0" strokeWidth="0" />
      </svg>

      <h2 className="solution-title text-4xl md:text-5xl lg:text-6xl font-bold text-foreground text-center">&nbsp;</h2>

      <p className="solution-tagline text-xl text-muted-foreground text-center">
        Clinical Documentation Reimagined with AI
      </p>

      <div className="flex items-center gap-4 mt-6">
        {[
          { icon: Mic, label: "Voice Input" },
          { icon: Brain, label: "AI Processing" },
          { icon: FileText, label: "Clinical Notes" },
        ].map((pillar, i) => (
          <div key={pillar.label} className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <div
                className="pillar-icon w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${slide.accentColor}15`, border: `2px solid ${slide.accentColor}40` }}
              >
                <pillar.icon className="w-7 h-7" style={{ color: slide.accentColor }} />
              </div>
              <span className="pillar-label text-sm font-medium text-muted-foreground">{pillar.label}</span>
            </div>
            {i < 2 && (
              <svg viewBox="0 0 60 20" className="w-16 h-5">
                <line className="pillar-arrow" x1="5" y1="10" x2="55" y2="10" stroke={slide.accentColor} strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
