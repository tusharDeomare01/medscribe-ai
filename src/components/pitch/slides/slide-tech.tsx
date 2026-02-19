"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { CustomBounce } from "gsap/CustomBounce";
import { CustomWiggle } from "gsap/CustomWiggle";
import { PitchSlide, TECH_STACK, TECH_BADGES } from "../pitch-slides";
import { SHIELD_PATH, LOCK_PATH } from "../pitch-svg-paths";

interface SlideProps {
  slide: PitchSlide;
  isActive: boolean;
}

const TECH_ICONS = ["⚡", "🧠", "🔗", "🐘", "🔒"];

export function SlideTech({ slide, isActive }: SlideProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    ctxRef.current?.revert();

    CustomBounce.create("badgeBounce", { strength: 0.5, squash: 8, squashID: "badgeSquash" });
    CustomWiggle.create("nodeSettle", { wiggles: 5, type: "easeOut" });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Title
      tl.fromTo(".tech-title", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }, 0);

      // Pipeline path DrawSVG
      tl.fromTo(
        ".tech-pipeline",
        { drawSVG: "0%" },
        { drawSVG: "100%", duration: 1.0, ease: "power2.inOut" },
        0.3
      );

      // Tech nodes pop in with CustomWiggle settle
      const nodes = gsap.utils.toArray<HTMLElement>(".tech-node");
      nodes.forEach((node, i) => {
        tl.fromTo(
          node,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2)" },
          0.5 + i * 0.25
        );

        // CustomWiggle mechanical settle on x
        tl.fromTo(
          node,
          { x: 0 },
          { x: 8, duration: 0.8, ease: "nodeSettle" },
          0.7 + i * 0.25
        );
      });

      // Tech node labels — ScrambleText
      const nodeLabels = gsap.utils.toArray<HTMLElement>(".tech-node-name");
      nodeLabels.forEach((el, i) => {
        const text = TECH_STACK[i]?.name || "";
        tl.to(el, {
          duration: 0.4,
          scrambleText: { text, chars: "01", speed: 0.4 },
        }, 0.8 + i * 0.25);
      });

      const nodeSubtitles = gsap.utils.toArray<HTMLElement>(".tech-node-sub");
      nodeSubtitles.forEach((el, i) => {
        tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 1.0 + i * 0.25);
      });

      // Data packet traveling along pipeline (repeating)
      // SVG x attribute requires numeric pixel values, not percentages
      // Pipeline goes from x=60 to x=740, so 5 nodes are spaced evenly
      const packetNodeX = [60, 230, 400, 570, 740];
      const packet = containerRef.current!.querySelector(".data-packet");
      if (packet) {
        const travel = () => {
          const packetTl = gsap.timeline({ repeat: -1, delay: 2.0, repeatDelay: 1.0 });
          packetNodeX.forEach((targetX, i) => {
            if (i === 0) return;
            packetTl.fromTo(
              packet,
              { attr: { x: packetNodeX[i - 1] }, opacity: 0.9 },
              {
                attr: { x: targetX },
                duration: 0.5,
                ease: "power2.inOut",
              },
              i * 0.6
            );

            // Node wiggles when packet arrives
            if (nodes[i]) {
              packetTl.fromTo(
                nodes[i],
                { x: 0 },
                { x: 4, duration: 0.5, ease: "nodeSettle" },
                i * 0.6 + 0.4
              );
            }
          });
          packetTl.to(packet, { opacity: 0, duration: 0.2 }, ">");
        };
        travel();
      }

      // Tech badges — CustomBounce drop
      const badges = gsap.utils.toArray<HTMLElement>(".tech-badge");
      badges.forEach((badge, i) => {
        tl.fromTo(
          badge,
          { y: -80, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.0, ease: "badgeBounce" },
          2.2 + i * 0.12
        );
        tl.fromTo(
          badge,
          { scaleX: 1, scaleY: 1 },
          { scaleX: 1.15, scaleY: 0.85, duration: 1.0, ease: "badgeSquash" },
          2.2 + i * 0.12
        );
      });

      // Shield DrawSVG
      tl.fromTo(".shield-stroke", { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.6, ease: "power2.out" }, 3.0);
      tl.fromTo(".lock-stroke", { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.4, ease: "power2.out" }, 3.3);

      // HIPAA label
      tl.to(".hipaa-label", {
        duration: 0.4,
        scrambleText: { text: "HIPAA-Ready", chars: "01", speed: 0.5 },
      }, 3.4);
    }, containerRef);

    ctxRef.current = ctx;
    return () => { ctx.revert(); };
  }, [isActive, slide.accentColor]);

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto flex flex-col items-center gap-8">
      <h2 className="tech-title text-3xl md:text-4xl font-bold text-foreground text-center">
        Enterprise-Grade Architecture
      </h2>

      {/* Pipeline */}
      <div className="relative w-full px-4">
        {/* Pipeline line */}
        <svg viewBox="0 0 800 10" className="w-full h-3 mb-2">
          <line
            className="tech-pipeline"
            x1="60" y1="5" x2="740" y2="5"
            stroke={slide.accentColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="6 4"
          />
          <rect
            className="data-packet"
            x="60" y="1" width="16" height="8" rx="3"
            fill={slide.accentColor}
            opacity="0"
          />
        </svg>

        {/* Tech nodes */}
        <div className="flex items-start justify-between">
          {TECH_STACK.map((tech, i) => (
            <div
              key={tech.id}
              className="tech-node flex flex-col items-center gap-2 w-28"
              style={{ transformOrigin: "center bottom" }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                style={{
                  backgroundColor: `${slide.accentColor}15`,
                  border: `1.5px solid ${slide.accentColor}40`,
                }}
              >
                {TECH_ICONS[i]}
              </div>
              <div className="tech-node-name text-sm font-semibold text-foreground text-center">&nbsp;</div>
              <div className="tech-node-sub text-xs text-muted-foreground text-center">{tech.subtitle}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Badges */}
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {TECH_BADGES.map((badge) => (
          <div
            key={badge}
            className="tech-badge px-4 py-2 rounded-full text-sm font-medium border border-border/40 bg-background/50"
            style={{ transformOrigin: "center bottom" }}
          >
            {badge}
          </div>
        ))}
      </div>

      {/* Security Section */}
      <div className="flex items-center gap-6 mt-4">
        <svg viewBox="0 0 100 100" className="w-16 h-16">
          <path
            className="shield-stroke"
            d={SHIELD_PATH}
            fill="none"
            stroke={slide.accentColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            className="lock-stroke"
            d={LOCK_PATH}
            fill="none"
            stroke={slide.accentColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="hipaa-label text-lg font-semibold" style={{ color: slide.accentColor }}>&nbsp;</span>
      </div>
    </div>
  );
}
