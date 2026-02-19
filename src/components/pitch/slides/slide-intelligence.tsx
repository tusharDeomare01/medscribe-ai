"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { PitchSlide, AI_CAPABILITIES, CATEGORY_LABELS, CATEGORY_COLORS } from "../pitch-slides";

interface SlideProps {
  slide: PitchSlide;
  isActive: boolean;
}

type Layout = "grid" | "clusters" | "spotlight";

export function SlideIntelligence({ slide, isActive }: SlideProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);
  const [layout, setLayout] = useState<Layout>("grid");
  const layoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flipStateRef = useRef<Flip.FlipState | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    ctxRef.current?.revert();
    setLayout("grid");

    const ctx = gsap.context(() => {
      gsap.fromTo(".intel-title", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" });
      gsap.fromTo(".ai-card", { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.4, stagger: 0.03, ease: "back.out(1.4)", delay: 0.3 });
      gsap.fromTo(".card-ring", { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.4, stagger: 0.02, ease: "power2.out", delay: 0.5 });
    }, containerRef);

    ctxRef.current = ctx;

    // Auto-transition sequence with safety guards
    layoutTimerRef.current = setTimeout(() => {
      if (!containerRef.current) return;
      const cards = containerRef.current.querySelectorAll(".ai-card");
      if (cards.length > 0) flipStateRef.current = Flip.getState(cards);
      setLayout("clusters");

      layoutTimerRef.current = setTimeout(() => {
        if (!containerRef.current) return;
        const cards2 = containerRef.current.querySelectorAll(".ai-card");
        if (cards2.length > 0) flipStateRef.current = Flip.getState(cards2);
        setLayout("spotlight");

        layoutTimerRef.current = setTimeout(() => {
          if (!containerRef.current) return;
          const cards3 = containerRef.current.querySelectorAll(".ai-card");
          if (cards3.length > 0) flipStateRef.current = Flip.getState(cards3);
          setLayout("grid");
        }, 2500);
      }, 2500);
    }, 2000);

    return () => {
      ctx.revert();
      if (layoutTimerRef.current) clearTimeout(layoutTimerRef.current);
    };
  }, [isActive]);

  // Flip on layout change
  useEffect(() => {
    if (!containerRef.current || !flipStateRef.current) return;
    const state = flipStateRef.current;
    flipStateRef.current = null;

    requestAnimationFrame(() => {
      if (!containerRef.current) return;
      const currentCards = containerRef.current.querySelectorAll(".ai-card");
      if (currentCards.length === 0) return;

      try {
        Flip.from(state, {
          duration: 0.8,
          ease: "power2.inOut",
          stagger: 0.03,
          absolute: true,
        });
      } catch {
        // Flip can fail if DOM structure changed drastically — graceful fallback
        gsap.fromTo(currentCards, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.4, stagger: 0.02 });
      }
    });
  }, [layout]);

  const categories = Object.keys(CATEGORY_LABELS);

  return (
    <div ref={containerRef} className="w-full max-w-6xl mx-auto flex flex-col items-center gap-6">
      <h2 className="intel-title text-3xl md:text-4xl font-bold text-foreground text-center">
        20 AI-Powered Capabilities
      </h2>

      <div className={`w-full ${layout === "grid" ? "grid grid-cols-4 md:grid-cols-5 gap-3" : layout === "clusters" ? "flex flex-wrap justify-center gap-6" : "flex flex-wrap justify-center items-center gap-3"}`}>
        {layout === "clusters" ? (
          categories.map((cat) => (
            <div key={cat} className="flex flex-col items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded" style={{ color: CATEGORY_COLORS[cat], backgroundColor: `${CATEGORY_COLORS[cat]}15` }}>
                {CATEGORY_LABELS[cat]}
              </span>
              <div className="flex flex-wrap gap-2 justify-center max-w-[180px]">
                {AI_CAPABILITIES.filter((c) => c.category === cat).map((cap) => (
                  <div key={cap.id} data-flip-id={cap.id} className="ai-card flex flex-col items-center gap-1 p-2 rounded-lg bg-background/40 border border-border/30 w-16">
                    <svg viewBox="0 0 24 24" className="w-5 h-5">
                      <circle className="card-ring" cx="12" cy="12" r="10" fill="none" stroke={CATEGORY_COLORS[cap.category]} strokeWidth="1.5" />
                    </svg>
                    <span className="text-[8px] text-muted-foreground text-center leading-tight">{cap.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : layout === "spotlight" ? (
          <>
            <div data-flip-id="soap" data-featured="true" className="ai-card flex flex-col items-center gap-3 p-6 rounded-xl bg-background/60 border-2 w-48" style={{ borderColor: slide.accentColor }}>
              <svg viewBox="0 0 24 24" className="w-10 h-10">
                <circle className="card-ring" cx="12" cy="12" r="10" fill="none" stroke={slide.accentColor} strokeWidth="1.5" />
              </svg>
              <span className="text-sm font-semibold text-foreground">SOAP Notes</span>
              <span className="text-xs text-muted-foreground text-center">AI-powered clinical note generation from voice</span>
            </div>
            {AI_CAPABILITIES.filter((c) => c.id !== "soap").map((cap) => (
              <div key={cap.id} data-flip-id={cap.id} className="ai-card flex flex-col items-center gap-1 p-1.5 rounded-lg bg-background/30 border border-border/20 w-12">
                <svg viewBox="0 0 24 24" className="w-4 h-4">
                  <circle className="card-ring" cx="12" cy="12" r="10" fill="none" stroke={CATEGORY_COLORS[cap.category]} strokeWidth="1.5" />
                </svg>
                <span className="text-[6px] text-muted-foreground text-center leading-tight">{cap.name}</span>
              </div>
            ))}
          </>
        ) : (
          AI_CAPABILITIES.map((cap) => (
            <div key={cap.id} data-flip-id={cap.id} className="ai-card flex flex-col items-center gap-1.5 p-2.5 rounded-lg bg-background/40 border border-border/30">
              <svg viewBox="0 0 24 24" className="w-6 h-6">
                <circle className="card-ring" cx="12" cy="12" r="10" fill="none" stroke={CATEGORY_COLORS[cap.category]} strokeWidth="1.5" />
              </svg>
              <span className="text-[10px] text-muted-foreground text-center leading-tight">{cap.name}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
