"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Stethoscope } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);
}

export function FooterSection() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!footerRef.current) return;

    const ctx = gsap.context(() => {
      // ── Divider line DrawSVG (faster, unified trigger) ─────────
      const divider = footerRef.current!.querySelector(".footer-divider");
      if (divider) {
        gsap.set(divider, { drawSVG: "0%" });
        gsap.to(divider, {
          drawSVG: "100%",
          duration: 0.6,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 85%",
            once: true,
          },
        });
      }

      // ── Footer columns stagger in (unified trigger, tighter stagger) ──
      const columns = gsap.utils.toArray<HTMLElement>(".footer-col");
      gsap.set(columns, { y: 25, opacity: 0 });
      gsap.to(columns, {
        y: 0,
        opacity: 1,
        duration: 0.4,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 85%",
          once: true,
        },
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="relative py-8 bg-muted/5">
      {/* DrawSVG divider line */}
      <svg
        className="absolute top-0 left-0 w-full h-px"
        viewBox="0 0 1000 2"
        preserveAspectRatio="none"
      >
        <line
          className="footer-divider"
          x1="0"
          y1="1"
          x2="1000"
          y2="1"
          stroke="hsl(var(--border))"
          strokeWidth="2"
          opacity="0.5"
        />
      </svg>

      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo */}
        <div className="footer-col flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm">MedScribe AI</span>
        </div>

        {/* Disclaimer */}
        <p className="footer-col text-xs text-muted-foreground text-center max-w-md">
          AI-generated content is for informational purposes only. Not a
          substitute for professional medical advice, diagnosis, or treatment.
        </p>

        {/* Copyright */}
        <p className="footer-col text-xs text-muted-foreground">
          &copy; 2026 Thinkitive Technologies
        </p>
      </div>
    </footer>
  );
}
