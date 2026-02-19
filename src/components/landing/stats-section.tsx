"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Brain, Clock, BarChart3, Zap } from "lucide-react";
import { STATS_ARC_PATH, STATS_TRACK_PATH } from "./svg-paths";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);
}

const stats = [
  {
    value: 107,
    suffix: "+",
    label: "Medical Entity Types",
    icon: Brain,
    color: "#8b5cf6",
    percent: 85,
  },
  {
    value: 2,
    suffix: "hrs",
    label: "Saved Per Doctor/Day",
    icon: Clock,
    color: "#0ea5e9",
    percent: 70,
  },
  {
    value: 98,
    suffix: "%",
    label: "NER Accuracy",
    icon: BarChart3,
    color: "#10b981",
    percent: 98,
  },
  {
    value: 500,
    suffix: "ms",
    label: "Avg Response Time",
    icon: Zap,
    color: "#f59e0b",
    percent: 60,
  },
];

export function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".stat-card");
      const arcs = gsap.utils.toArray<SVGPathElement>(".stat-arc");
      const numbers = gsap.utils.toArray<HTMLElement>(".stat-number");
      const checkmarks = gsap.utils.toArray<SVGPathElement>(".stat-check");
      const accents = gsap.utils.toArray<SVGLineElement>(".stat-accent");

      // Set initial states
      gsap.set(cards, { y: 60, opacity: 0 });
      gsap.set(arcs, { drawSVG: "0%" });
      gsap.set(checkmarks, { drawSVG: "0%", opacity: 0 });
      gsap.set(accents, { drawSVG: "0%" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          once: true,
        },
      });

      // Cards fade up with tighter stagger for smoother cascade
      tl.to(cards, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out",
      });

      // Arc rings draw + number countup (all start together, overlapped)
      stats.forEach((stat, i) => {
        const drawPercent = `${stat.percent}%`;

        tl.to(
          arcs[i],
          {
            drawSVG: `0% ${drawPercent}`,
            duration: 1,
            ease: "power2.out",
          },
          `-=${i === 0 ? 0.2 : 0.85}`
        );

        // CountUp number (synced exactly with arc)
        const numObj = { val: 0 };
        tl.to(
          numObj,
          {
            val: stat.value,
            duration: 1,
            ease: "power2.out",
            onUpdate: () => {
              if (numbers[i]) {
                numbers[i].textContent = Math.round(numObj.val).toString();
              }
            },
          },
          "<"
        );
      });

      // Checkmarks draw after arcs complete (cleaner sequencing)
      tl.to(
        checkmarks,
        {
          drawSVG: "100%",
          opacity: 1,
          duration: 0.25,
          stagger: 0.08,
          ease: "power2.out",
        },
        "-=0.1"
      );

      // Accent lines under labels (tighter stagger, less delay)
      tl.to(
        accents,
        {
          drawSVG: "100%",
          duration: 0.3,
          stagger: 0.06,
          ease: "power2.out",
        },
        "-=0.15"
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.02] to-background pointer-events-none" />
      <div className="max-w-6xl mx-auto px-6 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="stat-card rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-6 text-center hover:border-primary/30 transition-all duration-500"
            >
              {/* SVG Arc Ring */}
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  {/* Track (background ring) */}
                  <path
                    d={STATS_TRACK_PATH}
                    fill="none"
                    stroke="hsl(var(--border))"
                    strokeWidth="6"
                    strokeLinecap="round"
                    opacity="0.3"
                  />
                  {/* Animated arc */}
                  <path
                    className="stat-arc"
                    d={STATS_ARC_PATH}
                    fill="none"
                    stroke={stat.color}
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  {/* Small checkmark at end */}
                  <path
                    className="stat-check"
                    d="M54,62 L58,66 L68,56"
                    fill="none"
                    stroke={stat.color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0"
                  />
                </svg>
                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <stat.icon
                    className="w-6 h-6"
                    style={{ color: stat.color }}
                  />
                </div>
              </div>

              {/* Number */}
              <div className="flex items-baseline justify-center gap-0.5 mb-1">
                <span
                  className="stat-number text-3xl font-bold"
                  style={{ color: "hsl(var(--foreground))" }}
                >
                  0
                </span>
                <span
                  className="text-lg font-bold"
                  style={{ color: stat.color }}
                >
                  {stat.suffix}
                </span>
              </div>

              {/* Label with accent line */}
              <div className="relative">
                <p className="text-xs md:text-sm text-muted-foreground">
                  {stat.label}
                </p>
                <svg
                  className="w-12 h-1 mx-auto mt-2"
                  viewBox="0 0 48 2"
                >
                  <line
                    className="stat-accent"
                    x1="0"
                    y1="1"
                    x2="48"
                    y2="1"
                    stroke={stat.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.6"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
