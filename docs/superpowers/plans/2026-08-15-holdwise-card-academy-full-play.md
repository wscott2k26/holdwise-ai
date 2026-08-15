# HoldWise AI Card Academy Full-Play Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the one-game Appetize preview with a premium HoldWise Card Academy containing 21 fully playable solo/local card games, a complete beginner tutorial for every game, category-leading visual/gameplay conventions, the locked Google-3 material/motion system, Coach Ace teaching, progression, and a final verified iOS Simulator/Appetize package.

**Architecture:** Keep React/Vite inside the verified WKWebView native shell. Add a catalog-driven Card Academy router, shared deterministic card primitives, one rules engine per game/family, family-specific premium table views, a universal ten-step tutorial shell, and per-game progress storage. Preserve the existing exact Jacks-or-Better engine and native Storm And Me boot handshake. Local AI drives games that require opponents; online PvP is not required for this milestone. A tile is not considered shipped until its full game loop reaches a real terminal win/loss/score state, can start a new full game, and its tutorial contract is complete.

**Tech Stack:** React 18, React Router 6, Vite 6, Framer Motion, Tailwind CSS, Lucide, Node test runner, deterministic JavaScript rules engines, UIKit/WKWebView, XcodeGen, GitHub Actions.

## Global Constraints

- Production `main` remains untouched.
- Work in an isolated feature branch based on `appetize-runtime-fix-v2`.
- No demo-only tiles, fake game screens, or tutorial-only substitutes count as shipped.
- Solo/local bots are acceptable; every listed game must still play through the authentic complete common ruleset for that mode.
- Every game receives the same ten-stage beginner tutorial contract and a replayable Tutorial action.
- Preserve the Storm And Me company-first cloud/lightning native intro.
- Preserve the existing exhaustive 2,598,960-hand video-poker evaluator audit.
- Do not use competitor logos, branded artwork, proprietary card backs, or pixel-for-pixel UI copies. Match category conventions, palette families, information hierarchy, interaction order, motion cadence, table composition, and control prominence with original HoldWise assets.
- After every meaningful family-level visual/gameplay change, perform and record three checks: current reference-app match, Google-3 match, gameplay-flow match plus HoldWise twist. Final simulator screenshot review is the fourth visual gate.
- Google-3 is always explicit: Liquid Glassmorphism, Tactile Maximalism, Immersive Cinematic Pacing.
- Minimum interactive target is 44pt; Reduce Motion and current accessibility settings remain functional.

---

### Task 1: Create an isolated full-play branch and prove the inherited baseline

**Files:** no feature files yet.

- [ ] Create branch `card-academy-full-v1` from the current `appetize-runtime-fix-v2` head.
- [ ] Confirm `main` is not the target of any write.
- [ ] Run the existing GitHub Actions/Appetize baseline or equivalent existing test commands before feature edits.
- [ ] Expected baseline: existing premium/native tests green, gameplay audit green, simulator build green.
- [ ] Commit only if the branch setup itself requires a workflow branch-list change; otherwise no code commit.

---

### Task 2: Lock the 21-game catalog, engine contract, tutorial contract, and research audit format

**Files:**
- Create: `src/games/catalog.js`
- Create: `src/games/engineRegistry.js`
- Create: `src/games/tutorials.js`
- Create: `src/lib/cardAcademyProgress.js`
- Create: `docs/research/2026-08-15-card-academy-reference-audit.md`
- Test: `tests/card-academy-catalog.test.mjs`
- Test: `tests/tutorial-contract.test.mjs`
- Test: `tests/card-academy-progress.test.mjs`

**Catalog IDs:**
`texas-holdem`, `jacks-or-better`, `bonus-poker`, `double-bonus-poker`, `double-double-bonus-poker`, `deuces-wild`, `joker-poker`, `blackjack`, `klondike`, `spider`, `freecell`, `tripeaks`, `pyramid`, `spades`, `hearts`, `gin-rummy`, `crazy-eights`, `go-fish`, `war`, `speed`, `color-clash`.

**Engine interface:**
```js
{
  id,
  createGame(options),
  legalActions(state, actor),
  applyAction(state, action),
  isTerminal(state),
  result(state),
  coachFacts(state, actor),
}
```

**Tutorial shape:**
```js
{
  gameId,
  steps: [
    { id: 'objective', kind: 'explain', ... },
    { id: 'table', kind: 'explain', ... },
    { id: 'turn', kind: 'explain', ... },
    { id: 'legal-move', kind: 'interactive', ... },
    { id: 'scoring', kind: 'explain', ... },
    { id: 'mistakes', kind: 'explain', ... },
    { id: 'guided-game', kind: 'interactive', ... },
    { id: 'coach-review', kind: 'review', ... },
    { id: 'graduation', kind: 'interactive', ... },
    { id: 'reward', kind: 'reward', ... },
  ]
}
```

- [ ] Write failing catalog tests asserting exactly 21 unique game IDs, all five families represented, every entry has engine/tutorial/theme/reference metadata, and no entry is marked demo/coming-soon.
- [ ] Write failing tutorial tests asserting exactly ten ordered stages for every catalog game and at least three interactive/review stages.
- [ ] Write failing persistence tests for tutorial completion, plays, wins, last-played, per-family mastery, and recent games using an injected storage stub.
- [ ] Run: `node --test tests/card-academy-catalog.test.mjs tests/tutorial-contract.test.mjs tests/card-academy-progress.test.mjs` and confirm RED.
- [ ] Implement catalog/tutorial/progress modules minimally until GREEN.
- [ ] Refresh official current reference pages for poker/casino, solitaire, trick-taking/rummy, and color-matching leaders. Record palette family, table/background, card scale, CTA hierarchy, progression surfaces, interaction flow, and HoldWise-safe adaptation in the research audit.
- [ ] Commit: `feat: define full Card Academy contracts`.

---

### Task 3: Replace the single-game preview shell with the premium multi-game lobby and real routes

**Files:**
- Modify: `src/App.jsx`
- Create: `src/pages/CardAcademyLobby.jsx`
- Create: `src/pages/GameRoom.jsx`
- Create: `src/pages/GameTutorial.jsx`
- Create: `src/components/games/GameShell.jsx`
- Create: `src/components/games/GameFamilyTile.jsx`
- Modify: `src/components/BottomNav.jsx`
- Modify: `src/index.css`
- Test: `tests/card-academy-routing.test.mjs`
- Test: `tests/card-academy-visual.test.mjs`

**Required routes:**
```jsx
<Route path="/" element={<Navigate to="/academy" replace />} />
<Route path="/academy" element={<CardAcademyLobby />} />
<Route path="/game/:gameId" element={<GameRoom />} />
<Route path="/game/:gameId/tutorial" element={<GameTutorial />} />
<Route path="/achievements" element={<Achievements />} />
<Route path="/daily-challenge" element={<DailyChallenge />} />
```

- [ ] Write failing routing test proving `App.jsx` no longer hardcodes `<PracticeVP />`, the catalog lobby route exists, game/tutorial routes exist, and all 21 IDs resolve through the catalog.
- [ ] Write failing visual contract asserting lobby uses `GlassSurface`, `TactilePressable`, `ScreenReveal`, family theme classes, hero Continue Learning/Daily Challenge, recent games, XP/streak, and game-family tiles.
- [ ] Run focused tests and confirm RED.
- [ ] Implement the routes and lobby. The first screen after Storm And Me must be HoldWise Card Academy, not Jacks or Better.
- [ ] Lobby visual target: obsidian/midnight foundation, emerald/gold premium core, large glossy family tiles, warm spotlight glows, glass status chips, tactile CTA depth, staggered cinematic reveal. Family tiles may introduce controlled ruby, royal blue, and Color Clash saturated accents without losing the shared shell.
- [ ] Record reference match, Google-3 match, and gameplay/discovery-flow match in the research audit after the lobby pass.
- [ ] Commit: `feat: add premium Card Academy lobby`.

---

### Task 4: Build a correct shared poker evaluator for Texas Hold'em and variant scoring

**Files:**
- Create: `src/games/core/pokerEvaluator.js`
- Test: `tests/poker-evaluator.test.mjs`

**Interfaces:**
```js
export function evaluateFive(cards)
export function bestFiveOfSeven(cards)
export function comparePokerHands(a, b)
```

- [ ] Write failing tests for wheel straight, royal/straight flush, quads, full house, flush, straight, trips, two pair, pair, high card, kickers, ties, and best-five-of-seven selection.
- [ ] Run test and confirm RED.
- [ ] Implement deterministic rank vectors such as `{ category, ranks: [primary, ...kickers], cards }` and lexicographic comparison.
- [ ] Cross-check representative outcomes against authoritative poker rules/reference material before marking GREEN.
- [ ] Commit: `feat: add shared poker evaluator`.

---

### Task 5: Build full local Texas Hold'em mode

**Files:**
- Create: `src/games/engines/texasHoldem.js`
- Create: `src/components/games/HoldemTable.jsx`
- Test: `tests/texas-holdem-engine.test.mjs`

**Full-play rules for this milestone:** four-seat local table, user + three bots, rotating dealer/button, small/big blinds, starting stacks, hole cards, preflop/flop/turn/river, fold/check/call/bet/raise/all-in, side-pot-safe contribution accounting, showdown/tie split, hand winner, next hand, and match end when only one stack remains or user starts a new match.

- [ ] Write failing deterministic engine tests for blinds, action order, minimum call/raise, illegal check, folds, all-ins, street advancement, community cards, showdown, split pots, busting, dealer rotation, and new-hand stack persistence.
- [ ] Add seeded-bot simulation test that runs complete matches with a maximum action guard and asserts terminal states are reachable without illegal actions.
- [ ] Implement engine until tests pass.
- [ ] Implement HoldemTable with four readable seats, pot/stacks, community board, user hole cards, prominent Fold/Check-Call/Raise controls, legal-action disabling, bet sizing, hand-result celebration, Coach Ace facts, and New Hand/New Match.
- [ ] Refresh and compare current WSOP/Governor poker references for table composition, action hierarchy, card scale, progression density, and motion cadence; record three-pass audit.
- [ ] Commit: `feat: add full local Texas Holdem`.

---

### Task 6: Expand video poker into six full variants

**Files:**
- Modify: `src/lib/cards/payTables.js`
- Create: `src/games/engines/videoPoker.js`
- Create: `src/games/core/videoPokerEvaluator.js`
- Refactor: `src/pages/PracticeVP.jsx` or replace with `src/components/games/VideoPokerTable.jsx`
- Test: `tests/video-poker-variants.test.mjs`
- Modify: `scripts/audit-gameplay.mjs`

**Variants:** Jacks or Better, Bonus Poker, Double Bonus Poker, Double Double Bonus Poker, Deuces Wild, Joker Poker.

- [ ] Write failing tests for paytable identity, wild-deuce classification, joker-wild classification, variant-specific payout categories, five-card draw/hold completion, bankroll/credit settlement, and New Hand.
- [ ] Preserve existing exact Jacks-or-Better enumeration tests unchanged.
- [ ] For non-wild Bonus/Double variants, reuse exact 32-mask enumeration with variant-specific pay categories, including kicker-sensitive quads where required.
- [ ] For Deuces Wild and Joker Poker, use variant-correct wild-card evaluator and a deterministic strategy path; do not label standard Jacks-or-Better advice as exact for these games.
- [ ] Implement a game selector and full-credit/deal/hold/draw/payout loop for each variant.
- [ ] Refresh current video-poker/poker references, record visual/gameplay/Google-3 audit, then commit: `feat: add full video poker variant suite`.

---

### Task 7: Build full Blackjack mode

**Files:**
- Create: `src/games/engines/blackjack.js`
- Create: `src/components/games/BlackjackTable.jsx`
- Test: `tests/blackjack-engine.test.mjs`

**Rules:** six-deck shoe, configurable common dealer rule (default stand soft 17), blackjack 3:2, hit, stand, double, split when ranks match, split aces limitation, insurance only when dealer shows Ace, dealer hole card, settlement, bankroll, reshuffle threshold, full next-round loop.

- [ ] Write failing tests for card totals/soft aces, naturals, dealer rules, hit/stand/double/split, insurance resolution, busts, pushes, split settlement, bankroll, new rounds, and illegal actions.
- [ ] Implement engine and a deterministic basic-strategy hint helper grounded only in current legal state/rules.
- [ ] Implement premium table: dealer zone, user hand(s), shoe/discard, bet chip control, Hit/Stand/Double/Split/Insurance only when legal, payout result, Repeat Bet/New Round, Coach Ace explanation.
- [ ] Refresh current MobilityWare/major blackjack references and record three-pass audit.
- [ ] Commit: `feat: add full Blackjack table`.

---

### Task 8: Build five complete solitaire variants

**Files:**
- Create: `src/games/engines/klondike.js`
- Create: `src/games/engines/spider.js`
- Create: `src/games/engines/freecell.js`
- Create: `src/games/engines/tripeaks.js`
- Create: `src/games/engines/pyramid.js`
- Create: `src/components/games/SolitaireTable.jsx`
- Test: `tests/solitaire-engines.test.mjs`

- [ ] Klondike tests: 7-column deal, stock/waste, alternate-color descending tableau, King-to-empty, foundations, flip exposed hidden card, draw/redeal rule, undo, win detection.
- [ ] Spider tests: 10 columns, 104 cards, suit-count option default one-suit beginner mode plus four-suit advanced option, descending runs, complete same-suit King-to-Ace removal, deal new row only when legal, win detection.
- [ ] FreeCell tests: all cards face-up, four free cells, foundations, alternating descending tableau, empty-column capacity/move sequence rules, win detection.
- [ ] TriPeaks tests: correct peak layout/exposure, waste ±1 rank legal move with Ace wrap rule explicitly chosen, stock, chain removal, win/loss terminal state.
- [ ] Pyramid tests: exposed pair totals 13, Kings remove singly, stock/waste, exposure updates, win/loss.
- [ ] Implement family table renderer with variant-specific board composition, move highlighting, tap source/destination controls, Hint, Undo, New Deal, Win celebration and Coach tips.
- [ ] Refresh Microsoft Solitaire Collection and another current leading solitaire reference; record palette/table/card-scale/progression and Google-3 comparison.
- [ ] Commit: `feat: add five full solitaire games`.

---

### Task 9: Build full Spades and Hearts matches

**Files:**
- Create: `src/games/engines/spades.js`
- Create: `src/games/engines/hearts.js`
- Create: `src/components/games/TrickTable.jsx`
- Test: `tests/trick-taking-engines.test.mjs`

**Spades:** user + three bots, partnerships, 13-card deal, bidding, follow suit, spades cannot lead until broken unless only spades, trick winner, contract score, bags and 10-bag penalty, default match target 500, nil option, next round/full match.

**Hearts:** user + three bots, 13-card deal, pass-left/right/across/hold cycle, 2♣ first lead, follow suit, no points on first trick except rule exceptions explicitly disabled, Hearts lead restriction until broken, Queen of Spades 13, hearts 1 each, Shoot the Moon, default match ends at 100 with low score winning.

- [ ] Write failing tests for all turn legality, trick winners, round scoring, pass/bid stages, match-end logic and bot legal-action compliance.
- [ ] Implement engines and four-seat TrickTable with clear lead/trump/score indicators.
- [ ] Refresh current Spades+ / Spades Plus and major Hearts references; record three-pass audit.
- [ ] Commit: `feat: add full Spades and Hearts matches`.

---

### Task 10: Build full Gin Rummy match

**Files:**
- Create: `src/games/engines/ginRummy.js`
- Create: `src/components/games/RummyTable.jsx`
- Test: `tests/gin-rummy-engine.test.mjs`

**Rules:** two players, ten cards each, stock/discard, draw from stock or discard, discard, optimal meld/deadwood calculation, knock at <=10 deadwood, gin at 0, opponent layoff when allowed, undercut, gin bonus, round score, target 100, next round and match reset.

- [ ] Write failing tests for set/run meld resolution, overlapping meld optimization, deadwood, legal draw/discard, knock/gin/undercut/layoff, scoring and target match end.
- [ ] Implement bot policy that always selects a legal draw/discard and evaluates deadwood improvement.
- [ ] Implement RummyTable with spread hand, meld/deadwood cues, stock/discard piles, Draw/Discard/Knock controls, score card, Coach facts.
- [ ] Refresh Gin Rummy Stars plus another current leading gin reference; record three-pass audit.
- [ ] Commit: `feat: add full Gin Rummy match`.

---

### Task 11: Build full Crazy Eights, Go Fish, War and Speed modes

**Files:**
- Create: `src/games/engines/crazyEights.js`
- Create: `src/games/engines/goFish.js`
- Create: `src/games/engines/war.js`
- Create: `src/games/engines/speed.js`
- Create: `src/components/games/FamilyClassicTable.jsx`
- Test: `tests/classic-card-engines.test.mjs`

- [ ] Crazy Eights: seven-card two-player deal, rank/suit match, 8 wild suit selection, draw when blocked, discard-pile recycle, bot, first empty hand wins.
- [ ] Go Fish: four-player deal, rank request allowed only when requester holds that rank, transfer matching cards, Go Fish draw/continue-on-hit, four-of-a-kind books, stock exhaustion, most books wins.
- [ ] War: split full deck, high card captures, equal cards trigger face-down/face-up war, captured cards recycle deterministically, terminal winner; include safety against accidental infinite engine loops by deterministic queue order and high audit cap without changing authentic play.
- [ ] Speed: two-player standard Speed layout, central play piles, ±1 rank placement with Ace adjacent to King and 2, refill hand up to five, stock side piles, bot pacing, win when player hand+stock are empty.
- [ ] Implement full table UIs with family/classic skin, legal action highlights, actual end-game result and New Game.
- [ ] Refresh current category references for Crazy Eights/Go Fish/Speed or closest high-quality family-card implementations and record three-pass audit.
- [ ] Commit: `feat: add four full classic card games`.

---

### Task 12: Build original full Color Clash game

**Files:**
- Create: `src/games/engines/colorClash.js`
- Create: `src/components/games/ColorClashTable.jsx`
- Test: `tests/color-clash-engine.test.mjs`

**Original deck/rules:** four colors plus neutral wild cards, numbered cards, original action names `Block`, `Flip Flow`, `Surge Two`, `Color Shift`; match by color/number/action, draw when blocked, configurable local bot count default three, one-card warning rule called `Last Spark`, penalty if a player fails Last Spark before next action, first empty hand wins a round, points awarded from opponents' remaining cards, first to 300 wins a match.

- [ ] Write failing tests for deck composition, legal matches, each original action, direction, draw penalty, Color Shift choice, Last Spark penalty, round scoring, match target and bot legality.
- [ ] Implement engine without UNO name/logo/artwork/card-back treatment or trademarked visual symbols.
- [ ] Implement bright four-color premium table inside HoldWise glass shell with large original action glyphs and high-contrast non-color labels.
- [ ] Refresh the official current UNO mobile reference only for broad category conventions (fast mode selection, bright readability, event energy) and compare another color-matching/shedding reference where available. Record IP-safe adaptation and three-pass audit.
- [ ] Commit: `feat: add original full Color Clash game`.

---

### Task 13: Wire the universal full tutorials and Coach Ace into every game

**Files:**
- Modify: `src/pages/GameTutorial.jsx`
- Create: `src/components/games/TutorialCoach.jsx`
- Modify: `src/lib/coach.js`
- Modify: `src/components/CoachAcePanel.jsx` only as needed for generic game language
- Test: `tests/tutorial-runtime.test.mjs`
- Test: `tests/coach-game-context.test.mjs`

**Generic Coach context:**
```js
buildTutorContext({
  contextType: 'card-game',
  gameId,
  verifiedFacts,
  legalActions,
  lastAction,
  scoreState,
  skillLevel,
})
```

- [ ] Write failing tests proving every game tutorial can progress through all ten stages, interactive steps validate an actual legal engine action, completion persists, reward records once, and replay works.
- [ ] Write Coach tests proving facts are engine-produced strings and the prompt cannot invent game facts when none are supplied.
- [ ] Implement universal tutorial shell: objective, table spotlight, turn demo, required legal action, scoring examples, common mistakes, guided partial/full play, Coach review, reduced-hint graduation, XP/badge reward.
- [ ] Add `Tutorial` and `Play Full Game` actions to every game room/menu.
- [ ] Perform tutorial visual research check against current top apps' How to Play/onboarding patterns and record Google-3 + clarity comparison.
- [ ] Commit: `feat: add complete tutorials for every game`.

---

### Task 14: Generalize progression, daily missions, achievements and mastery across the whole library

**Files:**
- Modify: `src/lib/dailyMissions.js`
- Modify: `src/lib/achievementProgress.js`
- Modify: `src/lib/mastery.js`
- Modify: `src/pages/Achievements.jsx`
- Modify: `src/pages/DailyChallenge.jsx`
- Modify: `src/pages/Statistics.jsx`
- Modify: `src/pages/CardAcademyLobby.jsx`
- Test: `tests/card-academy-progression.test.mjs`

- [ ] Write failing tests for plays/wins/tutorial completion/family mastery, first-game badge, five-game explorer, family badges, tutorial-graduate badges, daily mixed-game missions, and recent-game continuation.
- [ ] Replace video-poker-only mission wording with cross-library missions while preserving exact-hold missions when video poker is the focus.
- [ ] Daily Challenge should select a deterministic mix from tutorial-safe mini challenges across game families rather than only poker-hand ID.
- [ ] Update progress dashboard to show overall academy mastery plus per-family mastery, while retaining detailed video-poker analytics where relevant.
- [ ] Refresh current multi-game collection progression references and record three-pass audit.
- [ ] Commit: `feat: expand progression across Card Academy`.

---

### Task 15: Add full-library deterministic gameplay audit and route/render audit

**Files:**
- Create: `scripts/audit-card-academy.mjs`
- Create: `tests/card-academy-full-play-contract.test.mjs`
- Modify: `package.json`

**Audit:**
```json
{
  "status": "PASS",
  "catalogGames": 21,
  "fullPlayEngines": 21,
  "tutorials": 21,
  "terminalSimulations": 21,
  "illegalActionChecks": "PASS",
  "existingPokerAudit": "PASS"
}
```

- [ ] Contract test rejects any catalog entry whose engine is missing, whose tutorial is missing/incomplete, whose `isTerminal/result` interface is missing, or whose room routes to placeholder/demo copy.
- [ ] Audit creates every game with deterministic seeds, runs legal bot/automated actions through complete terminal rounds/matches where practical, asserts state never becomes invalid, and has game-specific maximum guards that fail instead of silently accepting hangs.
- [ ] Add `audit:academy` npm script.
- [ ] Run `npm run test:core`, `npm run audit:gameplay`, and `npm run audit:academy` until all pass.
- [ ] Commit: `test: audit all Card Academy full-play modes`.

---

### Task 16: Upgrade GitHub Actions to quad-check the actual Card Academy package

**Files:**
- Modify: `.github/workflows/appetize-simulator.yml`
- Create: `scripts/verify-card-academy-build.mjs`

- [ ] Add `card-academy-full-v1` to workflow trigger.
- [ ] Run the entire test glob, existing exhaustive video-poker audit, and new full-library audit.
- [ ] Build native web assets and retain hardening verifier.
- [ ] Verify final bundle contains Card Academy route/catalog text and all 21 IDs, not a single-game hardcoded preview.
- [ ] Build universal x86_64/arm64 simulator app.
- [ ] Boot real iPhone Simulator and require native ready marker.
- [ ] Capture launch/lobby screenshot.
- [ ] Add deterministic route-manifest verification for all 21 game and tutorial routes; fail if any route lacks a real registered game.
- [ ] Package ZIP only after every prior step passes.
- [ ] Commit: `ci: quad check full Card Academy simulator build`.

---

### Task 17: Final visual/gameplay quad check and Appetize handoff

**Files:**
- Update: `docs/research/2026-08-15-card-academy-reference-audit.md`
- No source changes unless the audit exposes a defect.

- [ ] **Check 1 — Reference comparison:** Re-open current top references by family. Compare lobby/table palette family, background/table treatment, card size, CTA hierarchy, information density, progression surface and interaction order. Record PASS/FAIL per family.
- [ ] **Check 2 — Google-3:** Confirm Liquid Glassmorphism, Tactile Maximalism and Immersive Cinematic Pacing on lobby plus every family table. Record PASS/FAIL with the exact component/class evidence.
- [ ] **Check 3 — Gameplay:** Run automated tests/audits and manually inspect route/action contracts for all 21. Every game must have a real full end state, New Game/Next Round where appropriate, and replayable full tutorial.
- [ ] **Check 4 — Simulator:** Download runtime diagnostic screenshot(s), inspect for blank screen, clipping, unreadable cards, weak hierarchy or missing premium visuals at target phone size. If any fail, fix and repeat the relevant family research + three-pass gate before rebuilding.
- [ ] Download the final workflow artifact, extract the inner Appetize simulator ZIP, run `unzip -t`, verify bundle ID/ARM64/www/index/catalog assets, and compute SHA-256.
- [ ] Compare `card-academy-full-v1` against `appetize-runtime-fix-v2`; confirm `main` remains untouched.
- [ ] Hand off only the freshly verified inner ZIP and the inspected simulator screenshot.

## Plan Self-Review

- Spec coverage: all 21 approved games are named exactly once in the launch catalog and have an engine task.
- Full-play coverage: each engine task explicitly requires terminal state plus repeat/new game/round behavior; no task permits demos.
- Tutorial coverage: one universal ten-stage contract is required for all 21 and is backed by contract/runtime tests.
- Visual coverage: every family includes current reference research, Google-3, gameplay comparison, then simulator quad check.
- IP scope: Color Clash remains original; competitor work is used only for category conventions and comparison.
- Existing safety: native Storm And Me boot and exhaustive Jacks-or-Better audit remain required.
- No TBD/TODO placeholders or undefined launch-game decisions remain.
