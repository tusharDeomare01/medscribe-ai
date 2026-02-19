"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useTour } from "./tour-provider";
import { TOUR_STEPS } from "./tour-steps";

if (typeof window !== "undefined") {
  gsap.registerPlugin(DrawSVGPlugin);
}

// Group steps by page for progress nodes
function getPageGroups() {
  const groups: { page: string; startIndex: number; label: string }[] = [];
  let lastPage = "";
  TOUR_STEPS.forEach((step, i) => {
    if (step.page !== lastPage) {
      const label = step.page
        .replace("/", "")
        .replace(/-/g, " ")
        .replace(/^\w/, (c) => c.toUpperCase());
      groups.push({ page: step.page, startIndex: i, label });
      lastPage = step.page;
    }
  });
  return groups;
}

const PAGE_GROUPS = getPageGroups();
const NODE_COUNT = PAGE_GROUPS.length;
const BAR_W = Math.min(typeof window !== "undefined" ? window.innerWidth - 120 : 1200, 1200);
const BAR_H = 40;
const NODE_R = 8;
const NODE_SPACING = BAR_W / (NODE_COUNT + 1);

export function TourProgress() {
  const { isActive, phase, currentStepIndex } = useTour();
  const svgRef = useRef<SVGSVGElement>(null);
  const prevStepRef = useRef(0);

  // Find which page group the current step belongs to
  const currentGroupIndex = PAGE_GROUPS.findIndex((g, i) => {
    const nextGroup = PAGE_GROUPS[i + 1];
    if (!nextGroup) return true;
    return currentStepIndex >= g.startIndex && currentStepIndex < nextGroup.startIndex;
  });

  // ── Animate progress fill + node completion ──────────────────

  useEffect(() => {
    if (!isActive || phase !== "entering" || !svgRef.current) return;

    const ctx = gsap.context(() => {
      // Animate the progress fill path
      const fillPercent = ((currentGroupIndex + 1) / NODE_COUNT) * 100;
      gsap.to(".progress-fill", {
        drawSVG: `0% ${fillPercent}%`,
        duration: 0.6,
        ease: "power2.out",
      });

      // Animate completed checkmarks
      PAGE_GROUPS.forEach((_, i) => {
        const isCompleted = i < currentGroupIndex;
        const isCurrent = i === currentGroupIndex;
        const node = svgRef.current!.querySelector(`.progress-node-${i}`);
        const check = svgRef.current!.querySelector(`.progress-check-${i}`);
        const ring = svgRef.current!.querySelector(`.progress-ring-${i}`);

        if (isCompleted && check) {
          gsap.to(check, {
            drawSVG: "100%",
            duration: 0.3,
            ease: "power2.out",
            delay: i * 0.05,
          });
          gsap.to(node!, {
            fill: "currentColor",
            fillOpacity: 0.2,
            duration: 0.3,
          });
        }

        if (isCurrent && ring) {
          // Pulse ring on current node
          gsap.fromTo(
            ring,
            { attr: { r: NODE_R }, opacity: 0.6 },
            {
              attr: { r: NODE_R + 6 },
              opacity: 0,
              duration: 1.2,
              ease: "sine.out",
              repeat: -1,
            }
          );
          gsap.to(node!, {
            fill: "currentColor",
            fillOpacity: 0.4,
            duration: 0.3,
          });
        }
      });
    }, svgRef);

    prevStepRef.current = currentStepIndex;
    return () => ctx.revert();
  }, [isActive, phase, currentStepIndex, currentGroupIndex]);

  // ── Entrance/exit ────────────────────────────────────────────

  useEffect(() => {
    if (!svgRef.current) return;
    const container = svgRef.current.parentElement;
    if (!container) return;

    if (isActive && phase === "entering") {
      gsap.fromTo(
        container,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "back.out(2)", delay: 0.3 }
      );
    }
  }, [isActive, phase]);

  if (!isActive) return null;

  const accent = TOUR_STEPS[currentStepIndex]?.accentColor || "#8b5cf6";

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 pointer-events-none"
      style={{ zIndex: 9999 }}
    >
      <svg
        ref={svgRef}
        width={BAR_W + 60}
        height={BAR_H + 20}
        viewBox={`-30 -10 ${BAR_W + 60} ${BAR_H + 20}`}
        className="opacity-0"
      >
        {/* Background track */}
        <line
          x1={NODE_SPACING}
          y1={BAR_H / 2}
          x2={NODE_SPACING * NODE_COUNT}
          y2={BAR_H / 2}
          stroke="currentColor"
          strokeOpacity={0.1}
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Progress fill */}
        <line
          className="progress-fill"
          x1={NODE_SPACING}
          y1={BAR_H / 2}
          x2={NODE_SPACING * NODE_COUNT}
          y2={BAR_H / 2}
          stroke={accent}
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Nodes */}
        {PAGE_GROUPS.map((group, i) => {
          const cx = NODE_SPACING * (i + 1);
          const cy = BAR_H / 2;
          const isCompleted = i < currentGroupIndex;
          const isCurrent = i === currentGroupIndex;

          return (
            <g key={i}>
              {/* Pulse ring (current only) */}
              <circle
                className={`progress-ring-${i}`}
                cx={cx}
                cy={cy}
                r={NODE_R}
                fill="none"
                stroke={accent}
                strokeWidth={1.5}
                opacity={0}
              />

              {/* Node circle */}
              <circle
                className={`progress-node-${i}`}
                cx={cx}
                cy={cy}
                r={NODE_R}
                fill={
                  isCompleted || isCurrent ? accent : "currentColor"
                }
                fillOpacity={
                  isCompleted ? 0.8 : isCurrent ? 0.6 : 0.1
                }
                stroke={
                  isCompleted || isCurrent ? accent : "currentColor"
                }
                strokeOpacity={isCompleted || isCurrent ? 0.8 : 0.2}
                strokeWidth={1.5}
              />

              {/* Checkmark for completed */}
              {isCompleted && (
                <path
                  className={`progress-check-${i}`}
                  d={`M ${cx - 3} ${cy} L ${cx - 1} ${cy + 2.5} L ${cx + 3.5} ${cy - 2.5}`}
                  fill="none"
                  stroke="white"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Current dot */}
              {isCurrent && (
                <circle cx={cx} cy={cy} r={3} fill="white" opacity={0.9} />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
