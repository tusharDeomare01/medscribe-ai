"use client";

import { useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useTour } from "./tour-provider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(DrawSVGPlugin);
}

const CARD_W = 340;
const CARD_H_MIN = 160;
const CONNECTOR_GAP = 24;

export function TourTooltip() {
  const {
    isActive,
    phase,
    currentStep,
    currentStepIndex,
    targetRect,
    totalSteps,
    next,
    prev,
    skip,
  } = useTour();

  const cardRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const idleRef = useRef<gsap.core.Timeline | null>(null);

  // ── Compute card position ────────────────────────────────────

  const position = useMemo(() => {
    if (!targetRect || !currentStep) return { x: 0, y: 0 };

    const vw = typeof window !== "undefined" ? window.innerWidth : 1400;
    const vh = typeof window !== "undefined" ? window.innerHeight : 900;
    const placement = currentStep.tooltipPosition;

    let x = 0;
    let y = 0;

    switch (placement) {
      case "right":
        x = targetRect.x + targetRect.width + CONNECTOR_GAP;
        y = targetRect.centerY - CARD_H_MIN / 2;
        break;
      case "left":
        x = targetRect.x - CARD_W - CONNECTOR_GAP;
        y = targetRect.centerY - CARD_H_MIN / 2;
        break;
      case "bottom":
        x = targetRect.centerX - CARD_W / 2;
        y = targetRect.y + targetRect.height + CONNECTOR_GAP;
        break;
      case "top":
        x = targetRect.centerX - CARD_W / 2;
        y = targetRect.y - CARD_H_MIN - CONNECTOR_GAP;
        break;
    }

    // Clamp to viewport
    x = Math.max(16, Math.min(x, vw - CARD_W - 16));
    y = Math.max(16, Math.min(y, vh - CARD_H_MIN - 80));

    return { x, y };
  }, [targetRect, currentStep]);

  // ── Connector line from card to target ───────────────────────

  const connectorPath = useMemo(() => {
    if (!targetRect || !currentStep) return "";

    const cardCenterX = position.x + CARD_W / 2;
    const cardCenterY = position.y + CARD_H_MIN / 2;

    // Connect edge of card to edge of target
    let startX = cardCenterX;
    let startY = cardCenterY;
    let endX = targetRect.centerX;
    let endY = targetRect.centerY;

    const placement = currentStep.tooltipPosition;
    switch (placement) {
      case "right":
        startX = position.x;
        startY = position.y + CARD_H_MIN / 2;
        endX = targetRect.x + targetRect.width + 12;
        endY = targetRect.centerY;
        break;
      case "left":
        startX = position.x + CARD_W;
        startY = position.y + CARD_H_MIN / 2;
        endX = targetRect.x - 12;
        endY = targetRect.centerY;
        break;
      case "bottom":
        startX = position.x + CARD_W / 2;
        startY = position.y;
        endX = targetRect.centerX;
        endY = targetRect.y + targetRect.height + 12;
        break;
      case "top":
        startX = position.x + CARD_W / 2;
        startY = position.y + CARD_H_MIN;
        endX = targetRect.centerX;
        endY = targetRect.y - 12;
        break;
    }

    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    return `M ${startX} ${startY} Q ${midX} ${midY - 20} ${endX} ${endY}`;
  }, [targetRect, currentStep, position]);

  // ── Entrance animation ───────────────────────────────────────

  useEffect(() => {
    if (phase !== "entering" || !cardRef.current || !svgRef.current) return;

    // Lazy-register MotionPathPlugin
    import("gsap/MotionPathPlugin").then(({ MotionPathPlugin }) => {
      gsap.registerPlugin(MotionPathPlugin);
    }).catch(() => { /* ignore */ });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Connector line draws
      tl.fromTo(
        ".tooltip-connector",
        { drawSVG: "0%" },
        { drawSVG: "100%", duration: 0.5, ease: "power2.out" },
        0
      );

      // Card scales in
      tl.fromTo(
        cardRef.current,
        { scale: 0.7, opacity: 0, y: 15 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(2.5)" },
        0.1
      );

      // SVG corner decorations draw
      tl.fromTo(
        ".tooltip-corner-decor",
        { drawSVG: "0%" },
        {
          drawSVG: "100%",
          duration: 0.3,
          ease: "power2.out",
          stagger: 0.05,
        },
        0.3
      );

      // Particle burst at connector endpoint
      const particles = svgRef.current!.querySelectorAll(
        ".tooltip-endpoint-particle"
      );
      particles.forEach((p, i) => {
        const angle = (i / particles.length) * Math.PI * 2;
        const dist = 18 + Math.random() * 10;
        const endX = parseFloat(p.getAttribute("data-origin-x") || "0");
        const endY = parseFloat(p.getAttribute("data-origin-y") || "0");
        tl.fromTo(
          p,
          { attr: { cx: endX, cy: endY }, opacity: 0.8, scale: 1 },
          {
            attr: {
              cx: endX + Math.cos(angle) * dist,
              cy: endY + Math.sin(angle) * dist,
            },
            opacity: 0,
            scale: 0,
            duration: 0.8,
            ease: "power2.out",
          },
          0.5
        );
      });

      // Start idle: marching ants on connector
      tl.call(() => {
        const idle = gsap.timeline();
        idle.to(".tooltip-connector", {
          strokeDashoffset: -20,
          duration: 0.8,
          ease: "none",
          repeat: -1,
        });

        // Card border traveling dot
        const borderPath = document.querySelector(".tooltip-card-border-path");
        if (borderPath && borderPath.getAttribute("d")) {
          try {
            idle.to(
              ".tooltip-orbit-dot",
              {
                motionPath: {
                  path: ".tooltip-card-border-path",
                  align: ".tooltip-card-border-path",
                  alignOrigin: [0.5, 0.5],
                },
                duration: 4,
                ease: "none",
                repeat: -1,
              },
              0
            );
          } catch {
            // MotionPathPlugin may fail if path is invalid
          }
        }

        idleRef.current = idle;
      });
    }, svgRef);

    return () => ctx.revert();
  }, [phase]);

  // ── Exit animation ───────────────────────────────────────────

  useEffect(() => {
    if (
      phase !== "exiting" &&
      phase !== "transitioning" &&
      phase !== "navigating"
    )
      return;
    if (!cardRef.current) return;

    if (idleRef.current) {
      idleRef.current.kill();
      idleRef.current = null;
    }

    gsap.to(cardRef.current, {
      scale: 0.95,
      y: 15,
      opacity: 0,
      duration: 0.25,
      ease: "power2.in",
    });

    gsap.to(".tooltip-connector", {
      drawSVG: "0%",
      opacity: 0,
      duration: 0.2,
      ease: "power2.in",
    });
  }, [phase]);

  if (!isActive || !currentStep || !targetRect) return null;

  const accent = currentStep.accentColor;

  // Connector endpoint position
  const connEnd = connectorPath
    ? (() => {
        const parts = connectorPath.split(" ");
        const ex = parseFloat(parts[parts.length - 2]);
        const ey = parseFloat(parts[parts.length - 1]);
        return { x: ex, y: ey };
      })()
    : { x: 0, y: 0 };

  return (
    <>
      {/* SVG layer for connector + decorations */}
      <svg
        ref={svgRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 9999 }}
      >
        {/* Connector line (dashed, marching ants) */}
        <path
          className="tooltip-connector"
          d={connectorPath}
          fill="none"
          stroke={accent}
          strokeWidth={2}
          strokeDasharray="6 4"
          opacity={0.8}
        />

        {/* Connector endpoint particles (8) */}
        {Array.from({ length: 8 }).map((_, i) => (
          <circle
            key={i}
            className="tooltip-endpoint-particle"
            r={2.5}
            fill={accent}
            opacity={0}
            data-origin-x={connEnd.x}
            data-origin-y={connEnd.y}
          />
        ))}

        {/* Card border path for orbiting dot */}
        <path
          className="tooltip-card-border-path"
          d={`M ${position.x + 12} ${position.y} h ${CARD_W - 24} a 12 12 0 0 1 12 12 v ${CARD_H_MIN - 24} a 12 12 0 0 1 -12 12 h -${CARD_W - 24} a 12 12 0 0 1 -12 -12 v -${CARD_H_MIN - 24} a 12 12 0 0 1 12 -12 z`}
          fill="none"
          stroke="none"
        />

        {/* Orbiting dot */}
        <circle
          className="tooltip-orbit-dot"
          r={3}
          fill={accent}
          opacity={0.7}
        />

        {/* SVG corner decorations on card */}
        {/* Top-left */}
        <path
          className="tooltip-corner-decor"
          d={`M ${position.x + 4} ${position.y + 20} L ${position.x + 4} ${position.y + 4} L ${position.x + 20} ${position.y + 4}`}
          fill="none"
          stroke={accent}
          strokeWidth={2}
          strokeLinecap="round"
        />
        {/* Top-right */}
        <path
          className="tooltip-corner-decor"
          d={`M ${position.x + CARD_W - 20} ${position.y + 4} L ${position.x + CARD_W - 4} ${position.y + 4} L ${position.x + CARD_W - 4} ${position.y + 20}`}
          fill="none"
          stroke={accent}
          strokeWidth={2}
          strokeLinecap="round"
        />
        {/* Bottom-left */}
        <path
          className="tooltip-corner-decor"
          d={`M ${position.x + 4} ${position.y + CARD_H_MIN - 20} L ${position.x + 4} ${position.y + CARD_H_MIN - 4} L ${position.x + 20} ${position.y + CARD_H_MIN - 4}`}
          fill="none"
          stroke={accent}
          strokeWidth={2}
          strokeLinecap="round"
        />
        {/* Bottom-right */}
        <path
          className="tooltip-corner-decor"
          d={`M ${position.x + CARD_W - 20} ${position.y + CARD_H_MIN - 4} L ${position.x + CARD_W - 4} ${position.y + CARD_H_MIN - 4} L ${position.x + CARD_W - 4} ${position.y + CARD_H_MIN - 20}`}
          fill="none"
          stroke={accent}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </svg>

      {/* HTML Tooltip Card */}
      <div
        ref={cardRef}
        className="fixed pointer-events-auto"
        style={{
          zIndex: 9999,
          left: position.x,
          top: position.y,
          width: CARD_W,
          opacity: 0,
        }}
      >
        <div className="relative bg-background/95 backdrop-blur-xl border border-border/60 rounded-xl shadow-2xl overflow-hidden">
          {/* Accent top border */}
          <div
            className="h-1 w-full"
            style={{ background: accent }}
          />

          <div className="p-5">
            {/* Step indicator */}
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-xs font-bold tracking-wider uppercase"
                style={{ color: accent }}
              >
                Step {currentStepIndex + 1} of {totalSteps}
              </span>
              <button
                onClick={skip}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip Tour
              </button>
            </div>

            {/* Title */}
            <h3 className="text-base font-semibold text-foreground mb-2">
              {currentStep.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {currentStep.description}
            </p>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={prev}
                disabled={currentStepIndex === 0}
                className="px-3 py-1.5 text-sm rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Back
              </button>

              <div className="flex items-center gap-1">
                {/* Mini progress dots */}
                {Array.from({ length: Math.min(totalSteps, 10) }).map(
                  (_, i) => {
                    const segmentSize = Math.ceil(totalSteps / 10);
                    const segmentIndex = Math.floor(
                      currentStepIndex / segmentSize
                    );
                    return (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor:
                            i <= segmentIndex ? accent : "var(--border)",
                          transform: i === segmentIndex ? "scale(1.4)" : "scale(1)",
                        }}
                      />
                    );
                  }
                )}
              </div>

              <button
                onClick={next}
                className="px-4 py-1.5 text-sm font-medium rounded-lg text-white transition-all hover:brightness-110"
                style={{ backgroundColor: accent }}
              >
                {currentStepIndex === totalSteps - 1 ? "Finish" : "Next →"}
              </button>
            </div>

            {/* Keyboard hint */}
            <p className="text-[10px] text-muted-foreground/50 text-center mt-3">
              ← → Navigate · Esc Skip
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
