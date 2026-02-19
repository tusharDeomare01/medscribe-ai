"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Mic, Brain, FileText, BarChart3, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);
}

const workflows = [
  {
    step: "01",
    title: "Input",
    desc: "Type or dictate clinical notes using voice recognition",
    icon: Mic,
  },
  {
    step: "02",
    title: "Process",
    desc: "AI extracts entities, generates SOAP notes & ICD codes",
    icon: Brain,
  },
  {
    step: "03",
    title: "Review",
    desc: "Color-coded highlights for medications, diagnoses & more",
    icon: FileText,
  },
  {
    step: "04",
    title: "Analyze",
    desc: "Upload reports for AI-powered lab value interpretation",
    icon: BarChart3,
  },
];

export function WorkflowSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // ── Heading animation ─────────────────────────────────────
      gsap.fromTo(
        ".workflow-heading-content",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );

      // ── Main connector path DrawSVG (scrub) ──────────────────
      if (pathRef.current) {
        gsap.set(pathRef.current, { drawSVG: "0%" });

        gsap.to(pathRef.current, {
          drawSVG: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            end: "bottom 40%",
            scrub: 1,
          },
        });
      }

      // ── Traveling dot via MotionPathPlugin (lazy) ─────────────
      if (pathRef.current && dotRef.current) {
        const pathEl = pathRef.current;
        const dotEl = dotRef.current;

        import("gsap/MotionPathPlugin")
          .then(({ MotionPathPlugin }) => {
            gsap.registerPlugin(MotionPathPlugin);

            const d = pathEl.getAttribute("d");
            if (!d) return;

            gsap.set(dotEl, { opacity: 0.8 });
            gsap.to(dotEl, {
              motionPath: {
                path: pathEl,
                align: pathEl,
                alignOrigin: [0.5, 0.5],
              },
              ease: "none",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 60%",
                end: "bottom 40%",
                scrub: 1,
              },
            });
          })
          .catch(() => {
            // MotionPathPlugin not available
          });
      }

      // ── Step node circles DrawSVG ─────────────────────────────
      const nodeRings = gsap.utils.toArray<SVGCircleElement>(".wf-node-ring");
      gsap.set(nodeRings, { drawSVG: "0%" });

      nodeRings.forEach((ring, i) => {
        gsap.to(ring, {
          drawSVG: "100%",
          duration: 0.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: `.wf-step-${i}`,
            start: "top 75%",
            once: true,
          },
        });
      });

      // ── Step number pop-in (softer bounce) ──────────────────────
      const stepNums = gsap.utils.toArray<HTMLElement>(".wf-step-num");
      stepNums.forEach((num, i) => {
        gsap.fromTo(
          num,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            ease: "back.out(1.5)",
            scrollTrigger: {
              trigger: `.wf-step-${i}`,
              start: "top 75%",
              once: true,
            },
          }
        );
      });

      // ── Step cards slide in from alternating sides (smaller offset) ──
      const stepCards = gsap.utils.toArray<HTMLElement>(".wf-step-card");
      stepCards.forEach((card, i) => {
        const fromX = i % 2 === 0 ? -40 : 40;
        gsap.fromTo(
          card,
          { x: fromX, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 80%",
              once: true,
            },
          }
        );
      });

      // ── Final step: checkmark burst ───────────────────────────
      const checkmark = sectionRef.current!.querySelector(".wf-final-check");
      const burstLines = gsap.utils.toArray<SVGLineElement>(".wf-burst-line");

      if (checkmark) {
        gsap.set(checkmark, { drawSVG: "0%", opacity: 0 });
        gsap.set(burstLines, { scaleY: 0, opacity: 0 });

        ScrollTrigger.create({
          trigger: `.wf-step-3`,
          start: "top 70%",
          once: true,
          onEnter: () => {
            const burstTl = gsap.timeline({ delay: 0.2 });
            burstTl.to(checkmark, {
              drawSVG: "100%",
              opacity: 1,
              duration: 0.3,
              ease: "power2.out",
            });
            burstTl.to(
              burstLines,
              {
                scaleY: 1,
                opacity: 1,
                duration: 0.3,
                stagger: 0.02,
                ease: "power2.out",
              },
              "-=0.1"
            );
            burstTl.to(burstLines, {
              opacity: 0,
              scaleY: 0.5,
              y: -8,
              duration: 0.4,
              stagger: 0.02,
              ease: "power1.out",
            });
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="workflow" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.02] to-background pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative">
        {/* Heading */}
        <div className="workflow-heading-content text-center mb-20">
          <Badge
            variant="outline"
            className="mb-4 px-3 py-1 text-xs border-primary/20 bg-primary/5 text-primary"
          >
            <Zap className="w-3 h-3 mr-1" /> Workflow
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From voice dictation to structured clinical documentation in seconds
          </p>
        </div>

        {/* Steps with SVG connector */}
        <div className="relative">
          {/* SVG connector path (absolute, behind cards) */}
          <svg
            className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-16 pointer-events-none hidden md:block"
            viewBox="0 0 64 800"
            preserveAspectRatio="none"
          >
            {/* Connector bezier path */}
            <path
              ref={pathRef}
              d="M32,20 C32,120 16,160 32,260 C48,360 16,400 32,500 C48,600 16,640 32,740"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeDasharray="6 4"
              opacity="0.5"
            />
            {/* Traveling dot */}
            <circle
              ref={dotRef}
              r="5"
              fill="hsl(var(--primary))"
              opacity="0"
            />
          </svg>

          {/* Step cards */}
          <div className="space-y-20 md:space-y-24">
            {workflows.map((w, i) => (
              <div
                key={w.step}
                className={`wf-step-${i} relative grid md:grid-cols-[1fr_80px_1fr] gap-6 items-center`}
              >
                {/* Card (alternating sides) */}
                <div
                  className={`wf-step-card ${
                    i % 2 === 0 ? "md:col-start-1" : "md:col-start-3"
                  }`}
                >
                  <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-6 hover:border-primary/30 transition-all duration-500">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <w.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-xs font-mono text-primary/60">
                        STEP {w.step}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{w.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {w.desc}
                    </p>
                  </div>
                </div>

                {/* Center node */}
                <div
                  className={`hidden md:flex justify-center ${
                    i % 2 === 0 ? "md:col-start-2" : "md:col-start-2 md:row-start-1"
                  }`}
                >
                  <div className="relative w-14 h-14">
                    <svg viewBox="0 0 56 56" className="w-full h-full">
                      <circle
                        className="wf-node-ring"
                        cx="28"
                        cy="28"
                        r="24"
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="2"
                        opacity="0.6"
                      />
                    </svg>
                    <span className="wf-step-num absolute inset-0 flex items-center justify-center text-sm font-bold text-primary">
                      {w.step}
                    </span>

                    {/* Final step burst lines */}
                    {i === workflows.length - 1 && (
                      <svg
                        viewBox="0 0 56 56"
                        className="absolute inset-0 w-full h-full"
                      >
                        <path
                          className="wf-final-check"
                          d="M20,28 L25,33 L36,22"
                          fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity="0"
                        />
                        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                          <line
                            key={angle}
                            className="wf-burst-line"
                            x1="28"
                            y1="0"
                            x2="28"
                            y2="6"
                            stroke="hsl(var(--primary))"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            opacity="0"
                            transform={`rotate(${angle} 28 28)`}
                            style={{ transformOrigin: "28px 28px" }}
                          />
                        ))}
                      </svg>
                    )}
                  </div>
                </div>

                {/* Empty column for alternating layout */}
                {i % 2 === 0 && <div className="hidden md:block md:col-start-3" />}
                {i % 2 !== 0 && <div className="hidden md:block md:col-start-1 md:row-start-1" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
