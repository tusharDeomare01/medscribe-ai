"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { usePitch } from "./pitch-provider";
import { generateEKGPath, generateFlatlinePath } from "./pitch-ekg-path";
import { pitchCornerBracket } from "./pitch-svg-paths";
import { PITCH_SLIDES } from "./pitch-slides";

// ── EKG Wipe Overlay ────────────────────────────────────────────────
// Renders the SVG layer for slide transitions:
// - Opening ceremony: frame draws + title decodes
// - EKG wipe between slides
// - Corner brackets on entry
// - Closing ceremony: frame un-draws + EKG flatline

export function PitchOverlay() {
  const { phase, currentSlide, direction } = usePitch();
  const svgRef = useRef<SVGSVGElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);
  const prevPhaseRef = useRef(phase);

  // Generate EKG waveform path data once
  const ekgPath = useRef(generateEKGPath(1200, 60, 6, 22)).current;
  const flatlinePath = useRef(generateFlatlinePath(1200, 60)).current;

  useEffect(() => {
    if (!svgRef.current) return;
    prevPhaseRef.current = phase;

    // Cleanup previous context
    ctxRef.current?.revert();

    const ctx = gsap.context(() => {
      const svg = svgRef.current!;

      if (phase === "entering") {
        // ── Opening Ceremony ──────────────────────────────────────
        const tl = gsap.timeline();

        // 1. Dark overlay fades in
        tl.fromTo(
          ".pitch-bg",
          { opacity: 0 },
          { opacity: 1, duration: 0.4, ease: "power2.out" },
          0
        );

        // 2. Frame border DrawSVG traces
        tl.fromTo(
          ".pitch-frame",
          { drawSVG: "0%" },
          { drawSVG: "100%", duration: 1.2, ease: "power2.inOut" },
          0.3
        );

        // 3. EKG line traces across center
        tl.fromTo(
          ".pitch-ekg-wipe",
          { drawSVG: "0%" },
          { drawSVG: "100%", duration: 1.0, ease: "power2.inOut" },
          0.5
        );

        // 4. Title text ScrambleText decode
        const titleEl = svg.querySelector(".pitch-open-title") as SVGTextElement;
        if (titleEl) {
          tl.fromTo(
            titleEl,
            { opacity: 0 },
            { opacity: 1, duration: 0.3 },
            0.6
          );
          tl.to(
            titleEl,
            {
              duration: 0.8,
              scrambleText: {
                text: "MedScribe AI",
                chars: "░▒▓█▄▀▐▌",
                speed: 0.3,
              },
            },
            0.7
          );
          tl.to(
            titleEl,
            {
              duration: 0.5,
              scrambleText: {
                text: "MedScribe AI",
                chars: "ACGT01",
                speed: 0.6,
              },
            },
            1.5
          );
        }

        // 5. Frame shrinks
        tl.to(
          ".pitch-frame",
          { opacity: 0.3, duration: 0.3, ease: "power2.in" },
          2.0
        );

        // 6. EKG wipe fades
        tl.to(
          ".pitch-ekg-wipe",
          { opacity: 0, duration: 0.3 },
          2.0
        );

        // 7. Title fades
        if (titleEl) {
          tl.to(titleEl, { opacity: 0, duration: 0.2 }, 2.0);
        }
      }

      if (phase === "transitioning") {
        // ── Slide Transition ──────────────────────────────────────
        const tl = gsap.timeline();
        const accent = PITCH_SLIDES[currentSlide]?.accentColor ?? "#10b981";

        // EKG wipe line sweeps across
        const wipeEl = svg.querySelector(".pitch-ekg-wipe") as SVGPathElement;
        if (wipeEl) {
          wipeEl.style.stroke = accent;
          wipeEl.style.opacity = "1";
        }

        tl.fromTo(
          ".pitch-ekg-wipe",
          { drawSVG: "0%", opacity: 0.8 },
          { drawSVG: "100%", duration: 0.4, ease: "power2.inOut" },
          0
        );

        // Corner brackets fly in
        tl.fromTo(
          ".pitch-bracket",
          { drawSVG: "0%", opacity: 0 },
          {
            drawSVG: "100%",
            opacity: 1,
            duration: 0.3,
            stagger: 0.04,
            ease: "back.out(1.5)",
          },
          0.3
        );

        // EKG wipe reverses out
        tl.to(
          ".pitch-ekg-wipe",
          { drawSVG: "100% 100%", opacity: 0, duration: 0.3, ease: "power2.in" },
          0.5
        );

        // Brackets fade out
        tl.to(
          ".pitch-bracket",
          { opacity: 0, duration: 0.2 },
          0.7
        );
      }

      if (phase === "exiting") {
        // ── Closing Ceremony ──────────────────────────────────────
        const tl = gsap.timeline();

        // Frame border un-draws from center
        tl.to(
          ".pitch-frame",
          { drawSVG: "50% 50%", opacity: 0, duration: 0.6, ease: "power2.in" },
          0
        );

        // EKG flatline effect
        tl.fromTo(
          ".pitch-ekg-wipe",
          { opacity: 0.8, drawSVG: "0%" },
          { drawSVG: "100%", duration: 0.5, ease: "none" },
          0.2
        );

        // Overlay fades out
        tl.to(
          ".pitch-bg",
          { opacity: 0, duration: 0.4, ease: "power2.in" },
          0.8
        );
      }
    }, svgRef);

    ctxRef.current = ctx;

    return () => {
      ctx.revert();
    };
  }, [phase, currentSlide, direction, ekgPath, flatlinePath]);

  // Don't render when idle
  if (phase === "idle") return null;

  const vw = typeof window !== "undefined" ? window.innerWidth : 1920;
  const vh = typeof window !== "undefined" ? window.innerHeight : 1080;
  const margin = 40;
  const bracketSize = 30;

  return (
    <svg
      ref={svgRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 9991 }}
      viewBox={`0 0 ${vw} ${vh}`}
      preserveAspectRatio="none"
    >
      {/* Dark background overlay */}
      <rect
        className="pitch-bg"
        x="0"
        y="0"
        width={vw}
        height={vh}
        fill="rgba(0,0,0,0.92)"
        opacity="0"
      />

      {/* Frame border */}
      <rect
        className="pitch-frame"
        x={margin}
        y={margin}
        width={vw - margin * 2}
        height={vh - margin * 2}
        rx="12"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="1.5"
        opacity="0"
      />

      {/* EKG wipe line (centered vertically) */}
      <g transform={`translate(${(vw - 1200) / 2}, ${(vh - 60) / 2})`}>
        <path
          className="pitch-ekg-wipe"
          d={ekgPath}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          opacity="0"
        />
      </g>

      {/* Corner brackets */}
      {(["tl", "tr", "bl", "br"] as const).map((corner) => {
        const bx =
          corner.includes("l") ? margin + 10 : vw - margin - 10;
        const by =
          corner.includes("t") ? margin + 10 : vh - margin - 10;
        return (
          <path
            key={corner}
            className="pitch-bracket"
            d={pitchCornerBracket(corner, bx, by, bracketSize)}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0"
          />
        );
      })}

      {/* Opening title text */}
      <text
        className="pitch-open-title"
        x={vw / 2}
        y={vh / 2 - 60}
        textAnchor="middle"
        dominantBaseline="central"
        fill="hsl(var(--foreground))"
        fontSize="42"
        fontWeight="700"
        fontFamily="inherit"
        opacity="0"
      >
        MedScribe AI
      </text>
    </svg>
  );
}
