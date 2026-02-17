"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
  trigger?: boolean;
}

export default function BlurText({
  text,
  className = "",
  delay = 0,
  duration = 0.8,
  stagger = 0.04,
  trigger = false,
}: BlurTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const words = containerRef.current.querySelectorAll(".blur-word");

    const config: gsap.TweenVars = {
      opacity: 0,
      filter: "blur(12px)",
      y: 20,
      duration,
      stagger,
      delay,
      ease: "power2.out",
    };

    if (trigger) {
      config.scrollTrigger = {
        trigger: containerRef.current,
        start: "top 85%",
        toggleActions: "play none none reverse",
      };
    }

    const tween = gsap.from(words, config);

    return () => {
      tween.kill();
    };
  }, [text, delay, duration, stagger, trigger]);

  return (
    <div ref={containerRef} className={`inline-flex flex-wrap gap-x-[0.3em] ${className}`}>
      {text.split(" ").map((word, i) => (
        <span key={`${word}-${i}`} className="blur-word inline-block">
          {word}
        </span>
      ))}
    </div>
  );
}
