// ── Procedural EKG Waveform Generator ────────────────────────────────
// Generates a medically-accurate ECG waveform (P-QRS-T complex)
// using sine/cosine math. The path repeats for continuous animation.

/**
 * Generate a single PQRST complex as an array of {x, y} points.
 * Based on simplified ECG morphology:
 *   - Baseline (flat)
 *   - P-wave (small positive bump)
 *   - PR segment (flat)
 *   - QRS complex (sharp negative Q, tall positive R, negative S)
 *   - ST segment (flat)
 *   - T-wave (broad positive bump)
 *   - Baseline (flat)
 */
function generatePQRST(
  startX: number,
  beatWidth: number,
  baselineY: number,
  amplitude: number
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const segments = 120; // points per beat

  for (let i = 0; i <= segments; i++) {
    const t = i / segments; // 0→1 across one beat
    const x = startX + t * beatWidth;
    let y = baselineY;

    // P-wave: t = 0.08–0.18 (small positive gaussian)
    if (t >= 0.08 && t <= 0.18) {
      const pt = (t - 0.13) / 0.05;
      y -= amplitude * 0.12 * Math.exp(-pt * pt * 2);
    }

    // Q-wave: t = 0.24–0.28 (small negative dip)
    if (t >= 0.24 && t <= 0.28) {
      const qt = (t - 0.26) / 0.02;
      y += amplitude * 0.15 * Math.exp(-qt * qt * 3);
    }

    // R-wave: t = 0.28–0.34 (tall positive spike)
    if (t >= 0.28 && t <= 0.34) {
      const rt = (t - 0.31) / 0.03;
      y -= amplitude * 1.0 * Math.exp(-rt * rt * 4);
    }

    // S-wave: t = 0.34–0.38 (moderate negative dip)
    if (t >= 0.34 && t <= 0.38) {
      const st = (t - 0.36) / 0.02;
      y += amplitude * 0.25 * Math.exp(-st * st * 3);
    }

    // T-wave: t = 0.48–0.64 (broad positive bump)
    if (t >= 0.48 && t <= 0.64) {
      const tt = (t - 0.56) / 0.08;
      y -= amplitude * 0.3 * Math.exp(-tt * tt * 1.5);
    }

    points.push({ x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 });
  }

  return points;
}

/**
 * Generate a full EKG waveform SVG path string with multiple beats.
 *
 * @param width     Total path width in SVG units
 * @param height    Total path height in SVG units
 * @param beats     Number of PQRST beats to generate
 * @param amplitude Peak R-wave height in SVG units
 * @returns SVG path `d` attribute string
 */
export function generateEKGPath(
  width: number = 1200,
  height: number = 100,
  beats: number = 4,
  amplitude: number = 35
): string {
  const baselineY = height / 2;
  const beatWidth = width / beats;
  const allPoints: { x: number; y: number }[] = [];

  for (let b = 0; b < beats; b++) {
    const beatPoints = generatePQRST(b * beatWidth, beatWidth, baselineY, amplitude);
    // Avoid duplicating the last point of previous beat with first of next
    if (b > 0) beatPoints.shift();
    allPoints.push(...beatPoints);
  }

  // Convert points to SVG path using quadratic curves for smooth interpolation
  if (allPoints.length < 2) return "";

  let d = `M${allPoints[0].x},${allPoints[0].y}`;

  for (let i = 1; i < allPoints.length - 1; i++) {
    const curr = allPoints[i];
    const next = allPoints[i + 1];
    const midX = (curr.x + next.x) / 2;
    const midY = (curr.y + next.y) / 2;
    d += ` Q${curr.x},${curr.y} ${midX},${midY}`;
  }

  // Final point
  const last = allPoints[allPoints.length - 1];
  d += ` L${last.x},${last.y}`;

  return d;
}

/**
 * Generate a flat-line path (for the closing "EKG flatline" MorphSVG target).
 */
export function generateFlatlinePath(
  width: number = 1200,
  height: number = 100
): string {
  const y = height / 2;
  return `M0,${y} L${width},${y}`;
}

/**
 * Percentage of the total path one beat occupies.
 * Used for the DrawSVG sliding window: window = 100/beats %
 */
export function getBeatWindowPercent(beats: number = 4): number {
  return 100 / beats;
}
