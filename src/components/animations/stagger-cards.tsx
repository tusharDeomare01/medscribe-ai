"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface StaggerCardsProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  duration?: number;
  direction?: "up" | "left" | "right";
}

export default function StaggerCards({
  children,
  className = "",
  stagger = 0.12,
  duration = 0.7,
  direction = "up",
}: StaggerCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const items = containerRef.current.children;

    const fromVars: gsap.TweenVars = {
      opacity: 0,
      duration,
      stagger,
      ease: "back.out(1.4)",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    };

    if (direction === "up") {
      fromVars.y = 60;
    } else if (direction === "left") {
      fromVars.x = -60;
    } else if (direction === "right") {
      fromVars.x = 60;
    }

    const tween = gsap.from(items, fromVars);

    return () => {
      tween.kill();
    };
  }, [stagger, duration, direction]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
