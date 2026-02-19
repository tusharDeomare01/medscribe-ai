"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useTour } from "./tour-provider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(DrawSVGPlugin);
}

// ── SVG Hand Path Data ─────────────────────────────────────────────
// Stylized pointing hand — drawn stroke-by-stroke
const HAND_PATHS = {
  // Index finger (pointing)
  indexFinger:
    "M 12 2 C 12 2 13 1 14 1 C 15 1 16 2 16 3 L 16 18 C 16 18 15 19 14 19 C 13 19 12 18 12 18 Z",
  // Middle finger
  middleFinger:
    "M 17 4 C 17 4 18 3 19 3 C 20 3 21 4 21 5 L 21 18 C 21 18 20 20 19 20 C 18 20 17 19 17 19 Z",
  // Ring finger
  ringFinger:
    "M 22 6 C 22 6 23 5 24 5 C 25 5 26 6 26 7 L 26 19 C 26 19 25 21 24 21 C 23 21 22 20 22 20 Z",
  // Pinky
  pinky:
    "M 27 9 C 27 9 28 8 29 8 C 30 8 31 9 31 10 L 31 19 C 31 19 30 21 29 21 C 28 21 27 20 27 20 Z",
  // Thumb
  thumb:
    "M 11 12 C 11 12 8 11 7 10 C 6 9 5 8 5 8 C 5 8 4 9 5 10 C 6 11 8 13 10 14 L 11 15 Z",
  // Palm
  palm:
    "M 10 15 C 10 15 9 18 9 21 C 9 24 10 26 10 26 L 32 26 C 32 26 33 24 33 21 C 33 19 32 19 32 19 L 16 19 L 10 15 Z",
};

// Fingertip point (for ripples)
const FINGERTIP = { x: 14, y: 1 };

export function TourOverlay() {
  const { isActive, phase, targetRect, prevTargetRect, currentStep, skip } =
    useTour();

  const svgRef = useRef<SVGSVGElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const idleRef = useRef<gsap.core.Timeline | null>(null);

  // ── Cleanup helper ────────────────────────────────────────────

  const killAnimations = useCallback(() => {
    if (idleRef.current) {
      idleRef.current.kill();
      idleRef.current = null;
    }
    if (tlRef.current) {
      tlRef.current.kill();
      tlRef.current = null;
    }
    if (ctxRef.current) {
      ctxRef.current.revert();
      ctxRef.current = null;
    }
  }, []);

  // ── Entrance Animation ────────────────────────────────────────

  const playEntrance = useCallback(() => {
    if (!svgRef.current || !targetRect) return;
    killAnimations();

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      const pad = 12;
      const rx = targetRect.x - pad;
      const ry = targetRect.y - pad;
      const rw = targetRect.width + pad * 2;
      const rh = targetRect.height + pad * 2;

      // ── Overlay fade in
      tl.fromTo(
        ".tour-overlay-bg",
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power2.out" },
        0
      );

      // ── Spotlight cutout zoom open
      tl.fromTo(
        ".tour-cutout",
        {
          attr: {
            x: targetRect.centerX,
            y: targetRect.centerY,
            width: 0,
            height: 0,
            rx: 0,
          },
        },
        {
          attr: { x: rx, y: ry, width: rw, height: rh, rx: 12 },
          duration: 0.5,
          ease: "back.out(1.5)",
        },
        0.2
      );

      // ── Corner brackets fly in + draw
      const bracketSize = 24;
      const corners = [
        { cls: ".bracket-tl", x: rx, y: ry, dx: -30, dy: -30 },
        { cls: ".bracket-tr", x: rx + rw, y: ry, dx: 30, dy: -30 },
        { cls: ".bracket-bl", x: rx, y: ry + rh, dx: -30, dy: 30 },
        { cls: ".bracket-br", x: rx + rw, y: ry + rh, dx: 30, dy: 30 },
      ];

      corners.forEach((c, i) => {
        const el = svgRef.current!.querySelector(c.cls);
        if (!el) return;

        // Position the bracket path
        const paths: Record<string, string> = {
          ".bracket-tl": `M ${c.x} ${c.y + bracketSize} L ${c.x} ${c.y} L ${c.x + bracketSize} ${c.y}`,
          ".bracket-tr": `M ${c.x - bracketSize} ${c.y} L ${c.x} ${c.y} L ${c.x} ${c.y + bracketSize}`,
          ".bracket-bl": `M ${c.x} ${c.y - bracketSize} L ${c.x} ${c.y} L ${c.x + bracketSize} ${c.y}`,
          ".bracket-br": `M ${c.x - bracketSize} ${c.y} L ${c.x} ${c.y} L ${c.x} ${c.y - bracketSize}`,
        };

        gsap.set(el, { attr: { d: paths[c.cls] || "" } });

        tl.fromTo(
          el,
          {
            drawSVG: "0%",
            x: c.dx,
            y: c.dy,
            opacity: 0,
          },
          {
            drawSVG: "100%",
            x: 0,
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "back.out(2)",
          },
          0.5 + i * 0.05
        );
      });

      // ── Full border outline traces itself
      const borderPath = `M ${rx + 12} ${ry} L ${rx + rw - 12} ${ry} Q ${rx + rw} ${ry} ${rx + rw} ${ry + 12} L ${rx + rw} ${ry + rh - 12} Q ${rx + rw} ${ry + rh} ${rx + rw - 12} ${ry + rh} L ${rx + 12} ${ry + rh} Q ${rx} ${ry + rh} ${rx} ${ry + rh - 12} L ${rx} ${ry + 12} Q ${rx} ${ry} ${rx + 12} ${ry}`;
      gsap.set(".tour-border", { attr: { d: borderPath } });
      tl.fromTo(
        ".tour-border",
        { drawSVG: "0%" },
        { drawSVG: "100%", duration: 0.8, ease: "power2.inOut" },
        0.7
      );

      // ── Scan line sweep
      tl.fromTo(
        ".tour-scanline",
        { attr: { y: ry, height: 2 }, opacity: 0.6 },
        {
          attr: { y: ry + rh },
          opacity: 0,
          duration: 0.6,
          ease: "power2.inOut",
        },
        1.0
      );
      gsap.set(".tour-scanline", {
        attr: { x: rx, width: rw },
      });

      // ── Dotted trail from screen edge to target
      const trailPath = `M 0 ${targetRect.centerY} Q ${targetRect.centerX / 2} ${targetRect.centerY - 50} ${targetRect.centerX} ${targetRect.centerY}`;
      gsap.set(".tour-trail", { attr: { d: trailPath } });
      tl.fromTo(
        ".tour-trail",
        { drawSVG: "0%" },
        { drawSVG: "100%", duration: 0.8, ease: "power2.out" },
        0.85
      );

      // ── Hand SVG draws itself stroke-by-stroke
      const handGroup = svgRef.current!.querySelector(".tour-hand-group");
      if (handGroup) {
        // Position hand near the target
        const handX = targetRect.centerX - 20;
        const handY = targetRect.y - 55;
        gsap.set(handGroup, {
          x: handX,
          y: handY,
          scale: 1.2,
          transformOrigin: "14px 26px",
        });

        const fingerPaths = handGroup.querySelectorAll(".hand-path");
        fingerPaths.forEach((p, i) => {
          tl.fromTo(
            p,
            { drawSVG: "0%", opacity: 0 },
            {
              drawSVG: "100%",
              opacity: 1,
              duration: i === 0 ? 0.8 : 0.4,
              ease: "power2.out",
            },
            1.0 + i * 0.12
          );
        });
      }

      // ── Measurement lines
      tl.fromTo(
        ".tour-measure-h",
        { opacity: 0, scaleX: 0 },
        { opacity: 0.5, scaleX: 1, duration: 0.3, ease: "power2.out" },
        1.2
      );
      tl.fromTo(
        ".tour-measure-v",
        { opacity: 0, scaleY: 0 },
        { opacity: 0.5, scaleY: 1, duration: 0.3, ease: "power2.out" },
        1.2
      );

      // ── Connector endpoint circle pops
      tl.fromTo(
        ".tour-connector-dot",
        { scale: 0, transformOrigin: "center" },
        { scale: 1, duration: 0.3, ease: "back.out(3)" },
        1.5
      );

      // ── Particle burst at connector point
      const particles = svgRef.current!.querySelectorAll(".tour-particle");
      particles.forEach((p, i) => {
        const angle = (i / particles.length) * Math.PI * 2;
        const dist = 25 + Math.random() * 15;
        tl.fromTo(
          p,
          {
            attr: {
              cx: targetRect.centerX,
              cy: targetRect.y - pad,
            },
            scale: 1,
            opacity: 0.8,
          },
          {
            attr: {
              cx: targetRect.centerX + Math.cos(angle) * dist,
              cy: targetRect.y - pad + Math.sin(angle) * dist,
            },
            scale: 0,
            opacity: 0,
            duration: 1.0,
            ease: "power2.out",
          },
          1.5
        );
      });

      // ── Start idle animations at the end
      tl.call(() => playIdle(), [], 2.0);

      tlRef.current = tl;
    }, svgRef);

    ctxRef.current = ctx;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetRect, killAnimations]);

  // ── Idle Animations ───────────────────────────────────────────

  const playIdle = useCallback(
    () => {
      if (!svgRef.current || !targetRect) return;

      const idle = gsap.timeline();

      // Corner brackets breathe
      idle.to(".bracket-tl, .bracket-tr, .bracket-bl, .bracket-br", {
        strokeOpacity: 0.4,
        duration: 1.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: 0.1,
      });

      // Marching ants on dotted trail
      idle.to(
        ".tour-trail",
        {
          strokeDashoffset: -20,
          duration: 0.8,
          ease: "none",
          repeat: -1,
        },
        0
      );

      // Hand double-tap gesture
      const handGroup = svgRef.current.querySelector(".tour-hand-group");
      if (handGroup) {
        const tapTl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });
        // First tap
        tapTl.to(handGroup, {
          rotation: -8,
          duration: 0.15,
          ease: "power2.in",
          transformOrigin: "14px 26px",
        });
        tapTl.to(handGroup, {
          rotation: 0,
          duration: 0.3,
          ease: "back.out(3)",
        });
        // Second tap
        tapTl.to(
          handGroup,
          {
            rotation: -8,
            duration: 0.15,
            ease: "power2.in",
          },
          0.6
        );
        tapTl.to(handGroup, {
          rotation: 0,
          duration: 0.3,
          ease: "back.out(3)",
        });

        // Ripple rings on each tap
        const rippleTimings = [0.15, 0.75];
        rippleTimings.forEach((t) => {
          const handX = parseFloat(
            (handGroup as SVGGElement).getAttribute("x") ||
              String(targetRect.centerX - 20)
          );
          const handY = parseFloat(
            (handGroup as SVGGElement).getAttribute("y") ||
              String(targetRect.y - 55)
          );
          const rippleX = handX + FINGERTIP.x;
          const rippleY = handY + FINGERTIP.y;

          for (let r = 0; r < 3; r++) {
            const ring = svgRef.current!.querySelectorAll(".tour-ripple")[r];
            if (!ring) continue;
            tapTl.fromTo(
              ring,
              {
                attr: { cx: rippleX, cy: rippleY, r: 4 },
                opacity: 0.7,
              },
              {
                attr: { r: 25 + r * 10 },
                opacity: 0,
                duration: 0.8,
                ease: "power2.out",
              },
              t + r * 0.12
            );
          }
        });

        idle.add(tapTl, 0);
      }

      // Connector dot pulse
      idle.to(
        ".tour-connector-dot",
        {
          attr: { r: 6 },
          duration: 0.8,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        },
        0
      );

      idleRef.current = idle;
    },
    [targetRect]
  );

  // ── Exit Animation ────────────────────────────────────────────

  const playExit = useCallback(() => {
    if (!svgRef.current) return;

    // Kill idle first
    if (idleRef.current) {
      idleRef.current.kill();
      idleRef.current = null;
    }

    const tl = gsap.timeline();

    // Hand retracts
    tl.to(".tour-hand-group", {
      y: "-=30",
      scale: 0.6,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
    });

    // Ripples fade
    tl.to(".tour-ripple", { opacity: 0, duration: 0.15 }, 0);

    // Brackets retract
    tl.to(
      ".bracket-tl",
      { x: -20, y: -20, opacity: 0, duration: 0.25, ease: "power2.in" },
      0.1
    );
    tl.to(
      ".bracket-tr",
      { x: 20, y: -20, opacity: 0, duration: 0.25, ease: "power2.in" },
      0.1
    );
    tl.to(
      ".bracket-bl",
      { x: -20, y: 20, opacity: 0, duration: 0.25, ease: "power2.in" },
      0.1
    );
    tl.to(
      ".bracket-br",
      { x: 20, y: 20, opacity: 0, duration: 0.25, ease: "power2.in" },
      0.1
    );

    // Border un-draws
    tl.to(
      ".tour-border",
      { drawSVG: "50% 50%", duration: 0.3, ease: "power2.in" },
      0.1
    );

    // Trail reverse-draws
    tl.to(
      ".tour-trail",
      { drawSVG: "100% 100%", duration: 0.3, ease: "power2.in" },
      0.1
    );

    // Measurements + particles fade
    tl.to(
      ".tour-measure-h, .tour-measure-v, .tour-particle, .tour-connector-dot",
      { opacity: 0, duration: 0.2 },
      0
    );

    // Cutout shrinks
    if (targetRect) {
      tl.to(
        ".tour-cutout",
        {
          attr: {
            x: targetRect.centerX,
            y: targetRect.centerY,
            width: 0,
            height: 0,
          },
          duration: 0.3,
          ease: "power2.in",
        },
        0.25
      );
    }

    // Overlay fades
    tl.to(".tour-overlay-bg", { opacity: 0, duration: 0.3, ease: "power2.in" }, 0.3);

    return tl;
  }, [targetRect]);

  // ── Connecting Path (between steps on same page) ──────────────

  const playConnector = useCallback(async () => {
    if (!svgRef.current || !prevTargetRect || !targetRect) return;

    // Lazy-register MotionPathPlugin only when needed
    try {
      const { MotionPathPlugin } = await import("gsap/MotionPathPlugin");
      gsap.registerPlugin(MotionPathPlugin);
    } catch { /* ignore */ }

    const tl = gsap.timeline();
    const midX = (prevTargetRect.centerX + targetRect.centerX) / 2;
    const midY =
      Math.min(prevTargetRect.centerY, targetRect.centerY) -
      60 -
      Math.abs(prevTargetRect.centerX - targetRect.centerX) * 0.2;

    const connPath = `M ${prevTargetRect.centerX} ${prevTargetRect.centerY} Q ${midX} ${midY} ${targetRect.centerX} ${targetRect.centerY}`;

    gsap.set(".tour-connector-path", { attr: { d: connPath } });

    tl.fromTo(
      ".tour-connector-path",
      { drawSVG: "0%", opacity: 1 },
      { drawSVG: "100%", duration: 0.7, ease: "power2.inOut" }
    );

    // Traveling dot along path
    const connEl = document.querySelector(".tour-connector-path");
    if (connEl && connEl.getAttribute("d")) {
      try {
        tl.fromTo(
          ".tour-travel-dot",
          { opacity: 1, scale: 1 },
          {
            motionPath: {
              path: ".tour-connector-path",
              align: ".tour-connector-path",
              alignOrigin: [0.5, 0.5],
            },
            duration: 0.7,
            ease: "power2.inOut",
          },
          0
        );
      } catch {
        // MotionPathPlugin may fail if path data is empty
      }
    }

    tl.to(
      ".tour-connector-path",
      { opacity: 0, duration: 0.3 },
      0.6
    );
    tl.to(".tour-travel-dot", { opacity: 0, duration: 0.2 }, 0.6);

    return tl;
  }, [prevTargetRect, targetRect]);

  // ── Phase-driven animation trigger ────────────────────────────

  useEffect(() => {
    if (!isActive) {
      killAnimations();
      return;
    }

    if (phase === "entering") {
      playEntrance();
    } else if (phase === "exiting" || phase === "transitioning") {
      playExit();
    }
  }, [phase, isActive, playEntrance, playExit, killAnimations]);

  // Play connector when entering from a same-page transition
  useEffect(() => {
    if (phase === "entering" && prevTargetRect && targetRect) {
      const isSamePage =
        prevTargetRect.centerX !== targetRect.centerX ||
        prevTargetRect.centerY !== targetRect.centerY;
      if (isSamePage) {
        playConnector();
      }
    }
  }, [phase, prevTargetRect, targetRect, playConnector]);

  // ── Full exit on tour end ─────────────────────────────────────

  useEffect(() => {
    if (!isActive && phase === "idle") {
      killAnimations();
    }
  }, [isActive, phase, killAnimations]);

  if (!isActive) return null;

  const accentColor = currentStep?.accentColor || "#8b5cf6";
  const pad = 12;

  return (
    <svg
      ref={svgRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 9997 }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Spotlight mask */}
        <mask id="tour-spotlight-mask">
          <rect width="100%" height="100%" fill="white" />
          <rect
            className="tour-cutout"
            x={targetRect ? targetRect.centerX : 0}
            y={targetRect ? targetRect.centerY : 0}
            width={0}
            height={0}
            rx={12}
            fill="black"
          />
        </mask>
      </defs>

      {/* Dark overlay with spotlight hole */}
      <rect
        className="tour-overlay-bg pointer-events-auto"
        width="100%"
        height="100%"
        fill="rgba(0,0,0,0.75)"
        mask="url(#tour-spotlight-mask)"
        opacity={0}
        onClick={skip}
      />

      {/* Corner brackets (L-shaped) */}
      <path
        className="bracket-tl"
        d=""
        fill="none"
        stroke={accentColor}
        strokeWidth={2.5}
        strokeLinecap="round"
        opacity={0}
      />
      <path
        className="bracket-tr"
        d=""
        fill="none"
        stroke={accentColor}
        strokeWidth={2.5}
        strokeLinecap="round"
        opacity={0}
      />
      <path
        className="bracket-bl"
        d=""
        fill="none"
        stroke={accentColor}
        strokeWidth={2.5}
        strokeLinecap="round"
        opacity={0}
      />
      <path
        className="bracket-br"
        d=""
        fill="none"
        stroke={accentColor}
        strokeWidth={2.5}
        strokeLinecap="round"
        opacity={0}
      />

      {/* Full border outline */}
      <path
        className="tour-border"
        d=""
        fill="none"
        stroke={accentColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.8}
      />

      {/* Scan line */}
      <rect
        className="tour-scanline"
        x={0}
        y={0}
        width={0}
        height={2}
        fill={accentColor}
        opacity={0}
        rx={1}
      />

      {/* Dotted trail */}
      <path
        className="tour-trail"
        d=""
        fill="none"
        stroke={accentColor}
        strokeWidth={1.5}
        strokeDasharray="6 4"
        opacity={0.5}
      />

      {/* Measurement lines */}
      {targetRect && (
        <>
          <line
            className="tour-measure-h"
            x1={targetRect.x - pad - 20}
            y1={targetRect.y + targetRect.height / 2}
            x2={targetRect.x - pad}
            y2={targetRect.y + targetRect.height / 2}
            stroke={accentColor}
            strokeWidth={1}
            opacity={0}
            markerEnd="url(#arrow)"
          />
          <line
            className="tour-measure-v"
            x1={targetRect.x + targetRect.width / 2}
            y1={targetRect.y - pad - 20}
            x2={targetRect.x + targetRect.width / 2}
            y2={targetRect.y - pad}
            stroke={accentColor}
            strokeWidth={1}
            opacity={0}
            markerEnd="url(#arrow)"
          />
        </>
      )}

      {/* Connector path (between steps) */}
      <path
        className="tour-connector-path"
        d=""
        fill="none"
        stroke={accentColor}
        strokeWidth={2}
        strokeDasharray="8 4"
        opacity={0}
      />

      {/* Traveling dot */}
      <circle
        className="tour-travel-dot"
        r={4}
        fill={accentColor}
        opacity={0}
      />

      {/* Connector endpoint dot */}
      {targetRect && (
        <circle
          className="tour-connector-dot"
          cx={targetRect.centerX}
          cy={targetRect.y - pad}
          r={4}
          fill={accentColor}
          opacity={0.8}
        />
      )}

      {/* Particle burst (8 circles) */}
      {Array.from({ length: 8 }).map((_, i) => (
        <circle
          key={i}
          className="tour-particle"
          r={3}
          fill={accentColor}
          opacity={0}
        />
      ))}

      {/* Ripple rings (3) */}
      {Array.from({ length: 3 }).map((_, i) => (
        <circle
          key={`ripple-${i}`}
          className="tour-ripple"
          r={4}
          fill="none"
          stroke={accentColor}
          strokeWidth={1.5}
          opacity={0}
        />
      ))}

      {/* Self-drawing hand pointer */}
      <g className="tour-hand-group" opacity={0}>
        <path
          className="hand-path"
          d={HAND_PATHS.indexFinger}
          fill="none"
          stroke={accentColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="hand-path"
          d={HAND_PATHS.thumb}
          fill="none"
          stroke={accentColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="hand-path"
          d={HAND_PATHS.palm}
          fill="none"
          stroke={accentColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="hand-path"
          d={HAND_PATHS.middleFinger}
          fill="none"
          stroke={accentColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="hand-path"
          d={HAND_PATHS.ringFinger}
          fill="none"
          stroke={accentColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="hand-path"
          d={HAND_PATHS.pinky}
          fill="none"
          stroke={accentColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Arrow marker definition */}
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth={6}
          markerHeight={6}
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={accentColor} />
        </marker>
      </defs>
    </svg>
  );
}
