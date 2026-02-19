// ── SVG Path Data for Pitch Deck ─────────────────────────────────────

// ── Role Icons (viewBox 0 0 100 100) — for MorphSVG rotational ─────
// All paths designed with similar complexity for smooth morphing.

export const ROLE_ICONS: Record<string, string> = {
  // Stethoscope — Doctor
  stethoscope:
    "M35,15 C35,15 30,20 30,30 L30,50 C30,65 40,75 50,75 C60,75 70,65 70,50 L70,30 C70,20 65,15 65,15 M45,75 L45,85 C45,90 50,95 55,90 L55,80 M30,20 L25,20 M70,20 L75,20 M50,50 C55,50 60,55 60,60 C60,65 55,70 50,70 C45,70 40,65 40,60 C40,55 45,50 50,50",
  // Syringe — Nurse
  syringe:
    "M65,15 L85,35 L80,40 L75,35 L45,65 L40,70 L30,80 L20,70 L30,60 L35,55 L65,25 L60,20 Z M40,40 L50,50 M35,45 L45,55 M30,50 L40,60 M72,22 L78,28 M25,75 C20,80 15,85 20,90 C25,85 30,80 25,75",
  // Phone — Front-Office
  phone:
    "M30,15 L70,15 C75,15 80,20 80,25 L80,75 C80,80 75,85 70,85 L30,85 C25,85 20,80 20,75 L20,25 C20,20 25,15 30,15 M35,22 L65,22 M40,78 L60,78 C62,78 63,79 63,80 C63,81 62,82 60,82 L40,82 C38,82 37,81 37,80 C37,79 38,78 40,78 M30,30 L70,30 L70,70 L30,70 Z",
  // Heart — Patient
  heart:
    "M50,85 C50,85 15,60 15,38 C15,25 25,15 38,15 C45,15 50,22 50,22 C50,22 55,15 62,15 C75,15 85,25 85,38 C85,60 50,85 50,85 M35,40 L42,40 L46,30 L50,50 L54,35 L58,40 L65,40",
};

export const ROLE_ICON_ORDER = ["stethoscope", "syringe", "phone", "heart"] as const;

// ── Corner Bracket Paths (for slide transitions) ────────────────────

export function pitchCornerBracket(
  corner: "tl" | "tr" | "bl" | "br",
  x: number,
  y: number,
  size: number
): string {
  switch (corner) {
    case "tl":
      return `M${x},${y + size} L${x},${y} L${x + size},${y}`;
    case "tr":
      return `M${x - size},${y} L${x},${y} L${x},${y + size}`;
    case "bl":
      return `M${x},${y - size} L${x},${y} L${x + size},${y}`;
    case "br":
      return `M${x - size},${y} L${x},${y} L${x},${y - size}`;
  }
}

// ── Pipeline Arrow Path (for Demo slide) ────────────────────────────

export function generatePipelineArrow(
  x1: number,
  y: number,
  x2: number
): string {
  const midX = (x1 + x2) / 2;
  return `M${x1},${y} C${midX},${y - 15} ${midX},${y + 15} ${x2},${y}`;
}

// ── Stethoscope Logo (for Solution slide, viewBox 0 0 48 48) ───────

export const STETHOSCOPE_LOGO =
  "M14,8 C14,8 12,10 12,14 L12,24 C12,30 17,35 24,35 C31,35 36,30 36,24 L36,14 C36,10 34,8 34,8 M12,10 L8,10 M36,10 L40,10 M24,35 L24,40 C24,44 28,46 30,44 L30,40 M24,24 C27,24 30,27 30,30 C30,33 27,36 24,36 C21,36 18,33 18,30 C18,27 21,24 24,24";

// ── Shield Icon (for Tech slide Security section) ───────────────────

export const SHIELD_PATH =
  "M50,10 L15,30 L15,50 C15,72 30,88 50,95 C70,88 85,72 85,50 L85,30 Z";

export const LOCK_PATH =
  "M40,55 L60,55 L60,72 L40,72 Z M44,55 L44,48 C44,42 47,38 50,38 C53,38 56,42 56,48 L56,55 M50,62 L50,66";

// ── Checkmark Paths ─────────────────────────────────────────────────

export const CHECKMARK_PATH = "M20,50 L40,70 L80,25";

// Small checkmark for stat rings
export const SMALL_CHECK = "M35,52 L45,62 L65,38";

// ── Stats Arc Ring (reused from landing) ────────────────────────────

export const PITCH_ARC_PATH = "M60,10 A50,50 0 1 1 10,60";
export const PITCH_TRACK_PATH = "M60,10 A50,50 0 1 1 59.99,10";

// ── Waveform Bars (for Demo slide voice visualization) ──────────────

export function generateWaveformBars(
  count: number = 20,
  x: number = 0,
  y: number = 50,
  width: number = 100,
  maxHeight: number = 40
): { x: number; y: number; height: number }[] {
  const barWidth = width / count;
  const bars: { x: number; y: number; height: number }[] = [];

  for (let i = 0; i < count; i++) {
    // Simulate a voice waveform envelope
    const t = i / (count - 1);
    const envelope = Math.sin(t * Math.PI) * 0.8 + 0.2; // bell curve envelope
    const noise = 0.5 + 0.5 * Math.sin(i * 2.7 + 1.3); // pseudo-random variation
    const h = maxHeight * envelope * noise;

    bars.push({
      x: x + i * barWidth + barWidth * 0.15,
      y: y - h / 2,
      height: Math.max(2, h),
    });
  }

  return bars;
}
