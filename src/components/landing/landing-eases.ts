"use client";

// Landing page eases — using built-in GSAP eases to avoid CustomEase path issues.
// Export ease names as constants for consistency across components.

/** Smooth overshoot for premium UI entrances */
export const EASE_MEDSCRIBE = "back.out(1.4)";

/** Pulsing glow effect for medical-themed elements */
export const EASE_HEARTBEAT = "sine.inOut";
