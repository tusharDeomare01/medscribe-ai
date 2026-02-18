"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { motion, AnimatePresence } from "motion/react";
import {
  IconLayoutDashboard,
  IconUsers,
  IconFileText,
  IconUpload,
  IconMessageChatbot,
  IconChartBar,
  IconHeartbeat,
  IconClipboardHeart,
  IconSchool,
  IconVideo,
  IconHome,
  IconSitemap,
  IconCalendarBolt,
  IconPhoneCall,
  IconShieldCheck,
  IconFileBarcode,
  IconReceipt,
  IconNurse,
  IconDeviceHeartMonitor,
  IconCalendarStats,
  IconCertificate,
} from "@tabler/icons-react";
import Aurora from "@/components/animations/aurora";

// ─── Types ───────────────────────────────────────────────────────────
interface SiteNode {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  color: string;
  group: "root" | "main" | "care" | "ops";
}

interface Connection {
  from: string;
  to: string;
  color: string;
  level: 0 | 1 | 2;
}

// ─── Layout constants ────────────────────────────────────────────────
const MIN_NODE_SPACING = 130;
const LEVEL_GAP = 140;
const LEVEL_GAP_COMPACT = 115;
const OPS_SUB_ROW_GAP = 95;
const OPS_SUB_ROW_GAP_COMPACT = 75;

// ─── Node data ───────────────────────────────────────────────────────
const ROOT_NODE: SiteNode = {
  id: "home",
  label: "Home",
  href: "/dashboard",
  icon: IconHome,
  color: "#6b7280",
  group: "root",
};

const MAIN_NODES: SiteNode[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: IconLayoutDashboard,
    color: "#8b5cf6",
    group: "main",
  },
  {
    id: "patients",
    label: "Patients",
    href: "/patients",
    icon: IconUsers,
    color: "#06b6d4",
    group: "main",
  },
  {
    id: "notes",
    label: "Clinical Notes",
    href: "/notes",
    icon: IconFileText,
    color: "#10b981",
    group: "main",
  },
  {
    id: "reports",
    label: "Report Analysis",
    href: "/reports",
    icon: IconUpload,
    color: "#f59e0b",
    group: "main",
  },
  {
    id: "ai-chat",
    label: "AI Assistant",
    href: "/ai-chat",
    icon: IconMessageChatbot,
    color: "#ec4899",
    group: "main",
  },
  {
    id: "analytics",
    label: "Analytics",
    href: "/analytics",
    icon: IconChartBar,
    color: "#ef4444",
    group: "main",
  },
];

const CARE_NODES: SiteNode[] = [
  {
    id: "health-assistant",
    label: "Health Assistant",
    href: "/health-assistant",
    icon: IconHeartbeat,
    color: "#f43f5e",
    group: "care",
  },
  {
    id: "care-plans",
    label: "Care Plans",
    href: "/care-plans",
    icon: IconClipboardHeart,
    color: "#3b82f6",
    group: "care",
  },
  {
    id: "education",
    label: "Education",
    href: "/education",
    icon: IconSchool,
    color: "#22c55e",
    group: "care",
  },
  {
    id: "visits",
    label: "Visits",
    href: "/visits",
    icon: IconVideo,
    color: "#a855f7",
    group: "care",
  },
];

const OPS_ROW1: SiteNode[] = [
  {
    id: "scheduling",
    label: "Scheduling",
    href: "/scheduling",
    icon: IconCalendarBolt,
    color: "#0ea5e9",
    group: "ops",
  },
  {
    id: "call-routing",
    label: "Call Routing",
    href: "/call-routing",
    icon: IconPhoneCall,
    color: "#6366f1",
    group: "ops",
  },
  {
    id: "insurance",
    label: "Insurance",
    href: "/insurance",
    icon: IconShieldCheck,
    color: "#14b8a6",
    group: "ops",
  },
  {
    id: "medical-coding",
    label: "Coding",
    href: "/medical-coding",
    icon: IconFileBarcode,
    color: "#8b5cf6",
    group: "ops",
  },
  {
    id: "billing",
    label: "Billing",
    href: "/billing",
    icon: IconReceipt,
    color: "#10b981",
    group: "ops",
  },
];

const OPS_ROW2: SiteNode[] = [
  {
    id: "nursing-assistant",
    label: "Nursing AI",
    href: "/nursing-assistant",
    icon: IconNurse,
    color: "#ec4899",
    group: "ops",
  },
  {
    id: "patient-monitoring",
    label: "Monitoring",
    href: "/patient-monitoring",
    icon: IconDeviceHeartMonitor,
    color: "#ef4444",
    group: "ops",
  },
  {
    id: "shift-scheduling",
    label: "Shifts",
    href: "/shift-scheduling",
    icon: IconCalendarStats,
    color: "#f59e0b",
    group: "ops",
  },
  {
    id: "staff-training",
    label: "Training",
    href: "/staff-training",
    icon: IconCertificate,
    color: "#06b6d4",
    group: "ops",
  },
];

const OPS_NODES = [...OPS_ROW1, ...OPS_ROW2];
const ALL_NODES = [ROOT_NODE, ...MAIN_NODES, ...CARE_NODES, ...OPS_NODES];

// ─── Connections with hierarchy level ────────────────────────────────
function getConnections(): Connection[] {
  const connections: Connection[] = [];

  // Level 0: Root → Main
  MAIN_NODES.forEach((node) => {
    connections.push({ from: "home", to: node.id, color: node.color, level: 0 });
  });

  // Level 1: Main → Care
  connections.push({ from: "patients", to: "health-assistant", color: "#f43f5e", level: 1 });
  connections.push({ from: "patients", to: "care-plans", color: "#3b82f6", level: 1 });
  connections.push({ from: "notes", to: "education", color: "#22c55e", level: 1 });
  connections.push({ from: "patients", to: "visits", color: "#a855f7", level: 1 });

  // Level 2: Main → Ops
  connections.push({ from: "patients", to: "scheduling", color: "#0ea5e9", level: 2 });
  connections.push({ from: "dashboard", to: "call-routing", color: "#6366f1", level: 2 });
  connections.push({ from: "patients", to: "insurance", color: "#14b8a6", level: 2 });
  connections.push({ from: "notes", to: "medical-coding", color: "#8b5cf6", level: 2 });
  connections.push({ from: "patients", to: "billing", color: "#10b981", level: 2 });
  connections.push({ from: "patients", to: "nursing-assistant", color: "#ec4899", level: 2 });
  connections.push({ from: "patients", to: "patient-monitoring", color: "#ef4444", level: 2 });
  connections.push({ from: "dashboard", to: "shift-scheduling", color: "#f59e0b", level: 2 });
  connections.push({ from: "analytics", to: "staff-training", color: "#06b6d4", level: 2 });

  return connections;
}

// ─── Layout: Tiered Top-Down Tree ────────────────────────────────────
function getNodePositions(w: number, h: number) {
  const cx = w / 2;
  const pos: Record<string, { x: number; y: number }> = {};
  const isCompact = w < 768;
  const levelGap = isCompact ? LEVEL_GAP_COMPACT : LEVEL_GAP;
  const subRowGap = isCompact ? OPS_SUB_ROW_GAP_COMPACT : OPS_SUB_ROW_GAP;

  // Level 0: Root — top center
  const rootY = h * 0.05;
  pos["home"] = { x: cx, y: rootY };

  // Level 1: Main — gentle arc
  const mainY = rootY + levelGap;
  const mainWidth = Math.min(
    w * 0.85,
    MAIN_NODES.length * MIN_NODE_SPACING
  );
  const mainStartX = cx - mainWidth / 2;

  MAIN_NODES.forEach((node, i) => {
    const t = MAIN_NODES.length > 1 ? i / (MAIN_NODES.length - 1) : 0.5;
    const x = mainStartX + mainWidth * t;
    const arcOffset = Math.sin(t * Math.PI) * 18;
    pos[node.id] = { x, y: mainY + arcOffset };
  });

  // Level 2: Care — centered row
  const careY = mainY + levelGap + 18;
  const careWidth = Math.min(w * 0.55, CARE_NODES.length * 160);
  const careStartX = cx - careWidth / 2;

  CARE_NODES.forEach((node, i) => {
    const t = CARE_NODES.length > 1 ? i / (CARE_NODES.length - 1) : 0.5;
    pos[node.id] = {
      x: careStartX + careWidth * t,
      y: careY,
    };
  });

  // Level 3a: Ops Row 1 (5 nodes)
  const opsY1 = careY + levelGap;
  const ops1Width = Math.min(w * 0.75, OPS_ROW1.length * 170);
  const ops1StartX = cx - ops1Width / 2;

  OPS_ROW1.forEach((node, i) => {
    const t = OPS_ROW1.length > 1 ? i / (OPS_ROW1.length - 1) : 0.5;
    pos[node.id] = {
      x: ops1StartX + ops1Width * t,
      y: opsY1,
    };
  });

  // Level 3b: Ops Row 2 (4 nodes)
  const opsY2 = opsY1 + subRowGap;
  const ops2Width = Math.min(w * 0.6, OPS_ROW2.length * 170);
  const ops2StartX = cx - ops2Width / 2;

  OPS_ROW2.forEach((node, i) => {
    const t = OPS_ROW2.length > 1 ? i / (OPS_ROW2.length - 1) : 0.5;
    pos[node.id] = {
      x: ops2StartX + ops2Width * t,
      y: opsY2,
    };
  });

  return pos;
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function SitemapPage() {
  const router = useRouter();
  const pageRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const idleCtxRef = useRef<gsap.Context | null>(null);
  const [dims, setDims] = useState({ width: 0, height: 0 });
  const [navigating, setNavigating] = useState<string | null>(null);

  const connections = getConnections();
  const level0Count = connections.filter((c) => c.level === 0).length;
  const level1Count = connections.filter((c) => c.level === 1).length;

  // ── Measure graph area ─────────────────────────────────────────
  useEffect(() => {
    const measure = () => {
      if (graphRef.current) {
        const r = graphRef.current.getBoundingClientRect();
        setDims({ width: r.width, height: r.height });
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const isMobile = dims.width > 0 && dims.width < 768;
  const positions = dims.width > 0 ? getNodePositions(dims.width, dims.height) : {};

  // ── Level-Cascading Entrance GSAP Timeline ─────────────────────
  useEffect(() => {
    if (dims.width === 0 || !pageRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Step 1: Subtitle
      tl.from(".sitemap-subtitle", { y: 15, opacity: 0, duration: 0.6 }, 0.3);

      // Step 2: Root node (index 0)
      const rootNode = nodeRefs.current[0];
      if (rootNode) {
        tl.from(rootNode, {
          scale: 0,
          opacity: 0,
          duration: 0.7,
          ease: "back.out(2.5)",
        }, 0.5);
      }

      // Step 3: Root→Main connections (level 0)
      connections.forEach((conn, i) => {
        if (conn.level !== 0) return;
        const path = pathRefs.current[i];
        if (!path) return;
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
        tl.to(path, {
          strokeDashoffset: 0,
          duration: 0.6,
          ease: "power2.inOut",
        }, 0.8 + (i * 0.08));
      });

      // Step 4: Main nodes (indices 1..6)
      for (let i = 0; i < MAIN_NODES.length; i++) {
        const node = nodeRefs.current[1 + i];
        if (!node) continue;
        tl.from(node, {
          scale: 0,
          opacity: 0,
          y: 20,
          duration: 0.5,
          ease: "back.out(2)",
        }, 1.0 + i * 0.1);
      }

      // Step 5: Main→Care connections (level 1)
      let level1Idx = 0;
      connections.forEach((conn, i) => {
        if (conn.level !== 1) return;
        const path = pathRefs.current[i];
        if (!path) return;
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
        tl.to(path, {
          strokeDashoffset: 0,
          duration: 0.5,
          ease: "power2.inOut",
        }, 2.0 + level1Idx * 0.1);
        level1Idx++;
      });

      // Step 6: Care nodes (indices 7..10)
      const careStartIdx = 1 + MAIN_NODES.length;
      for (let i = 0; i < CARE_NODES.length; i++) {
        const node = nodeRefs.current[careStartIdx + i];
        if (!node) continue;
        tl.from(node, {
          scale: 0,
          opacity: 0,
          y: 15,
          duration: 0.5,
          ease: "back.out(1.8)",
        }, 2.2 + i * 0.12);
      }

      // Step 7: Main→Ops connections (level 2)
      let level2Idx = 0;
      connections.forEach((conn, i) => {
        if (conn.level !== 2) return;
        const path = pathRefs.current[i];
        if (!path) return;
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
        tl.to(path, {
          strokeDashoffset: 0,
          duration: 0.5,
          ease: "power2.inOut",
        }, 3.0 + level2Idx * 0.06);
        level2Idx++;
      });

      // Step 8: Ops Row 1 nodes
      const opsStartIdx = careStartIdx + CARE_NODES.length;
      for (let i = 0; i < OPS_ROW1.length; i++) {
        const node = nodeRefs.current[opsStartIdx + i];
        if (!node) continue;
        tl.from(node, {
          scale: 0,
          opacity: 0,
          y: 15,
          duration: 0.45,
          ease: "back.out(1.5)",
        }, 3.2 + i * 0.1);
      }

      // Step 9: Ops Row 2 nodes
      const ops2StartIdx = opsStartIdx + OPS_ROW1.length;
      for (let i = 0; i < OPS_ROW2.length; i++) {
        const node = nodeRefs.current[ops2StartIdx + i];
        if (!node) continue;
        tl.from(node, {
          scale: 0,
          opacity: 0,
          y: 15,
          duration: 0.45,
          ease: "back.out(1.5)",
        }, 3.7 + i * 0.1);
      }

      // Step 10: Section labels + legend
      tl.from(".section-label", {
        opacity: 0,
        x: -15,
        duration: 0.5,
        stagger: 0.12,
        ease: "power2.out",
      }, 4.0);

      tl.from(".sitemap-legend", {
        y: 30,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
      }, 4.2);
    }, pageRef);

    return () => ctx.revert();
  }, [dims.width, dims.height, level0Count, level1Count, connections]);

  // ── Idle Animations (after entrance) ───────────────────────────
  useEffect(() => {
    if (dims.width === 0 || !pageRef.current) return;

    const idleTimer = setTimeout(() => {
      idleCtxRef.current = gsap.context(() => {
        // 1. Root glow pulse
        const rootGlow = pageRef.current?.querySelector(".root-glow");
        if (rootGlow) {
          gsap.to(rootGlow, {
            scale: 1.5,
            opacity: 0.5,
            duration: 2.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        }

        // 2. Gentle node floating
        nodeRefs.current.forEach((node, i) => {
          if (!node) return;
          gsap.to(node, {
            y: `+=${3 + Math.random() * 4}`,
            duration: 3 + Math.random() * 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.2,
          });
        });

        // 3. Connection breathing
        pathRefs.current.forEach((path, i) => {
          if (!path) return;
          gsap.to(path, {
            strokeOpacity: 0.65,
            duration: 2 + Math.random() * 1.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.15,
          });
        });

        // 4. Traveling light dots on connections
        pathRefs.current.forEach((path) => {
          if (!path || !path.parentElement) return;
          const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          dot.setAttribute("r", "2.5");
          dot.setAttribute("fill", path.getAttribute("stroke") || "#fff");
          dot.setAttribute("opacity", "0");
          dot.classList.add("traveling-dot");
          path.parentElement.appendChild(dot);

          const length = path.getTotalLength();
          const duration = 4 + Math.random() * 3;

          gsap.to(dot, {
            opacity: 0.7,
            duration: 0.5,
            delay: 0.3,
          });

          const proxy = { progress: 0 };
          gsap.to(proxy, {
            progress: 1,
            duration,
            repeat: -1,
            ease: "none",
            onUpdate: () => {
              const point = path.getPointAtLength(proxy.progress * length);
              dot.setAttribute("cx", String(point.x));
              dot.setAttribute("cy", String(point.y));
            },
          });
        });
      }, pageRef);
    }, 4600);

    return () => {
      clearTimeout(idleTimer);
      if (idleCtxRef.current) idleCtxRef.current.revert();
    };
  }, [dims.width, dims.height]);

  // ── Floating particles ────────────────────────────────────────
  useEffect(() => {
    if (!pageRef.current) return;
    const particles = pageRef.current.querySelectorAll(".particle");

    const ctx = gsap.context(() => {
      particles.forEach((p, i) => {
        gsap.set(p, {
          x: Math.random() * (dims.width || 800),
          y: Math.random() * (dims.height || 600),
          opacity: 0,
          scale: 0,
        });

        gsap.to(p, {
          opacity: Math.random() * 0.4 + 0.15,
          scale: Math.random() * 1.2 + 0.5,
          duration: 1.5,
          delay: i * 0.12,
          ease: "power2.out",
        });

        gsap.to(p, {
          y: `+=${Math.random() * 80 - 40}`,
          x: `+=${Math.random() * 50 - 25}`,
          duration: 5 + Math.random() * 4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.1,
        });
      });
    }, pageRef);

    return () => ctx.revert();
  }, [dims.width, dims.height]);

  // ── Highlight connected paths on hover ─────────────────────────
  const handleNodeHoverIn = useCallback(
    (nodeId: string) => {
      connections.forEach((conn, i) => {
        if (conn.from === nodeId || conn.to === nodeId) {
          const path = pathRefs.current[i];
          if (path) {
            gsap.to(path, {
              strokeOpacity: 0.85,
              strokeWidth: 3,
              duration: 0.3,
              ease: "power2.out",
            });
          }
        }
      });
    },
    [connections]
  );

  const handleNodeHoverOut = useCallback(
    (nodeId: string) => {
      connections.forEach((conn, i) => {
        if (conn.from === nodeId || conn.to === nodeId) {
          const path = pathRefs.current[i];
          if (path) {
            const sw = conn.level === 0 ? 2.5 : conn.level === 1 ? 2 : 1.5;
            gsap.to(path, {
              strokeOpacity: 0.4,
              strokeWidth: sw,
              duration: 0.3,
              ease: "power2.out",
            });
          }
        }
      });
    },
    [connections]
  );

  // ── Navigate with exit animation ──────────────────────────────
  const handleNavigate = useCallback(
    (href: string) => {
      if (navigating) return;
      setNavigating(href);

      // Kill idle animations before exit
      if (idleCtxRef.current) idleCtxRef.current.revert();

      const tl = gsap.timeline({
        onComplete: () => router.push(href),
      });

      nodeRefs.current.forEach((node, i) => {
        if (!node) return;
        tl.to(
          node,
          { scale: 0.6, opacity: 0, duration: 0.25, ease: "power2.in" },
          i * 0.02
        );
      });

      if (svgRef.current) {
        tl.to(svgRef.current, { opacity: 0, duration: 0.25 }, 0);
      }
    },
    [router, navigating]
  );

  // ── Compute stroke width per connection level ──────────────────
  const getStrokeWidth = (level: number) => {
    if (level === 0) return 2.5;
    if (level === 1) return 2;
    return 1.5;
  };

  // ── Compute icon sizes ─────────────────────────────────────────
  const rootIconSize = isMobile ? 56 : 64;
  const normalIconSize = isMobile ? 44 : 52;

  return (
    <div
      ref={pageRef}
      className="relative w-full h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] lg:h-[calc(100vh-4rem)] -m-4 md:-m-6 lg:-m-8 overflow-hidden"
    >
      {/* ── Aurora Background ── */}
      <div className="absolute inset-0 opacity-20 dark:opacity-[0.12]">
        <Aurora
          colorOne="#6366f1"
          colorTwo="#8b5cf6"
          colorThree="#06b6d4"
          speed={0.5}
          blend={0.3}
        />
      </div>

      {/* ── Dot grid ── */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── Particles ── */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="particle absolute w-1.5 h-1.5 rounded-full bg-primary/25 dark:bg-primary/15 pointer-events-none"
        />
      ))}

      {/* ── Title Section ── */}
      <div className="absolute top-6 md:top-8 left-0 right-0 z-10 flex flex-col items-center gap-2 pointer-events-none">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: 0.15,
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
          >
            <IconSitemap className="w-7 h-7 text-primary" />
          </motion.div>

          <motion.strong
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-4xl text-foreground text-center max-w-md px-2"
          >
            Site Architecture
          </motion.strong>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="sitemap-subtitle text-sm text-muted-foreground text-center max-w-md px-4"
        >
          Interactive visualization of the platform&apos;s page hierarchy. Click
          nodes to navigate.
        </motion.p>
      </div>

      {/* ── Navigating overlay ── */}
      <AnimatePresence>
        {navigating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Graph Area ── */}
      <div
        ref={graphRef}
        className={`absolute left-0 right-0 top-28 md:top-32 bottom-14 ${
          isMobile ? "overflow-y-auto overflow-x-hidden" : ""
        }`}
        style={isMobile ? { minHeight: 900 } : undefined}
      >
        {/* SVG connections */}
        {dims.width > 0 && (
          <svg
            ref={svgRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={`0 0 ${dims.width} ${isMobile ? 900 : dims.height}`}
            preserveAspectRatio="xMidYMid meet"
            style={isMobile ? { height: 900 } : undefined}
          >
            {connections.map((conn, i) => {
              const from = positions[conn.from];
              const to = positions[conn.to];
              if (!from || !to) return null;

              // For skip-level connections (level 2), use adjusted control points
              let d: string;
              if (conn.level === 2) {
                const cp1Y = from.y + (to.y - from.y) * 0.33;
                const cp2Y = from.y + (to.y - from.y) * 0.66;
                d = `M ${from.x} ${from.y} C ${from.x} ${cp1Y}, ${to.x} ${cp2Y}, ${to.x} ${to.y}`;
              } else {
                const midY = (from.y + to.y) / 2;
                d = `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`;
              }

              return (
                <path
                  key={`${conn.from}-${conn.to}`}
                  ref={(el) => {
                    pathRefs.current[i] = el;
                  }}
                  d={d}
                  fill="none"
                  stroke={conn.color}
                  strokeWidth={getStrokeWidth(conn.level)}
                  strokeOpacity={0.4}
                />
              );
            })}
          </svg>
        )}

        {/* Nodes */}
        {dims.width > 0 &&
          ALL_NODES.map((node, i) => {
            const pos = positions[node.id];
            if (!pos) return null;
            const isRoot = node.group === "root";
            const Icon = node.icon;
            const iconSize = isRoot ? rootIconSize : normalIconSize;

            return (
              <div
                key={node.id}
                ref={(el) => {
                  nodeRefs.current[i] = el;
                }}
                className="absolute"
                style={{
                  left: pos.x,
                  top: pos.y,
                  transform: "translate(-50%, -50%)",
                  zIndex: isRoot ? 5 : 3,
                }}
              >
                <motion.button
                  onClick={() => handleNavigate(node.href)}
                  whileHover={{ scale: 1.15, y: -5 }}
                  whileTap={{ scale: 0.92 }}
                  onHoverStart={() => handleNodeHoverIn(node.id)}
                  onHoverEnd={() => handleNodeHoverOut(node.id)}
                  className="relative flex flex-col items-center gap-1.5 group cursor-pointer outline-none"
                >
                  {/* Hover glow */}
                  <div
                    className="absolute rounded-full blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none"
                    style={{
                      backgroundColor: node.color,
                      width: isRoot ? 90 : 70,
                      height: isRoot ? 90 : 70,
                      left: "50%",
                      top: isRoot ? "40%" : "35%",
                      transform: "translate(-50%, -50%)",
                    }}
                  />

                  {/* Root continuous glow */}
                  {isRoot && (
                    <div
                      className="root-glow absolute rounded-full pointer-events-none"
                      style={{
                        width: 80,
                        height: 80,
                        left: "50%",
                        top: "40%",
                        transform: "translate(-50%, -50%)",
                        backgroundColor: node.color,
                        opacity: 0.2,
                        filter: "blur(20px)",
                      }}
                    />
                  )}

                  {/* Icon circle */}
                  <div
                    className="relative flex items-center justify-center rounded-full border-2 shadow-lg group-hover:shadow-xl transition-shadow duration-300 bg-card dark:bg-neutral-800"
                    style={{
                      borderColor: `${node.color}50`,
                      width: iconSize,
                      height: iconSize,
                    }}
                    onMouseEnter={(e) => {
                      gsap.to(e.currentTarget, {
                        boxShadow: `0 0 24px 6px ${node.color}35`,
                        borderColor: node.color,
                        duration: 0.3,
                      });
                    }}
                    onMouseLeave={(e) => {
                      gsap.to(e.currentTarget, {
                        boxShadow: "0 0 0 0 transparent",
                        borderColor: `${node.color}50`,
                        duration: 0.3,
                      });
                    }}
                  >
                    <Icon
                      className={isRoot ? "w-7 h-7" : isMobile ? "w-4 h-4" : "w-5 h-5"}
                      style={{ color: node.color }}
                    />
                  </div>

                  {/* Label — wraps long text, no overlap */}
                  <span
                    className={`font-medium text-foreground/70 dark:text-foreground/60 text-center leading-tight group-hover:text-foreground transition-colors duration-200 ${
                      isMobile
                        ? "text-[10px] max-w-[80px]"
                        : "text-[11px] max-w-[100px]"
                    }`}
                  >
                    {node.label}
                  </span>

                  {/* Group dot indicator */}
                  {(node.group === "care" || node.group === "ops") && (
                    <span
                      className="absolute -top-0.5 -right-1.5 w-2 h-2 rounded-full"
                      style={{ backgroundColor: node.color }}
                    />
                  )}
                </motion.button>
              </div>
            );
          })}

        {/* Section labels */}
        {dims.width > 0 && (
          <>
            <div
              className="section-label absolute z-10 pointer-events-none flex items-center gap-2"
              style={{
                left: 16,
                top: (positions[MAIN_NODES[0]?.id]?.y ?? 0) - 28,
              }}
            >
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
                Main Navigation
              </span>
              <div className="h-px w-12 bg-muted-foreground/10" />
            </div>
            <div
              className="section-label absolute z-10 pointer-events-none flex items-center gap-2"
              style={{
                left: 16,
                top: (positions[CARE_NODES[0]?.id]?.y ?? 0) - 28,
              }}
            >
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
                Patient Care
              </span>
              <div className="h-px w-12 bg-muted-foreground/10" />
            </div>
            <div
              className="section-label absolute z-10 pointer-events-none flex items-center gap-2"
              style={{
                left: 16,
                top: (positions[OPS_ROW1[0]?.id]?.y ?? 0) - 28,
              }}
            >
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
                Operations
              </span>
              <div className="h-px w-12 bg-muted-foreground/10" />
            </div>
          </>
        )}
      </div>

      {/* ── Legend ── */}
      <div className="sitemap-legend absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-5 px-5 py-2.5 rounded-full border border-border/50 bg-card/80 dark:bg-neutral-900/80 backdrop-blur-xl shadow-lg z-10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-500" />
          <span className="text-[11px] text-muted-foreground">Root</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary" />
          <span className="text-[11px] text-muted-foreground">Section</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="text-[11px] text-muted-foreground">
            Patient Care
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
          <span className="text-[11px] text-muted-foreground">Operations</span>
        </div>
      </div>
    </div>
  );
}
