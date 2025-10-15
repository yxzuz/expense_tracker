# Implementation Plan: Mindful Expense Tracker – Calm Page Outline

**Branch**: `001-mindful-expense-tracker` | **Date**: 2025-10-15 | **Spec**: ./spec.md
**Input**: Feature specification from `/specs/001-mindful-expense-tracker/spec.md`

Note: This plan follows the repository constitution for a static web app and the provided technical stack.

## Summary

Deliver a calm, minimalist Expense Tracker as a static-exported Next.js 14 app with client-side data stored in localStorage. Core pages: Dashboard, Add Expense, History, Reports, and Settings. Keep the initial bundle lean via route-level code-splitting, lazy-load charts, and provide a simple service worker for offline-friendly basics. Styling uses Tailwind CSS with light/dark class toggling and accessible defaults.

## Technical Context

**Language/Version**: TypeScript (ES2020 targets via Next.js 14)  
**Primary Dependencies**: Next.js 14 (App Router, static export), Tailwind CSS (v4), Recharts (charts) [lazy-loaded], clsx/cva (optional), react-hook-form/zod (optional, for forms/validation)  
**Storage**: localStorage (client-side only) with simple versioned migrations  
**Testing**: Vitest or Jest for unit tests; Playwright for basic e2e flows (NEEDS CLARIFICATION: choose one test runner)  
**Target Platform**: Static site on CDN/object storage over HTTPS  
**Project Type**: Web (SPA-like with static export)  
**Performance Goals**: Initial interactive Dashboard route JS < 200KB gzipped; FMP ~2s on mid-tier devices  
**Constraints**: Offline-friendly shell via service worker; no runtime secrets; no server code; no trackers  
**Scale/Scope**: Single-user per device; ~5 core pages; low concurrency (client-only)

Open choices to resolve in Phase 0 research:

- Chart library: Recharts vs Chart.js (target: smallest, accessible, lazy-loadable).
- Test stack: Vitest vs Jest; e2e via Playwright scope.
- Currency/locale formatting defaults.

## Constitution Check (Pre-Design Gate)

- Simplicity-First: PASS — static export only; no server-side features.
- Accessibility & Performance: PASS w/ Mitigation — a11y basics enforced; lazy-load charts; code-split routes; image optimization; target JS < 200KB on Dashboard.
- Offline-Friendly Basics: PASS — plan includes a simple service worker caching the shell (index, CSS, main JS).
- Security & Privacy: PASS — HTTPS-only, no trackers, minimal local storage of necessary data only.
- Reliability & DX: PASS — local preview via Next dev; single build/export; semantic versioning and changelog entries.

## Project Structure

### Documentation (this feature)

```
specs/001-mindful-expense-tracker/
├── plan.md              # This plan
├── research.md          # Phase 0 decisions and rationale
├── data-model.md        # Entities, validation, relationships
├── quickstart.md        # Setup and dev/run/export steps
└── contracts/
    └── openapi.yaml     # Client action contracts (future-API-ready)
```

### Source Code (repository root)

```
/app/                      # Next.js App Router
  ├── layout.tsx          # Root layout, theme class on <html>
  ├── page.tsx            # Dashboard
  ├── add-expense/page.tsx
  ├── history/page.tsx
  ├── reports/page.tsx    # Lazy-load charts
  └── settings/page.tsx

/components/              # UI components (accessible, minimal)
  ├── cards/
  ├── charts/             # Dynamically imported in Reports
  ├── forms/
  └── layout/

/hooks/
  └── useExpenses.ts      # CRUD + derived selectors; localStorage sync

/lib/
  ├── currency.ts         # Intl.NumberFormat helpers
  ├── dates.ts            # Period helpers (month filtering, boundaries)
  ├── storage.ts          # localStorage keys, migrations
  └── validation.ts       # Parsers/guards for Expense, Settings

/public/
  ├── favicon.ico
  ├── manifest.webmanifest
  └── sw.js               # Simple service worker (cache shell)

/styles/
  └── globals.css         # Tailwind base/utilities; soft palette tokens

tailwind.config.[js|ts]
postcss.config.js
next.config.js            # Static export config
```

**Structure Decision**: Single Next.js app with App Router. Client state in hooks/lib. Charts dynamically imported from `/components/charts`. Public assets include manifest and service worker to satisfy offline and PWA meta.

## Implementation Order (Phases)

### Phase 0: Outline & Research

1. Resolve open choices (charts, tests, locale defaults) and document in `research.md` (Decision, Rationale, Alternatives).
2. Confirm constitution mitigations: code-splitting, lazy-loaded charts, service worker scope, cache strategy.

Artifacts: `research.md`

### Phase 1: Design & Contracts

1. Data model (`data-model.md`): Expense, Budget/Preferences entities; validation rules; state transitions for CRUD.
2. Contracts (`contracts/openapi.yaml`): Define REST-style contracts for expenses and settings (client-internal, future-API ready).
3. Quickstart (`quickstart.md`): Steps to install deps, init Tailwind v4, dev run, export, and preview static files. Include dark-mode conventions.
4. Update agent context via `.specify/scripts/bash/update-agent-context.sh copilot`.

Artifacts: `data-model.md`, `contracts/openapi.yaml`, `quickstart.md`

### Phase 2: Implementation Planning (High-Level Tasks)

- Setup Next.js 14, Tailwind v4, TS strict; add globals.css and theme class toggling.
- Implement `/hooks/useExpenses` with localStorage persistence and versioned migrations.
- Build pages incrementally: Dashboard (P1), Add Expense (P1), History (P2), Reports (P2, lazy charts), Settings (P3).
- Add service worker in `/public/sw.js` and register it in a client layout effect.
- Testing: unit tests for storage and helpers; basic e2e for add/edit/delete and filtering; static export and smoke test.

Dependencies between parts:

- Hooks/lib before pages consuming them.
- Settings before Dashboard budget display.
- Date/currency helpers before History/Reports sorting and summaries.
- Charts after Reports scaffolding (dynamic import).

## Constitution Check (Post-Design)

- Performance: Route-level code-splitting; lazy charts; ensure Dashboard initial JS < 200KB gzipped (verify in build stats). PASS w/ verification step.
- Offline: SW caches shell (HTML, CSS, main JS); read-only offline for visited pages. PASS.
- Privacy/Security: No trackers; HTTPS; local-only storage. PASS.
- SPA Routing: Static export and client navigation; ensure CDN rewrite to `/index.html` for deep links. PASS (deployment note in quickstart).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| None      | —          | —                                    |
