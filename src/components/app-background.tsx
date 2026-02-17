"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ColorBends = dynamic(() => import("@/components/ui/color-bends"), {
  ssr: false,
});

export default function AppBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* WebGL background layer — fixed, covers full viewport */}
      <div
        className="fixed inset-0 w-screen h-screen"
        style={{ zIndex: 0 }}
        aria-hidden="true"
      >
        <ColorBends
          colors={["#0ea5e9", "#6366f1", "#10b981"]}
          rotation={0}
          speed={0.15}
          scale={1.2}
          frequency={0.8}
          warpStrength={0.6}
          mouseInfluence={0.3}
          parallax={0.3}
          noise={0.05}
          transparent
          autoRotate={2}
        />
      </div>
      {/* Semi-transparent overlay so text stays readable */}
      <div
        className="fixed inset-0 w-screen h-screen bg-background/80 pointer-events-none"
        style={{ zIndex: 1 }}
        aria-hidden="true"
      />
    </>
  );
}
