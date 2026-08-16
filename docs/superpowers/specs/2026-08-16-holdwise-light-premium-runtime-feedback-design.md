# HoldWise Light Premium, Runtime Compatibility, Sound, and Haptics Design

**Date:** 2026-08-16  
**Product:** HoldWise AI Card Academy  
**Branch:** `card-academy-full-v1`  
**Status:** Approved design

## 1. Goal

Replace the current dark green-and-gold presentation with a bright, joyful, premium card-game visual system; add complete sound and haptic feedback; and close the runtime-verification gap that allowed an iOS 18.5 simulator build to pass while the same package failed at startup on Appetize iOS 16.2.

The release succeeds only when the same packaged `.app` opens on the supported Appetize runtime, reaches the Card Academy lobby, exposes all 21 games and tutorials, and demonstrates its sound and native feedback contracts.

## 2. Locked experience direction

HoldWise must feel like a polished modern card-game collection in daylight, not a dark casino, finance dashboard, or private card room after midnight.

The shared visual language uses:

- pearl-white and pale-sky foundations;
- soft aqua, lavender, mint, coral, royal blue, and sunshine-gold gradients;
- deep navy text for readable contrast;
- luminous white panels with colored edge light and soft dimensional shadows;
- gold only for rewards, mastery, current focus, and meaningful primary actions;
- bright, restrained celebration effects for wins, graduation, streaks, and achievements.

Dark charcoal, black glass, and near-black full-screen backgrounds are removed from the default experience. Dark colors may appear only as small text, suit marks, or contrast details. They must never dominate a lobby or game screen.

## 3. Palette and family identities

### 3.1 Shared foundation

| Role | Color direction | Use |
| --- | --- | --- |
| App canvas | Pearl white to pale sky | Default screen background |
| Primary text | Deep navy | Titles, labels, controls |
| Standard surface | Luminous white | Cards, sheets, tiles |
| Primary action | Royal blue to cyan | Play, Continue, Next |
| Mastery/reward | Sunshine to warm gold | XP, wins, achievements |
| Positive state | Bright mint to emerald | Correct decisions, progress |
| Warning state | Warm coral to ruby | Mistakes, busts, destructive actions |
| Supporting accent | Lavender to violet | Tutorials, Coach Ace, special modes |

### 3.2 Game-family identities

- **Poker:** fresh emerald, cyan, and sky blue.
- **Casino:** aqua, royal blue, and limited celebratory gold.
- **Solitaire:** cornflower blue, lavender, and soft periwinkle.
- **Classics:** violet, warm yellow, and pale blue.
- **Family:** coral, mint, aqua, and original rainbow accents where the rules require color coding.

Each family receives a recognizable tile gradient, icon field, and game-table accent while reusing the shared white-card and navy-text system. Family identity must not reduce card readability or legal-move clarity.

## 4. Surface and component redesign

### 4.1 Lobby

- Replace the tall dark list with a bright collection-first lobby.
- Use a colorful Continue Learning hero with one dominant action.
- Present XP, streak, and tutorial progress as compact white cards with distinct accent colors.
- Give each family a visually differentiated premium tile rather than repeating the same dark panel.
- Keep Play and Learn immediately visible for each game.
- Preserve all 21 full-play entries and all 21 ten-stage tutorials.

### 4.2 Gameplay

- Use bright table fields with clear visual separation between felt, cards, player state, and controls.
- Keep playing cards predominantly white with strong red/black suit contrast.
- Use saturated colors for legal choices and active controls, not decorative noise.
- Make the primary move visually dominant and keep secondary actions quieter.
- Use family color on the table perimeter, score chips, result panels, and Coach highlights.

### 4.3 Motion and celebration

- Preserve Reduced Motion behavior.
- Use short card-deal, card-flip, selection-lift, reward-pop, and result-reveal animations.
- Wins and tutorial graduations may use brief original confetti, light bursts, and XP movement.
- Celebrations must end quickly and never block the next action.

## 5. Sound system

A single app-facing sound service owns playback and settings. Components do not create ad hoc audio objects.

### 5.1 Required cues

- interface tap;
- primary button press;
- card deal;
- card flip/reveal;
- card select/hold;
- correct decision;
- warning/incorrect decision;
- round or game win;
- tutorial graduation or achievement.

All cues are original or properly licensed, stored locally in the app bundle, short, normalized, and free from remote runtime dependencies.

### 5.2 Settings and behavior

- Provide separate **Sound**, **Music**, and **Haptics** toggles.
- Sound effects default on at a restrained volume.
- Music defaults off for the first corrected release; the toggle remains available for future original music without forcing a loop into this scope.
- Respect device mute and interruption behavior.
- Repeated actions use rate limiting so rapid card movement does not become noisy.
- Audio load or playback failure must never block gameplay or startup.

## 6. Haptic system

The existing JavaScript-to-iOS message bridge remains the single native transport and is expanded from a partial primitive into a consistent interaction contract.

Semantic feedback types are:

- `selection` for card holds, legal choices, tab changes, and important toggles;
- `success` for correct decisions, round wins, achievements, and graduation;
- `warning` for illegal moves, incorrect decisions, busts, and destructive confirmations;
- `impactLight` for standard primary button presses;
- `impactMedium` for deal/draw confirmation and major game actions.

Haptics fire only for meaningful moments, never on passive animation or every frame. The user setting disables all feedback immediately. Browser vibration remains a best-effort fallback; native iOS feedback is the authoritative path.

## 7. Startup failure and compatibility repair

The observed Appetize failure is treated as a release blocker. The previous workflow proved only an available Xcode 16.4/iOS 18.5 simulator, while the user opened the artifact under Appetize iOS 16.2.

The repair must:

1. reproduce or isolate the iOS 16.2 script failure before changing production behavior;
2. retain actionable startup diagnostics including error name, message, source filename, line, column, and rejection stack when available;
3. compile the web bundle to an explicitly supported Safari/iOS target rather than relying on Vite defaults;
4. inventory runtime APIs used by first-party and bundled dependency code and provide targeted compatibility handling where the supported OS lacks them;
5. verify the exact inlined `file://` package, not only the HTTP preview build;
6. prevent the ready marker from passing until the React lobby has committed and its required catalog data is present;
7. fail CI if an error marker appears before or after readiness during the verification window.

The minimum supported iOS version remains iOS 15.0 unless investigation proves a dependency makes that impossible. Raising the minimum requires separate user approval; the repair should prefer compatibility.

## 8. Verification and release gates

A corrected package is not labeled ready until all gates pass:

### 8.1 Automated gates

- unit tests for compatibility helpers, sound service, settings, haptic semantics, and startup diagnostics;
- production web build and native inlining verification;
- all 21 full-play routes open;
- all 21 tutorials reach graduation through all ten stages;
- gameplay engine and existing Google-3 gates remain green;
- lobby palette contract rejects the former dark-dominant token set;
- sound assets exist, decode, and are referenced through the sound service;
- native bridge recognizes every required haptic semantic;
- exact Appetize ZIP contains one universal `.app` and passes archive integrity checks.

### 8.2 Runtime gates

- launch the exact packaged app on the oldest available supported iOS simulator in CI;
- verify Appetize iOS 16.2 directly when the service offers that runtime;
- capture distinct Storm And Me intro and bright-lobby screenshots;
- confirm no startup error marker is written;
- open representative Poker, Casino, Solitaire, Classics, and Family tables;
- record a sound-event proof and native haptic-message proof;
- conduct a final human visual review before distribution.

If Appetize infrastructure cannot expose logs or automate haptics, the pipeline must still verify the native bridge locally and treat the Appetize launch plus human feedback review as a required manual release gate.

## 9. Error handling

- Startup errors remain visible through the branded boot surface, but the displayed detail must be useful rather than only `Script error`.
- Audio and haptic failures degrade silently after recording a diagnostic event; gameplay continues.
- Missing required catalog or tutorial data blocks readiness and shows a specific recoverable message.
- Retry clears old markers, reloads the bundle, and produces fresh diagnostics.

## 10. Scope boundaries

This pass does not change game rules, evaluator logic, pay tables, tutorial curriculum, billing identifiers, entitlements, account behavior, or the number of games. It does not add wagering, cash prizes, copied competitor artwork, remote sound dependencies, or mandatory background music.

## 11. Acceptance criteria

The design is complete when:

1. the default experience is visibly light, colorful, and premium across the lobby and all five game families;
2. dark full-screen surfaces no longer dominate the product;
3. sound and haptics have user controls and consistent semantic coverage;
4. the exact Appetize package opens without a script error on iOS 16.2;
5. all 21 games and all 21 tutorials remain accessible and functional;
6. screenshots and runtime evidence are attached to the successful release;
7. the user approves the corrected Appetize experience before store-submission work begins.
