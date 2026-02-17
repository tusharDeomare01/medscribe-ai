"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
  trigger?: boolean; // use scroll trigger
  tag?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
}

export default function SplitText({
  text,
  className = "",
  delay = 0,
  duration = 0.6,
  stagger = 0.03,
  trigger = false,
  tag: Tag = "div",
}: SplitTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chars = containerRef.current.querySelectorAll(".split-char");

    const config: gsap.TweenVars = {
      y: 40,
      opacity: 0,
      duration,
      stagger,
      delay,
      ease: "power3.out",
    };

    if (trigger) {
      config.scrollTrigger = {
        trigger: containerRef.current,
        start: "top 85%",
        toggleActions: "play none none reverse",
      };
    }

    const tween = gsap.from(chars, config);

    return () => {
      tween.kill();
    };
  }, [text, delay, duration, stagger, trigger]);

  return (
    <Tag ref={containerRef as React.RefObject<HTMLDivElement>} className={`inline-flex flex-wrap ${className}`}>
      {text.split("").map((char, i) => (
        <span
          key={`${char}-${i}`}
          className="split-char inline-block"
          style={{ whiteSpace: char === " " ? "pre" : undefined }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </Tag>
  );
}
