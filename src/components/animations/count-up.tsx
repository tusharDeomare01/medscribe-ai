"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface CountUpProps {
  from?: number;
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  trigger?: boolean;
  separator?: boolean;
}

export default function CountUp({
  from = 0,
  to,
  duration = 2,
  prefix = "",
  suffix = "",
  className = "",
  trigger = true,
  separator = true,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(from);

  useEffect(() => {
    if (!ref.current) return;

    const obj = { val: from };

    const tweenConfig: gsap.TweenVars = {
      val: to,
      duration,
      ease: "power2.out",
      onUpdate: () => {
        setValue(Math.round(obj.val));
      },
    };

    if (trigger) {
      tweenConfig.scrollTrigger = {
        trigger: ref.current,
        start: "top 85%",
        toggleActions: "play none none reverse",
      };
    }

    const tween = gsap.to(obj, tweenConfig);

    return () => {
      tween.kill();
    };
  }, [from, to, duration, trigger]);

  const formatted = separator
    ? value.toLocaleString()
    : value.toString();

  return (
    <span ref={ref} className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
