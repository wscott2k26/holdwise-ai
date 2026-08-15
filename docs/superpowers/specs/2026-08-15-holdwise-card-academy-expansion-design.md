# HoldWise AI — Card Academy Expansion Design

Date: 2026-08-15
Branch: `appetize-runtime-fix-v2`
Status: Approved design; implementation blocked until written-spec review is confirmed

## Goal

Turn HoldWise AI from a single Jacks-or-Better trainer preview into a premium, teach-first card-game academy with a broad mainstream game library, a shared progression system, full tutorials for every game, and a visual/gameplay quality bar benchmarked against current leading card apps.

The product must feel like a premium card-game destination first and a tutorial product second: polished tables, satisfying card motion, strong progression, fast onboarding, clear rewards, and Coach Ace guidance layered over authentic rules and strategy.

## Non-negotiable Product Rules

1. Every shipped game is actually playable. No dead tiles or fake demo screens.
2. Every shipped game has a complete beginner tutorial that can take a first-time player from zero knowledge into a guided first game.
3. Every game has a research/reference pass before implementation and a three-pass comparison after meaningful visual or gameplay changes.
4. The shared visual system must preserve the three Google-inspired ingredients already chosen for HoldWise:
   - Liquid Glassmorphism
   - Tactile Maximalism
   - Immersive Cinematic Pacing
5. Storm And Me branding remains the company-first intro across the native app shell.
6. HoldWise adds its own teach-first twist: Coach Ace, guided legal moves, decision explanations, mistake review, mastery progress, challenges, badges, and skill progression.
7. No proprietary competitor artwork, logos, branded card faces, or pixel-for-pixel copying. We match category conventions, interaction patterns, palette families, density, hierarchy, and motion language while keeping HoldWise assets original.

## Launch Library

### Poker / Video Poker
- Texas Hold'em
- Jacks or Better
- Bonus Poker
- Double Bonus Poker
- Double Double Bonus Poker
- Deuces Wild
- Joker Poker

### Casino Card
- Blackjack

### Solitaire
- Klondike
- Spider
- FreeCell
- TriPeaks
- Pyramid

### Trick-Taking / Classics
- Spades
- Hearts
- Gin Rummy
- Crazy Eights
- Go Fish
- War
- Speed

### Color-Matching Family Game
- Color Clash — an original color/number shedding game inspired by the broad genre conventions popularized by games such as UNO, but using original name, rules presentation, card design, iconography, effects, and branding.

The architecture must make additional modules such as Euchre, Canasta, Bid Whist, Phase-style sequencing, and other card games additive rather than requiring another shell rewrite.

## Current Market Reference Set

Research snapshot refreshed 2026-08-15 from current App Store listings.

### WSOP Poker
Reference: https://apps.apple.com/us/app/wsop-poker-texas-holdem-game/id719525810
Use as a benchmark for:
- dramatic poker-table presentation
- tournament / mode selection
- collectible prestige items
- reward and progression density
- high-energy casino presentation

Do not reproduce WSOP marks, bracelet/ring art, branded table art, or exact proprietary UI.

### Governor of Poker 3
Reference: https://apps.apple.com/us/app/governor-of-poker-3-holdem/id877638937
Use as a benchmark for:
- multi-mode discovery
- missions and quests
- rewards cadence
- progression/status presentation
- cross-game hub feel

### UNO! Mobile
Reference: https://apps.apple.com/us/app/uno/id1344700142
Use as a benchmark for:
- bright readable color coding
- fast mode selection
- social/family energy
- rule variants
- event/tournament presentation

Color Clash must remain original and must not use UNO name, logo, card-back treatment, branded symbols, or proprietary assets.

### Microsoft Solitaire Collection
Reference: https://apps.apple.com/us/app/microsoft-solitaire-collection/id1103438575
Use as a benchmark for:
- multiple games inside one collection
- Daily Challenges
- Weekly Rewards
- XP, trophies, achievements
- difficulty choice
- tutorial / How to Play discoverability

### Solitaire Grand Harvest
Reference: https://apps.apple.com/us/app/solitaire-grand-harvest/id1223338261
Use as a benchmark for:
- clear progression loop
- daily surprises
- collectible rewards
- satisfying level completion energy

### Spades+ / Spades Plus
References:
- https://apps.apple.com/us/app/spades/id467280605
- https://apps.apple.com/us/app/spades-plus-card-game/id834185106
Use as benchmarks for:
- readable four-seat table layout
- bidding flow
- smart AI expectations
- solo/multiplayer mode conventions
- stats and achievement presentation

### Blackjack by MobilityWare
Reference: https://apps.apple.com/us/app/blackjack/id289523017
Use as a benchmark for:
- authentic hit / stand / split / double flow
- learn-to-play support
- strategy coaching
- table progression

### Gin Rummy Stars
Reference: https://apps.apple.com/us/app/gin-rummy-stars-card-game/id1467143758
Use as a benchmark for:
- meld/deadwood clarity
- game-mode discoverability
- level/progression presentation
- competitive table pacing

## Mandatory Research-Match Gate After Every Meaningful Change

A meaningful change is any new game, table layout, lobby layout, card style, button system, progression surface, tutorial flow, or major motion change.

For each meaningful change:

### Pass 1 — Reference Match
- Re-open at least two current leading apps in the relevant game/category.
- Record the current palette family, table/background treatment, card scale, primary CTA treatment, information density, reward surfaces, and interaction flow.
- Confirm our screen reads as belonging to the same premium category at first glance.

### Pass 2 — Google-3 Match
Verify all three ingredients are present intentionally:
- Liquid Glassmorphism: layered translucent surfaces, depth, specular edge/light behavior, strong contrast, no muddy glass.
- Tactile Maximalism: large physical-feeling cards/buttons, press depth, haptics, bold feedback, chunky readable controls.
- Immersive Cinematic Pacing: staged reveal order, card deal/flip/hold/draw motion, table transitions, reward celebration, controlled lightning/storm brand moments.

### Pass 3 — Gameplay Match + HoldWise Twist
- Compare core interaction order against a leading implementation of that game.
- Verify legal actions, scoring, turn sequence, win state, retry/new-game flow, and common rule options.
- Then add HoldWise-specific teaching: Coach Ace, highlighted legal move, why-this-move explanation, mistakes, mastery XP, challenge progress, and tutorial cues.

No change is considered done until all three passes are recorded as PASS.

## Visual System

### Shared Core Palette
- Obsidian / near-black foundation
- Deep midnight / royal blue atmospheric backgrounds
- Emerald and deep felt-green card-table surfaces
- Champagne / warm gold primary accents and premium edges
- Ruby / energetic red for urgency, losses, warnings, and casino energy where appropriate
- White/ivory card faces with high-contrast black/red pips

This palette should track the premium visual language of the leading poker/casino/card category without copying a single competitor screen exactly.

### Per-Game Skin Rules
- Poker / Blackjack: darkest cinematic treatment, emerald felt, gold/ruby energy, spotlight/dealer-room depth.
- Solitaire: cleaner and calmer, deep blue/green atmospheric tables, less aggressive red, stronger focus on card readability.
- Spades / Hearts / Rummy: rich social-table treatment with visible player zones and score hierarchy.
- Color Clash: brighter saturated color zones inside the same premium glass shell, energetic animations, original symbols.

### Cards
- Larger on phone than the current preview where possible.
- Strong face contrast and readable ranks at a glance.
- Gloss/specular pass without hurting legibility.
- Held/selected/legal/invalid states must be instantly distinct.
- Motion must communicate state change, not decorate randomly.

### Navigation / Lobby
- Storm And Me intro -> HoldWise Card Academy lobby.
- Hero region with Continue Learning / Daily Challenge.
- Large game-family tiles: Poker, Casino, Solitaire, Classics, Family.
- Recently played row.
- Missions / streak / XP visible without obstructing play.
- Badge/trophy case and mastery progress accessible from lobby.
- Bottom navigation remains compact and glassy; no cluttered casino-ad feel.

## Universal Tutorial Architecture

Every game implements the same tutorial contract:

1. **What is this game?** — one-screen objective.
2. **Know the table/cards** — identify zones and card meanings.
3. **How a turn works** — animated, interactive steps.
4. **Legal moves** — user must perform highlighted legal actions.
5. **Scoring / winning** — visual examples.
6. **Common mistakes** — game-specific warnings.
7. **Coach-guided first game** — prompts before the move.
8. **Coach review** — explanation after the move.
9. **Graduation hand/game** — reduced hints.
10. **Tutorial completion reward** — XP/badge and unlock into normal play.

Tutorials must be replayable from each game's menu.

## Game Module Contract

Each game module exposes:
- metadata: id, title, family, complexity, tutorial availability
- rules engine
- legalActions(state, player)
- applyAction(state, action)
- score/winner evaluator
- AI policy for solo opponents where required
- tutorial steps
- Coach Ace context builder
- theme tokens / table skin
- analytics/progress hooks
- deterministic seed option for tests

Shared systems provide deck/shuffle primitives, card rendering, animations, tutorial chrome, Coach UI, XP/badges, daily challenge plumbing, accessibility, haptics, persistence, and native boot shell.

## Gameplay Requirements by Family

### Texas Hold'em
- blinds, deal, flop, turn, river, showdown
- fold/check/call/bet/raise/all-in logic
- hand evaluator and tie resolution
- beginner betting tutorial
- local AI opponents for initial release

### Blackjack
- hit, stand, double, split, insurance where enabled
- configurable common table rules
- dealer action rules
- basic-strategy teaching and post-move explanations

### Video Poker
- multiple pay tables and variants
- exact or variant-correct strategy engine
- hold/draw flow
- pay-table tutorial and expected-value coaching

### Solitaire Family
- complete legal move rules
- undo/new/deal logic where appropriate
- move hints
- win detection
- difficulty/rule options appropriate to each variant

### Trick-Taking / Rummy
- bidding where applicable
- legal trick/meld/discard actions
- AI opponents
- score progression across rounds
- tutorial explanations for terminology

### Color Clash
- original color/number matching rules
- draw, skip/reverse-equivalent original mechanics where used
- original action symbols and naming
- bot opponents for local play
- tutorial optimized for very fast understanding

## Progression / Retention

Borrow the proven category pattern, but use teaching-oriented rewards:
- XP and mastery levels
- Daily Challenge
- weekly learning streak
- game-family mastery tracks
- achievements and badges
- tutorial completion badges
- mistake-recovery missions
- five-hand/five-round focus drills
- collectible original table themes/card backs earned primarily through play

Avoid disruptive popup spam. Progression should motivate learning rather than block the table.

## Quality and Completion Gates

### Automated
- unit tests for every rules engine
- deterministic state/action tests
- scoring/winner tests
- invalid-action rejection tests
- tutorial progression tests
- persistence/progression tests
- native boot handshake tests
- existing exhaustive video-poker evaluator audit retained

### Visual Quad Check
For every major screen/game:
1. reference-app comparison
2. Google-3 checklist
3. gameplay-flow comparison
4. simulator screenshot review at target iPhone sizes

### Final Appetize Gate
Before a ZIP is handed off:
- clean production/native web build
- all automated tests green
- simulator build green
- ARM64 present
- bundled assets verified
- real simulator boot ready marker
- launch screenshot reviewed
- lobby screenshot reviewed
- each shipped game launched from lobby
- each shipped tutorial entered and advanced through at least one interactive step
- no blank screens
- no dead navigation

## Accessibility / Device Requirements

- minimum 44pt interactive targets
- Reduce Motion respected
- readable rank/suit text
- color is never the only signal for an action/state
- dynamic safe-area layout for recent iPhones
- tablet layout may scale later, but phone must be fully usable first

## Scope Boundary for Today

"All card games" is implemented as the broad mainstream launch library listed in this spec, backed by a modular game contract so additional card games can be added without rebuilding the product shell. The goal is a coherent, working collection rather than hundreds of placeholder games.

A game does not count as shipped today unless its core loop, rules, tutorial entry, and basic solo play are functional and pass its game-specific tests.

## Done Definition

HoldWise Card Academy is done for this milestone only when:
- the single-game Jacks-or-Better start screen has been replaced by a premium multi-game lobby;
- all launch-library game tiles route to functional game modules;
- every launch-library game has a complete tutorial path;
- visual research/reference, Google-3, gameplay, and simulator review gates pass;
- existing HoldWise teaching/progression systems remain integrated;
- Storm And Me company intro remains intact;
- final Appetize simulator package boots and is visually inspected before delivery.
