# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MedScribe AI** — An AI-powered clinical documentation and report intelligence platform built for the Thinkitive AI-Based Healthcare Development Competition. It helps clinicians document faster with NER extraction + SOAP generation, and helps patients understand lab reports with plain-English explanations.

## Tech Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **UI**: ShadCN UI (new-york style) + Tailwind CSS
- **Animations**: GSAP with `@gsap/react`, custom animation components (Aurora, SplitText, GradientText, CountUp, BlurText, StaggerCards) in `src/components/animations/`
- **Charts**: Recharts (via ShadCN chart component)
- **AI**: Google Gemini 2.5 Flash (`@google/genai`) for NER, SOAP generation, report analysis, and streaming chat
- **Database**: MongoDB with Mongoose
- **Auth**: Custom JWT (jsonwebtoken + bcryptjs) — stored in localStorage

## Commands

```bash
npm run dev       # Start dev server on localhost:3000
npm run build     # Production build (type-checked + linted)
npm run start     # Start production server
npm run lint      # ESLint check
```

## Architecture

### Route Groups
- `(landing)` — Public landing page at `/`
- `(auth)` — `/login` and `/register` (no sidebar)
- `(dashboard)` — All protected routes with sidebar layout: `/dashboard`, `/patients`, `/notes`, `/reports`, `/ai-chat`, `/analytics`

### API Routes (all under `src/app/api/`)
- `auth/login` + `auth/register` — JWT-based auth
- `patients` — CRUD for patient records
- `notes` — Clinical note storage
- `stats` — Dashboard KPI aggregation
- `ai/process-note` — NER extraction + SOAP note generation (Gemini)
- `ai/chat` — SSE streaming chat (Gemini)
- `ai/analyze-report` — Lab report analysis (Gemini)

### Key Patterns
- **Auth flow**: JWT token in localStorage, verified via `src/lib/api-auth.ts` `getAuthUser()` in every API route
- **Gemini AI**: Initialized lazily in `src/lib/gemini.ts`, system prompts stored as constants
- **SSE Streaming**: AI chat uses `ReadableStream` + `TextEncoder` for server-sent events, consumed by `src/hooks/use-sse.ts` on the client
- **GSAP Animations**: Every page uses `gsap.context()` with cleanup in `useEffect`. ScrollTrigger is registered globally. Animation components in `src/components/animations/` are all `"use client"`.
- **MongoDB**: Singleton connection via `src/lib/db.ts` with HMR-safe global caching

### Models (Mongoose — `src/models/`)
- `User` — name, email, password (hashed), role (doctor/patient/admin), specialization
- `Patient` — demographics, allergies, medications, createdBy reference
- `ClinicalNote` — rawText, extracted entities (with character offsets), soapNote, icdCodes, status
- `Report` — uploaded file metadata, extractedData (labValues with flags), explanation

## Environment Variables

Required in `.env.local`:
```
MONGODB_URI=mongodb+srv://...
GEMINI_API_KEY=<from https://aistudio.google.com/>
JWT_SECRET=<any random string 32+ chars>
```

## Important Notes

- All AI outputs display a medical disclaimer
- ShadCN components are in `src/components/ui/` (auto-generated, don't edit directly)
- Custom animation components in `src/components/animations/` replicate ReactBits patterns
- The `components.json` includes a ReactBits registry entry for future use
- Voice dictation uses the Web Speech API (Chrome/Edge only, ~88% browser coverage)
