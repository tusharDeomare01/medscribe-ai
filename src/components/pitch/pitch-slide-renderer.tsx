"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { usePitch } from "./pitch-provider";
import { PITCH_SLIDES } from "./pitch-slides";

// Lazy-loaded slide components
import { SlideHook } from "./slides/slide-hook";
import { SlidePain } from "./slides/slide-pain";
import { SlideSolution } from "./slides/slide-solution";
import { SlideCoreDemo } from "./slides/slide-core-demo";
import { SlideIntelligence } from "./slides/slide-intelligence";
import { SlideRoles } from "./slides/slide-roles";
import { SlideDepth } from "./slides/slide-depth";
import { SlideTech } from "./slides/slide-tech";
import { SlideMetrics } from "./slides/slide-metrics";
import { SlideClose } from "./slides/slide-close";

const SLIDE_COMPONENTS = [
  SlideHook,
  SlidePain,
  SlideSolution,
  SlideCoreDemo,
  SlideIntelligence,
  SlideRoles,
  SlideDepth,
  SlideTech,
  SlideMetrics,
  SlideClose,
];

export function PitchSlideRenderer() {
  const { phase, currentSlide } = usePitch();
  const containerRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  const slide = PITCH_SLIDES[currentSlide];
  const SlideComponent = SLIDE_COMPONENTS[currentSlide];

  // Animate slide container entrance/exit
  useEffect(() => {
    if (!containerRef.current) return;
    ctxRef.current?.revert();

    const ctx = gsap.context(() => {
      if (phase === "active") {
        gsap.fromTo(
          ".pitch-slide-content",
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.15 }
        );
      }
      if (phase === "transitioning") {
        gsap.to(".pitch-slide-content", {
          opacity: 0,
          y: -20,
          duration: 0.35,
          ease: "power2.in",
        });
      }
      if (phase === "exiting") {
        gsap.to(".pitch-slide-content", {
          opacity: 0,
          y: -30,
          duration: 0.4,
          ease: "power2.in",
        });
      }
    }, containerRef);

    ctxRef.current = ctx;
    return () => {
      ctx.revert();
    };
  }, [phase, currentSlide]);

  if (phase === "idle") return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 flex items-center justify-center bg-black"
      style={{ zIndex: 9992 }}
    >
      <div
        className="pitch-slide-content w-full h-full flex items-center justify-center px-16 py-20"
        style={{ opacity: phase === "entering" ? 0 : undefined }}
      >
        {phase !== "entering" && SlideComponent && (
          <SlideComponent
            slide={slide}
            isActive={phase === "active"}
          />
        )}
      </div>
    </div>
  );
}
