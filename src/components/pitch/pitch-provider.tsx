"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";
import { Flip } from "gsap/Flip";
import { TextPlugin } from "gsap/TextPlugin";
import { CustomEase } from "gsap/CustomEase";
import { CustomBounce } from "gsap/CustomBounce";
import { CustomWiggle } from "gsap/CustomWiggle";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { PITCH_SLIDES } from "./pitch-slides";

if (typeof window !== "undefined") {
  gsap.registerPlugin(
    DrawSVGPlugin,
    SplitText,
    ScrambleTextPlugin,
    MorphSVGPlugin,
    Physics2DPlugin,
    Flip,
    TextPlugin,
    CustomEase,
    CustomBounce,
    CustomWiggle,
    InertiaPlugin
  );
}

// ── Types ──────────────────────────────────────────────────────────

export type PitchPhase =
  | "idle"
  | "entering"
  | "active"
  | "transitioning"
  | "exiting";

interface PitchContextType {
  phase: PitchPhase;
  currentSlide: number;
  isAutoPlaying: boolean;
  direction: "forward" | "backward";
  totalSlides: number;
  startPitch: () => void;
  endPitch: () => void;
  nextSlide: () => void;
  prevSlide: () => void;
  goToSlide: (n: number) => void;
  toggleAutoPlay: () => void;
}

const PitchContext = createContext<PitchContextType | null>(null);

// ── Provider ───────────────────────────────────────────────────────

export function PitchProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<PitchPhase>("idle");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");

  const phaseRef = useRef<PitchPhase>("idle");
  const slideRef = useRef(0);
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalSlides = PITCH_SLIDES.length;

  // Keep refs in sync
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    slideRef.current = currentSlide;
  }, [currentSlide]);

  // ── Auto-advance timer ─────────────────────────────────────────

  const clearAutoTimer = useCallback(() => {
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
  }, []);

  const startAutoTimer = useCallback(() => {
    clearAutoTimer();
    const slide = PITCH_SLIDES[slideRef.current];
    if (!slide || slide.autoAdvanceMs <= 0) return;
    autoPlayTimerRef.current = setTimeout(() => {
      if (
        phaseRef.current === "active" &&
        slideRef.current < totalSlides - 1
      ) {
        setDirection("forward");
        setPhase("transitioning");
        setTimeout(() => {
          const next = slideRef.current + 1;
          setCurrentSlide(next);
          setPhase("active");
        }, 900); // transition duration
      }
    }, slide.autoAdvanceMs);
  }, [clearAutoTimer, totalSlides]);

  // Start auto-timer when slide becomes active and auto-play is on
  useEffect(() => {
    if (phase === "active" && isAutoPlaying) {
      startAutoTimer();
    } else {
      clearAutoTimer();
    }
    return clearAutoTimer;
  }, [phase, currentSlide, isAutoPlaying, startAutoTimer, clearAutoTimer]);

  // ── Body scroll lock ──────────────────────────────────────────

  useEffect(() => {
    if (phase !== "idle") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  // ── Navigation ────────────────────────────────────────────────

  const startPitch = useCallback(() => {
    setCurrentSlide(0);
    setDirection("forward");
    setIsAutoPlaying(true);
    setPhase("entering");
    // After entrance animation, go to active
    setTimeout(() => {
      setPhase("active");
    }, 2500); // opening ceremony duration
  }, []);

  const endPitch = useCallback(() => {
    clearAutoTimer();
    setPhase("exiting");
    setTimeout(() => {
      setPhase("idle");
      setCurrentSlide(0);
    }, 1500); // closing ceremony duration
  }, [clearAutoTimer]);

  const nextSlide = useCallback(() => {
    if (phaseRef.current !== "active") return;
    if (slideRef.current >= totalSlides - 1) return;
    clearAutoTimer();
    setDirection("forward");
    setPhase("transitioning");
    setTimeout(() => {
      setCurrentSlide((s) => s + 1);
      setPhase("active");
    }, 900);
  }, [totalSlides, clearAutoTimer]);

  const prevSlide = useCallback(() => {
    if (phaseRef.current !== "active") return;
    if (slideRef.current <= 0) return;
    clearAutoTimer();
    setDirection("backward");
    setPhase("transitioning");
    setTimeout(() => {
      setCurrentSlide((s) => s - 1);
      setPhase("active");
    }, 900);
  }, [clearAutoTimer]);

  const goToSlide = useCallback(
    (n: number) => {
      if (n < 0 || n >= totalSlides) return;
      if (phaseRef.current !== "active") return;
      clearAutoTimer();
      setDirection(n > slideRef.current ? "forward" : "backward");
      setPhase("transitioning");
      setTimeout(() => {
        setCurrentSlide(n);
        setPhase("active");
      }, 900);
    },
    [totalSlides, clearAutoTimer]
  );

  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlaying((prev) => !prev);
  }, []);

  // ── Keyboard ──────────────────────────────────────────────────

  useEffect(() => {
    if (phase === "idle") return;

    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case " ":
        case "Enter":
          e.preventDefault();
          nextSlide();
          break;
        case "ArrowLeft":
          e.preventDefault();
          prevSlide();
          break;
        case "Escape":
          e.preventDefault();
          endPitch();
          break;
        case "p":
        case "P":
          e.preventDefault();
          toggleAutoPlay();
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, nextSlide, prevSlide, endPitch, toggleAutoPlay]);

  // ── Context ───────────────────────────────────────────────────

  const value: PitchContextType = {
    phase,
    currentSlide,
    isAutoPlaying,
    direction,
    totalSlides,
    startPitch,
    endPitch,
    nextSlide,
    prevSlide,
    goToSlide,
    toggleAutoPlay,
  };

  return (
    <PitchContext.Provider value={value}>{children}</PitchContext.Provider>
  );
}

export function usePitch() {
  const context = useContext(PitchContext);
  if (!context) {
    throw new Error("usePitch must be used within PitchProvider");
  }
  return context;
}
