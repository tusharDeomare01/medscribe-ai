// ── Pitch Slide Definitions ─────────────────────────────────────────

export interface PitchSlide {
  id: string;
  title: string;
  subtitle: string;
  accentColor: string;
  autoAdvanceMs: number;
}

export const PITCH_SLIDES: PitchSlide[] = [
  {
    id: "hook",
    title: "What if AI could give doctors 2 hours back every day?",
    subtitle: "The question that started it all",
    accentColor: "#10b981", // emerald
    autoAdvanceMs: 8000,
  },
  {
    id: "pain",
    title: "The Documentation Crisis",
    subtitle: "Healthcare is drowning in paperwork",
    accentColor: "#ef4444", // red (urgency)
    autoAdvanceMs: 10000,
  },
  {
    id: "solution",
    title: "Meet MedScribe AI",
    subtitle: "Clinical Documentation Reimagined with AI",
    accentColor: "#3b82f6", // blue (trust)
    autoAdvanceMs: 9000,
  },
  {
    id: "core-demo",
    title: "From Voice to Clinical Note in Seconds",
    subtitle: "Watch the AI pipeline in action",
    accentColor: "#8b5cf6", // violet
    autoAdvanceMs: 12000,
  },
  {
    id: "intelligence",
    title: "20 AI-Powered Capabilities",
    subtitle: "Every clinical workflow, automated",
    accentColor: "#f59e0b", // amber
    autoAdvanceMs: 10000,
  },
  {
    id: "roles",
    title: "Built for Every Role",
    subtitle: "Doctors, Nurses, Front-Office, Patients",
    accentColor: "#06b6d4", // cyan
    autoAdvanceMs: 9000,
  },
  {
    id: "depth",
    title: "23 Specialized Pages",
    subtitle: "A complete clinical operations platform",
    accentColor: "#a855f7", // purple
    autoAdvanceMs: 10000,
  },
  {
    id: "tech",
    title: "Enterprise-Grade Architecture",
    subtitle: "Built for scale, security, and speed",
    accentColor: "#64748b", // slate
    autoAdvanceMs: 9000,
  },
  {
    id: "metrics",
    title: "The Numbers Speak",
    subtitle: "Real impact, measured",
    accentColor: "#10b981", // emerald
    autoAdvanceMs: 9000,
  },
  {
    id: "close",
    title: "Ready to Transform Healthcare?",
    subtitle: "See it in action",
    accentColor: "#f59e0b", // gold
    autoAdvanceMs: 0, // no auto-advance on last slide
  },
];

// ── AI Capability Definitions (for Slide 5) ────────────────────────

export interface AICapability {
  id: string;
  name: string;
  category: "clinical" | "nursing" | "frontoffice" | "billing" | "patient";
}

export const AI_CAPABILITIES: AICapability[] = [
  // Clinical (5)
  { id: "soap", name: "SOAP Notes", category: "clinical" },
  { id: "ner", name: "NER Extraction", category: "clinical" },
  { id: "chat", name: "AI Chat", category: "clinical" },
  { id: "reports", name: "Lab Analysis", category: "clinical" },
  { id: "vitals", name: "Vitals Analysis", category: "clinical" },
  // Nursing (4)
  { id: "triage", name: "AI Triage", category: "nursing" },
  { id: "nursing", name: "Nurse Tasks", category: "nursing" },
  { id: "monitoring", name: "Patient Monitor", category: "nursing" },
  { id: "shift", name: "Shift Optimizer", category: "nursing" },
  // Front-Office (4)
  { id: "scheduling", name: "Smart Scheduling", category: "frontoffice" },
  { id: "callroute", name: "Call Routing", category: "frontoffice" },
  { id: "insurance", name: "Insurance Check", category: "frontoffice" },
  { id: "noshow", name: "No-Show Predict", category: "frontoffice" },
  // Billing (3)
  { id: "coding", name: "Medical Coding", category: "billing" },
  { id: "audit", name: "Claims Audit", category: "billing" },
  { id: "finance", name: "Financial Guide", category: "billing" },
  // Patient (4)
  { id: "careplan", name: "Care Plans", category: "patient" },
  { id: "education", name: "Health Ed", category: "patient" },
  { id: "prescreening", name: "Pre-Screening", category: "patient" },
  { id: "training", name: "Staff Training", category: "patient" },
];

export const CATEGORY_LABELS: Record<string, string> = {
  clinical: "Clinical",
  nursing: "Nursing",
  frontoffice: "Front-Office",
  billing: "Billing",
  patient: "Patient Care",
};

export const CATEGORY_COLORS: Record<string, string> = {
  clinical: "#3b82f6",
  nursing: "#10b981",
  frontoffice: "#f59e0b",
  billing: "#8b5cf6",
  patient: "#ec4899",
};

// ── Role Definitions (for Slide 6) ─────────────────────────────────

export interface RoleDefinition {
  id: string;
  name: string;
  features: string[];
  featureCount: number;
}

export const ROLES: RoleDefinition[] = [
  {
    id: "doctor",
    name: "Doctor",
    features: ["SOAP Note Generation", "Lab Report Analysis", "AI Clinical Chat", "Medical Coding"],
    featureCount: 4,
  },
  {
    id: "nurse",
    name: "Nurse",
    features: ["Voice Task Parsing", "Patient Monitoring", "Shift Scheduling"],
    featureCount: 3,
  },
  {
    id: "frontoffice",
    name: "Front-Office",
    features: ["Smart Scheduling", "Call Routing", "Insurance Verification"],
    featureCount: 3,
  },
  {
    id: "patient",
    name: "Patient",
    features: ["Care Plans", "Health Education", "Pre-Visit Screening"],
    featureCount: 3,
  },
];

// ── Site Map Nodes (for Slide 7) ────────────────────────────────────

export interface SiteNode {
  id: string;
  name: string;
  cluster: string;
}

export const SITE_NODES: SiteNode[] = [
  { id: "dashboard", name: "Dashboard", cluster: "core" },
  { id: "patients", name: "Patients", cluster: "clinical" },
  { id: "notes", name: "Notes", cluster: "clinical" },
  { id: "reports", name: "Reports", cluster: "clinical" },
  { id: "ai-chat", name: "AI Chat", cluster: "clinical" },
  { id: "analytics", name: "Analytics", cluster: "clinical" },
  { id: "health-assistant", name: "Health Assistant", cluster: "nursing" },
  { id: "nursing-assistant", name: "Nursing Tasks", cluster: "nursing" },
  { id: "patient-monitoring", name: "Monitoring", cluster: "nursing" },
  { id: "shift-scheduling", name: "Shifts", cluster: "nursing" },
  { id: "scheduling", name: "Scheduling", cluster: "frontoffice" },
  { id: "call-routing", name: "Call Routing", cluster: "frontoffice" },
  { id: "insurance", name: "Insurance", cluster: "frontoffice" },
  { id: "medical-coding", name: "Coding", cluster: "billing" },
  { id: "billing", name: "Billing", cluster: "billing" },
  { id: "care-plans", name: "Care Plans", cluster: "patient" },
  { id: "education", name: "Education", cluster: "patient" },
  { id: "visits", name: "Visits", cluster: "patient" },
  { id: "staff-training", name: "Training", cluster: "settings" },
  { id: "profile", name: "Profile", cluster: "settings" },
  { id: "sitemap", name: "Sitemap", cluster: "settings" },
  { id: "care-plan-detail", name: "Plan Detail", cluster: "patient" },
  { id: "visit-detail", name: "Visit Detail", cluster: "patient" },
];

export const CLUSTER_ANGLES: Record<string, number> = {
  core: 0,        // center
  clinical: 30,   // top-right
  nursing: 100,   // right
  frontoffice: 170, // bottom-right
  billing: 230,   // bottom-left
  patient: 300,   // left
  settings: 340,  // top-left
};

// ── Tech Stack (for Slide 8) ────────────────────────────────────────

export interface TechNode {
  id: string;
  name: string;
  subtitle: string;
}

export const TECH_STACK: TechNode[] = [
  { id: "nextjs", name: "Next.js 14", subtitle: "App Router" },
  { id: "gemini", name: "Gemini 2.5", subtitle: "AI Engine" },
  { id: "prisma", name: "Prisma ORM", subtitle: "Data Layer" },
  { id: "postgres", name: "PostgreSQL", subtitle: "Neon Serverless" },
  { id: "security", name: "JWT + RBAC", subtitle: "HIPAA-Ready" },
];

export const TECH_BADGES = [
  "TypeScript",
  "ShadCN UI",
  "GSAP Club",
  "Tailwind CSS",
  "Neon DB",
  "Zod v4",
];

// ── Stat Metrics (for Slide 9) ──────────────────────────────────────

export interface StatMetric {
  id: string;
  value: number;
  suffix: string;
  label: string;
  orbitRadius: number;
}

export const STAT_METRICS: StatMetric[] = [
  { id: "accuracy", value: 98.5, suffix: "%", label: "AI Accuracy", orbitRadius: 80 },
  { id: "timesaved", value: 2, suffix: "hrs", label: "Saved Per Day", orbitRadius: 120 },
  { id: "endpoints", value: 20, suffix: "", label: "AI Endpoints", orbitRadius: 160 },
  { id: "pages", value: 23, suffix: "", label: "App Pages", orbitRadius: 200 },
];
