"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { PitchSlide, STAT_METRICS } from "../pitch-slides";

interface SlideProps {
  slide: PitchSlide;
  isActive: boolean;
}

const ORBIT_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6"];

// Place 4 stats at top, right, bottom, left (clock positions: 12, 3, 6, 9)
const STAT_ANGLES = [-90, 0, 90, 180]; // degrees, -90 = top

export function SlideMetrics({ slide, isActive }: SlideProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    ctxRef.current?.revert();

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Title
      tl.fromTo(
        ".metrics-title",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
        0
      );

      // Subtitle
      tl.fromTo(
        ".metrics-subtitle",
        { opacity: 0 },
        { opacity: 1, duration: 0.4 },
        0.3
      );

      // Central node ring draws in
      tl.fromTo(
        ".metrics-center-ring",
        { drawSVG: "0%" },
        { drawSVG: "100%", duration: 0.6, ease: "power2.out" },
        0.3
      );
      tl.fromTo(
        ".metrics-center-glow",
        { opacity: 0 },
        { opacity: 1, duration: 0.4 },
        0.6
      );
      tl.fromTo(
        ".metrics-center-text",
        { opacity: 0 },
        { opacity: 1, duration: 0.3 },
        0.7
      );

      // Center ring idle pulse
      gsap.to(".metrics-center-ring", {
        attr: { r: 52 },
        duration: 2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 2,
      });

      // Orbit track rings draw in (staggered)
      tl.fromTo(
        ".orbit-track",
        { drawSVG: "0%" },
        {
          drawSVG: "100%",
          duration: 0.8,
          stagger: 0.12,
          ease: "power2.out",
        },
        0.5
      );

      // Each stat: connector draws → card scales in → arc fills → number counts
      STAT_METRICS.forEach((stat, i) => {
        const statGroup = containerRef.current!.querySelector(
          `.stat-orbital-${i}`
        ) as SVGGElement;
        const statText = containerRef.current!.querySelector(
          `.stat-value-${i}`
        ) as SVGTextElement;

        if (!statGroup || !statText) return;

        const delay = 1.0 + i * 0.35;

        // Connector line draws from center outward
        tl.fromTo(
          `.stat-connector-${i}`,
          { drawSVG: "0%" },
          { drawSVG: "100%", duration: 0.5, ease: "power2.out" },
          delay
        );

        // Stat node pops in
        tl.fromTo(
          statGroup,
          { opacity: 0, scale: 0, transformOrigin: "center center" },
          { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" },
          delay + 0.2
        );

        // Arc ring fills to percentage
        tl.fromTo(
          `.orbit-fill-${i}`,
          { drawSVG: "0%" },
          {
            drawSVG: `${Math.min(stat.value, 100)}%`,
            duration: 1.2,
            ease: "power2.out",
          },
          delay + 0.3
        );

        // Number count-up
        const obj = { val: 0 };
        tl.to(
          obj,
          {
            val: stat.value,
            duration: 1.2,
            ease: "power2.out",
            onUpdate: () => {
              if (statText) {
                const display =
                  stat.value % 1 !== 0
                    ? obj.val.toFixed(1)
                    : Math.round(obj.val).toString();
                statText.textContent = display + stat.suffix;
              }
            },
          },
          delay + 0.4
        );

        // Checkmark
        tl.fromTo(
          `.stat-check-${i}`,
          { drawSVG: "0%" },
          { drawSVG: "100%", duration: 0.3, ease: "power2.out" },
          delay + 1.2
        );

        // Stat card (HTML) fades in
        tl.fromTo(
          `.stat-card-${i}`,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
          delay + 0.5
        );
      });

      // Idle: gentle pulse on stat nodes
      STAT_METRICS.forEach((_, i) => {
        const statGroup = containerRef.current!.querySelector(
          `.stat-orbital-${i}`
        );
        if (statGroup) {
          gsap.to(statGroup, {
            scale: 1.05,
            duration: 1.8 + i * 0.2,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: 3.5 + i * 0.3,
            transformOrigin: "center center",
          });
        }
      });
    }, containerRef);

    ctxRef.current = ctx;
    return () => {
      ctx.revert();
    };
  }, [isActive, slide.accentColor]);

  // SVG layout constants
  const cx = 300;
  const cy = 300;
  const orbitRadii = [100, 140, 180, 220]; // evenly spaced rings

  // Compute stat positions around the circle
  const statPositions = STAT_METRICS.map((_, i) => {
    const angleDeg = STAT_ANGLES[i];
    const angleRad = (angleDeg * Math.PI) / 180;
    const r = orbitRadii[i];
    return {
      x: cx + Math.cos(angleRad) * r,
      y: cy + Math.sin(angleRad) * r,
      radius: r,
    };
  });

  return (
    <div
      ref={containerRef}
      className="w-full max-w-5xl mx-auto flex flex-col items-center gap-4"
    >
      <h2 className="metrics-title text-3xl md:text-4xl font-bold text-white text-center">
        The Numbers Speak
      </h2>
      <p className="metrics-subtitle text-sm text-gray-400 text-center">
        Real impact metrics from MedScribe AI
      </p>

      <div className="relative w-full flex items-center justify-center">
        {/* Central SVG orbital diagram */}
        <svg viewBox="0 0 600 600" className="w-full max-w-[520px]">
          {/* Orbit track rings */}
          {orbitRadii.map((r, i) => (
            <g key={`track-${i}`}>
              <circle
                className="orbit-track"
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={`${ORBIT_COLORS[i]}18`}
                strokeWidth="1"
              />
              <circle
                className={`orbit-fill-${i}`}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={ORBIT_COLORS[i]}
                strokeWidth="3"
                strokeLinecap="round"
                transform={`rotate(-90 ${cx} ${cy})`}
                opacity="0.6"
              />
            </g>
          ))}

          {/* Connector lines — center to each stat */}
          {statPositions.map((pos, i) => (
            <line
              key={`conn-${i}`}
              className={`stat-connector-${i}`}
              x1={cx}
              y1={cy}
              x2={pos.x}
              y2={pos.y}
              stroke={`${ORBIT_COLORS[i]}50`}
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
          ))}

          {/* Center node */}
          <circle
            className="metrics-center-ring"
            cx={cx}
            cy={cy}
            r="50"
            fill="none"
            stroke={slide.accentColor}
            strokeWidth="2"
          />
          <circle
            className="metrics-center-glow"
            cx={cx}
            cy={cy}
            r="47"
            fill={`${slide.accentColor}10`}
            opacity="0"
          />
          <text
            className="metrics-center-text"
            x={cx}
            y={cy - 6}
            textAnchor="middle"
            fill={slide.accentColor}
            fontSize="13"
            fontWeight="700"
            opacity="0"
          >
            MedScribe
          </text>
          <text
            className="metrics-center-text"
            x={cx}
            y={cy + 10}
            textAnchor="middle"
            fill={slide.accentColor}
            fontSize="10"
            opacity="0"
          >
            AI
          </text>

          {/* Stat orbital nodes */}
          {STAT_METRICS.map((stat, i) => {
            const pos = statPositions[i];
            return (
              <g
                key={`stat-${i}`}
                className={`stat-orbital-${i}`}
                transform={`translate(${Math.round(pos.x)}, ${Math.round(pos.y)})`}
                opacity="0"
              >
                {/* Outer glow */}
                <circle
                  cx="0"
                  cy="0"
                  r="38"
                  fill="none"
                  stroke={ORBIT_COLORS[i]}
                  strokeWidth="0.5"
                  opacity="0.2"
                />
                {/* Main circle */}
                <circle
                  className={`stat-circle-${i}`}
                  cx="0"
                  cy="0"
                  r="35"
                  fill={`${ORBIT_COLORS[i]}10`}
                  stroke={ORBIT_COLORS[i]}
                  strokeWidth="2"
                />
                {/* Value */}
                <text
                  className={`stat-value-${i}`}
                  x="0"
                  y="-2"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={ORBIT_COLORS[i]}
                  fontSize="16"
                  fontWeight="800"
                >
                  0{stat.suffix}
                </text>
                {/* Label */}
                <text
                  x="0"
                  y="14"
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="6"
                >
                  {stat.label}
                </text>
                {/* Checkmark below */}
                <path
                  className={`stat-check-${i}`}
                  d="M-5,22 L-1,26 L7,18"
                  fill="none"
                  stroke={ORBIT_COLORS[i]}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}
        </svg>

        {/* HTML stat cards — positioned at corners around the SVG */}
        <div className="absolute inset-0 pointer-events-none">
          {STAT_METRICS.map((stat, i) => {
            // Position cards near their SVG stat positions
            const positions = [
              "top-0 left-1/2 -translate-x-1/2", // top (accuracy)
              "top-1/2 right-0 -translate-y-1/2", // right (time saved)
              "bottom-0 left-1/2 -translate-x-1/2", // bottom (endpoints)
              "top-1/2 left-0 -translate-y-1/2", // left (pages)
            ];
            return (
              <div
                key={`card-${i}`}
                className={`stat-card-${i} absolute ${positions[i]} px-4 py-2 rounded-lg border opacity-0`}
                style={{
                  borderColor: `${ORBIT_COLORS[i]}30`,
                  backgroundColor: `${ORBIT_COLORS[i]}08`,
                }}
              >
                <div
                  className="text-xs font-bold"
                  style={{ color: ORBIT_COLORS[i] }}
                >
                  {stat.label}
                </div>
                <div className="text-[10px] text-gray-500">
                  {stat.id === "accuracy"
                    ? "Clinical documentation precision"
                    : stat.id === "timesaved"
                      ? "Per clinician per day"
                      : stat.id === "endpoints"
                        ? "AI-powered features"
                        : "Full application coverage"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
