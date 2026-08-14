# HoldWise Premium Visual System Design

**Date:** 2026-08-13  
**Product:** HoldWise: Video Poker Coach  
**Source baseline:** v1.4.0  
**Scope:** Premium visual and interaction redesign only; preserve verified strategy, Academy, billing, auth, and release systems.

## 1. Goal

Transform HoldWise from a competent educational card app into a polished, premium-feeling iPhone-first learning experience without restarting the product or destabilizing its verified card logic.

The redesign is governed by three locked experience pillars:

1. **Liquid Glassmorphism** — layered translucent surfaces, luminous edges, soft depth, selective blur, and clear material hierarchy.
2. **Tactile Maximalism** — controls look pressable and respond with compression, depth shifts, spring motion, and haptics where the platform supports them.
3. **Immersive Cinematic Pacing** — information is revealed in deliberate stages rather than appearing all at once; cards, coach feedback, progress, and transitions feel directed rather than abrupt.

The first release focuses on five experiences that determine the app's perceived quality:

- Onboarding
- Home
- Video-poker trainer
- Coach Ace explanation flow
- Progress / Statistics

## 2. Non-goals

This redesign does **not**:

- change the exact video-poker strategy engine, pay tables, evaluator, or worker behavior;
- add a second animation library, second backend, or new state framework;
- rebuild the Academy content system;
- alter StoreKit product identifiers or entitlement semantics;
- add casino wagering, cash balances, winnings/losses, or gambling mechanics;
- replace Base44 auth, learning-state synchronization, or account deletion;
- redesign every secondary page before the five priority experiences are proven;
- depend on remote image-generation assets for core usability.

## 3. Visual direction

### 3.1 Brand mood

HoldWise should feel like a **private card academy after dark** rather than a casino floor: deep charcoal and green felt, warm ivory card faces, brushed-gold accents, restrained light, and crisp typography.

The mood is sophisticated, focused, and educational. Gold communicates mastery and important actions, not decoration everywhere. Green felt communicates the table. Glass communicates modern premium software.

### 3.2 Material hierarchy

A small reusable material system prevents every screen from inventing its own glass effect.

- **Glass 1 — Whisper:** faint translucent backing for passive labels and chips.
- **Glass 2 — Card:** standard content surface for stat cards and secondary panels.
- **Glass 3 — Raised:** interactive cards and navigation surfaces with stronger edge light and shadow.
- **Glass 4 — Focus:** selected or currently active learning surface with gold caustic highlight.
- **Glass 5 — Modal:** Coach Ace, paywall, and focused overlays with the strongest blur/contrast and backdrop dimming.

Each glass surface keeps an opaque fallback for reduced-transparency / unsupported-backdrop environments.

### 3.3 Tactile materials

The tactile layer uses four material metaphors:

- **Polished gold:** primary actions and mastery rewards.
- **Obsidian:** dark elevated secondary controls.
- **Felt:** table/background interaction zones.
- **Ivory card stock:** playing cards and rule examples.

Interactive surfaces have a raised face, a subtle lower depth plate, and a pressed state that compresses toward the plate. Motion must remain readable and never slow task completion.

## 4. Shared visual primitives

The redesign introduces focused components rather than duplicating Tailwind strings across pages.

### 4.1 `CinematicBackdrop`

Responsibilities:

- render the existing felt/charcoal base;
- add slow breathing radial light, soft vignette, and optional low-opacity suit particles / table glow;
- expose intensity variants for onboarding, normal app screens, and trainer mode;
- disable drifting layers under Reduced Motion.

No downloaded video background is required.

### 4.2 `GlassSurface`

Responsibilities:

- implement the five glass strengths;
- handle border highlight, shadow, blur, inner glow, and opaque fallback;
- provide semantic variants (`passive`, `interactive`, `selected`, `modal`);
- allow an optional gold focus edge without hard-coding page-specific styles.

### 4.3 `TactilePressable`

Responsibilities:

- provide at least a 44x44 point hit target;
- animate press compression and depth shift with Framer Motion;
- trigger the existing haptic helper when enabled;
- route haptics through a tiny iOS bridge when running in the native shell, falling back to `navigator.vibrate` where available;
- respect Reduced Motion by removing spring travel while preserving visible pressed state.

### 4.4 `ScreenReveal`

Responsibilities:

- provide shared screen entrance pacing;
- stage heading, primary content, and supporting content with short stagger intervals;
- skip the stagger under Reduced Motion;
- never animate critical controls out of reach for more than a fraction of a second.

### 4.5 `MasteryMeter`

Responsibilities:

- provide the canonical mastery / accuracy visual language;
- show value plus plain-language interpretation;
- support streak, improvement delta, and focus/weakness callouts without implying money or gambling performance.

## 5. Priority experience designs

## 5.1 Onboarding

Current onboarding choices remain intact. The flow becomes a three-scene guided setup.

### Scene A — Goal

- Coach Ace appears as a calm guide, not a floating obstruction.
- The question enters first, then choice cards rise in a short stagger.
- Selected choice changes from standard glass to Focus glass and compresses on tap.
- Continue appears as a polished-gold tactile control once a selection exists.

### Scene B — Learning style

- Same layout rhythm to reduce cognitive load.
- Each choice has one concise supporting line or icon where already available.
- Background light subtly shifts rather than cutting between pages.

### Scene C — Voice preference

- Voice options remain exactly the existing supported states.
- Completion performs a short "academy ready" reveal and routes to Assessment.

No new onboarding questions are added.

## 5.2 Home

Home is redesigned around one clear question: **What should I do next?**

Order:

1. greeting and small streak/level context;
2. large Continue Learning hero;
3. primary **Practice a Hand** action;
4. concise mastery strip with accuracy, streak, and review count;
5. Daily Challenge;
6. Recent Mistakes;
7. Daily Card Fact;
8. Premium teaser only for free users.

The current three tiny stat boxes become a unified mastery strip so the screen reads less like a dashboard template.

The Continue Learning hero uses a translucent raised surface over a subtle card-table light pool. The progress rail animates only when it first enters view.

## 5.3 Video-poker trainer

The trainer is the signature product surface.

### Hand pacing

The flow becomes five explicit visual beats while preserving existing logic:

1. **Deal** — cards enter one at a time with a short cascading deal motion.
2. **Choose** — user taps holds; held cards lift slightly, gain a Focus ring, and lock with tactile/haptic feedback.
3. **Check** — the decision button becomes the visual focus; background motion reduces so the result is easy to read.
4. **Coach reveal** — correct/incorrect state appears first, then the verified reason, then optional deeper explanation / Coach Ace action.
5. **Draw / next hand** — replacements animate in while held cards remain visually anchored.

### Trainer chrome

- pay-table and mode controls move into compact glass chips;
- developer diagnostics stay available but visually secondary;
- free daily limit remains visible without dominating the play surface;
- correctness uses icon + text + border treatment, never color alone;
- existing accessibility modes remain supported.

### Playing cards

Playing cards gain:

- more convincing card-stock shadow and edge;
- a small contact shadow on the felt;
- tactile press behavior;
- improved held-state label integrated into the card rather than floating too far below it;
- Reduced Motion fallback with no bobbing/pulsing loop.

No card dimensions are changed enough to threaten small-iPhone fit.

## 5.4 Coach Ace

Coach Ace becomes the app's signature teaching moment rather than a generic chat sheet.

### Opening

- Modal uses Glass 5 with a cleaner dark backdrop.
- Coach Ace enters before the text so the interaction reads as a guided lesson.
- Verified facts are shown as a compact "What I know about this hand" strip, collapsed by default when long.

### Response pacing

Coach responses render in two stages:

1. **The answer** — one concise verified recommendation / explanation.
2. **Go deeper** — optional simple, visual, math, or example modes using the existing mode system.

This avoids dumping long text at once. The underlying coach grounding rules are unchanged.

### Controls

- quick prompts become tactile pill controls with horizontal snapping;
- send button uses polished-gold material;
- Read / Repeat / Slow down become 44-point icon+text controls;
- remaining free questions remain visible but low-pressure.

## 5.5 Progress / Statistics

Statistics becomes a coaching dashboard, not a wall of metric tiles.

### Free section

Top hero:

- overall mastery;
- decision accuracy;
- current streak;
- total practice decisions.

Then one "Next best focus" card derived from the same existing local statistics.

### Premium section

Premium analytics retain the existing values but are grouped into:

- **Momentum:** recent accuracy and trend;
- **Strength:** strongest category;
- **Focus:** weakest category / common mistake;
- **Table familiarity:** most-used pay table;
- **Weekly focus:** recommended area.

No new predictive claim is introduced.

## 6. Navigation and global shell

`AppLayout` keeps its route structure. The redesign changes presentation only:

- place all authenticated screens inside `CinematicBackdrop`;
- increase bottom content inset using safe-area-aware spacing;
- convert `BottomNav` into a Raised glass dock with an animated active indicator;
- keep the same five destinations and route paths;
- active tab receives a subtle tactile lift and gold line, not an oversized animation.

## 7. Haptics

The existing JavaScript helper currently relies on browser vibration. The native iOS shell will expose a minimal message handler for three semantic haptic types:

- `selection`
- `success`
- `warning`

`hapticPulse` becomes the single app-facing API and chooses the native bridge first, then browser vibration fallback.

No haptic fires when the accessibility setting is disabled.

## 8. Data flow and state

The visual redesign does not introduce a new state store.

- Profile, accessibility, settings, mascot state, and learning state stay in `AppProvider`.
- Practice logic stays in `PracticeVP` and the existing card modules/workers.
- Coach Ace still receives grounded structured facts.
- Premium status still comes from the existing billing bridge.
- Progress still reads the existing lesson/practice/mistake records.

Visual components receive state through props or the existing hooks. They do not own business logic.

## 9. Error and fallback behavior

- If backdrop blur is unsupported, glass surfaces use an opaque charcoal/felt fallback with the same border hierarchy.
- If native haptics are unavailable, the interaction still provides visual pressed feedback.
- If Coach Ace integration fails, deterministic facts and existing fallback explanations remain visible.
- If Reduced Motion is enabled, entrance staggers, parallax, looping card movement, and large spring travel are disabled.
- High Contrast keeps stronger borders/text rather than relying on translucency.
- Dynamic text and large-card mode retain priority over decorative composition.

## 10. Testing and release gates

### Existing logic regression

The redesign must leave the existing core/card/content tests passing.

### New visual-system tests / checks

Add focused checks for:

- shared glass primitive usage on the five priority experiences;
- 44px minimum interactive targets in newly introduced controls;
- Reduced Motion paths;
- haptic helper choosing native/fallback/disabled behavior;
- Coach Ace verified-fact content still renders;
- trainer correctness state still matches the strategy result;
- free/premium gating remains unchanged.

### Manual route QA

At minimum verify:

- onboarding three-step completion;
- Home primary actions;
- trainer deal / hold / check / draw / replay;
- correct and incorrect Coach reveal;
- Coach Ace open/send/mode/close;
- Statistics free and Premium views;
- iPhone small and large widths;
- Dynamic Type, High Contrast, Reduced Motion, Large Card, haptics off;
- browser preview and native iOS shell.

### Completion gate

Before calling the premium redesign complete:

```bash
npm ci
npm run qa
npm run build:native
```

If the Linux package gateway prevents dependency installation again, only dependency-independent checks may be claimed locally; the full QA/build gate must run in the configured cloud-macOS release workflow before TestFlight promotion.

## 11. Implementation boundaries

Prefer focused files and reuse existing patterns. The expected implementation shape is:

- new shared visual primitives under `src/components/premium/`;
- design tokens and fallbacks in `src/index.css`;
- light edits to `AppLayout`, `BottomNav`, `Home`, `Onboarding`, `PracticeVP`, `PlayingCard`, `CoachAcePanel`, and `Statistics`;
- minimal extension to `src/lib/haptics.js` and the iOS WebView controller for semantic native haptics;
- no broad rewrite of unrelated pages.

Secondary pages can adopt the shared primitives later without blocking the first premium release.

## 12. Success criteria

The redesign succeeds when:

- the five priority experiences clearly share one premium visual language;
- the trainer feels substantially more tactile and directed without becoming slower;
- Coach Ace feels like a signature teaching interaction rather than a generic chat modal;
- progress tells the learner what to do next, not just what happened;
- all existing verified strategy, content, billing, auth, and accessibility behavior remains intact;
- no new backend or unnecessary framework is added;
- the app is materially closer to App Store submission rather than farther from it.
