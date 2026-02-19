"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { SplitText } from "gsap/SplitText";
import {
  Mic,
  Brain,
  Upload,
  MessageSquare,
  Activity,
  Shield,
  Star,
} from "lucide-react";
import StarBorder from "@/components/StarBorder";
import { MEDICAL_ICONS, FEATURE_ICON_ORDER } from "./svg-paths";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, MorphSVGPlugin, SplitText);
}

const features = [
  {
    icon: Mic,
    title: "Voice-to-SOAP Notes",
    description:
      "Dictate clinical notes and let AI convert them into structured SOAP format instantly with medical terminology recognition.",
    color: "#0ea5e9",
  },
  {
    icon: Brain,
    title: "Medical NER Extraction",
    description:
      "Auto-detect medications, diagnoses, procedures, symptoms, and lab results with color-coded entity highlighting.",
    color: "#8b5cf6",
  },
  {
    icon: Upload,
    title: "Report Intelligence",
    description:
      "Upload lab reports — AI extracts values, flags abnormals, and explains findings in plain English for patients.",
    color: "#10b981",
  },
  {
    icon: MessageSquare,
    title: "AI Clinical Assistant",
    description:
      "Chat with an AI that understands medical context. Get instant answers with real-time streaming responses.",
    color: "#f59e0b",
  },
  {
    icon: Activity,
    title: "Analytics Dashboard",
    description:
      "Interactive charts tracking patient records, note processing, entity extraction stats, and AI performance metrics.",
    color: "#ef4444",
  },
  {
    icon: Shield,
    title: "Secure & Compliant",
    description:
      "JWT-based authentication, role-based access control, and audit-ready design for healthcare data protection.",
    color: "#06b6d4",
  },
];

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !trackRef.current) return;

    const ctx = gsap.context(() => {
      const track = trackRef.current!;
      const cards = gsap.utils.toArray<HTMLElement>(".feature-card");
      const totalScroll = track.scrollWidth - window.innerWidth;

      // ── Section heading SplitText reveal ──────────────────────
      if (headingRef.current) {
        const split = new SplitText(headingRef.current, {
          type: "lines",
          mask: "lines",
        });
        gsap.set(split.lines, { y: 50, opacity: 0 });
        gsap.to(split.lines, {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            once: true,
          },
        });
      }

      // ── Horizontal scroll ─────────────────────────────────────
      const scrollTween = gsap.to(track, {
        x: -totalScroll,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${totalScroll}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          snap: {
            snapTo: 1 / (features.length - 1),
            duration: 0.3,
            ease: "power1.inOut",
          },
        },
      });

      // ── MorphSVG icon transitions synced to scroll (wider trigger window) ──
      const morphTarget = sectionRef.current!.querySelector(".morph-icon-path");
      if (morphTarget) {
        FEATURE_ICON_ORDER.forEach((key, i) => {
          if (i === 0) return; // First icon is already set
          const progress = i / (FEATURE_ICON_ORDER.length - 1);
          const pathData = MEDICAL_ICONS[key];
          if (!pathData) return;

          ScrollTrigger.create({
            trigger: sectionRef.current,
            start: "top top",
            end: () => `+=${totalScroll}`,
            onUpdate: (self) => {
              const prevProgress = (i - 1) / (FEATURE_ICON_ORDER.length - 1);
              if (
                self.progress >= prevProgress &&
                self.progress < progress + 0.05
              ) {
                gsap.to(morphTarget, {
                  morphSVG: pathData,
                  duration: 0.6,
                  ease: "power2.inOut",
                  overwrite: "auto",
                });
              }
            },
          });
        });
      }

      // ── Per-card entrance (staggered icon draw after card reveal) ──
      cards.forEach((card) => {
        const iconPath = card.querySelector(".card-icon-path");
        if (iconPath) {
          gsap.set(iconPath, { drawSVG: "0%" });
        }

        gsap.fromTo(
          card,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "left 85%",
              containerAnimation: scrollTween,
              once: true,
              onEnter: () => {
                if (iconPath) {
                  gsap.to(iconPath, {
                    drawSVG: "100%",
                    duration: 0.5,
                    delay: 0.15,
                    ease: "power2.out",
                  });
                }
              },
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const firstIconKey = FEATURE_ICON_ORDER[0];
  const firstIconPath = MEDICAL_ICONS[firstIconKey];

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative overflow-hidden"
    >
      {/* Header area */}
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-12">
        <div className="text-center mb-8">
          <StarBorder
            as="div"
            color="hsl(var(--primary))"
            speed="8s"
            className="inline-flex mb-4 px-3 py-1 text-xs"
          >
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-primary" />
              <span className="text-primary">Core Features</span>
            </div>
          </StarBorder>
          <h2
            ref={headingRef}
            className="text-3xl md:text-5xl font-bold tracking-tight mb-4"
          >
            Everything Clinicians Need
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            One platform to document, analyze, and understand — powered by
            Google Gemini AI
          </p>
        </div>

        {/* Morphing icon (visible on larger screens) */}
        <div className="hidden md:flex justify-center mb-8">
          <svg
            viewBox="0 0 24 24"
            className="w-16 h-16 text-primary"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path className="morph-icon-path" d={firstIconPath} />
          </svg>
        </div>
      </div>

      {/* Horizontal scroll track */}
      <div ref={trackRef} className="flex gap-6 pl-6 pr-[30vw] md:pr-[40vw] py-8">
        {features.map((feature, i) => (
          <div
            key={feature.title}
            className="feature-card shrink-0 w-[85vw] sm:w-[400px] rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-8 hover:border-primary/30 transition-all duration-500"
          >
            {/* Card icon with DrawSVG ring */}
            <div className="relative w-16 h-16 mb-6">
              <svg viewBox="0 0 64 64" className="w-full h-full">
                <circle
                  className="card-icon-path"
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke={feature.color}
                  strokeWidth="2"
                  opacity="0.5"
                />
              </svg>
              <div
                className="absolute inset-0 flex items-center justify-center rounded-xl"
                style={{ backgroundColor: `${feature.color}15` }}
              >
                <feature.icon
                  className="w-7 h-7"
                  style={{ color: feature.color }}
                />
              </div>
            </div>

            {/* Step indicator */}
            <div
              className="text-xs font-mono mb-2 opacity-50"
              style={{ color: feature.color }}
            >
              {String(i + 1).padStart(2, "0")}
            </div>

            <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
