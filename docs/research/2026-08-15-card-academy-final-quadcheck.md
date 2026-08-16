# HoldWise AI Card Academy — Final Research / Visual / Gameplay Quad Check

Date: 2026-08-15
Branch: `card-academy-full-v1`
Status: Source implementation pass complete; release QA and simulator screenshot gate pending.

## Mandatory four-pass rule
Every major game-family implementation is reviewed against:
1. Current category-leading reference apps and their information hierarchy / palette family / control prominence.
2. Google-3 material system: Liquid Glassmorphism, Tactile Maximalism, Immersive Cinematic Pacing.
3. Authentic gameplay order and legal rules for the shipped local/solo mode.
4. HoldWise differentiation: Coach Ace, legal move visibility, tutorials, XP/mastery and Storm And Me company-first launch.

No proprietary marks, artwork, card backs, logos, branded symbols or pixel-for-pixel screens are copied.

## Lobby / collection
References: Microsoft Solitaire Collection, WSOP Poker, Governor of Poker 3.
Source pass:
- multi-family discovery rather than a single Jacks-or-Better landing page
- Continue Learning and Daily Challenge hero actions
- recent-game / progress surfaces
- obsidian + midnight core with champagne-gold premium emphasis
- large glass/tactile family tiles
- staged visual hierarchy rather than dense casino-ad clutter
HoldWise twist: teach-first mastery hub instead of chip-store-first casino lobby.

## Poker / Texas Hold'em
References: current WSOP Poker and Governor of Poker 3 mobile presentation.
Palette / composition:
- dark cinematic surround
- emerald felt center
- gold stack / premium emphasis
- ruby destructive Fold control
- four readable seats, board and pot hierarchy
Gameplay source pass:
- rotating dealer, blinds, four streets, legal betting, all-ins, side pots, ties, showdown, next hand and match end
Google-3 pass:
- glass status/control surfaces
- tactile bet sizing and legal actions
- motion-enabled cards / press feedback
HoldWise twist: Coach explanations and legal-action teaching over local bots.

## Video Poker suite
Reference family: current premium video-poker / casino card-machine conventions plus published variant paytable conventions.
Palette / composition:
- deep casino green / obsidian
- warm gold primary action
- high-contrast ivory cards
- variant selector and pay table always discoverable
Gameplay source pass:
- Jacks or Better, Bonus Poker, Double Bonus, Double Double Bonus, Deuces Wild and Joker Poker
- full Deal / Hold / Draw / payout / bankroll / new-hand loops
- exact Jacks-or-Better strategy engine preserved
- wild variants use their own evaluators and are never mislabeled as Jacks exact strategy
HoldWise twist: math explanation and variant warning instead of opaque machine behavior.

## Blackjack
Reference: current leading mobile Blackjack table conventions including MobilityWare-style learn / strategy support.
Palette / composition:
- darkest casino room treatment
- emerald table
- champagne-gold bet / Stand emphasis
- ruby loss / bust treatment
Gameplay source pass:
- six-deck shoe, S17 default, 3:2 natural, Hit, Stand, Double, Split, Insurance, split-Ace rule, DAS, bankroll, next round, reshuffle
Google-3 pass:
- layered glass betting panel
- tactile chip presets / action row
- real card motion primitives and strategy reveal
HoldWise twist: legal basic-strategy guidance and Coach facts.

## Solitaire Collection
References: current Microsoft Solitaire Collection and MobilityWare Solitaire / Spider conventions.
Palette / composition:
- calmer royal-blue / teal atmospheric table
- less aggressive casino red
- large readable cards
- obvious stock / waste / foundations / cells
Gameplay source pass:
- Klondike, Spider, FreeCell, TriPeaks and Pyramid full rules
- Hint, Undo, New Deal and real win/loss states
- Spider difficulty choices
Google-3 pass:
- glass chrome surrounding a clean board
- tactile source/destination interaction
- motion-enabled cards with quiet cinematic pacing
HoldWise twist: one Coach-driven collection with rule explanations instead of five disconnected apps.

## Spades / Hearts
References: current Spades+, Spades Plus and Hearts+ / MobilityWare Hearts conventions.
Palette / composition:
- midnight teal social table
- champagne-gold bids / scores
- ruby risk / point cues
- four-seat hierarchy with trick center
Gameplay source pass:
- Spades: partnership bidding, Nil, follow suit, broken-Spades rule, bags / ten-bag penalty, 500-point match
- Hearts: left/right/across/hold passing, 2-club lead, first-trick restrictions, Hearts broken, Q-spades, Shoot the Moon, 100-point match
Google-3 pass:
- glass seats and score chips
- tactile legal cards / bid controls
- trick collection pacing through shared motion card primitive
HoldWise twist: live Coach facts and beginner rules layered over smart local bots.

## Gin Rummy
References: current Gin Rummy Stars and leading classic Gin Rummy mobile apps.
Palette / composition:
- emerald / teal base
- controlled purple secondary glow
- gold score / mastery emphasis
- obvious stock and discard
- deadwood visible throughout the decision loop
Gameplay source pass:
- exact non-overlapping meld optimization
- draw / discard, deadwood, Knock, Gin, layoffs, undercut, round scoring and first-to-100 match
Google-3 pass:
- premium glass hand / score regions
- tactile selected-card state
- staged knock / gin result surface
HoldWise twist: deadwood math and Coach explanation tied directly to the rules engine.

## Family / Classics
References: current Crazy Eights category leaders; current Go Fish, War and Speed mobile conventions; UNO Mobile only as a high-level color-shedding category reference for energy / readability / fast mode comprehension.
Color Clash remains original and does not use UNO name, mark, branded symbols, card backs or proprietary artwork.

### Crazy Eights
- dark HoldWise table with classic readable cards
- suit/rank matching, wild Eight suit choice, draw, scoring rounds and match target
- local bots + Coach

### Go Fish
- simple center pond / ask loop
- rank and opponent choice are explicit
- successful ask, Go Fish draw, lucky repeat and four-card books are real engine states

### War
- two-deck confrontation with visible latest face-up battle comparison
- three-down / one-up tie War sequence
- cycle protection prevents endless deterministic lockups

### Speed
- two active center piles and visible reserve counts
- 5-card hand + 15-card personal stock per player
- adjacent-rank play with Ace wrap
- reserve flip when both sides stall
- unrecoverable stall resolves as a terminal draw rather than freezing

### Color Clash
- bright spectrum treatment inside the same obsidian / glass HoldWise shell
- original palette names: Ember, Tide, Moss, Violet
- original actions: Block, Flip Flow, Surge Two, Color Shift, Prism Four
- original Last Spark one-card declaration / penalty
- 108-card original deck, four-player local bots, round scoring and match target

Google-3 family pass:
- Liquid Glassmorphism remains in shell/status surfaces
- Tactile Maximalism comes from oversized cards, large actions and physical press states
- Immersive Cinematic Pacing comes from card motion, center-stage table flow and restrained win / battle / action reveals

## Universal tutorial pass
Every catalog game has ten stages:
1. objective
2. table / zones
3. turn flow
4. real engine-backed legal move
5. scoring / winning
6. common mistake
7. guided real engine move
8. live Coach review
9. graduation real engine move
10. mastery reward + Open full table

Tutorial interactions call the same game-engine `legalActions` and `applyAction` contracts used by full play.

## Native / brand pass
- Storm And Me company-first native cloud / lightning boot stays before HoldWise.
- Blank-web failures remain covered by native branded diagnostics.
- iOS Simulator build must retain ARM64 and x86_64.
- Final runtime must create the React -> native ready marker.

## Remaining release-only gates
- all source / rules / UI tests green in one consolidated run
- existing premium/native regression suite green
- exhaustive 2,598,960-hand poker audit green
- production Vite build green
- native iOS Simulator build green
- real simulator boot marker green
- simulator screenshots reviewed for intro, lobby and representative game families
- every one of the 21 game routes launched
- every tutorial route launched and interactive engine step exercised
- final Appetize ZIP integrity checked before handoff
