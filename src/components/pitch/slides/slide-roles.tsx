"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { PitchSlide, ROLES } from "../pitch-slides";
import { ROLE_ICONS, ROLE_ICON_ORDER } from "../pitch-svg-paths";

interface SlideProps {
  slide: PitchSlide;
  isActive: boolean;
}

export function SlideRoles({ slide, isActive }: SlideProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);
  const morphTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [activeRole, setActiveRole] = useState(0);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    ctxRef.current?.revert();
    if (morphTimerRef.current) clearInterval(morphTimerRef.current);
    setActiveRole(0);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Title entrance
      tl.fromTo(
        ".roles-title",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
        0
      );

      // Central morph icon — DrawSVG self-draw first shape
      tl.fromTo(
        ".morph-path",
        { drawSVG: "0%" },
        { drawSVG: "100%", duration: 0.8, ease: "power2.out" },
        0.2
      );

      // After draw completes, set the path to be fully visible for morphing
      tl.set(".morph-path", { drawSVG: "0% 100%" }, 1.0);

      // Glow ring pulse
      tl.fromTo(
        ".morph-glow-ring",
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 0.3, duration: 0.5, ease: "power2.out" },
        0.4
      );

      // Role cards float in
      const cards = gsap.utils.toArray<HTMLElement>(".role-card");
      cards.forEach((card, i) => {
        const angles = [-30, 30, -150, 150];
        tl.fromTo(
          card,
          { x: Math.cos((angles[i] * Math.PI) / 180) * 200, y: Math.sin((angles[i] * Math.PI) / 180) * 200, opacity: 0 },
          { x: 0, y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
          0.3 + i * 0.15
        );
      });

      // Card border DrawSVG traces
      tl.fromTo(
        ".role-card-border",
        { drawSVG: "0%" },
        { drawSVG: "100%", duration: 0.5, stagger: 0.15, ease: "power2.out" },
        1.0
      );

      // Feature bullets stagger in
      tl.fromTo(
        ".role-feature",
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, stagger: 0.06, ease: "power2.out" },
        1.2
      );

      // Role name ScrambleText decode
      const roleNames = gsap.utils.toArray<HTMLElement>(".role-name-text");
      roleNames.forEach((el, i) => {
        tl.to(el, {
          duration: 0.5,
          scrambleText: { text: ROLES[i].name, chars: "upperCase", speed: 0.6 },
        }, 1.0 + i * 0.15);
      });

      // Feature count tween
      ROLES.forEach((role, i) => {
        const countEl = containerRef.current!.querySelector(`.role-count-${i}`);
        if (countEl) {
          const obj = { val: 0 };
          tl.to(obj, {
            val: role.featureCount,
            duration: 0.8,
            ease: "power2.out",
            onUpdate: () => { countEl.textContent = `${Math.round(obj.val)} AI features`; },
          }, 1.2 + i * 0.1);
        }
      });
    }, containerRef);

    ctxRef.current = ctx;

    // Morph sequence — auto-cycle through roles (outside gsap.context, managed by ref)
    const morphPath = containerRef.current.querySelector(".morph-path") as SVGPathElement;
    if (morphPath) {
      let morphIndex = 0;
      morphTimerRef.current = setInterval(() => {
        morphIndex = (morphIndex + 1) % ROLE_ICON_ORDER.length;
        setActiveRole(morphIndex);

        const nextPath = ROLE_ICONS[ROLE_ICON_ORDER[morphIndex]];
        gsap.to(morphPath, {
          morphSVG: { shape: nextPath, type: "rotational", origin: "50% 50%" },
          duration: 1.2,
          ease: "power2.inOut",
        });

        // Glow ring pulses during morph
        gsap.fromTo(
          ".morph-glow-ring",
          { scale: 0.9, opacity: 0.15 },
          { scale: 1.1, opacity: 0.4, duration: 0.6, ease: "sine.inOut", yoyo: true, repeat: 1 }
        );
      }, 2000);
    }

    return () => {
      ctx.revert();
      if (morphTimerRef.current) {
        clearInterval(morphTimerRef.current);
        morphTimerRef.current = null;
      }
    };
  }, [isActive, slide.accentColor]);

  return (
    <div ref={containerRef} className="w-full max-w-6xl mx-auto flex flex-col items-center gap-8">
      <h2 className="roles-title text-3xl md:text-4xl font-bold text-foreground text-center">
        Built for Every Role
      </h2>

      <div className="relative flex flex-col items-center gap-10 w-full">
        {/* Central Morphing Icon */}
        <div className="relative flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-32 h-32 md:w-40 md:h-40">
            <circle
              className="morph-glow-ring"
              cx="50" cy="50" r="48"
              fill="none"
              stroke={slide.accentColor}
              strokeWidth="1"
              opacity="0"
            />
            <path
              className="morph-path"
              d={ROLE_ICONS[ROLE_ICON_ORDER[0]]}
              fill="none"
              stroke={slide.accentColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div
            className="absolute -bottom-6 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: `${slide.accentColor}20`, color: slide.accentColor }}
          >
            {ROLES[activeRole]?.name ?? "Doctor"}
          </div>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
          {ROLES.map((role, i) => (
            <div
              key={role.id}
              className={`role-card relative bg-background/50 rounded-xl p-5 transition-all duration-300 ${
                activeRole === i ? "border" : "border border-border/30"
              }`}
              style={activeRole === i ? { borderColor: slide.accentColor, boxShadow: `0 0 20px ${slide.accentColor}15` } : {}}
            >
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <rect
                  className="role-card-border"
                  x="1" y="1"
                  width="calc(100% - 2px)" height="calc(100% - 2px)"
                  rx="12"
                  fill="none"
                  stroke={slide.accentColor}
                  strokeWidth="1"
                  opacity={activeRole === i ? 0.6 : 0.2}
                />
              </svg>

              <div className="flex items-center gap-3 mb-3">
                <svg viewBox="0 0 100 100" className="w-8 h-8">
                  <path
                    d={ROLE_ICONS[ROLE_ICON_ORDER[i]]}
                    fill="none"
                    stroke={activeRole === i ? slide.accentColor : "currentColor"}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-muted-foreground"
                  />
                </svg>
                <div>
                  <div className="role-name-text font-semibold text-foreground">&nbsp;</div>
                  <div className={`role-count-${i} text-xs text-muted-foreground`}>0 AI features</div>
                </div>
              </div>

              <div className="space-y-1.5">
                {role.features.map((feature) => (
                  <div
                    key={feature}
                    className="role-feature flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <div
                      className="w-1 h-1 rounded-full flex-shrink-0"
                      style={{ backgroundColor: slide.accentColor }}
                    />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
