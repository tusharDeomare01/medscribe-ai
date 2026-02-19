"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";
import { Zap, Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EASE_HEARTBEAT } from "./landing-eases";

if (typeof window !== "undefined") {
  gsap.registerPlugin(
    ScrollTrigger,
    DrawSVGPlugin,
    SplitText,
    ScrambleTextPlugin,
    Physics2DPlugin
  );
}

export function CtaSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const particleRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 65%",
          once: true,
        },
      });

      // ── Glow ring heartbeat pulse (wider range, faster) ───────
      if (glowRef.current) {
        gsap.fromTo(
          glowRef.current,
          { scale: 0.75, opacity: 0.25 },
          {
            scale: 1.15,
            opacity: 0.55,
            duration: 1,
            repeat: -1,
            yoyo: true,
            ease: EASE_HEARTBEAT,
          }
        );
      }

      // ── Badge entrance ────────────────────────────────────────
      tl.fromTo(
        ".cta-badge",
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" }
      );

      // ── SplitText heading char reveal (tighter stagger) ───────
      if (headingRef.current) {
        const split = new SplitText(headingRef.current, {
          type: "chars",
        });
        gsap.set(split.chars, { y: 40, opacity: 0 });
        tl.to(
          split.chars,
          {
            y: 0,
            opacity: 1,
            duration: 0.45,
            stagger: 0.02,
            ease: "power3.out",
          },
          "-=0.2"
        );
      }

      // ── Subtitle ScrambleText ─────────────────────────────────
      if (subtitleRef.current) {
        const originalText = subtitleRef.current.textContent || "";
        tl.fromTo(
          subtitleRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.2 },
          "-=0.3"
        );
        tl.to(subtitleRef.current, {
          scrambleText: {
            text: originalText,
            chars: "01!<>{}/_\\",
            speed: 0.4,
          },
          duration: 0.8,
          ease: "power2.inOut",
        });
      }

      // ── CTA button entrance (smoother ease) ────────────────────
      tl.fromTo(
        ".cta-buttons",
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.4)" },
        "-=0.4"
      );

      // ── DrawSVG accent lines ──────────────────────────────────
      const accentLines = gsap.utils.toArray<SVGLineElement>(".cta-accent-line");
      gsap.set(accentLines, { drawSVG: "0%" });
      tl.to(
        accentLines,
        {
          drawSVG: "100%",
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
        },
        "-=0.3"
      );

      // ── Physics2D particle burst (tighter spread, less gravity) ──
      if (particleRef.current) {
        const container = particleRef.current;

        tl.call(
          () => {
            const count = 18;
            for (let i = 0; i < count; i++) {
              const dot = document.createElement("div");
              dot.className =
                "absolute w-1.5 h-1.5 rounded-full bg-primary/50";
              dot.style.left = "50%";
              dot.style.top = "50%";
              container.appendChild(dot);

              gsap.to(dot, {
                physics2D: {
                  velocity: 350 + Math.random() * 100,
                  angle: Math.random() * 360,
                  gravity: 100,
                },
                opacity: 0,
                duration: 1 + Math.random() * 0.3,
                ease: "power2.out",
                onComplete: () => dot.remove(),
              });
            }
          },
          [],
          "-=0.4"
        );
      }

      // ── Powered-by text ───────────────────────────────────────
      tl.fromTo(
        ".cta-powered",
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
        "-=0.8"
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 relative overflow-hidden">
      {/* Heartbeat glow ring */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div
          ref={glowRef}
          className="w-[800px] h-[400px] rounded-full bg-primary/8"
          style={{ filter: "blur(120px)" }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="cta-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-8">
          <Heart className="w-4 h-4 fill-current" />
          Built for the Thinkitive AI Healthcare Competition
        </div>

        {/* Accent lines + heading */}
        <div className="relative mb-6">
          {/* Left accent line */}
          <svg
            className="absolute left-0 top-1/2 -translate-y-1/2 w-16 h-0.5 hidden md:block"
            viewBox="0 0 64 2"
          >
            <line
              className="cta-accent-line"
              x1="0"
              y1="1"
              x2="64"
              y2="1"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.4"
            />
          </svg>
          {/* Right accent line */}
          <svg
            className="absolute right-0 top-1/2 -translate-y-1/2 w-16 h-0.5 hidden md:block"
            viewBox="0 0 64 2"
          >
            <line
              className="cta-accent-line"
              x1="0"
              y1="1"
              x2="64"
              y2="1"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.4"
            />
          </svg>

          <h2
            ref={headingRef}
            className="text-3xl md:text-5xl font-bold tracking-tight"
          >
            Ready to Transform Clinical Documentation?
          </h2>
        </div>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-lg text-muted-foreground mb-4 max-w-xl mx-auto opacity-0"
        >
          Join the future of healthcare AI. Start documenting smarter, not
          harder.
        </p>

        {/* Powered by */}
        <p className="cta-powered text-sm text-muted-foreground/60 mb-10">
          Powered by cutting-edge Gemini AI technology
        </p>

        {/* Particle burst container */}
        <div
          ref={particleRef}
          className="absolute inset-0 pointer-events-none overflow-hidden"
        />

        {/* CTA Buttons */}
        <div className="cta-buttons flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button
              size="lg"
              className="text-base px-10 h-13 gap-2 shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-300"
            >
              <Zap className="w-4 h-4" /> Get Started Now
            </Button>
          </Link>
          <Link href="/login">
            <Button
              variant="outline"
              size="lg"
              className="text-base px-10 h-13 gap-2 border-border/50 hover:border-primary/30 transition-all duration-300"
            >
              <Users className="w-4 h-4" /> Sign In
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
