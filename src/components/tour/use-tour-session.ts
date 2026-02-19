"use client";

import { useCallback, useEffect, useState } from "react";

const DEMO_EMAIL = "doctor@medscribe.ai";
const SESSION_KEY = "medscribe-tour-completed";
const PERMANENT_KEY = "medscribe-tour-completed-ever";
const STEP_KEY = "medscribe-tour-step";

interface TourSession {
  /** Whether the tour should auto-start */
  shouldAutoStart: boolean;
  /** Mark the tour as completed for this session */
  markCompleted: () => void;
  /** Persist the current step index across route changes */
  saveStep: (index: number) => void;
  /** Retrieve persisted step index (returns 0 if none) */
  getSavedStep: () => number;
  /** Clear the saved step */
  clearStep: () => void;
}

export function useTourSession(userEmail: string | undefined): TourSession {
  const [shouldAutoStart, setShouldAutoStart] = useState(false);

  useEffect(() => {
    if (!userEmail) return;

    const isDemo = userEmail === DEMO_EMAIL;

    if (isDemo) {
      // Demo users: tour starts every new browser session
      const done = sessionStorage.getItem(SESSION_KEY);
      if (!done) setShouldAutoStart(true);
    } else {
      // Regular users: tour starts only on first-ever visit
      const doneEver = localStorage.getItem(PERMANENT_KEY);
      if (!doneEver) setShouldAutoStart(true);
    }
  }, [userEmail]);

  const markCompleted = useCallback(() => {
    setShouldAutoStart(false);
    sessionStorage.setItem(SESSION_KEY, "1");
    localStorage.setItem(PERMANENT_KEY, "1");
    sessionStorage.removeItem(STEP_KEY);
  }, []);

  const saveStep = useCallback((index: number) => {
    sessionStorage.setItem(STEP_KEY, String(index));
  }, []);

  const getSavedStep = useCallback(() => {
    const v = sessionStorage.getItem(STEP_KEY);
    return v ? parseInt(v, 10) : 0;
  }, []);

  const clearStep = useCallback(() => {
    sessionStorage.removeItem(STEP_KEY);
  }, []);

  return { shouldAutoStart, markCompleted, saveStep, getSavedStep, clearStep };
}
