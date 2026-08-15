# HoldWise Card Academy — Current Reference Audit

Date: 2026-08-15
Purpose: Current category benchmark used before and after meaningful HoldWise Card Academy visual/gameplay changes. This document records conventions to adapt, not proprietary artwork to copy.

## Shared adaptation rules
- Match category-level palette families, table framing, card scale, CTA prominence, information density, progression surfaces and motion pacing.
- Keep all HoldWise artwork, icons, card backs, mascots, labels and branded surfaces original.
- Every family pass must show the Google-3 trio: Liquid Glassmorphism, Tactile Maximalism, Immersive Cinematic Pacing.
- Every gameplay pass must use the HoldWise rules engine as source of truth, then add Coach Ace, tutorial highlights, mastery XP and mistake review.

## Academy Lobby — verified source pass
Current references:
- WSOP Poker: Texas Holdem Game — Apple App Store: https://apps.apple.com/us/app/wsop-poker-texas-holdem-game/id719525810
- Governor of Poker 3 — Apple App Store: https://apps.apple.com/us/app/governor-of-poker-3-holdem/id877638937
- Microsoft Solitaire Collection — Apple App Store: https://apps.apple.com/us/app/microsoft-solitaire-collection/id1103438575
- UNO! Mobile category reference — Apple App Store: https://apps.apple.com/us/app/uno/id1344700142

Reference match: PASS at source-contract level. HoldWise now opens into a collection-first destination with Continue Learning, Daily Challenge, XP/streak/tutorial progress, recent games, five game families, and all 21 full-play entries rather than opening directly into Jacks or Better.

Google-3 match: PASS at source-contract level.
- Liquid Glassmorphism: GlassSurface drives hero, status, family and game tiles.
- Tactile Maximalism: TactilePressable drives primary discovery and play/learn actions.
- Immersive Cinematic Pacing: ScreenReveal/RevealItem stages the hero, progress and family sections.

HoldWise twist: every game exposes Play + Learn; progression is education-first rather than purchase-first.

Simulator screenshot gate: PENDING final family implementation and real iOS runtime verification.

## Poker / Texas Hold'em / Video Poker
Current references:
- WSOP Poker: Texas Holdem Game — Apple App Store: https://apps.apple.com/us/app/wsop-poker-texas-holdem-game/id719525810
- Governor of Poker 3 — Apple App Store: https://apps.apple.com/us/app/governor-of-poker-3-holdem/id877638937
- WSOP 2026 official rules/tournament hub: https://www.wsop.com/tournaments/2026-57th-annual-world-series-of-poker/

Current category conventions confirmed 2026-08-15:
- WSOP continues to combine classic Texas Hold'em with multiple modes, tournaments, collectibles, daily quests and reward progression.
- Governor continues to combine seated Hold'em, tournaments, multiple game modes, missions, collectible status items and progression.
- The play surface must remain the visual center; progression chrome cannot overpower an active decision.

### Texas Hold'em visual target
- emerald felt center stage
- obsidian/midnight perimeter
- bright white readable cards
- four readable seats and stacks close to player identity
- community board centered with pot hierarchy
- champagne-gold current-turn, premium edge and win emphasis
- restrained ruby for fold/loss/urgent state
- large bottom Fold / Check-Call / Bet-Raise hierarchy
- complete bet sizing rather than fixed demo-size bets

### Texas Hold'em Google-3 target
- Liquid Glass: player/status chips, bet controls, result sheet, Coach layer.
- Tactile: large hole cards, oversized action buttons, physical-feeling bet-size controls with haptics.
- Cinematic: staged hole-card deal, flop three-card reveal, turn/river single reveals, showdown glow and restrained win celebration.

### Texas Hold'em gameplay verification
Focused CI GREEN for:
- shared five-card and best-five-of-seven evaluator including wheel straights, kickers and ties
- four-seat match creation
- small/big blinds
- legal-action rejection
- raises and action reset
- preflop/flop/turn/river/showdown flow
- uncontested-pot award
- side-pot-safe showdown settlement with chip conservation
- next-hand dealer rotation and persistent chips
- legal local bot actions

Table UI and simulator visual gate: ACTIVE / pending completion.

### Video Poker target
- Preserve exact Jacks-or-Better engine and 2,598,960-hand evaluator audit.
- Bonus Poker, Double Bonus, Double Double Bonus, Deuces Wild and Joker Poker must use variant-correct pay tables/evaluation.
- Wild variants must never be labeled as using exact standard Jacks-or-Better advice.

## Blackjack
Current references:
- Blackjack by MobilityWare+ — https://apps.apple.com/us/app/blackjack-by-mobilityware/id6469052640
- MobilityWare Blackjack — https://apps.apple.com/us/app/blackjack/id289523017

Current conventions:
- Full casino action set includes Hit, Stand, Split, Double and Insurance where legal.
- Learn-to-play/strategy support and table progression are core value propositions.
- Prominent hand total, bet/bankroll and large primary action controls reduce decision friction.

HoldWise adaptation:
- Dark emerald/teal felt, champagne-gold chip/edge system, ruby warning/bust states, large circular/rounded tactile action controls, glass strategy panel.

## Solitaire collection
Current references:
- Microsoft Solitaire Collection — https://apps.apple.com/us/app/microsoft-solitaire-collection/id1103438575
- Solitaire Grand Harvest — https://apps.apple.com/us/app/solitaire-grand-harvest/id1223338261

Current conventions:
- Microsoft ships Klondike, Spider, FreeCell, TriPeaks and Pyramid in one collection with difficulty choices, Daily Challenges, Weekly Rewards, XP, trophies and achievements.
- Collection discovery uses clearly differentiated game tiles rather than one generic solitaire entry.
- Classic play screens favor large readable cards on uncluttered green/blue table fields.
- Grand Harvest layers strong level progression, daily rewards and celebratory completion energy around TriPeaks.

HoldWise adaptation:
- Calm royal-blue/deep-teal atmosphere, green table zones when useful, colorful-but-premium variant tiles, stronger glass chrome than the classic references, mastery/reward loops tied to learning instead of farming or purchase pressure.

## Spades / Hearts
Current references:
- Spades+ — https://apps.apple.com/us/app/spades/id467280605
- Hearts+ — https://apps.apple.com/us/app/hearts/id398890666
- MobilityWare Hearts — https://apps.apple.com/us/app/hearts-card-game/id1466297045

Current conventions:
- Solo play with smart AI is expected.
- Four-seat readability, clear bid/trick/score labels, persistent stats/achievements and beginner tutorial/help are standard.
- Hearts competitors emphasize hints, undo/start guidance and dramatic Shoot-the-Moon feedback.

HoldWise adaptation:
- Midnight-teal social table, gold bid/score chips, readable player quadrants, highlighted legal hand cards, Coach Ace before/after decision explanations, stronger tactile card lift and cinematic trick collection.

## Gin Rummy
Current references:
- Gin Rummy Stars — https://apps.apple.com/us/app/gin-rummy-stars-card-game/id1467143758

Current conventions:
- Clear deadwood/knock status, stock/discard prominence, sorted hand readability, round/target score and progression are emphasized.
- Screenshot conventions use bright casino felt with high-contrast primary Knock control and distinctive accent trim.

HoldWise adaptation:
- Emerald/teal felt with purple/royal secondary glow, gold/ruby Knock state, sorted large hand cards, glass deadwood/meld meter, Coach explanation tied to verified meld/deadwood engine.

## Crazy Eights / family shedding
Current references:
- Crazy Eights by MobilityWare — https://apps.apple.com/us/app/crazy-eights-card-games/id6464439483
- UNO Mobile — https://apps.apple.com/us/app/uno/id1344700142

Current conventions:
- Fast readability, strong color coding, obvious legal matches, multiple modes/rules and lively completion feedback.
- UNO currently emphasizes modes, house rules, events/tournaments and social/2v2 play; those are category conventions only.
- MobilityWare Crazy Eights emphasizes hints, challenge levels, matching color/number and a strong AI/competitive loop.

HoldWise adaptation:
- Crazy Eights uses standard playing cards inside the shared premium family table.
- Color Clash uses fully original name, card art, symbols and action names; saturated spectrum accents sit inside the obsidian/glass HoldWise shell. No UNO logo, card back or branded symbol treatment is used.

## Go Fish / War / Speed
Reference approach:
- These simpler games have fragmented app-store leaders, so HoldWise uses the strongest current family-card conventions: large central piles, immediately readable turn state, minimal control clutter, smart/fast local bots, and celebratory progression without ad-like interruption.
- Rules are validated against standard/common published play conventions before engine completion.

## Baseline visual gates
Reference match: PASS — five family visual directions defined from current leaders.
Google-3 match target: PASS BY DESIGN — existing HoldWise glass/tactile/cinematic primitives remain required.
Gameplay match target: ENGINE-BY-ENGINE — a game is PASS only after its complete loop and tests are green.
IP-safe adaptation: PASS — competitor assets/names are not reused except ordinary game names; Color Clash stays original.
