"use client";

import { useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import { PitchSlide } from "../pitch-slides";
import { computeGraphLayout, getClusterSummaries } from "../pitch-graph-generator";

interface SlideProps {
  slide: PitchSlide;
  isActive: boolean;
}

const CLUSTER_DISPLAY: Record<string, string> = {
  clinical: "Clinical",
  nursing: "Nursing",
  frontoffice: "Front-Office",
  billing: "Billing",
  patient: "Patient Care",
  settings: "Settings",
};

const CLUSTER_COLORS: Record<string, string> = {
  clinical: "#3b82f6",
  nursing: "#10b981",
  frontoffice: "#f59e0b",
  billing: "#8b5cf6",
  patient: "#ec4899",
  settings: "#64748b",
  core: "#a855f7",
};

export function SlideDepth({ slide, isActive }: SlideProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  const graph = useMemo(() => computeGraphLayout(400, 250, 160, 50), []);
  const clusters = useMemo(() => getClusterSummaries(graph.nodes), [graph.nodes]);

  const dashboardNode = graph.nodes.find((n) => n.id === "dashboard");

  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    ctxRef.current?.revert();

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Title
      tl.fromTo(".depth-title", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }, 0);

      // Central dashboard node draws first
      tl.fromTo(
        ".graph-center-ring",
        { drawSVG: "0%" },
        { drawSVG: "100%", duration: 0.5, ease: "power2.out" },
        0.2
      );
      tl.fromTo(
        ".graph-center-fill",
        { opacity: 0 },
        { opacity: 1, duration: 0.3 },
        0.5
      );
      // ScrambleText doesn't work on SVG <text> — use count-up style textContent update
      const centerLabel = containerRef.current!.querySelector(".graph-center-label");
      if (centerLabel) {
        const target = "Dashboard";
        const chars = "01ABCDEF";
        const obj = { progress: 0 };
        tl.to(obj, {
          progress: 1,
          duration: 0.4,
          ease: "power2.out",
          onUpdate: () => {
            const len = target.length;
            const revealed = Math.floor(obj.progress * len);
            let result = "";
            for (let c = 0; c < len; c++) {
              result += c < revealed ? target[c] : chars[Math.floor(Math.random() * chars.length)];
            }
            centerLabel.textContent = result;
          },
          onComplete: () => { centerLabel.textContent = target; },
        }, 0.5);
      }

      // Edges draw outward from center
      tl.fromTo(
        ".graph-edge",
        { drawSVG: "0%" },
        { drawSVG: "100%", duration: 0.8, stagger: 0.03, ease: "power2.out" },
        0.6
      );

      // Cluster nodes appear
      tl.fromTo(
        ".graph-node-ring",
        { drawSVG: "0%", opacity: 0 },
        { drawSVG: "100%", opacity: 1, duration: 0.4, stagger: 0.04, ease: "power2.out" },
        0.9
      );
      tl.fromTo(
        ".graph-node-fill",
        { opacity: 0 },
        { opacity: 1, duration: 0.3, stagger: 0.04 },
        1.1
      );

      // Node labels — manual text scramble (ScrambleText doesn't work on SVG <text>)
      const nodeLabels = gsap.utils.toArray<SVGTextElement>(".graph-node-label");
      nodeLabels.forEach((el, i) => {
        const targetText = el.dataset.name || "";
        if (!targetText) return;
        const chars = "01ABCDEF";
        const obj = { progress: 0 };
        tl.to(obj, {
          progress: 1,
          duration: 0.3,
          ease: "power2.out",
          onUpdate: () => {
            const len = targetText.length;
            const revealed = Math.floor(obj.progress * len);
            let result = "";
            for (let c = 0; c < len; c++) {
              result += c < revealed ? targetText[c] : chars[Math.floor(Math.random() * chars.length)];
            }
            el.textContent = result;
          },
          onComplete: () => { el.textContent = targetText; },
        }, 1.0 + i * 0.04);
      });

      // Traveling pulse dots (infinite)
      clusters.forEach((cluster, ci) => {
        const clusterEdges = containerRef.current!.querySelectorAll(`.graph-edge-${cluster.cluster}`);
        if (clusterEdges.length === 0) return;

        // Pulse dot on first edge of each cluster
        const pulseDot = containerRef.current!.querySelector(`.pulse-dot-${ci}`);
        if (pulseDot && dashboardNode) {
          gsap.fromTo(
            pulseDot,
            { attr: { cx: dashboardNode.x, cy: dashboardNode.y }, opacity: 0.8 },
            {
              attr: { cx: cluster.centerX, cy: cluster.centerY },
              opacity: 0,
              duration: 1.5,
              ease: "power2.inOut",
              repeat: -1,
              delay: 2.0 + ci * 0.6,
              repeatDelay: 2.0,
            }
          );
        }
      });

      // Counter tween
      const counterEl = containerRef.current!.querySelector(".depth-counter");
      if (counterEl) {
        const obj = { val: 0 };
        tl.to(obj, {
          val: 23,
          duration: 1.5,
          ease: "power2.out",
          onUpdate: () => { counterEl.textContent = `${Math.round(obj.val)} Pages`; },
        }, 2.0);
      }

      // Counter ring fills
      tl.fromTo(
        ".depth-counter-ring",
        { drawSVG: "0%" },
        { drawSVG: "100%", duration: 1.0, ease: "power2.out" },
        2.0
      );

      // Cluster labels highlight sequence
      clusters.forEach((cluster, ci) => {
        tl.fromTo(
          `.cluster-label-${ci}`,
          { opacity: 0, y: 5 },
          { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
          2.5 + ci * 0.2
        );
      });
    }, containerRef);

    ctxRef.current = ctx;
    return () => { ctx.revert(); };
  }, [isActive, graph, clusters, dashboardNode, slide.accentColor]);

  return (
    <div ref={containerRef} className="w-full max-w-6xl mx-auto flex flex-col items-center gap-6">
      <h2 className="depth-title text-3xl md:text-4xl font-bold text-foreground text-center">
        23 Specialized Pages
      </h2>

      <div className="relative w-full" style={{ maxWidth: 800 }}>
        <svg viewBox="0 0 800 500" className="w-full">
          {/* Edges */}
          {graph.edges.map((edge, i) => {
            const fromNode = graph.nodes.find((n) => n.id === edge.from);
            const toNode = graph.nodes.find((n) => n.id === edge.to);
            if (!fromNode || !toNode) return null;
            const cluster = toNode.cluster;
            return (
              <line
                key={`edge-${i}`}
                className={`graph-edge graph-edge-${cluster}`}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={CLUSTER_COLORS[cluster] || slide.accentColor}
                strokeWidth="1"
                opacity="0.3"
                strokeLinecap="round"
              />
            );
          })}

          {/* Traveling pulse dots */}
          {clusters.map((_, ci) => (
            <circle
              key={`pulse-${ci}`}
              className={`pulse-dot-${ci}`}
              r="3"
              fill={slide.accentColor}
              opacity="0"
            />
          ))}

          {/* Dashboard center node */}
          {dashboardNode && (
            <g>
              <circle
                className="graph-center-ring"
                cx={dashboardNode.x}
                cy={dashboardNode.y}
                r="20"
                fill="none"
                stroke={slide.accentColor}
                strokeWidth="2"
              />
              <circle
                className="graph-center-fill"
                cx={dashboardNode.x}
                cy={dashboardNode.y}
                r="18"
                fill={`${slide.accentColor}20`}
                opacity="0"
              />
              <text
                className="graph-center-label"
                x={dashboardNode.x}
                y={dashboardNode.y + 4}
                textAnchor="middle"
                fill={slide.accentColor}
                fontSize="7"
                fontWeight="600"
              >
                &nbsp;
              </text>
            </g>
          )}

          {/* Cluster nodes */}
          {graph.nodes
            .filter((n) => n.cluster !== "core")
            .map((node) => {
              const color = CLUSTER_COLORS[node.cluster] || slide.accentColor;
              return (
                <g key={node.id}>
                  <circle
                    className="graph-node-ring"
                    cx={node.x}
                    cy={node.y}
                    r="10"
                    fill="none"
                    stroke={color}
                    strokeWidth="1.5"
                    opacity="0"
                  />
                  <circle
                    className="graph-node-fill"
                    cx={node.x}
                    cy={node.y}
                    r="8"
                    fill={`${color}20`}
                    opacity="0"
                  />
                  <text
                    className="graph-node-label fill-muted-foreground"
                    data-name={node.name}
                    x={node.x}
                    y={node.y + 20}
                    textAnchor="middle"
                    fontSize="6"
                  >
                    &nbsp;
                  </text>
                </g>
              );
            })}

          {/* Cluster summary labels */}
          {clusters.map((cluster, ci) => (
            <text
              key={`clabel-${ci}`}
              className={`cluster-label-${ci}`}
              x={cluster.centerX}
              y={cluster.centerY - 35}
              textAnchor="middle"
              fill={CLUSTER_COLORS[cluster.cluster] || slide.accentColor}
              fontSize="8"
              fontWeight="700"
              opacity="0"
            >
              {CLUSTER_DISPLAY[cluster.cluster] || cluster.cluster} ({cluster.count})
            </text>
          ))}
        </svg>

        {/* Counter overlay */}
        <div className="absolute bottom-4 right-4 flex items-center gap-3">
          <svg viewBox="0 0 60 60" className="w-14 h-14">
            <circle cx="30" cy="30" r="26" fill="none" stroke={`${slide.accentColor}30`} strokeWidth="2" />
            <circle
              className="depth-counter-ring"
              cx="30" cy="30" r="26"
              fill="none"
              stroke={slide.accentColor}
              strokeWidth="2"
              strokeLinecap="round"
              transform="rotate(-90 30 30)"
            />
          </svg>
          <span className="depth-counter text-2xl font-bold" style={{ color: slide.accentColor }}>
            0 Pages
          </span>
        </div>
      </div>
    </div>
  );
}
