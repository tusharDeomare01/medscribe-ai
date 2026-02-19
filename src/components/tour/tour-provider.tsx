"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { TOUR_STEPS, TourStep } from "./tour-steps";
import { useTourSession } from "./use-tour-session";
import { useAuth } from "@/hooks/use-auth";

if (typeof window !== "undefined") {
  gsap.registerPlugin(DrawSVGPlugin);
}

// ── Types ──────────────────────────────────────────────────────────

export type TourPhase =
  | "idle"
  | "entering"
  | "active"
  | "exiting"
  | "transitioning"
  | "navigating";

export interface TargetRect {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

interface TourContextType {
  isActive: boolean;
  phase: TourPhase;
  currentStepIndex: number;
  currentStep: TourStep | null;
  targetRect: TargetRect | null;
  prevTargetRect: TargetRect | null;
  totalSteps: number;
  start: () => void;
  next: () => void;
  prev: () => void;
  skip: () => void;
  goToStep: (index: number) => void;
  setPhase: (phase: TourPhase) => void;
}

const TourContext = createContext<TourContextType | null>(null);

// ── Helpers ────────────────────────────────────────────────────────

function measureElement(el: Element): TargetRect {
  const rect = el.getBoundingClientRect();
  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
    centerX: rect.left + rect.width / 2,
    centerY: rect.top + rect.height / 2,
  };
}

function pollForElement(
  selector: string,
  timeout = 3000,
  interval = 100
): Promise<Element | null> {
  return new Promise((resolve) => {
    const start = Date.now();
    const check = () => {
      const el = document.querySelector(selector);
      if (el) return resolve(el);
      if (Date.now() - start > timeout) return resolve(null);
      setTimeout(check, interval);
    };
    check();
  });
}

// ── Provider ───────────────────────────────────────────────────────

export function TourProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const session = useTourSession(user?.email);

  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<TourPhase>("idle");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [prevTargetRect, setPrevTargetRect] = useState<TargetRect | null>(null);

  const isActiveRef = useRef(false);
  const stepIndexRef = useRef(0);

  const currentStep =
    isActive && currentStepIndex < TOUR_STEPS.length
      ? TOUR_STEPS[currentStepIndex]
      : null;

  // ── Measure & Watch Target ─────────────────────────────────────

  const measureTarget = useCallback(() => {
    const step = TOUR_STEPS[stepIndexRef.current];
    if (!step || !isActiveRef.current) return;
    const el = document.querySelector(step.targetSelector);
    if (el) {
      setTargetRect(measureElement(el));
    }
  }, []);

  // Re-measure on scroll/resize
  useEffect(() => {
    if (!isActive) return;
    const handler = () => measureTarget();
    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler, true);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, true);
    };
  }, [isActive, measureTarget]);

  // ── Navigate to step target ────────────────────────────────────

  const activateStep = useCallback(
    async (index: number) => {
      const step = TOUR_STEPS[index];
      if (!step) return;

      stepIndexRef.current = index;
      setCurrentStepIndex(index);
      session.saveStep(index);

      const currentPath = window.location.pathname;
      const needsNav = step.page !== currentPath;

      if (needsNav) {
        setPhase("navigating");
        router.push(step.page);
        // Wait for route change + element mount
        await new Promise((r) => setTimeout(r, 400));
        const el = await pollForElement(step.targetSelector);
        if (el) {
          setTargetRect(measureElement(el));
          setPhase("entering");
        } else {
          // Skip if target not found
          const nextIdx = index + 1;
          if (nextIdx < TOUR_STEPS.length) {
            activateStep(nextIdx);
          } else {
            endTour();
          }
          return;
        }
      } else {
        const el = await pollForElement(step.targetSelector, 2000);
        if (el) {
          setTargetRect(measureElement(el));
          setPhase("entering");
        } else {
          const nextIdx = index + 1;
          if (nextIdx < TOUR_STEPS.length) {
            activateStep(nextIdx);
          } else {
            endTour();
          }
          return;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router, session]
  );

  // ── Start / End ────────────────────────────────────────────────

  const endTour = useCallback(() => {
    setPhase("exiting");
    setTimeout(() => {
      setIsActive(false);
      isActiveRef.current = false;
      setPhase("idle");
      setTargetRect(null);
      setPrevTargetRect(null);
      setCurrentStepIndex(0);
      stepIndexRef.current = 0;
      session.markCompleted();
    }, 800);
  }, [session]);

  const start = useCallback(() => {
    setIsActive(true);
    isActiveRef.current = true;
    setPhase("idle");

    // Navigate to dashboard first if not already there
    const currentPath = window.location.pathname;
    if (currentPath !== "/dashboard") {
      router.push("/dashboard");
      setTimeout(() => activateStep(0), 600);
    } else {
      activateStep(0);
    }
  }, [router, activateStep]);

  // ── Navigation ─────────────────────────────────────────────────

  const next = useCallback(() => {
    if (phase === "navigating" || phase === "transitioning") return;
    setPrevTargetRect(targetRect);
    const nextIdx = currentStepIndex + 1;
    if (nextIdx >= TOUR_STEPS.length) {
      endTour();
      return;
    }

    const currentPage = TOUR_STEPS[currentStepIndex]?.page;
    const nextPage = TOUR_STEPS[nextIdx]?.page;

    if (currentPage !== nextPage) {
      setPhase("transitioning");
      setTimeout(() => activateStep(nextIdx), 600);
    } else {
      setPhase("exiting");
      setTimeout(() => activateStep(nextIdx), 400);
    }
  }, [
    phase,
    targetRect,
    currentStepIndex,
    endTour,
    activateStep,
  ]);

  const prev = useCallback(() => {
    if (phase === "navigating" || phase === "transitioning") return;
    if (currentStepIndex <= 0) return;
    setPrevTargetRect(targetRect);
    const prevIdx = currentStepIndex - 1;

    const currentPage = TOUR_STEPS[currentStepIndex]?.page;
    const prevPage = TOUR_STEPS[prevIdx]?.page;

    if (currentPage !== prevPage) {
      setPhase("transitioning");
      setTimeout(() => activateStep(prevIdx), 600);
    } else {
      setPhase("exiting");
      setTimeout(() => activateStep(prevIdx), 400);
    }
  }, [phase, targetRect, currentStepIndex, activateStep]);

  const skip = useCallback(() => {
    endTour();
  }, [endTour]);

  const goToStep = useCallback(
    (index: number) => {
      if (index < 0 || index >= TOUR_STEPS.length) return;
      setPrevTargetRect(targetRect);
      activateStep(index);
    },
    [targetRect, activateStep]
  );

  // ── Keyboard ───────────────────────────────────────────────────

  useEffect(() => {
    if (!isActive) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "Escape") {
        e.preventDefault();
        skip();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isActive, next, prev, skip]);

  // ── Auto-start ─────────────────────────────────────────────────

  useEffect(() => {
    if (session.shouldAutoStart && !isActive && pathname === "/dashboard") {
      const timer = setTimeout(() => start(), 1500);
      return () => clearTimeout(timer);
    }
  }, [session.shouldAutoStart, isActive, pathname, start]);

  // ── Re-measure on pathname change ──────────────────────────────

  useEffect(() => {
    if (isActive) {
      setTimeout(measureTarget, 200);
    }
  }, [pathname, isActive, measureTarget]);

  // ── Context value ──────────────────────────────────────────────

  const value: TourContextType = {
    isActive,
    phase,
    currentStepIndex,
    currentStep,
    targetRect,
    prevTargetRect,
    totalSteps: TOUR_STEPS.length,
    start,
    next,
    prev,
    skip,
    goToStep,
    setPhase,
  };

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTour must be used within TourProvider");
  }
  return context;
}
