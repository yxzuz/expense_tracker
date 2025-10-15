# Expense Tracker Static Web App Constitution

<!-- Minimal, practical requirements for a static site (HTML/CSS/JS) served from a CDN/object storage. -->

## Core Principles

### I. Simplicity-First

- No server-side code in this project. Deliver pure static assets: HTML, CSS, JS, images, fonts, manifest.
- Prefer zero build when possible. If a build is used, it must be deterministic and documented.
- Keep dependencies minimal; avoid heavy frameworks unless justified.

### II. Accessibility and Performance Basics

- Meet baseline a11y: semantic HTML, labels for inputs, color contrast, keyboard navigation.
- First meaningful paint under 2s on mid-tier devices; total JS payload target < 200KB gzipped.
- Images optimized (responsive sources, compression) and lazy-loaded when appropriate.

### III. Offline-Friendly Basics

- Provide a simple service worker to cache core shell (HTML, CSS, main JS) for repeat visits.
- App must function read-only when offline; write actions queue or clearly inform user.

### IV. Security & Privacy Minimums

- All assets served over HTTPS. No mixed content.
- No third-party trackers by default. If analytics is needed, use privacy-friendly, anonymized metrics.
- Store only necessary data in localStorage/IndexedDB; encrypt or avoid sensitive info entirely.

### V. Reliability & DX

- Every change must build locally and preview in a static server.
- A single "deploy" command produces versioned, immutable artifacts.
- Use semantic versioning for releases; changelog is required.

## Project Minimums

- Entry point: `index.html` at repo root or `public/`.
- Meta: `favicon`, `manifest.webmanifest` (name, icons, start_url, display=standalone), viewport tag.
- Routing: For SPA, serve `index.html` on unknown routes (CDN rewrite rule).
- Build (if used): output to `dist/` only; no runtime secrets; environment via compile-time variables.
- Lint/format: Prettier (or equivalent) and basic HTML/CSS linting.

## Workflow Minimums

- Local dev: run a static server (e.g., `npx serve` or `python -m http.server`).
- CI: build (if applicable) and publish artifacts; enforce no broken links (simple link checker).
- Deploy: push `dist/` (or `public/`) to CDN/storage with cache headers: HTML `no-cache`, assets `cache-control: public, max-age=31536000, immutable`.
- Rollback: keep last 2 versions addressable and restorable.

## Governance

<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

This constitution sets the non-negotiable minimums for the static web app. Any change must:

- Document the rationale in the changelog.
- Update deployment/config docs if behavior changes.
- Maintain backward-compatible URLs when feasible.

**Version**: 1.0.0 | **Ratified**: 2025-10-15 | **Last Amended**: 2025-10-15

<!-- Keep dates in ISO format (YYYY-MM-DD). -->
