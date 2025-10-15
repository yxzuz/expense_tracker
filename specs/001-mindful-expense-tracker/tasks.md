# Tasks: Mindful Expense Tracker – Calm Page Outline

Date: 2025-10-15  
Branch: 001-mindful-expense-tracker  
Plan: ./plan.md  
Spec: ./spec.md

## Phase 1 – Setup

- [ ] T001 Initialize Next.js 14 project structure and TypeScript config per plan in repository root
- [ ] T002 Add Tailwind CSS v4 and PostCSS config files at repository root (tailwind.config.ts, postcss.config.js)
- [ ] T003 Create global styles with soft palette and a11y defaults in /styles/globals.css
- [ ] T004 Configure Next.js static export in /next.config.js and add base app structure in /app/
- [ ] T005 Add PWA basics: /public/manifest.webmanifest and /public/favicon.ico
- [ ] T006 Create simple service worker /public/sw.js that caches shell (HTML, CSS, main JS)
- [ ] T007 Add light/dark mode class toggle on <html> in /app/layout.tsx (system preference fallback)

## Phase 2 – Foundational

- [ ] T008 Create currency helpers in /lib/currency.ts using Intl.NumberFormat
- [ ] T009 Create date helpers in /lib/dates.ts (month boundaries, filters)
- [ ] T010 Define storage utilities and keyed versions in /lib/storage.ts (expenses:v1, preferences:v1)
- [ ] T011 Define validation guards/parsers in /lib/validation.ts for Expense and Preferences
- [ ] T012 Implement expenses hook with localStorage CRUD in /hooks/useExpenses.ts

## Phase 3 – User Story 1 (P1): Glanceable Dashboard Overview

- [ ] T013 [US1] Add Dashboard route file at /app/page.tsx with monthly summary and remaining budget
- [ ] T014 [US1] Add summary cards components in /components/cards/ with calm, accessible presentation
- [ ] T015 [US1] Wire Dashboard to useExpenses selectors for total, spent, remaining
- [ ] T016 [US1] Implement empty state for no expenses in /app/page.tsx

## Phase 4 – User Story 2 (P1): Record a New Expense Effortlessly

- [ ] T017 [US2] Create Add Expense page at /app/add-expense/page.tsx with form fields (title, amount, category, date)
- [ ] T018 [US2] Implement form validation and gentle error messages using /lib/validation.ts
- [ ] T019 [US2] Save new expense via useExpenses.create and show calm confirmation
- [ ] T020 [US2] Update Dashboard and History views after successful add

## Phase 5 – User Story 3 (P2): Review and Manage History with Ease

- [ ] T021 [US3] Create History page at /app/history/page.tsx showing list or table of expenses
- [ ] T022 [US3] Add filters by date range and category with clear indicators
- [ ] T023 [US3] Implement edit flow for an expense (inline or modal) in /app/history/page.tsx
- [ ] T024 [US3] Implement delete with confirmation in /app/history/page.tsx

## Phase 6 – User Story 4 (P2): Understand Spending Patterns Calmly

- [ ] T025 [US4] Create Reports page at /app/reports/page.tsx with summaries
- [ ] T026 [P] [US4] Add dynamically imported charts in /components/charts/ (lazy-load in Reports)
- [ ] T027 [US4] Implement category totals and monthly trend logic using /lib/dates.ts and useExpenses

## Phase 7 – User Story 5 (P3): Adjust Preferences Quietly

- [ ] T028 [US5] Create Settings page at /app/settings/page.tsx to manage budget, theme, currency
- [ ] T029 [US5] Persist preferences via /lib/storage.ts and reflect changes across pages
- [ ] T030 [US5] Implement theme toggle and currency selection UI with calm feedback

## Final Phase – Polish & Cross-Cutting

- [ ] T031 Add accessibility passes (labels, focus states, color contrast) across /app and /components
- [ ] T032 Add route-level code-splitting checks and verify initial JS on Dashboard < 200KB gzipped
- [ ] T033 Add basic link checking and static export verification in CI (document in ./quickstart.md)
- [ ] T034 Document Readme-like quickstart in ./quickstart.md with dev/export steps and CDN rewrite note

## Dependencies (Story Order)

1. US1 (Dashboard) and US2 (Add Expense) can proceed in parallel after Foundational
2. US3 (History) depends on expenses hook and validation
3. US4 (Reports) depends on hooks, dates/currency helpers; charts lazy import is parallelizable
4. US5 (Settings) should land before final Dashboard budget polishing

## Parallel Execution Examples

- [P] T026 charts work can proceed while T025 scaffolds Reports page
- [P] T008 currency helpers and T009 date helpers can proceed in parallel
- [P] T014 summary cards can be built in parallel with T013 Dashboard page shell

## Implementation Strategy

- MVP: Complete US1 + US2 (Dashboard + Add Expense) for a usable first release
- Incrementally add US3 (History), US4 (Reports), and US5 (Settings) with lazy charts and preferences
- Keep assets minimal; enforce calm, accessible defaults
