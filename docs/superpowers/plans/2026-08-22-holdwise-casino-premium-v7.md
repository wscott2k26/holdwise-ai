# HoldWise Casino Premium V7 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild HoldWise around a bright premium card-game shell with real casino/card photography, five-part mobile navigation, premium shared game tables, and optional casino ambience while preserving the proven 21 game engines.

**Architecture:** Keep game engines and game-table behavior intact. Add the visual/atmosphere layer through shared components, hub pages, app settings, and CSS so all games inherit the redesign. Real Unsplash-licensed photography is loaded with gradient fallbacks; casino ambience is opt-in and generated through Web Audio so it works without bundling copyrighted audio.

**Tech Stack:** React, React Router, Vite, Tailwind, Lucide, Web Audio API, existing HoldWise game engines/progress store.

**Spec:** Approved HoldWise rebuild direction from 2026-08-22 conversation: Bolt structure + brighter card-app usability + real casino/card photos + optional casino ambience.

## Global Constraints
- Preserve all 21 existing game engines and their rules.
- Casino ambience defaults OFF and supports off/low/high.
- Rotating real-photo backgrounds can be disabled.
- Reduced-motion users must not get automatic photo motion.
- App Store release workflow and bundle id remain unchanged.
- Full completion gate: tests, lint, typecheck, production build, and gameplay audit all pass.

---

### Task 1: Lock V7 behavior contract
**Files:** `tests/casino-premium-v7.test.mjs`, `.github/workflows/premium-v7-contract.yml`
- [x] Write source-level contract tests first.
- [ ] Confirm they fail against the pre-rebuild app.
- [ ] Keep contract green after implementation.

### Task 2: Atmosphere and persisted controls
**Files:** `src/lib/appContext.jsx`, `src/lib/casinoAmbience.js`, `src/components/premium/CinematicBackdrop.jsx`, `src/components/premium/SensoryControls.jsx`
- [ ] Add persisted ambience/background settings with safe migration.
- [ ] Add off/low/high Web Audio ambience controller.
- [ ] Add five licensed real casino/card photo scenes with 12-second crossfade and fallback.
- [ ] Respect reduced motion and background toggle.

### Task 3: Premium mobile navigation
**Files:** `src/components/premium/PremiumBottomNav.jsx`, `src/App.jsx`
- [ ] Add Home, Games, Practice, Learn, Progress routes.
- [ ] Add mobile bottom navigation and keep game routes intact.

### Task 4: Premium hub pages
**Files:** `src/pages/PremiumHome.jsx`, `src/pages/GameLibrary.jsx`, `src/pages/PracticeHub.jsx`, `src/pages/LearnHub.jsx`, `src/pages/ProgressHub.jsx`
- [ ] Build a photo-backed home hero, featured/continue/daily sections.
- [ ] Build searchable/filterable 21-game library with Play/Learn actions.
- [ ] Build practice hub using real game/tutorial routes.
- [ ] Build tutorial/Coach Ace learning hub.
- [ ] Build progress dashboard from the existing progress store.

### Task 5: Shared game-table uplift
**Files:** `src/components/games/GameShell.jsx`, `src/index.css`
- [ ] Wrap every game in one premium felt/table stage.
- [ ] Keep Coach Ace and tutorial actions intact.
- [ ] Add card-focused contrast, responsive spacing, larger touch targets and premium surface styles.

### Task 6: Bright premium design system
**Files:** `src/index.css`
- [ ] Add emerald/teal/ivory/gold design tokens and photo overlay treatment.
- [ ] Add Bolt-inspired glass cards, library cards, hero panels and progress cards without copying Bolt branding.
- [ ] Add responsive bottom-nav safe-area spacing and reduced-motion rules.

### Task 7: Release verification
**Files:** `.release/premium-v7-contract.txt`
- [ ] Run V7 contract.
- [ ] Run `npm run test`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run build`.
- [ ] Run `npm run audit:gameplay` and require PASS before integration.
