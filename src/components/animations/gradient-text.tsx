"use client";

interface GradientTextProps {
  children: React.ReactNode;
  colors?: string[];
  animationSpeed?: number;
  className?: string;
}

export default function GradientText({
  children,
  colors = ["#0ea5e9", "#6366f1", "#8b5cf6", "#0ea5e9"],
  animationSpeed = 4,
  className = "",
}: GradientTextProps) {
  const gradientStyle = {
    backgroundImage: `linear-gradient(90deg, ${colors.join(", ")})`,
    backgroundSize: "200% 100%",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    animation: `gradient-shift ${animationSpeed}s ease infinite`,
  } as React.CSSProperties;

  return (
    <>
      <style jsx global>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <span className={className} style={gradientStyle}>
        {children}
      </span>
    </>
  );
}
