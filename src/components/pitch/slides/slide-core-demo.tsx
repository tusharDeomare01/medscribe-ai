"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { PitchSlide } from "../pitch-slides";
import { generateWaveformBars } from "../pitch-svg-paths";

interface SlideProps {
  slide: PitchSlide;
  isActive: boolean;
}

const TERMINAL_LINES = [
  "→ Initializing voice capture...",
  "→ Transcribing audio stream...",
  "→ Running NER extraction...",
  "→ Generating SOAP note...",
];

const NER_ENTITIES = [
  { label: "Diagnosis", value: "Hypertension", color: "#ef4444" },
  { label: "Medication", value: "Lisinopril 10mg", color: "#3b82f6" },
  { label: "Procedure", value: "BP Check", color: "#10b981" },
];

const SOAP_SECTIONS = ["Subjective", "Objective", "Assessment", "Plan"];

export function SlideCoreDemo({ slide, isActive }: SlideProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);
  const waveformBars = useRef(generateWaveformBars(24, 0, 40, 200, 35)).current;

  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    ctxRef.current?.revert();

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Terminal border DrawSVG
      tl.fromTo(".terminal-border", { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.5, ease: "power2.out" }, 0);
      tl.fromTo(".terminal-titlebar", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.3);

      // Waveform bars
      tl.fromTo(".waveform-bar", { scaleY: 0, transformOrigin: "center center" }, { scaleY: 1, duration: 0.3, stagger: 0.02, ease: "power2.out" }, 0.3);

      // Waveform idle pulsing
      const bars = gsap.utils.toArray<SVGRectElement>(".waveform-bar");
      bars.forEach((bar, i) => {
        gsap.to(bar, {
          scaleY: 0.3 + Math.random() * 0.7,
          duration: 0.3 + Math.random() * 0.3,
          ease: "sine.inOut",
          yoyo: true, repeat: -1, delay: i * 0.05,
        });
      });

      // Terminal lines — TextPlugin typewriter
      TERMINAL_LINES.forEach((line, i) => {
        const el = containerRef.current!.querySelector(`.term-line-${i}`);
        if (el) {
          tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.5 + i * 1.0);
          tl.to(el, { duration: 0.8, text: { value: line } }, 0.6 + i * 1.0);
        }
      });

      // Pipeline nodes
      tl.fromTo(".pipeline-node", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, stagger: 0.8, ease: "back.out(2)" }, 0.8);
      tl.fromTo(".pipeline-line", { drawSVG: "0%" }, { drawSVG: "100%", duration: 2.5, ease: "power2.out" }, 1.0);

      // NER entities
      NER_ENTITIES.forEach((entity, i) => {
        tl.to(`.ner-${i}`, {
          duration: 0.5,
          scrambleText: { text: `${entity.label}: ${entity.value}`, chars: "ACGT01", speed: 0.5 },
        }, 3.0 + i * 0.4);
        tl.fromTo(`.ner-bg-${i}`, { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: 0.3, ease: "back.out(1.2)" }, 3.0 + i * 0.4);
      });

      // SOAP sections
      tl.fromTo(".soap-section", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, stagger: 0.1, ease: "power2.out" }, 4.0);
      tl.fromTo(".soap-underline", { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.3, stagger: 0.08, ease: "power2.out" }, 4.2);

      // Completion message
      tl.to(".term-complete", { duration: 0.6, text: { value: "✓ Clinical note generated successfully" } }, 4.5);
    }, containerRef);

    ctxRef.current = ctx;
    return () => { ctx.revert(); };
  }, [isActive, waveformBars, slide.accentColor]);

  return (
    <div ref={containerRef} className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: Terminal + Waveform */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${slide.accentColor}20` }}>
            <span className="text-lg">🎤</span>
          </div>
          <svg viewBox="0 0 200 80" className="flex-1 h-16">
            {waveformBars.map((bar, i) => (
              <rect key={i} className="waveform-bar" x={bar.x} y={bar.y} width={6} height={bar.height} rx="3" fill={slide.accentColor} opacity="0.7" />
            ))}
          </svg>
        </div>

        <div className="relative bg-gray-950 rounded-xl overflow-hidden border border-gray-800">
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <rect className="terminal-border" x="0" y="0" width="100%" height="100%" rx="12" fill="none" stroke={slide.accentColor} strokeWidth="1" opacity="0.3" />
          </svg>
          <div className="terminal-titlebar flex items-center gap-2 px-4 py-2.5 border-b border-gray-800">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            </div>
            <span className="text-xs text-gray-500 ml-2 font-mono">MedScribe AI v2.0</span>
          </div>
          <div className="p-4 font-mono text-sm space-y-1.5 min-h-[180px]">
            {TERMINAL_LINES.map((_, i) => (
              <div key={i} className={`term-line-${i} text-green-400`} style={{ opacity: 0 }}>&nbsp;</div>
            ))}
            <div className="term-complete text-emerald-300 mt-3">&nbsp;</div>
          </div>
        </div>
      </div>

      {/* Right: Results */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between px-4">
          {["🎤", "📝", "🏷️", "📋"].map((icon, i) => (
            <div key={i} className="pipeline-node w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${slide.accentColor}15`, border: `1px solid ${slide.accentColor}30` }}>
              {icon}
            </div>
          ))}
        </div>
        <svg viewBox="0 0 400 10" className="w-full h-2.5 -mt-4 px-8">
          <line className="pipeline-line" x1="30" y1="5" x2="370" y2="5" stroke={slide.accentColor} strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" />
        </svg>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">NER Extraction</h3>
          {NER_ENTITIES.map((entity, i) => (
            <div key={entity.label} className="relative">
              <div className={`ner-bg-${i} absolute inset-0 rounded-lg`} style={{ backgroundColor: `${entity.color}15` }} />
              <div className={`ner-${i} relative px-3 py-2 font-mono text-sm`} style={{ color: entity.color }}>&nbsp;</div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">SOAP Note</h3>
          {SOAP_SECTIONS.map((section) => (
            <div key={section} className="soap-section relative">
              <span className="text-sm font-semibold" style={{ color: slide.accentColor }}>{section}</span>
              <svg className="w-full h-px mt-1"><line className="soap-underline" x1="0" y1="0" x2="100%" y2="0" stroke={slide.accentColor} strokeWidth="1" opacity="0.5" /></svg>
              <p className="text-xs text-muted-foreground mt-1">AI-generated clinical documentation...</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
