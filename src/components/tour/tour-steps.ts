export type TooltipPosition = "top" | "bottom" | "left" | "right";

export interface TourStep {
  id: string;
  page: string;
  targetSelector: string;
  title: string;
  description: string;
  accentColor: string;
  tooltipPosition: TooltipPosition;
}

export const TOUR_STEPS: TourStep[] = [
  // ── Layout Steps (on /dashboard) ─────────────────────────────────
  {
    id: "sidebar",
    page: "/dashboard",
    targetSelector: '[data-tour-id="sidebar"]',
    title: "Navigation Sidebar",
    description:
      "Your main navigation hub. Hover to expand and explore all 23 modules — from clinical notes to billing.",
    accentColor: "#8b5cf6",
    tooltipPosition: "right",
  },
  {
    id: "chat-button",
    page: "/dashboard",
    targetSelector: '[data-tour-id="chat-button"]',
    title: "AI Chat Assistant",
    description:
      "Instant AI help — ask clinical questions, get drug interactions, or summarize patient history anytime.",
    accentColor: "#ec4899",
    tooltipPosition: "left",
  },
  {
    id: "site-arch-button",
    page: "/dashboard",
    targetSelector: '[data-tour-id="site-arch-button"]',
    title: "Site Architecture",
    description:
      "See the full platform map — an interactive visual graph of every page and how they connect.",
    accentColor: "#6366f1",
    tooltipPosition: "left",
  },

  // ── Dashboard ────────────────────────────────────────────────────
  {
    id: "dashboard-kpis",
    page: "/dashboard",
    targetSelector: '[data-tour-id="dashboard-kpis"]',
    title: "Key Performance Indicators",
    description:
      "Live metrics at a glance — total patients, clinical notes, reports analyzed, and AI analyses today.",
    accentColor: "#3b82f6",
    tooltipPosition: "bottom",
  },
  {
    id: "dashboard-charts",
    page: "/dashboard",
    targetSelector: '[data-tour-id="dashboard-charts"]',
    title: "Activity & Trends",
    description:
      "Visual charts showing patient activity, note creation trends, and AI usage patterns over time.",
    accentColor: "#3b82f6",
    tooltipPosition: "top",
  },

  // ── Patients ─────────────────────────────────────────────────────
  {
    id: "patients-header",
    page: "/patients",
    targetSelector: '[data-tour-id="patients-header"]',
    title: "Patient Management",
    description:
      "Search existing patients or add new ones. Each patient profile stores demographics, allergies, and medications.",
    accentColor: "#10b981",
    tooltipPosition: "bottom",
  },
  {
    id: "patients-grid",
    page: "/patients",
    targetSelector: '[data-tour-id="patients-grid"]',
    title: "Patient Directory",
    description:
      "Browse all patients in card view. Click any patient to see their full medical history and care plans.",
    accentColor: "#10b981",
    tooltipPosition: "top",
  },

  // ── Clinical Notes ───────────────────────────────────────────────
  {
    id: "notes-voice",
    page: "/notes",
    targetSelector: '[data-tour-id="notes-voice"]',
    title: "Voice Dictation",
    description:
      "Speak naturally — AI transcribes your clinical notes in real-time. Supports multiple languages.",
    accentColor: "#f59e0b",
    tooltipPosition: "bottom",
  },
  {
    id: "notes-results",
    page: "/notes",
    targetSelector: '[data-tour-id="notes-results"]',
    title: "AI-Powered Analysis",
    description:
      "Automatic entity extraction, SOAP note generation, and ICD-10 code suggestions from your dictation.",
    accentColor: "#f59e0b",
    tooltipPosition: "top",
  },

  // ── Reports ──────────────────────────────────────────────────────
  {
    id: "reports-upload",
    page: "/reports",
    targetSelector: '[data-tour-id="reports-upload"]',
    title: "Upload Reports",
    description:
      "Drag & drop lab results, imaging reports, or PDFs. AI extracts structured data automatically.",
    accentColor: "#ef4444",
    tooltipPosition: "bottom",
  },
  {
    id: "reports-results",
    page: "/reports",
    targetSelector: '[data-tour-id="reports-results"]',
    title: "Report Analysis",
    description:
      "AI-generated explanations of medical reports in simple language — great for patient education.",
    accentColor: "#ef4444",
    tooltipPosition: "top",
  },

  // ── AI Chat ──────────────────────────────────────────────────────
  {
    id: "chat-suggestions",
    page: "/ai-chat",
    targetSelector: '[data-tour-id="chat-suggestions"]',
    title: "Smart Suggestions",
    description:
      "Pre-built clinical queries to get you started — drug interactions, differential diagnoses, and more.",
    accentColor: "#8b5cf6",
    tooltipPosition: "bottom",
  },
  {
    id: "chat-messages",
    page: "/ai-chat",
    targetSelector: '[data-tour-id="chat-messages"]',
    title: "AI Conversation",
    description:
      "Chat with a medical AI assistant trained on clinical knowledge. Ask anything about patient care.",
    accentColor: "#8b5cf6",
    tooltipPosition: "top",
  },

  // ── Analytics ────────────────────────────────────────────────────
  {
    id: "analytics-stats",
    page: "/analytics",
    targetSelector: '[data-tour-id="analytics-stats"]',
    title: "Practice Statistics",
    description:
      "Key numbers for your practice — patient volume, revenue trends, note completion rates, and more.",
    accentColor: "#06b6d4",
    tooltipPosition: "bottom",
  },
  {
    id: "analytics-charts",
    page: "/analytics",
    targetSelector: '[data-tour-id="analytics-charts"]',
    title: "Visual Analytics",
    description:
      "Interactive charts and graphs for deep-dive analysis. Filter by date range, department, or provider.",
    accentColor: "#06b6d4",
    tooltipPosition: "top",
  },

  // ── Health Assistant ─────────────────────────────────────────────
  {
    id: "health-symptoms",
    page: "/health-assistant",
    targetSelector: '[data-tour-id="health-symptoms"]',
    title: "Symptom Selection",
    description:
      "Select symptoms from quick-pick chips or describe them freely. AI evaluates severity in real-time.",
    accentColor: "#ec4899",
    tooltipPosition: "bottom",
  },
  {
    id: "health-chat",
    page: "/health-assistant",
    targetSelector: '[data-tour-id="health-chat"]',
    title: "Triage Chat",
    description:
      "AI-guided triage conversation — assesses urgency and recommends appropriate level of care.",
    accentColor: "#ec4899",
    tooltipPosition: "top",
  },

  // ── Care Plans ───────────────────────────────────────────────────
  {
    id: "care-plans-header",
    page: "/care-plans",
    targetSelector: '[data-tour-id="care-plans-header"]',
    title: "Create Care Plans",
    description:
      "AI generates personalized care plans with medications, exercises, and diet recommendations.",
    accentColor: "#14b8a6",
    tooltipPosition: "bottom",
  },
  {
    id: "care-plans-grid",
    page: "/care-plans",
    targetSelector: '[data-tour-id="care-plans-grid"]',
    title: "Active Plans",
    description:
      "View and manage all active care plans. Track patient progress, adherence, and milestones.",
    accentColor: "#14b8a6",
    tooltipPosition: "top",
  },

  // ── Education ────────────────────────────────────────────────────
  {
    id: "education-achievements",
    page: "/education",
    targetSelector: '[data-tour-id="education-achievements"]',
    title: "Patient Achievements",
    description:
      "Gamified health education — patients earn badges and points for completing learning modules.",
    accentColor: "#f97316",
    tooltipPosition: "bottom",
  },
  {
    id: "education-content",
    page: "/education",
    targetSelector: '[data-tour-id="education-content"]',
    title: "Education Library",
    description:
      "AI-generated health education content simplified for patient understanding. Multi-language support.",
    accentColor: "#f97316",
    tooltipPosition: "top",
  },

  // ── Visits ───────────────────────────────────────────────────────
  {
    id: "visits-header",
    page: "/visits",
    targetSelector: '[data-tour-id="visits-header"]',
    title: "Visit Management",
    description:
      "Schedule and manage patient visits. AI pre-screens patients before appointments.",
    accentColor: "#a855f7",
    tooltipPosition: "bottom",
  },
  {
    id: "visits-list",
    page: "/visits",
    targetSelector: '[data-tour-id="visits-list"]',
    title: "Visit History",
    description:
      "Complete visit log with summaries, care instructions, and follow-up tracking for every patient.",
    accentColor: "#a855f7",
    tooltipPosition: "top",
  },

  // ── Scheduling ───────────────────────────────────────────────────
  {
    id: "scheduling-tabs",
    page: "/scheduling",
    targetSelector: '[data-tour-id="scheduling-tabs"]',
    title: "Smart Scheduling",
    description:
      "AI-optimized appointment scheduling — predicts no-shows and suggests optimal time slots.",
    accentColor: "#6366f1",
    tooltipPosition: "bottom",
  },
  {
    id: "scheduling-actions",
    page: "/scheduling",
    targetSelector: '[data-tour-id="scheduling-actions"]',
    title: "Quick Actions",
    description:
      "One-click actions for check-in, rescheduling, and automated patient reminders.",
    accentColor: "#6366f1",
    tooltipPosition: "top",
  },

  // ── Call Routing ─────────────────────────────────────────────────
  {
    id: "call-categories",
    page: "/call-routing",
    targetSelector: '[data-tour-id="call-categories"]',
    title: "Call Categories",
    description:
      "Select the call type — prescription refills, appointment requests, urgent care, or billing inquiries.",
    accentColor: "#0ea5e9",
    tooltipPosition: "bottom",
  },
  {
    id: "call-chat",
    page: "/call-routing",
    targetSelector: '[data-tour-id="call-chat"]',
    title: "AI Call Assistant",
    description:
      "AI routes calls intelligently, provides scripts, and logs conversation summaries automatically.",
    accentColor: "#0ea5e9",
    tooltipPosition: "top",
  },

  // ── Insurance ────────────────────────────────────────────────────
  {
    id: "insurance-form",
    page: "/insurance",
    targetSelector: '[data-tour-id="insurance-form"]',
    title: "Insurance Verification",
    description:
      "Enter policy details for instant AI-powered eligibility checks. Verifies coverage in seconds.",
    accentColor: "#22c55e",
    tooltipPosition: "bottom",
  },
  {
    id: "insurance-results",
    page: "/insurance",
    targetSelector: '[data-tour-id="insurance-results"]',
    title: "Coverage Results",
    description:
      "Detailed breakdown — eligible services, copay amounts, deductibles, and prior auth requirements.",
    accentColor: "#22c55e",
    tooltipPosition: "top",
  },

  // ── Medical Coding ───────────────────────────────────────────────
  {
    id: "coding-input",
    page: "/medical-coding",
    targetSelector: '[data-tour-id="coding-input"]',
    title: "Clinical Input",
    description:
      "Paste clinical notes or select from existing ones. AI extracts ICD-10, CPT, and HCPCS codes.",
    accentColor: "#d946ef",
    tooltipPosition: "bottom",
  },
  {
    id: "coding-results",
    page: "/medical-coding",
    targetSelector: '[data-tour-id="coding-results"]',
    title: "Code Suggestions",
    description:
      "AI-suggested codes with confidence scores, denial risk alerts, and revenue optimization tips.",
    accentColor: "#d946ef",
    tooltipPosition: "top",
  },

  // ── Billing ──────────────────────────────────────────────────────
  {
    id: "billing-kpis",
    page: "/billing",
    targetSelector: '[data-tour-id="billing-kpis"]',
    title: "Revenue Overview",
    description:
      "Real-time revenue metrics — total charges, insurance payments, patient balances, and denial rates.",
    accentColor: "#eab308",
    tooltipPosition: "bottom",
  },
  {
    id: "billing-claims",
    page: "/billing",
    targetSelector: '[data-tour-id="billing-claims"]',
    title: "Claims Management",
    description:
      "Track claim lifecycle — submission, processing, payment, and denial recovery with AI assistance.",
    accentColor: "#eab308",
    tooltipPosition: "top",
  },

  // ── Nursing Assistant ────────────────────────────────────────────
  {
    id: "nursing-voice",
    page: "/nursing-assistant",
    targetSelector: '[data-tour-id="nursing-voice"]',
    title: "Nursing Voice Input",
    description:
      "Hands-free task logging — speak patient vitals, medication administration, or care notes.",
    accentColor: "#f43f5e",
    tooltipPosition: "bottom",
  },
  {
    id: "nursing-results",
    page: "/nursing-assistant",
    targetSelector: '[data-tour-id="nursing-results"]',
    title: "Task Summary",
    description:
      "AI organizes spoken input into structured tasks with priorities, medications, and alert flags.",
    accentColor: "#f43f5e",
    tooltipPosition: "top",
  },

  // ── Patient Monitoring ───────────────────────────────────────────
  {
    id: "monitoring-vitals",
    page: "/patient-monitoring",
    targetSelector: '[data-tour-id="monitoring-vitals"]',
    title: "Vital Signs",
    description:
      "Real-time patient vitals — heart rate, blood pressure, SpO2, temperature with AI anomaly detection.",
    accentColor: "#84cc16",
    tooltipPosition: "bottom",
  },
  {
    id: "monitoring-charts",
    page: "/patient-monitoring",
    targetSelector: '[data-tour-id="monitoring-charts"]',
    title: "Trend Charts",
    description:
      "Historical vital sign trends with AI-powered analysis highlighting concerning patterns.",
    accentColor: "#84cc16",
    tooltipPosition: "top",
  },

  // ── Shift Scheduling ────────────────────────────────────────────
  {
    id: "shift-grid",
    page: "/shift-scheduling",
    targetSelector: '[data-tour-id="shift-grid"]',
    title: "Shift Schedule",
    description:
      "Weekly staff scheduling grid — assign shifts by department with drag-and-drop simplicity.",
    accentColor: "#7c3aed",
    tooltipPosition: "bottom",
  },
  {
    id: "shift-optimize",
    page: "/shift-scheduling",
    targetSelector: '[data-tour-id="shift-optimize"]',
    title: "AI Optimization",
    description:
      "AI predicts patient load and suggests optimal staffing levels to prevent burnout and gaps.",
    accentColor: "#7c3aed",
    tooltipPosition: "top",
  },

  // ── Staff Training ──────────────────────────────────────────────
  {
    id: "training-generate",
    page: "/staff-training",
    targetSelector: '[data-tour-id="training-generate"]',
    title: "Generate Training",
    description:
      "AI creates customized training modules for any medical topic — with quizzes and difficulty levels.",
    accentColor: "#0d9488",
    tooltipPosition: "bottom",
  },
  {
    id: "training-modules",
    page: "/staff-training",
    targetSelector: '[data-tour-id="training-modules"]',
    title: "Training Library",
    description:
      "Browse and complete training modules. Track staff certifications and continuing education credits.",
    accentColor: "#0d9488",
    tooltipPosition: "top",
  },

  // ── Profile ──────────────────────────────────────────────────────
  {
    id: "profile-info",
    page: "/profile",
    targetSelector: '[data-tour-id="profile-info"]',
    title: "Your Profile",
    description:
      "Manage your professional information — name, specialization, credentials, and avatar.",
    accentColor: "#64748b",
    tooltipPosition: "bottom",
  },
  {
    id: "profile-settings",
    page: "/profile",
    targetSelector: '[data-tour-id="profile-settings"]',
    title: "Settings",
    description:
      "Customize your preferences — notification settings, language, theme, and security options.",
    accentColor: "#64748b",
    tooltipPosition: "top",
  },

  // ── Final Step (back to /dashboard) ──────────────────────────────
  {
    id: "guide-button",
    page: "/dashboard",
    targetSelector: '[data-tour-id="guide-button"]',
    title: "Need Help Again?",
    description:
      "Click this button anytime to restart the guided tour. Welcome to MedScribe AI!",
    accentColor: "#10b981",
    tooltipPosition: "left",
  },
];
