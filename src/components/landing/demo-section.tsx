"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { FileText, Brain, Play, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cornerBracketPath } from "./svg-paths";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, ScrambleTextPlugin);
}

const soapNotes = [
  {
    letter: "S",
    label: "Subjective",
    text: "Patient reports acute onset chest pain and difficulty breathing.",
    color: "from-sky-500",
  },
  {
    letter: "O",
    label: "Objective",
    text: "ECG demonstrates ST elevation. Vitals pending review.",
    color: "from-emerald-500",
  },
  {
    letter: "A",
    label: "Assessment",
    text: "Acute myocardial infarction (I21.9) — high priority.",
    color: "from-amber-500",
  },
  {
    letter: "P",
    label: "Plan",
    text: "Continue Aspirin 325mg, Metoprolol 50mg. Urgent cardiology consult.",
    color: "from-violet-500",
  },
];

export function DemoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !cardRef.current) return;

    const ctx = gsap.context(() => {
      // ── Heading ───────────────────────────────────────────────
      gsap.fromTo(
        ".demo-heading-content",
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

      // ── Demo card 3D perspective entrance (more dramatic) ──────
      const card = cardRef.current!;
      gsap.set(card, {
        rotateX: 6,
        rotateY: -3,
        opacity: 0,
        y: 60,
        transformPerspective: 900,
      });

      const mainTl = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: "top 80%",
          once: true,
        },
      });

      mainTl.to(card, {
        rotateX: 0,
        rotateY: 0,
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
      });

      // ── Corner brackets DrawSVG ───────────────────────────────
      const brackets = gsap.utils.toArray<SVGPathElement>(".demo-bracket");
      gsap.set(brackets, { drawSVG: "0%", opacity: 0 });

      mainTl.to(
        brackets,
        {
          drawSVG: "100%",
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: "back.out(2)",
        },
        "-=0.6"
      );

      // ── Scan line sweep ───────────────────────────────────────
      const scanLine = sectionRef.current!.querySelector(".demo-scan-line");
      if (scanLine) {
        gsap.set(scanLine, { y: "-100%", opacity: 0 });
        mainTl.to(
          scanLine,
          { y: "100%", opacity: 0.3, duration: 0.8, ease: "power2.inOut" },
          "-=0.3"
        );
        mainTl.set(scanLine, { opacity: 0 });
      }

      // ── Demo text lines stagger (slightly wider spacing) ──────
      const textLines = gsap.utils.toArray<HTMLElement>(".demo-text-line");
      gsap.set(textLines, { y: 12, opacity: 0 });
      mainTl.to(
        textLines,
        {
          y: 0,
          opacity: 1,
          duration: 0.35,
          stagger: 0.06,
          ease: "power2.out",
        },
        "-=0.5"
      );

      // ── NER entity ScrambleText + highlight scale ─────────────
      const entities = gsap.utils.toArray<HTMLElement>(".ner-entity-label");
      entities.forEach((el, i) => {
        const originalText = el.dataset.entity || el.textContent || "";
        gsap.set(el, { opacity: 0 });

        mainTl.to(
          el,
          {
            opacity: 1,
            duration: 0.1,
          },
          `-=${i === 0 ? 0.2 : 0.05}`
        );

        mainTl.to(el, {
          scrambleText: {
            text: originalText,
            chars: "ACGT01#$%",
            speed: 0.5,
          },
          duration: 0.6,
          ease: "power2.inOut",
        });
      });

      // Entity highlight backgrounds scale in (synced with entities)
      const highlights = gsap.utils.toArray<HTMLElement>(".ner-highlight-bg");
      gsap.set(highlights, { scaleX: 0 });
      mainTl.to(
        highlights,
        {
          scaleX: 1,
          duration: 0.25,
          stagger: 0.1,
          ease: "back.out(1.2)",
        },
        "-=1.8"
      );

      // ── SOAP section slide up (cleaner offset) ────────────────
      const soapSections = gsap.utils.toArray<HTMLElement>(".soap-item");
      gsap.set(soapSections, { y: 30, opacity: 0 });
      mainTl.to(
        soapSections,
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.08,
          ease: "power2.out",
        },
        "-=1.2"
      );

      // ── SOAP underlines DrawSVG (tighter stagger) ────────────
      const soapUnderlines = gsap.utils.toArray<SVGLineElement>(".soap-underline");
      gsap.set(soapUnderlines, { drawSVG: "0%" });
      mainTl.to(
        soapUnderlines,
        {
          drawSVG: "100%",
          duration: 0.25,
          stagger: 0.06,
          ease: "power2.out",
        },
        "-=0.5"
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="demo" className="py-24 relative">
      <div className="max-w-6xl mx-auto px-6">
        {/* Heading */}
        <div className="demo-heading-content text-center mb-16">
          <Badge
            variant="outline"
            className="mb-4 px-3 py-1 text-xs border-primary/20 bg-primary/5 text-primary"
          >
            <Play className="w-3 h-3 mr-1" /> Live Preview
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            See It In Action
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Watch how MedScribe AI transforms raw clinical text into structured,
            actionable data
          </p>
        </div>

        {/* Demo Card with corner brackets */}
        <div className="relative">
          {/* SVG corner brackets overlay */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            viewBox="0 0 1000 600"
            preserveAspectRatio="none"
          >
            <path
              className="demo-bracket"
              d={cornerBracketPath("tl", 15, 15, 50)}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              className="demo-bracket"
              d={cornerBracketPath("tr", 985, 15, 50)}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              className="demo-bracket"
              d={cornerBracketPath("bl", 15, 585, 50)}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              className="demo-bracket"
              d={cornerBracketPath("br", 985, 585, 50)}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div
            ref={cardRef}
            className="relative rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/10"
          >
            {/* Scan line */}
            <div className="demo-scan-line absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent z-20 pointer-events-none" />

            {/* Window Chrome */}
            <div className="demo-text-line flex items-center justify-between px-5 py-3 border-b border-border/50 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
                <div className="hidden sm:flex items-center gap-2 ml-3 px-3 py-1 rounded-md bg-muted/30 text-xs text-muted-foreground">
                  <Stethoscope className="w-3 h-3" />
                  MedScribe AI — Clinical Notes
                </div>
              </div>
              <Badge
                variant="outline"
                className="text-xs border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                AI Processing
              </Badge>
            </div>

            {/* Demo Content */}
            <div className="p-6 md:p-10">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left: Input with NER */}
                <div>
                  <h4 className="demo-text-line text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <FileText className="w-4 h-4 text-primary" /> Clinical Note
                    Input
                  </h4>
                  <div className="demo-text-line rounded-xl bg-background/50 border border-border/50 p-5 font-mono text-[13px] leading-7">
                    <p className="text-muted-foreground">
                      Patient presents with{" "}
                      <span className="relative inline-block">
                        <span className="ner-highlight-bg absolute inset-0 bg-rose-500/15 rounded-md origin-left" />
                        <span
                          className="ner-entity-label relative px-1.5 py-0.5 text-rose-300 font-medium"
                          data-entity="chest pain"
                        >
                          chest pain
                        </span>
                      </span>{" "}
                      and{" "}
                      <span className="relative inline-block">
                        <span className="ner-highlight-bg absolute inset-0 bg-rose-500/15 rounded-md origin-left" />
                        <span
                          className="ner-entity-label relative px-1.5 py-0.5 text-rose-300 font-medium"
                          data-entity="shortness of breath"
                        >
                          shortness of breath
                        </span>
                      </span>
                      . Started on{" "}
                      <span className="relative inline-block">
                        <span className="ner-highlight-bg absolute inset-0 bg-sky-500/15 rounded-md origin-left" />
                        <span
                          className="ner-entity-label relative px-1.5 py-0.5 text-sky-300 font-medium"
                          data-entity="Aspirin 325mg"
                        >
                          Aspirin 325mg
                        </span>
                      </span>{" "}
                      and{" "}
                      <span className="relative inline-block">
                        <span className="ner-highlight-bg absolute inset-0 bg-sky-500/15 rounded-md origin-left" />
                        <span
                          className="ner-entity-label relative px-1.5 py-0.5 text-sky-300 font-medium"
                          data-entity="Metoprolol 50mg"
                        >
                          Metoprolol 50mg
                        </span>
                      </span>
                      .{" "}
                      <span className="relative inline-block">
                        <span className="ner-highlight-bg absolute inset-0 bg-emerald-500/15 rounded-md origin-left" />
                        <span
                          className="ner-entity-label relative px-1.5 py-0.5 text-emerald-300 font-medium"
                          data-entity="ECG"
                        >
                          ECG
                        </span>
                      </span>{" "}
                      shows ST elevation.{" "}
                      <span className="relative inline-block">
                        <span className="ner-highlight-bg absolute inset-0 bg-violet-500/15 rounded-md origin-left" />
                        <span
                          className="ner-entity-label relative px-1.5 py-0.5 text-violet-300 font-medium"
                          data-entity="Acute MI"
                        >
                          Acute MI
                        </span>
                      </span>{" "}
                      suspected.
                    </p>
                  </div>
                  <div className="demo-text-line flex flex-wrap gap-2 mt-4">
                    {[
                      { label: "Medications", color: "sky" },
                      { label: "Symptoms", color: "rose" },
                      { label: "Procedures", color: "emerald" },
                      { label: "Diagnoses", color: "violet" },
                    ].map((badge) => (
                      <Badge
                        key={badge.label}
                        variant="outline"
                        className={`text-xs border-${badge.color}-500/30 text-${badge.color}-400 bg-${badge.color}-500/10`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full bg-${badge.color}-400 mr-1.5`}
                        />
                        {badge.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Right: SOAP Output */}
                <div>
                  <h4 className="demo-text-line text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <Brain className="w-4 h-4 text-primary" /> AI-Generated SOAP
                    Note
                  </h4>
                  <div className="space-y-3">
                    {soapNotes.map((s) => (
                      <div
                        key={s.letter}
                        className="soap-item rounded-xl bg-background/50 border border-border/50 p-4 flex gap-4 hover:border-primary/20 transition-colors duration-300"
                      >
                        <div
                          className={`shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${s.color} to-transparent/20 flex items-center justify-center`}
                        >
                          <span className="text-sm font-bold text-white">
                            {s.letter}
                          </span>
                        </div>
                        <div>
                          <div className="relative inline-block mb-1">
                            <p className="text-xs font-semibold text-primary">
                              {s.label}
                            </p>
                            <svg className="w-full h-0.5 mt-0.5" viewBox="0 0 100 2">
                              <line
                                className="soap-underline"
                                x1="0"
                                y1="1"
                                x2="100"
                                y2="1"
                                stroke="hsl(var(--primary))"
                                strokeWidth="2"
                                opacity="0.4"
                              />
                            </svg>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {s.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
