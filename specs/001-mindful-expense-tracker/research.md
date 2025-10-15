# Research: Mindful Expense Tracker – Calm Page Outline

Date: 2025-10-15  
Branch: 001-mindful-expense-tracker

## Decisions and Rationale

### Charts Library

- Decision: Recharts (dynamically imported on Reports)
- Rationale: Declarative API, small mental model, accessible defaults, compatible with static rendering, good community examples.
- Alternatives:
  - Chart.js: Mature, flexible, but imperative API; requires adapter wrappers; bundle may be larger without careful tree-shaking.
  - ECharts: Powerful but heavier; unnecessary for minimalist scope.

### Test Stack

- Decision: Vitest for unit tests; Playwright for smoke/e2e.
- Rationale: Fast DX for TS/React; Playwright for minimal UI flows with static export.
- Alternatives:
  - Jest: Ubiquitous but slower in some setups; Vitest aligns better with Vite-like tooling (acceptable with Next).
  - Cypress: Great DX, but Playwright integrates well with CI matrix and is lighter for our scope.

### Currency/Locale Defaults

- Decision: Use Intl.NumberFormat with user's locale; allow Settings to override currency code.
- Rationale: Matches user expectations and reduces config friction; adheres to calm defaults.
- Alternatives: Hardcode currency or require manual selection (adds friction).

## Mitigations for Constitution

- Performance: Route-level code-splitting, lazy-load charts, optimized images; Dashboard initial JS target < 200KB gzipped.
- Offline Basics: Cache shell (index, CSS, main JS) via simple service worker; read-only offline behavior.
- Privacy: No trackers; minimal localStorage usage for necessary data only.
