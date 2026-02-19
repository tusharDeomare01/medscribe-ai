"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { usePitch } from "./pitch-provider";
import { PITCH_SLIDES } from "./pitch-slides";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  X,
} from "lucide-react";

export function PitchProgress() {
  const {
    phase,
    currentSlide,
    totalSlides,
    isAutoPlaying,
    nextSlide,
    prevSlide,
    goToSlide,
    toggleAutoPlay,
    endPitch,
  } = usePitch();

  const barRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  // Animate in on active, out on exiting
  useEffect(() => {
    if (!barRef.current) return;
    ctxRef.current?.revert();

    const ctx = gsap.context(() => {
      if (phase === "active") {
        gsap.fromTo(
          barRef.current,
          { y: 80, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.3 }
        );
      }
      if (phase === "exiting") {
        gsap.to(barRef.current, {
          y: 80,
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
        });
      }
    }, barRef);

    ctxRef.current = ctx;
    return () => {
      ctx.revert();
    };
  }, [phase]);

  if (phase === "idle") return null;

  return (
    <div
      ref={barRef}
      className="fixed bottom-0 left-0 right-0 z-[9993] flex items-center justify-center gap-3 px-6 py-4"
      style={{ opacity: phase === "entering" ? 0 : undefined }}
    >
      {/* Glass backdrop */}
      <div className="flex items-center gap-3 bg-background/80 backdrop-blur-xl border border-border/50 rounded-full px-5 py-2.5 shadow-2xl">
        {/* Close button */}
        <button
          onClick={endPitch}
          className="p-1.5 rounded-full hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Close pitch"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Separator */}
        <div className="w-px h-5 bg-border/50" />

        {/* Prev */}
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="p-1.5 rounded-full hover:bg-muted/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-muted-foreground hover:text-foreground"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Slide dots */}
        <div className="flex items-center gap-1.5">
          {PITCH_SLIDES.map((slide, i) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(i)}
              className="group relative p-0.5"
              aria-label={`Go to slide ${i + 1}: ${slide.title}`}
            >
              <div
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  backgroundColor:
                    i === currentSlide
                      ? slide.accentColor
                      : i < currentSlide
                        ? "hsl(var(--primary) / 0.5)"
                        : "hsl(var(--muted-foreground) / 0.3)",
                  transform: i === currentSlide ? "scale(1.4)" : "scale(1)",
                  boxShadow:
                    i === currentSlide
                      ? `0 0 8px ${slide.accentColor}60`
                      : "none",
                }}
              />
              {/* Pulse ring on current */}
              {i === currentSlide && (
                <div
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{
                    backgroundColor: `${slide.accentColor}30`,
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Next */}
        <button
          onClick={nextSlide}
          disabled={currentSlide === totalSlides - 1}
          className="p-1.5 rounded-full hover:bg-muted/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-muted-foreground hover:text-foreground"
          aria-label="Next slide"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Separator */}
        <div className="w-px h-5 bg-border/50" />

        {/* Play/Pause */}
        <button
          onClick={toggleAutoPlay}
          className="p-1.5 rounded-full hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
          aria-label={isAutoPlaying ? "Pause auto-play" : "Resume auto-play"}
        >
          {isAutoPlaying ? (
            <Pause className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Slide counter */}
        <span className="text-xs text-muted-foreground font-mono min-w-[3ch] text-center">
          {currentSlide + 1}/{totalSlides}
        </span>
      </div>

      {/* Keyboard hints */}
      <div className="absolute bottom-full mb-2 text-[10px] text-muted-foreground/50 flex gap-2">
        <span>← → navigate</span>
        <span>ESC close</span>
        <span>P pause</span>
      </div>
    </div>
  );
}
