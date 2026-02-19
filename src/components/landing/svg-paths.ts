// ── Neural Network SVG Data ─────────────────────────────────────────

export interface NetworkNode {
  id: string;
  cx: number;
  cy: number;
  r: number;
  layer: "input" | "hidden" | "output";
}

export interface NetworkEdge {
  id: string;
  from: string;
  to: string;
  d: string;
}

// viewBox 0 0 500 400
export const NETWORK_NODES: NetworkNode[] = [
  // Input layer (left)
  { id: "i1", cx: 60, cy: 80, r: 14, layer: "input" },
  { id: "i2", cx: 60, cy: 160, r: 14, layer: "input" },
  { id: "i3", cx: 60, cy: 240, r: 14, layer: "input" },
  { id: "i4", cx: 60, cy: 320, r: 14, layer: "input" },
  // Hidden layer 1
  { id: "h1", cx: 200, cy: 100, r: 16, layer: "hidden" },
  { id: "h2", cx: 200, cy: 200, r: 18, layer: "hidden" },
  { id: "h3", cx: 200, cy: 300, r: 16, layer: "hidden" },
  // Hidden layer 2
  { id: "h4", cx: 340, cy: 120, r: 16, layer: "hidden" },
  { id: "h5", cx: 340, cy: 220, r: 20, layer: "hidden" },
  { id: "h6", cx: 340, cy: 310, r: 16, layer: "hidden" },
  // Output layer (right)
  { id: "o1", cx: 460, cy: 160, r: 14, layer: "output" },
  { id: "o2", cx: 460, cy: 260, r: 14, layer: "output" },
];

export const NETWORK_EDGES: NetworkEdge[] = [
  // Input → Hidden 1
  { id: "e1", from: "i1", to: "h1", d: "M74,80 C130,80 140,100 184,100" },
  { id: "e2", from: "i1", to: "h2", d: "M74,80 C130,80 140,200 184,200" },
  { id: "e3", from: "i2", to: "h1", d: "M74,160 C130,160 140,100 184,100" },
  { id: "e4", from: "i2", to: "h2", d: "M74,160 C130,160 140,200 184,200" },
  { id: "e5", from: "i3", to: "h2", d: "M74,240 C130,240 140,200 184,200" },
  { id: "e6", from: "i3", to: "h3", d: "M74,240 C130,240 140,300 184,300" },
  { id: "e7", from: "i4", to: "h2", d: "M74,320 C130,320 140,200 184,200" },
  { id: "e8", from: "i4", to: "h3", d: "M74,320 C130,320 140,300 184,300" },
  // Hidden 1 → Hidden 2
  { id: "e9", from: "h1", to: "h4", d: "M216,100 C270,100 280,120 324,120" },
  { id: "e10", from: "h1", to: "h5", d: "M216,100 C270,100 280,220 324,220" },
  { id: "e11", from: "h2", to: "h4", d: "M218,200 C270,200 280,120 324,120" },
  { id: "e12", from: "h2", to: "h5", d: "M218,200 C270,200 280,220 324,220" },
  { id: "e13", from: "h2", to: "h6", d: "M218,200 C270,200 280,310 324,310" },
  { id: "e14", from: "h3", to: "h5", d: "M216,300 C270,300 280,220 324,220" },
  { id: "e15", from: "h3", to: "h6", d: "M216,300 C270,300 280,310 324,310" },
  // Hidden 2 → Output
  { id: "e16", from: "h4", to: "o1", d: "M356,120 C400,120 420,160 446,160" },
  { id: "e17", from: "h5", to: "o1", d: "M360,220 C400,220 420,160 446,160" },
  { id: "e18", from: "h5", to: "o2", d: "M360,220 C400,220 420,260 446,260" },
];

// 3 data pulse routes (edge id sequences)
export const PULSE_ROUTES: string[][] = [
  ["e2", "e12", "e17"],   // top-left → center → top-right
  ["e6", "e14", "e18"],   // mid-left → center → bottom-right
  ["e3", "e9", "e16"],    // input2 → h1 → h4 → o1
];

// Central hub node (largest, pulses)
export const CENTRAL_NODE_ID = "h5";

// ── Medical Icons for MorphSVG (viewBox 0 0 24 24) ─────────────────

export const MEDICAL_ICONS: Record<string, string> = {
  stethoscope:
    "M6 3a1 1 0 0 0-1 1v3.5a5.5 5.5 0 0 0 5 5.48V16a3 3 0 0 0 6 0v-1a2 2 0 1 0-4 0v1a1 1 0 0 1-2 0v-3.02A5.5 5.5 0 0 0 15 7.5V4a1 1 0 0 0-1-1h-1a1 1 0 0 0 0 2h0v2.5a3.5 3.5 0 0 1-7 0V5h0a1 1 0 0 0 0-2H6z",
  brain:
    "M12 2a7 7 0 0 0-5.6 2.8A5 5 0 0 0 2 9.5a5.5 5.5 0 0 0 3 4.9V17a5 5 0 0 0 10 0v-2.6a5.5 5.5 0 0 0 3-4.9 5 5 0 0 0-4.4-4.7A7 7 0 0 0 12 2zm0 2a5 5 0 0 1 3.5 1.5 3 3 0 0 1 2.5 3 3.5 3.5 0 0 1-2 3.2V17a3 3 0 0 1-6 0v-5.3A3.5 3.5 0 0 1 8 8.5a3 3 0 0 1 2.5-3A5 5 0 0 1 12 4z",
  chart:
    "M3 3v18h18M7 14l3-4 4 2 5-6",
  shield:
    "M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm0 2.18l7 3.82v4c0 4.52-3.13 8.69-7 9.93C8.13 20.69 5 16.52 5 12V8l7-3.82z",
  clock:
    "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm-1 2v7l5 3 1-1.5-4-2.5V6h-2z",
  heart:
    "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
};

// Array of icon keys in feature section order
export const FEATURE_ICON_ORDER = [
  "stethoscope",
  "brain",
  "chart",
  "shield",
  "clock",
  "heart",
] as const;

// ── Workflow Connector Path (viewBox 0 0 100 800) ───────────────────

// A vertical bezier that snakes through 4 step positions (y: 100, 300, 500, 700)
export const WORKFLOW_PATH =
  "M50,50 C50,150 20,200 50,300 C80,400 20,450 50,500 C80,550 20,600 50,700 C80,800 50,750 50,750";

// Step node positions along the path (approximate y-positions)
export const WORKFLOW_NODES = [
  { x: 50, y: 50 },
  { x: 50, y: 300 },
  { x: 50, y: 500 },
  { x: 50, y: 700 },
];

// ── Corner Brackets for Demo Section ────────────────────────────────

// Each bracket: an L-shape drawn from corner. size = arm length
export function cornerBracketPath(
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

// ── Stats Arc Ring (viewBox 0 0 120 120) ────────────────────────────

// 270° arc centered at 60,60 with radius 50
export const STATS_ARC_PATH =
  "M60,10 A50,50 0 1 1 10,60";

// Full circle for background track
export const STATS_TRACK_PATH =
  "M60,10 A50,50 0 1 1 59.99,10";
