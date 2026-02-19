"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { CustomBounce } from "gsap/CustomBounce";
import { PitchSlide } from "../pitch-slides";
import { CHECKMARK_PATH } from "../pitch-svg-paths";

interface SlideProps {
  slide: PitchSlide;
  isActive: boolean;
}

const DIFFERENTIATORS = [
  "Only platform with 20 AI endpoints",
  "Voice-first clinical workflow",
  "All-role coverage in one app",
];

export function SlideClose({ slide, isActive }: SlideProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);
  const burstTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const burstElementsRef = useRef<SVGElement[]>([]);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    ctxRef.current?.revert();
    if (burstTimerRef.current) clearTimeout(burstTimerRef.current);
    burstElementsRef.current.forEach((el) => el.remove());
    burstElementsRef.current = [];

    CustomBounce.create("btnBounce", { strength: 0.5, squash: 15, squashID: "btnSquash" });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Heading — SplitText with propIndex for CSS wave
      const heading = containerRef.current!.querySelector(".close-heading") as HTMLElement;
      if (heading) {
        const split = SplitText.create(heading, {
          type: "chars",
          mask: "chars",
        });

        // 3D flip entrance from mask
        tl.from(split.chars, {
          rotateX: 90,
          y: "100%",
          opacity: 0,
          duration: 0.6,
          stagger: 0.02,
          ease: "back.out(1.4)",
        }, 0);

        // After entrance, set up CSS custom properties for wave animation
        tl.call(() => {
          split.chars.forEach((char, i) => {
            (char as HTMLElement).style.setProperty("--char-index", String(i));
            (char as HTMLElement).classList.add("close-char-wave");
          });
        }, [], 0.8);
      }

      // Differentiator bullets
      DIFFERENTIATORS.forEach((text, i) => {
        const delay = 0.8 + i * 0.4;

        // Checkmark DrawSVG
        tl.fromTo(
          `.diff-check-${i}`,
          { drawSVG: "0%" },
          { drawSVG: "100%", duration: 0.3, ease: "power2.out" },
          delay
        );

        // Text ScrambleText decode
        const textEl = containerRef.current!.querySelector(`.diff-text-${i}`);
        if (textEl) {
          tl.to(textEl, {
            duration: 0.5,
            scrambleText: { text, chars: "upperCase", speed: 0.6 },
          }, delay + 0.1);
        }

        // Bullet fade
        tl.fromTo(
          `.diff-item-${i}`,
          { opacity: 0.3 },
          { opacity: 1, duration: 0.3 },
          delay
        );
      });

      // CTA Buttons — CustomBounce drop
      tl.fromTo(
        ".cta-btn-primary",
        { y: -60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.0, ease: "btnBounce" },
        2.0
      );
      tl.fromTo(
        ".cta-btn-primary",
        { scaleX: 1, scaleY: 1 },
        { scaleX: 1.15, scaleY: 0.85, duration: 1.0, ease: "btnSquash" },
        2.0
      );

      tl.fromTo(
        ".cta-btn-secondary",
        { y: -60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.0, ease: "btnBounce" },
        2.2
      );
      tl.fromTo(
        ".cta-btn-secondary",
        { scaleX: 1, scaleY: 1 },
        { scaleX: 1.15, scaleY: 0.85, duration: 1.0, ease: "btnSquash" },
        2.2
      );

      // Idle: button glow pulse
      gsap.to(".cta-btn-primary", {
        scale: 1.03,
        duration: 1.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 3.5,
      });
    }, containerRef);

    ctxRef.current = ctx;

    // Celebration burst — outside gsap.context, managed by ref for cleanup
    burstTimerRef.current = setTimeout(() => {
      if (!containerRef.current) return;
      const burstContainer = containerRef.current.querySelector(".close-burst");
      if (!burstContainer) return;

      const shapes = ["circle", "rect", "circle"];
      const colors = [slide.accentColor, "#f59e0b", "#3b82f6", "#10b981", "#ec4899"];

      for (let i = 0; i < 40; i++) {
        const shapeType = shapes[i % shapes.length];
        const el = document.createElementNS("http://www.w3.org/2000/svg", shapeType);
        const color = colors[i % colors.length];

        if (shapeType === "circle") {
          el.setAttribute("cx", "250");
          el.setAttribute("cy", "250");
          el.setAttribute("r", String(2 + Math.random() * 3));
          el.setAttribute("fill", color);
        } else {
          el.setAttribute("x", "248");
          el.setAttribute("y", "248");
          el.setAttribute("width", String(3 + Math.random() * 4));
          el.setAttribute("height", String(3 + Math.random() * 4));
          el.setAttribute("rx", "1");
          el.setAttribute("fill", color);
        }

        burstContainer.appendChild(el);
        burstElementsRef.current.push(el);

        gsap.to(el, {
          physics2D: {
            velocity: 200 + Math.random() * 300,
            angle: Math.random() * 360,
            gravity: 50,
          },
          opacity: 0,
          duration: 2.5 + Math.random(),
          ease: "none",
          onComplete: () => {
            el.remove();
            burstElementsRef.current = burstElementsRef.current.filter((e) => e !== el);
          },
        });
      }
    }, 2500);

    return () => {
      ctx.revert();
      if (burstTimerRef.current) {
        clearTimeout(burstTimerRef.current);
        burstTimerRef.current = null;
      }
      burstElementsRef.current.forEach((el) => {
        gsap.killTweensOf(el);
        el.remove();
      });
      burstElementsRef.current = [];
    };
  }, [isActive, slide.accentColor]);

  return (
    <div ref={containerRef} className="w-full max-w-4xl mx-auto flex flex-col items-center gap-8 relative">
      {/* Celebration SVG container */}
      <svg className="close-burst absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 500" />

      {/* CSS wave animation style */}
      <style dangerouslySetInnerHTML={{ __html: `
        .close-char-wave {
          animation: colorWave 3s ease-in-out infinite;
          animation-delay: calc(var(--char-index, 0) * 80ms);
        }
        @keyframes colorWave {
          0%, 100% { color: hsl(var(--foreground)); }
          50% { color: ${slide.accentColor}; text-shadow: 0 0 20px ${slide.accentColor}66; }
        }
      `}} />

      {/* Heading */}
      <h1 className="close-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground text-center leading-tight">
        Ready to Transform Healthcare?
      </h1>

      {/* Differentiators */}
      <div className="flex flex-col gap-4 mt-4">
        {DIFFERENTIATORS.map((text, i) => (
          <div
            key={text}
            className={`diff-item-${i} flex items-center gap-3`}
            style={{ opacity: 0.3 }}
          >
            <svg viewBox="0 0 100 100" className="w-6 h-6 flex-shrink-0">
              <path
                className={`diff-check-${i}`}
                d={CHECKMARK_PATH}
                fill="none"
                stroke={slide.accentColor}
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className={`diff-text-${i} text-lg text-foreground`}>&nbsp;</span>
          </div>
        ))}
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <a
          href="/register"
          className="cta-btn-primary inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-lg font-semibold text-white transition-all duration-300"
          style={{
            backgroundColor: slide.accentColor,
            boxShadow: `0 8px 32px ${slide.accentColor}40`,
            transformOrigin: "center bottom",
          }}
        >
          Try the Demo →
        </a>
        <button
          className="cta-btn-secondary inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-lg font-semibold border-2 transition-all duration-300"
          style={{
            borderColor: `${slide.accentColor}50`,
            color: slide.accentColor,
            transformOrigin: "center bottom",
          }}
          onClick={() => {
            // Could trigger the tour
            window.location.href = "/dashboard";
          }}
        >
          Take the Guided Tour →
        </button>
      </div>

      <p className="text-sm text-muted-foreground text-center mt-4">
        See it in action — no sign-up required
      </p>
    </div>
  );
}
