"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { CustomBounce } from "gsap/CustomBounce";
import { CustomWiggle } from "gsap/CustomWiggle";
import { PitchSlide } from "../pitch-slides";

interface SlideProps {
  slide: PitchSlide;
  isActive: boolean;
}

const STATS = [
  { value: 49, suffix: "%", label: "Physician Burnout Rate", description: "Nearly half of all physicians report burnout symptoms" },
  { value: 2, suffix: " hrs/day", label: "Lost to Documentation", description: "Time spent on notes instead of patients" },
  { value: 300, suffix: "K", label: "Physician Shortage by 2030", description: "Growing deficit in healthcare workforce" },
];

export function SlidePain({ slide, isActive }: SlideProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    ctxRef.current?.revert();

    CustomBounce.create("statDrop", { strength: 0.6, squash: 20, squashID: "statSquash" });
    CustomWiggle.create("impact", { wiggles: 3, type: "easeOut" });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Title ScrambleText with block characters
      tl.to(".pain-title", {
        duration: 1.2,
        scrambleText: {
          text: "The Documentation Crisis",
          chars: "░▒▓█▄▀",
          speed: 0.3,
        },
      }, 0);

      // Red pulse behind title
      tl.fromTo(
        ".pain-title-glow",
        { opacity: 0 },
        { opacity: 0.15, duration: 0.8, ease: "sine.inOut", yoyo: true, repeat: 2 },
        0.2
      );

      // Stat cards — CustomBounce squash drop
      const cards = gsap.utils.toArray<HTMLElement>(".pain-card");
      cards.forEach((card, i) => {
        const delay = 0.4 + i * 0.3;

        tl.fromTo(
          card,
          { y: -300, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.5, ease: "statDrop" },
          delay
        );

        tl.fromTo(
          card,
          { scaleX: 1, scaleY: 1 },
          { scaleX: 1.3, scaleY: 0.7, duration: 1.5, ease: "statSquash" },
          delay
        );

        tl.fromTo(
          card,
          { x: 0 },
          { x: 5, duration: 0.6, ease: "impact" },
          delay + 0.6
        );

        // Impact burst lines
        const burstLines = card.querySelectorAll(".impact-line");
        tl.fromTo(
          burstLines,
          { scaleY: 0, opacity: 1 },
          { scaleY: 1, opacity: 0, duration: 0.4, stagger: 0.02, ease: "power2.out" },
          delay + 0.5
        );

        // Number count-up
        const numEl = card.querySelector(".pain-stat-num");
        if (numEl) {
          const target = STATS[i].value;
          const obj = { val: 0 };
          tl.to(obj, {
            val: target,
            duration: 1.2,
            ease: "power2.out",
            onUpdate: () => {
              numEl.textContent = Math.round(obj.val) + STATS[i].suffix;
            },
          }, delay + 0.5);
        }
      });

      // Idle breathing
      cards.forEach((card) => {
        gsap.to(card, {
          scaleX: 1.02, scaleY: 0.98,
          duration: 2, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 3,
        });
      });
    }, containerRef);

    ctxRef.current = ctx;
    return () => { ctx.revert(); };
  }, [isActive, slide.accentColor]);

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto flex flex-col items-center gap-10">
      <div className="relative text-center">
        <div
          className="pain-title-glow absolute inset-0 -inset-x-8 -inset-y-4 rounded-xl"
          style={{ backgroundColor: slide.accentColor, opacity: 0 }}
        />
        <h2 className="pain-title relative text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
          &nbsp;
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="pain-card relative bg-background/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8 text-center overflow-hidden"
            style={{ transformOrigin: "center bottom" }}
          >
            <svg className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-20 overflow-visible">
              {Array.from({ length: 6 }).map((_, j) => {
                const angle = -90 + (j - 2.5) * 30;
                const rad = (angle * Math.PI) / 180;
                return (
                  <line
                    key={j}
                    className="impact-line"
                    x1="80" y1="20"
                    x2={80 + Math.cos(rad) * 35}
                    y2={20 + Math.sin(rad) * 35}
                    stroke={slide.accentColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                    style={{ transformOrigin: "80px 20px" }}
                  />
                );
              })}
            </svg>
            <div className="pain-stat-num text-5xl md:text-6xl font-black mb-3" style={{ color: slide.accentColor }}>
              0{stat.suffix}
            </div>
            <div className="text-lg font-semibold text-foreground mb-2">{stat.label}</div>
            <p className="text-sm text-muted-foreground">{stat.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
