# Shelter Toronto — shelter-client

This repository is the frontend client for a Shelter Toronto web app. It is a small React application built with Vite and Sass that displays shelters, a map view, and resources. This README is written for two audiences:

- Developers: how to run, test, and extend the app.
- Hiring managers / reviewers: what to look for when evaluating the code, UX, and engineering choices.

## Project snapshot

- Framework: React (Vite)
- Styling: SCSS + modular component styles
- Map: react-leaflet + Leaflet
- HTTP: axios
- Date handling: date-fns

The app focuses on clarity, accessibility, and responsiveness. Components are organized under `src/components`, pages under `src/pages`, and utilities under `src/utils`.

## Quick start (developer)

Prerequisites:
- Node 18+ recommended
- npm (or use Yarn / pnpm if preferred)

Install and run in development:

```bash
npm install
npm run dev
```

Other useful scripts (project root):
- `npm run build` — produce a production build
- `npm run preview` — locally preview the production build
- `npm run lint` — run ESLint
- `npm run format` — run Prettier to auto-format source files

Files of interest:
- `src/main.jsx` — app bootstrapping and router
- `src/App.jsx` — top-level routes and layout
- `src/components/Nav/` — responsive navigation
- `src/components/SheltersMap/` — map page and map-related logic
- `src/api/shelters.js` — API client for shelter data

## Architecture & patterns

- Mobile-first, component-based layout.
- Small, focused components (single responsibility).
- Utility functions for common logic (distance calculation, filtering) live in `src/utils`.
- Styling uses scoped component SCSS files and a global `_global.scss` for variables and basic resets.

## What to look for 

Frontend engineering quality is often demonstrated across several axes; here's a concise checklist to evaluate this repo:

- Code organization: logical component / page separation, small components, clear file structure.
- Readability: clear naming, short functions, sensible abstraction boundaries.
- Styling: consistent CSS/SCSS patterns, responsive rules, and minimal duplication.
- Accessibility: semantic HTML, keyboard support, focus states, ARIA where appropriate (e.g., map markers, toggles).
- Performance: sensible bundling, avoiding heavy synchronous work in rendering, lazy-loading where appropriate (map, large lists).
- Testing (if present): unit tests for utils/components and clear test strategy.
- Version control hygiene: readable commits, descriptive messages, small focused PRs.

Suggested targeted review tasks for an interview or code review:

- Open `src/components/Nav` and verify responsive behavior and accessibility.
- Inspect `src/components/ShelterDisclaimer` for keyboard support and click behavior.
- Review `src/utils/filterSheltersWithOccupancy.js` for correctness and edge cases.
- Run `npm run lint` and check for autofixable issues.

## Extending the app 

- Adding a new page: add a route in `src/App.jsx` and create a new folder under `src/pages`.
- Adding API calls: use `src/api/shelters.js` as a pattern (axios instance + small wrappers).
- Styling: follow the existing SCSS module pattern; add variables to `src/styles/_global.scss`.

## Deployment notes

The project uses Vite — a static build is produced by `npm run build`. Deploy the `dist/` folder to any static host (Netlify, Vercel, S3 + CloudFront). If you use environment variables for API URLs, inject them at build time (Vite uses `import.meta.env`).

## Code quality & automation

- ESLint and Prettier are configured. Run `npm run lint` and `npm run format` before creating PRs.
- Consider adding CI (GitHub Actions) to run lint and build on every PR.

## Quick evaluation rubric 



