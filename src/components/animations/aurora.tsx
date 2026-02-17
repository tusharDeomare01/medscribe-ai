"use client";

import { useRef, useEffect } from "react";

interface AuroraProps {
  colorOne?: string;
  colorTwo?: string;
  colorThree?: string;
  speed?: number;
  blend?: number;
  className?: string;
}

export default function Aurora({
  colorOne = "#0ea5e9",
  colorTwo = "#6366f1",
  colorThree = "#8b5cf6",
  speed = 1,
  blend = 0.5,
  className = "",
}: AuroraProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = canvas.offsetWidth);
    let h = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 0, g: 0, b: 0 };
    };

    const c1 = hexToRgb(colorOne);
    const c2 = hexToRgb(colorTwo);
    const c3 = hexToRgb(colorThree);

    let t = 0;

    const animate = () => {
      t += 0.003 * speed;
      ctx.clearRect(0, 0, w, h);

      // Draw three overlapping gradient circles
      const blobs = [
        {
          x: w * (0.5 + 0.3 * Math.sin(t * 0.7)),
          y: h * (0.5 + 0.3 * Math.cos(t * 0.8)),
          color: c1,
          radius: Math.min(w, h) * (0.4 + 0.1 * Math.sin(t)),
        },
        {
          x: w * (0.5 + 0.3 * Math.cos(t * 0.6)),
          y: h * (0.5 + 0.3 * Math.sin(t * 0.9)),
          color: c2,
          radius: Math.min(w, h) * (0.35 + 0.1 * Math.cos(t * 1.1)),
        },
        {
          x: w * (0.5 + 0.25 * Math.sin(t * 1.1)),
          y: h * (0.5 + 0.25 * Math.cos(t * 0.5)),
          color: c3,
          radius: Math.min(w, h) * (0.3 + 0.1 * Math.sin(t * 0.8)),
        },
      ];

      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = blend;

      for (const blob of blobs) {
        const gradient = ctx.createRadialGradient(
          blob.x,
          blob.y,
          0,
          blob.x,
          blob.y,
          blob.radius
        );
        gradient.addColorStop(
          0,
          `rgba(${blob.color.r}, ${blob.color.g}, ${blob.color.b}, 0.8)`
        );
        gradient.addColorStop(
          0.5,
          `rgba(${blob.color.r}, ${blob.color.g}, ${blob.color.b}, 0.3)`
        );
        gradient.addColorStop(
          1,
          `rgba(${blob.color.r}, ${blob.color.g}, ${blob.color.b}, 0)`
        );

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [colorOne, colorTwo, colorThree, speed, blend]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ filter: "blur(60px)" }}
    />
  );
}
