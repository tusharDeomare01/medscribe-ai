"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import {
  NETWORK_NODES,
  NETWORK_EDGES,
  PULSE_ROUTES,
  CENTRAL_NODE_ID,
} from "./svg-paths";

if (typeof window !== "undefined") {
  gsap.registerPlugin(DrawSVGPlugin);
}

export function HeroSvgNetwork() {
  const svgRef = useRef<SVGSVGElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    ctxRef.current = gsap.context(() => {
      const svg = svgRef.current!;
      const tl = gsap.timeline({ delay: 0.4 });

      // ── Draw node strokes ─────────────────────────────────────
      const nodeEls = svg.querySelectorAll(".net-node");
      gsap.set(nodeEls, { drawSVG: "0%", opacity: 1 });
      tl.to(nodeEls, {
        drawSVG: "100%",
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.out",
      });

      // ── Fill nodes (tighter sync with stroke) ─────────────────
      const fillEls = svg.querySelectorAll(".net-node-fill");
      gsap.set(fillEls, { opacity: 0 });
      tl.to(
        fillEls,
        {
          opacity: 1,
          duration: 0.3,
          stagger: 0.05,
          ease: "power2.out",
        },
        "-=0.15"
      );

      // ── Draw edges (faster, overlapped) ───────────────────────
      const edgeEls = svg.querySelectorAll(".net-edge");
      gsap.set(edgeEls, { drawSVG: "0%", opacity: 1 });
      tl.to(
        edgeEls,
        {
          drawSVG: "100%",
          duration: 0.4,
          stagger: 0.03,
          ease: "power2.inOut",
        },
        "-=0.3"
      );

      // ── Central node pulse (faster, more visible) ─────────────
      const centralNode = NETWORK_NODES.find(
        (n) => n.id === CENTRAL_NODE_ID
      );
      if (centralNode) {
        const pulseRing = svg.querySelector(".central-pulse");
        if (pulseRing) {
          tl.to(
            pulseRing,
            {
              attr: { r: centralNode.r + 18 },
              opacity: 0,
              duration: 1.2,
              repeat: -1,
              ease: "sine.out",
            },
            "+=0.2"
          );
        }
      }

      // ── Data pulses along routes (lazy MotionPathPlugin) ──────
      const pulseDots = svg.querySelectorAll(".pulse-dot");
      if (pulseDots.length > 0) {
        import("gsap/MotionPathPlugin")
          .then(({ MotionPathPlugin }) => {
            gsap.registerPlugin(MotionPathPlugin);

            PULSE_ROUTES.forEach((route, routeIdx) => {
              const dot = pulseDots[routeIdx];
              if (!dot) return;

              const edgePathEls = route
                .map((eid) => svg.querySelector(`#${eid}`))
                .filter(Boolean) as SVGPathElement[];

              if (edgePathEls.length === 0) return;

              const routeTl = gsap.timeline({
                repeat: -1,
                delay: routeIdx * 0.8 + 0.6,
                repeatDelay: 0.4,
              });

              edgePathEls.forEach((pathEl) => {
                const d = pathEl.getAttribute("d");
                if (!d) return;

                routeTl.to(dot, {
                  motionPath: {
                    path: pathEl,
                    align: pathEl,
                    alignOrigin: [0.5, 0.5],
                  },
                  duration: 0.6,
                  ease: "power1.inOut",
                });
              });
            });
          })
          .catch(() => {});
      }

      // ── Idle: glow breathing on nodes (faster cycle) ──────────
      tl.to(
        nodeEls,
        {
          strokeOpacity: 0.35,
          duration: 1.4,
          stagger: { each: 0.12, repeat: -1, yoyo: true },
          ease: "sine.inOut",
        },
        "+=0.3"
      );
    }, svgRef);

    return () => {
      ctxRef.current?.revert();
    };
  }, []);

  const centralNode = NETWORK_NODES.find((n) => n.id === CENTRAL_NODE_ID);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 500 400"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="node-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Edges */}
      <g className="edges">
        {NETWORK_EDGES.map((edge) => (
          <path
            key={edge.id}
            id={edge.id}
            className="net-edge"
            d={edge.d}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="1.5"
            strokeOpacity="0.5"
            opacity="0"
          />
        ))}
      </g>

      {/* Node fills (behind strokes) */}
      <g className="node-fills">
        {NETWORK_NODES.map((node) => (
          <circle
            key={`fill-${node.id}`}
            className="net-node-fill"
            cx={node.cx}
            cy={node.cy}
            r={node.r}
            fill="hsl(var(--primary))"
            fillOpacity="0.12"
            opacity="0"
          />
        ))}
      </g>

      {/* Node glow halos */}
      <g className="node-glows">
        {NETWORK_NODES.filter((n) => n.layer === "hidden").map((node) => (
          <circle
            key={`glow-${node.id}`}
            cx={node.cx}
            cy={node.cy}
            r={node.r + 10}
            fill="url(#node-glow)"
          />
        ))}
      </g>

      {/* Node strokes */}
      <g className="nodes">
        {NETWORK_NODES.map((node) => (
          <circle
            key={node.id}
            className="net-node"
            cx={node.cx}
            cy={node.cy}
            r={node.r}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeOpacity="0.8"
            opacity="0"
          />
        ))}
      </g>

      {/* Central node pulse ring */}
      {centralNode && (
        <circle
          className="central-pulse"
          cx={centralNode.cx}
          cy={centralNode.cy}
          r={centralNode.r}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          opacity="0.6"
        />
      )}

      {/* Data pulse dots */}
      {PULSE_ROUTES.map((_, i) => (
        <circle
          key={`pulse-${i}`}
          className="pulse-dot"
          r="5"
          fill="hsl(var(--primary))"
          opacity="0.9"
        />
      ))}
    </svg>
  );
}
