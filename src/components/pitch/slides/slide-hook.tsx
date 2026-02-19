"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { PitchSlide } from "../pitch-slides";
import { generateEKGPath } from "../pitch-ekg-path";

interface SlideProps {
  slide: PitchSlide;
  isActive: boolean;
}

export function SlideHook({ slide, isActive }: SlideProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);
  const ekgPath = useRef(generateEKGPath(900, 80, 4, 30)).current;

  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    ctxRef.current?.revert();

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // EKG heartbeat sliding window animation
      const ekgEl = containerRef.current!.querySelector(".ekg-line");
      if (ekgEl) {
        gsap.set(ekgEl, { drawSVG: "0% 6%" });
        gsap.to(ekgEl, {
          drawSVG: "94% 100%",
          duration: 3.2,
          ease: "none",
          repeat: -1,
        });
      }

      // EKG glow trail
      const ekgGlow = containerRef.current!.querySelector(".ekg-glow");
      if (ekgGlow) {
        gsap.set(ekgGlow, { drawSVG: "0% 4%" });
        gsap.to(ekgGlow, {
          drawSVG: "96% 100%",
          duration: 3.2,
          ease: "none",
          repeat: -1,
          delay: 0.05,
        });
      }

      // Heading text — SplitText with char mask (3D flip reveal)
      const heading = containerRef.current!.querySelector(".hook-heading");
      if (heading) {
        const split = SplitText.create(heading, {
          type: "chars",
          mask: "chars",
        });
        tl.from(split.chars, {
          rotateX: 90,
          y: "100%",
          opacity: 0,
          duration: 0.6,
          stagger: 0.025,
          ease: "back.out(1.4)",
        }, 0.5);
      }

      // "2 hours" highlight underline
      tl.fromTo(
        ".hook-underline",
        { drawSVG: "0%" },
        { drawSVG: "100%", duration: 0.5, ease: "power2.out" },
        1.5
      );

      // Highlight background scale
      tl.fromTo(
        ".hook-highlight",
        { scaleX: 0, transformOrigin: "left center" },
        { scaleX: 1, duration: 0.4, ease: "back.out(1.2)" },
        1.3
      );

      // Floating particles
      const particleContainer = containerRef.current!.querySelector(".hook-particles");
      if (particleContainer) {
        for (let i = 0; i < 6; i++) {
          const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          circle.setAttribute("r", String(1.5 + Math.random() * 2));
          circle.setAttribute("fill", slide.accentColor);
          circle.setAttribute("opacity", "0.4");
          circle.setAttribute("cx", String(Math.random() * 900));
          circle.setAttribute("cy", String(Math.random() * 80));
          particleContainer.appendChild(circle);

          gsap.to(circle, {
            physics2D: {
              velocity: 15 + Math.random() * 20,
              angle: Math.random() * 360,
              gravity: 0,
            },
            duration: 10,
            repeat: -1,
            opacity: 0,
          });
        }
      }
    }, containerRef);

    ctxRef.current = ctx;
    return () => { ctx.revert(); };
  }, [isActive, ekgPath, slide.accentColor]);

  return (
    <div ref={containerRef} className="w-full max-w-4xl mx-auto flex flex-col items-center gap-8">
      {/* EKG Visualization */}
      <svg viewBox="0 0 900 80" className="w-full max-w-3xl" preserveAspectRatio="xMidYMid meet">
        <g className="hook-particles" />
        <path
          className="ekg-glow"
          d={ekgPath}
          fill="none"
          stroke={slide.accentColor}
          strokeWidth="6"
          opacity="0.15"
          strokeLinecap="round"
        />
        <path
          className="ekg-line"
          d={ekgPath}
          fill="none"
          stroke={slide.accentColor}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <defs>
          <filter id="sparkGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Question Text */}
      <div className="text-center relative">
        <h1 className="hook-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
          What if AI could give doctors{" "}
          <span className="relative inline-block">
            <span className="relative z-10">2 hours</span>
            <span
              className="hook-highlight absolute inset-0 -inset-x-2 rounded"
              style={{ backgroundColor: `${slide.accentColor}20` }}
            />
          </span>{" "}
          back every day?
        </h1>
        <svg className="absolute bottom-0 left-0 w-full h-3 overflow-visible" viewBox="0 0 800 12">
          <line
            className="hook-underline"
            x1="280" y1="10" x2="440" y2="10"
            stroke={slide.accentColor}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <p className="text-lg text-muted-foreground text-center">{slide.subtitle}</p>
    </div>
  );
}
