// Static, verified lesson content. Read by the Learn UI.
// Content here is the single source of truth for lessons the AI references;
// the AI may only explain these facts, never invent new ones.

export const WORLDS = [
  {
    id: "world-1",
    title: "Meet the Cards",
    subtitle: "Start from the very beginning: what a deck is and how cards work.",
    premiumRequired: false,
    units: [
      {
        id: "unit-1-1",
        title: "What Is a Deck?",
        lessons: [
          {
            id: "lesson-deck-standard",
            title: "A Standard Deck",
            lessonType: "reading",
            objectives: ["Understand that a standard deck has 52 cards", "Learn the two colors and four suits"],
            contentBlocks: [
              { type: "text", text: "A standard deck of playing cards has 52 cards. You will use the same kind of deck for video poker, blackjack, and almost every card game in this academy." },
              { type: "text", text: "Every card belongs to one of four suits: Hearts, Diamonds, Clubs, and Spades. Hearts and Diamonds are red. Clubs and Spades are black." },
              { type: "text", text: "Each suit has 13 cards: the numbers 2 through 10, plus the Jack, Queen, King, and Ace. That gives 4 suits times 13 cards, which equals 52." },
            ],
            examples: [
              { label: "A red card", card: { rank: "A", suit: "hearts" } },
              { label: "A black card", card: { rank: "K", suit: "spades" } },
            ],
            nonExamples: [],
            quizData: {
              question: "How many cards are in a standard deck?",
              options: ["48", "52", "54", "56"],
              answer: 1,
              explanation: "A standard deck has 52 cards: 13 ranks in each of 4 suits.",
            },
          },
          {
            id: "lesson-deck-ranks-suits",
            title: "Cards, Ranks and Suits",
            lessonType: "reading",
            objectives: ["Tell a rank from a suit", "Know the 13 ranks and 4 suits"],
            contentBlocks: [
              { type: "text", text: "Every card has two parts: a rank and a suit. The rank is the value or name (like 7, or Queen). The suit is the symbol (like Hearts)." },
              { type: "text", text: "When we say 'Queen of Hearts', the Queen is the rank and Hearts is the suit." },
            ],
            quizData: {
              question: "In 'Jack of Spades', which part is the suit?",
              options: ["Jack", "Spades", "Both", "Neither"],
              answer: 1,
              explanation: "Spades is the suit. Jack is the rank.",
            },
          },
          {
            id: "lesson-deck-52",
            title: "Why There Are 52 Cards",
            lessonType: "reading",
            objectives: ["Explain the 13 x 4 structure"],
            contentBlocks: [
              { type: "text", text: "Each suit has 13 ranks. There are 4 suits. 13 times 4 is 52. That is the whole deck, with no duplicates." },
            ],
            quizData: { question: "13 ranks times 4 suits equals what?", options: ["48", "50", "52", "54"], answer: 2, explanation: "13 x 4 = 52." },
          },
          {
            id: "lesson-deck-red-black",
            title: "Red Cards and Black Cards",
            lessonType: "activity",
            objectives: ["Identify red and black cards", "Never rely on color alone"],
            contentBlocks: [
              { type: "text", text: "Hearts and Diamonds are red. Clubs and Spades are black. But never rely on color alone — always look at the suit symbol and name too." },
            ],
            examples: [{ label: "Heart (red)", card: { rank: "2", suit: "hearts" } }, { label: "Club (black)", card: { rank: "2", suit: "clubs" } }],
            quizData: { question: "Which suit is red?", options: ["Clubs", "Spades", "Diamonds", "All black"], answer: 2, explanation: "Diamonds are red, along with Hearts." },
          },
          {
            id: "lesson-deck-face-up-down",
            title: "Face-Up and Face-Down Cards",
            lessonType: "reading",
            objectives: ["Understand face-up vs face-down"],
            contentBlocks: [
              { type: "text", text: "A face-up card shows its rank and suit. A face-down card hides them, showing only the back. In video poker, your five cards are dealt face-up so you can decide what to hold." },
            ],
            quizData: { question: "A face-down card shows…", options: ["Its rank and suit", "Only its back", "Its color", "Its owner"], answer: 1, explanation: "A face-down card hides its face." },
          },
        ],
      },
      {
        id: "unit-1-2",
        title: "The Four Suits",
        lessons: [
          { id: "lesson-suit-hearts", title: "Hearts", lessonType: "activity", objectives: ["Recognize the heart suit"], contentBlocks: [{ type: "text", text: "Hearts use the symbol ♥ and are red. Tap every heart you see and we will practice together." }], examples: [{ label: "Heart", card: { rank: "Q", suit: "hearts" } }], quizData: { question: "What symbol represents Hearts?", options: ["♦", "♥", "♣", "♠"], answer: 1, explanation: "Hearts use ♥." } },
          { id: "lesson-suit-diamonds", title: "Diamonds", lessonType: "activity", objectives: ["Recognize the diamond suit"], contentBlocks: [{ type: "text", text: "Diamonds use the symbol ♦ and are red." }], examples: [{ label: "Diamond", card: { rank: "9", suit: "diamonds" } }], quizData: { question: "Diamonds are which color?", options: ["Red", "Black", "Green", "Gold"], answer: 0, explanation: "Diamonds are red." } },
          { id: "lesson-suit-clubs", title: "Clubs", lessonType: "activity", objectives: ["Recognize the club suit"], contentBlocks: [{ type: "text", text: "Clubs use the symbol ♣ and are black." }], examples: [{ label: "Club", card: { rank: "7", suit: "clubs" } }], quizData: { question: "Which symbol is Clubs?", options: ["♣", "♦", "♥", "♠"], answer: 0, explanation: "Clubs use ♣." } },
          { id: "lesson-suit-spades", title: "Spades", lessonType: "activity", objectives: ["Recognize the spade suit"], contentBlocks: [{ type: "text", text: "Spades use the symbol ♠ and are black." }], examples: [{ label: "Spade", card: { rank: "A", suit: "spades" } }], quizData: { question: "Spades are which color?", options: ["Red", "Black", "Blue", "White"], answer: 1, explanation: "Spades are black." } },
          { id: "lesson-suit-matching", title: "Suit Matching Activity", lessonType: "activity", objectives: ["Match cards of the same suit"], contentBlocks: [{ type: "text", text: "Two cards share a suit when they show the same symbol. A 3 of Hearts and a Queen of Hearts share the Hearts suit." }], quizData: { question: "Do the 3 of Hearts and Q of Hearts share a suit?", options: ["Yes", "No", "Only sometimes", "Cannot tell"], answer: 0, explanation: "Both are Hearts, so they share a suit." } },
          { id: "lesson-suit-sorting", title: "Suit Sorting Activity", lessonType: "activity", objectives: ["Group cards by suit"], contentBlocks: [{ type: "text", text: "Sorting means putting cards into groups by a rule. When we sort by suit, every Heart goes in one pile, every Diamond in another, and so on." }], quizData: { question: "Sorting by suit groups cards by…", options: ["Rank value", "Suit symbol", "Color only", "Card size"], answer: 1, explanation: "Suit sorting groups by suit symbol." } },
        ],
      },
      {
        id: "unit-1-3",
        title: "Card Ranks",
        lessons: [
          { id: "lesson-rank-numbers", title: "Numbers 2 through 10", lessonType: "reading", objectives: ["Know the numbered ranks"], contentBlocks: [{ type: "text", text: "The numbered cards run from 2 up to 10. A 2 is the lowest numbered rank and a 10 is the highest numbered rank." }], quizData: { question: "Which is higher, 8 or 3?", options: ["8", "3", "Equal", "Depends"], answer: 0, explanation: "Higher numbers beat lower numbers." } },
          { id: "lesson-rank-jack", title: "Jack", lessonType: "reading", objectives: ["Know the Jack"], contentBlocks: [{ type: "text", text: "The Jack (J) is the lowest of the face cards. It ranks above the 10 and below the Queen." }], quizData: { question: "The Jack ranks above the…", options: ["Queen", "King", "10", "Ace"], answer: 2, explanation: "Jack is just above the 10." } },
          { id: "lesson-rank-queen", title: "Queen", lessonType: "reading", objectives: ["Know the Queen"], contentBlocks: [{ type: "text", text: "The Queen (Q) ranks above the Jack and below the King." }], quizData: { question: "Which ranks above the Queen?", options: ["Jack", "10", "King", "7"], answer: 2, explanation: "King outranks Queen." } },
          { id: "lesson-rank-king", title: "King", lessonType: "reading", objectives: ["Know the King"], contentBlocks: [{ type: "text", text: "The King (K) is the second-highest rank, above the Queen and below the Ace (in most games)." }], quizData: { question: "The King is outranked by the…", options: ["Queen", "Jack", "Ace", "10"], answer: 2, explanation: "The Ace usually outranks the King." } },
          { id: "lesson-rank-ace", title: "Ace", lessonType: "reading", objectives: ["Know the Ace"], contentBlocks: [{ type: "text", text: "The Ace (A) is special. It can be the highest card (above the King) or, in straights, the lowest (below the 2) to form A-2-3-4-5." }], quizData: { question: "An Ace can be…", options: ["Only high", "Only low", "High or low", "Neither"], answer: 2, explanation: "The Ace can be high or low depending on the hand." } },
          { id: "lesson-rank-order", title: "Rank Order", lessonType: "activity", objectives: ["Order ranks 2 through Ace"], contentBlocks: [{ type: "text", text: "From low to high, a common order is: 2, 3, 4, 5, 6, 7, 8, 9, 10, Jack, Queen, King, Ace." }], quizData: { question: "Which is the lowest rank?", options: ["2", "3", "Ace", "Jack"], answer: 0, explanation: "2 is the lowest numbered rank." } },
          { id: "lesson-rank-ace-high-low", title: "When Ace May Be High or Low", lessonType: "reading", objectives: ["Understand Ace dual role"], contentBlocks: [{ type: "text", text: "In a straight, the Ace can complete either A-2-3-4-5 (a 'wheel', Ace low) or 10-J-Q-K-A (Ace high). It cannot wrap around, so Q-K-A-2-3 is not a straight." }], quizData: { question: "Is Q-K-A-2-3 a straight?", options: ["Yes", "No", "Only in some games", "It's a flush"], answer: 1, explanation: "The Ace cannot wrap. Q-K-A-2-3 is not a straight." } },
        ],
      },
      {
        id: "unit-1-4",
        title: "Matching Cards",
        lessons: [
          { id: "lesson-match-same-rank", title: "Same Rank", lessonType: "activity", objectives: ["Identify same rank"], contentBlocks: [{ type: "text", text: "Two cards have the same rank when they show the same value, even if their suits differ. A 7 of Clubs and a 7 of Hearts share the rank 7." }], quizData: { question: "Do 7♣ and 7♥ share a rank?", options: ["Yes", "No", "Only if same color", "Cannot tell"], answer: 0, explanation: "Both are 7s, so they share a rank." } },
          { id: "lesson-match-same-suit", title: "Same Suit", lessonType: "activity", objectives: ["Identify same suit"], contentBlocks: [{ type: "text", text: "Two cards share a suit when their symbols match, regardless of rank. A 2 of Spades and a King of Spades both belong to Spades." }], quizData: { question: "2♠ and K♠ share…", options: ["Rank", "Suit", "Both", "Neither"], answer: 1, explanation: "They share the Spades suit." } },
          { id: "lesson-match-pair", title: "Pair", lessonType: "reading", objectives: ["Define a pair"], contentBlocks: [{ type: "text", text: "A pair is two cards of the same rank. These two Queens match even though their suits are different." }], examples: [{ label: "A pair of Queens", cards: [{ rank: "Q", suit: "hearts" }, { rank: "Q", suit: "spades" }] }], quizData: { question: "A pair is two cards of the same…", options: ["Suit", "Color", "Rank", "Value+Suit"], answer: 2, explanation: "A pair shares a rank." } },
          { id: "lesson-match-two-pair", title: "Two Pair", lessonType: "reading", objectives: ["Define two pair"], contentBlocks: [{ type: "text", text: "Two pair means two different pairs, like two 8s and two Kings." }], examples: [{ label: "Two pair", cards: [{ rank: "8", suit: "hearts" }, { rank: "8", suit: "clubs" }, { rank: "K", suit: "diamonds" }, { rank: "K", suit: "spades" }] }], quizData: { question: "Two pair means…", options: ["One pair twice", "Two different pairs", "Four of a kind", "A full house"], answer: 1, explanation: "Two pair is two distinct pairs." } },
          { id: "lesson-match-three", title: "Three Matching Cards", lessonType: "reading", objectives: ["Define three of a kind"], contentBlocks: [{ type: "text", text: "Three of a kind is three cards of the same rank, like three 6s." }], examples: [{ label: "Three 6s", cards: [{ rank: "6", suit: "hearts" }, { rank: "6", suit: "diamonds" }, { rank: "6", suit: "clubs" }] }], quizData: { question: "Three of a kind needs…", options: ["2 same rank", "3 same rank", "4 same rank", "3 same suit"], answer: 1, explanation: "Three matching ranks." } },
          { id: "lesson-match-four", title: "Four Matching Cards", lessonType: "reading", objectives: ["Define four of a kind"], contentBlocks: [{ type: "text", text: "Four of a kind is all four cards of one rank, like four Aces. There is only one set of four for each rank in a single deck." }], examples: [{ label: "Four Aces", cards: [{ rank: "A", suit: "hearts" }, { rank: "A", suit: "diamonds" }, { rank: "A", suit: "clubs" }, { rank: "A", suit: "spades" }] }], quizData: { question: "Four of a kind means…", options: ["4 same suit", "4 same rank", "4 face cards", "4 in a row"], answer: 1, explanation: "Four cards of the same rank." } },
        ],
      },
    ],
  },
  {
    id: "world-2",
    title: "Poker Hands",
    subtitle: "Every standard poker hand, from high card to royal flush.",
    premiumRequired: false,
    units: [
      {
        id: "unit-2-1",
        title: "The Poker Hands",
        lessons: [
          { id: "hand-high-card", title: "High Card", lessonType: "hand", handType: "HIGH_CARD", objectives: ["Recognize high card"], contentBlocks: [{ type: "text", text: "High card means no pair, no flush, no straight — just the single highest card decides." }], examples: [{ label: "Ace high", cards: [{ rank: "A", suit: "spades" }, { rank: "9", suit: "hearts" }, { rank: "7", suit: "clubs" }, { rank: "4", suit: "diamonds" }, { rank: "2", suit: "hearts" }] }], nonExamples: [{ label: "This has a pair, not high card", cards: [{ rank: "K", suit: "spades" }, { rank: "K", suit: "hearts" }, { rank: "9", suit: "clubs" }, { rank: "5", suit: "diamonds" }, { rank: "3", suit: "hearts" }] }], quizData: { question: "High card means…", options: ["A pair", "No made hand", "A flush", "A straight"], answer: 1, explanation: "High card is the weakest category." } },
          { id: "hand-one-pair", title: "One Pair", lessonType: "hand", handType: "HIGH_PAIR", objectives: ["Recognize one pair"], contentBlocks: [{ type: "text", text: "One pair is exactly two cards of the same rank." }], examples: [{ label: "A pair of Jacks", cards: [{ rank: "J", suit: "hearts" }, { rank: "J", suit: "clubs" }, { rank: "9", suit: "spades" }, { rank: "7", suit: "diamonds" }, { rank: "3", suit: "hearts" }] }], quizData: { question: "One pair is…", options: ["2 same rank", "3 same rank", "2 pairs", "2 same suit"], answer: 0, explanation: "A pair is two of the same rank." } },
          { id: "hand-two-pair", title: "Two Pair", lessonType: "hand", handType: "TWO_PAIR", objectives: ["Recognize two pair"], contentBlocks: [{ type: "text", text: "Two pair is two different pairs in the same five cards." }], examples: [{ label: "Jacks and 5s", cards: [{ rank: "J", suit: "spades" }, { rank: "J", suit: "hearts" }, { rank: "5", suit: "clubs" }, { rank: "5", suit: "diamonds" }, { rank: "9", suit: "hearts" }] }], quizData: { question: "Two pair beats…", options: ["Three of a kind", "One pair", "A flush", "A straight"], answer: 1, explanation: "Two pair outranks one pair." } },
          { id: "hand-three-kind", title: "Three of a Kind", lessonType: "hand", handType: "THREE_OF_A_KIND", objectives: ["Recognize three of a kind"], contentBlocks: [{ type: "text", text: "Three of a kind is three cards of the same rank." }], examples: [{ label: "Three 7s", cards: [{ rank: "7", suit: "hearts" }, { rank: "7", suit: "diamonds" }, { rank: "7", suit: "clubs" }, { rank: "K", suit: "spades" }, { rank: "2", suit: "hearts" }] }], quizData: { question: "Three of a kind beats…", options: ["A flush", "Two pair", "A full house", "Four of a kind"], answer: 1, explanation: "Three of a kind outranks two pair." } },
          { id: "hand-straight", title: "Straight", lessonType: "hand", handType: "STRAIGHT", objectives: ["Recognize a straight"], contentBlocks: [{ type: "text", text: "A straight is five cards in rank sequence, suits do not matter. The Ace can be high (10-J-Q-K-A) or low (A-2-3-4-5)." }], examples: [{ label: "9-high straight", cards: [{ rank: "5", suit: "hearts" }, { rank: "6", suit: "spades" }, { rank: "7", suit: "clubs" }, { rank: "8", suit: "diamonds" }, { rank: "9", suit: "hearts" }] }, { label: "Wheel (Ace low)", cards: [{ rank: "A", suit: "hearts" }, { rank: "2", suit: "spades" }, { rank: "3", suit: "clubs" }, { rank: "4", suit: "diamonds" }, { rank: "5", suit: "hearts" }] }], nonExamples: [{ label: "Not a straight (gap)", cards: [{ rank: "5", suit: "hearts" }, { rank: "6", suit: "spades" }, { rank: "7", suit: "clubs" }, { rank: "9", suit: "diamonds" }, { rank: "10", suit: "hearts" }] }], quizData: { question: "A straight needs…", options: ["Same suit", "5 in sequence", "3 same rank", "2 pairs"], answer: 1, explanation: "Five cards in rank order." } },
          { id: "hand-flush", title: "Flush", lessonType: "hand", handType: "FLUSH", objectives: ["Recognize a flush"], contentBlocks: [{ type: "text", text: "A flush is five cards of the same suit. The ranks do not need to be in order." }], examples: [{ label: "Heart flush", cards: [{ rank: "A", suit: "hearts" }, { rank: "9", suit: "hearts" }, { rank: "6", suit: "hearts" }, { rank: "4", suit: "hearts" }, { rank: "2", suit: "hearts" }] }], quizData: { question: "A flush is five cards of the same…", options: ["Rank", "Color", "Suit", "Value"], answer: 2, explanation: "Same suit." } },
          { id: "hand-full-house", title: "Full House", lessonType: "hand", handType: "FULL_HOUSE", objectives: ["Recognize a full house"], contentBlocks: [{ type: "text", text: "A full house is three of a kind plus a pair, like three 8s and two Kings." }], examples: [{ label: "8s full of Kings", cards: [{ rank: "8", suit: "hearts" }, { rank: "8", suit: "diamonds" }, { rank: "8", suit: "clubs" }, { rank: "K", suit: "spades" }, { rank: "K", suit: "hearts" }] }], quizData: { question: "A full house is…", options: ["Two pair", "Three of a kind + a pair", "A flush", "Four of a kind"], answer: 1, explanation: "Three of a kind plus a pair." } },
          { id: "hand-four-kind", title: "Four of a Kind", lessonType: "hand", handType: "FOUR_OF_A_KIND", objectives: ["Recognize four of a kind"], contentBlocks: [{ type: "text", text: "Four of a kind is all four cards of one rank, like four Aces." }], examples: [{ label: "Quad Aces", cards: [{ rank: "A", suit: "hearts" }, { rank: "A", suit: "diamonds" }, { rank: "A", suit: "clubs" }, { rank: "A", suit: "spades" }, { rank: "5", suit: "hearts" }] }], quizData: { question: "Four of a kind beats…", options: ["A straight flush", "A royal flush", "A full house", "Both royal and straight flush"], answer: 2, explanation: "Four of a kind outranks a full house." } },
          { id: "hand-straight-flush", title: "Straight Flush", lessonType: "hand", handType: "STRAIGHT_FLUSH", objectives: ["Recognize a straight flush"], contentBlocks: [{ type: "text", text: "A straight flush is five cards in sequence AND all the same suit." }], examples: [{ label: "5-high straight flush", cards: [{ rank: "A", suit: "clubs" }, { rank: "2", suit: "clubs" }, { rank: "3", suit: "clubs" }, { rank: "4", suit: "clubs" }, { rank: "5", suit: "clubs" }] }], quizData: { question: "A straight flush needs…", options: ["Same suit + sequence", "Same rank", "Two pair", "A pair"], answer: 0, explanation: "Sequence and same suit." } },
          { id: "hand-royal-flush", title: "Royal Flush", lessonType: "hand", handType: "ROYAL_FLUSH", objectives: ["Recognize a royal flush"], contentBlocks: [{ type: "text", text: "A royal flush is the best hand: 10-J-Q-K-A all in the same suit. It is a special straight flush." }], examples: [{ label: "Royal in spades", cards: [{ rank: "10", suit: "spades" }, { rank: "J", suit: "spades" }, { rank: "Q", suit: "spades" }, { rank: "K", suit: "spades" }, { rank: "A", suit: "spades" }] }], quizData: { question: "A royal flush is…", options: ["10-J-Q-K-A same suit", "Any straight flush", "Four aces", "A full house"], answer: 0, explanation: "10 through Ace, same suit." } },
        ],
      },
    ],
  },
  {
    id: "world-3",
    title: "Video Poker Basics",
    subtitle: "How video poker works and why correct play does not guarantee a win.",
    premiumRequired: false,
    units: [
      {
        id: "unit-3-1",
        title: "How Video Poker Works",
        lessons: [
          { id: "vp-what-is", title: "What Video Poker Is", lessonType: "reading", objectives: ["Describe video poker"], contentBlocks: [{ type: "text", text: "Video poker is a solo card game against a pay table, not against other players. You are dealt five cards, choose which to hold, and the rest are replaced on the draw. Your final five cards are scored by the pay table." }], quizData: { question: "In video poker you play against…", options: ["Other players", "A pay table", "A dealer", "The clock"], answer: 1, explanation: "Video poker scores against a pay table." } },
          { id: "vp-vs-table", title: "Video Poker vs Table Poker", lessonType: "reading", objectives: ["Contrast the two"], contentBlocks: [{ type: "text", text: "Table poker is about beating other players and using bluffing. Video poker has no bluffing and no opponents — you simply try to make the best-paying five-card hand from one deal and one draw." }], quizData: { question: "Video poker involves…", options: ["Bluffing", "Opponents", "One deal and one draw", "Betting rounds"], answer: 2, explanation: "Just one deal and one draw." } },
          { id: "vp-first-five", title: "The First Five Cards", lessonType: "reading", objectives: ["Understand the deal"], contentBlocks: [{ type: "text", text: "You start with five face-up cards. You decide which to keep (hold) and which to replace." }], quizData: { question: "You start with how many cards?", options: ["3", "5", "7", "10"], answer: 1, explanation: "Five cards." } },
          { id: "vp-hold", title: "What Hold Means", lessonType: "reading", objectives: ["Define hold"], contentBlocks: [{ type: "text", text: "To hold a card means to keep it for the final hand. Held cards are not replaced on the draw." }], quizData: { question: "Holding a card means…", options: ["Replacing it", "Keeping it", "Discarding it", "Betting on it"], answer: 1, explanation: "You keep it." } },
          { id: "vp-draw", title: "What Draw Means", lessonType: "reading", objectives: ["Define draw"], contentBlocks: [{ type: "text", text: "The draw replaces every card you did not hold with new cards from the remaining deck." }], quizData: { question: "The draw replaces…", options: ["Held cards", "Unheld cards", "All cards", "No cards"], answer: 1, explanation: "Only unheld cards." } },
          { id: "vp-replacing", title: "Replacing Unheld Cards", lessonType: "reading", objectives: ["Understand replacement"], contentBlocks: [{ type: "text", text: "If you hold 3 cards, you draw 2 new cards from the 47 remaining. Those replacements come from the same deck, so the held cards cannot reappear." }], quizData: { question: "Drawn cards come from…", options: ["A new deck", "The held cards", "The remaining deck", "Discards"], answer: 2, explanation: "From the remaining 47 cards." } },
          { id: "vp-evaluated", title: "How the Final Hand Is Evaluated", lessonType: "reading", objectives: ["Understand final eval"], contentBlocks: [{ type: "text", text: "After the draw, your five cards (held plus drawn) are checked against the pay table. The highest qualifying hand earns the listed payout." }], quizData: { question: "After the draw, your hand is…", options: ["Compared to an opponent", "Scored by the pay table", "Ignored", "Re-dealt"], answer: 1, explanation: "Scored by the pay table." } },
          { id: "vp-pay-table", title: "What a Pay Table Is", lessonType: "reading", objectives: ["Define pay table"], contentBlocks: [{ type: "text", text: "A pay table lists how much each hand pays. In Jacks or Better, a pair of Jacks or better is the minimum paying hand." }], quizData: { question: "A pay table shows…", options: ["Hand payouts", "Card colors", "Suits", "Player ranks"], answer: 0, explanation: "Payouts per hand." } },
          { id: "vp-versions", title: "Why Game Versions Matter", lessonType: "reading", objectives: ["Understand version differences"], contentBlocks: [{ type: "text", text: "Two games can share the name 'Jacks or Better' yet pay differently. The full house and flush payouts especially change the return. Always read the pay table." }], quizData: { question: "Two 'Jacks or Better' games…", options: ["Always pay the same", "May pay differently", "Are illegal", "Have no pay table"], answer: 1, explanation: "Pay tables can differ." } },
          { id: "vp-no-guarantee", title: "Why Correct Decisions Do Not Guarantee a Win", lessonType: "reading", objectives: ["Internalize the disclaimer"], contentBlocks: [{ type: "text", text: "Correct strategy gives you the best long-run average outcome, but each draw is random. A perfect decision can still lose any single hand. No strategy guarantees a winning session." }], quizData: { question: "Correct play guarantees…", options: ["A win every hand", "Nothing per hand", "A profit", "A royal flush"], answer: 1, explanation: "No per-hand guarantee." } },
          { id: "vp-ev-plain", title: "What Expected Value Means in Plain English", lessonType: "reading", objectives: ["Understand EV simply"], contentBlocks: [{ type: "text", text: "Expected value is the average result if you made the same choice many, many times. A higher expected value means a better long-run choice — not a sure thing now." }], quizData: { question: "Expected value is a…", options: ["Guarantee", "Long-run average", "Lucky number", "Bet size"], answer: 1, explanation: "It is an average over many trials." } },
          { id: "vp-points-vs-money", title: "Learning Points vs Real Money", lessonType: "reading", objectives: ["Reinforce educational points"], contentBlocks: [{ type: "text", text: "HoldWise uses learning points, stars and mastery. Practice points have no monetary value and cannot be exchanged for anything." }], quizData: { question: "Practice points…", options: ["Are cash", "Have no monetary value", "Can be withdrawn", "Buy prizes"], answer: 1, explanation: "No monetary value." } },
          { id: "vp-responsible", title: "Responsible Practice", lessonType: "reading", objectives: ["Reinforce responsible learning"], contentBlocks: [{ type: "text", text: "Take breaks. Treat this as learning, not a way to make money. If you ever feel pressured, stop. HoldWise is an educational simulator only." }], quizData: { question: "Good practice means…", options: ["Chasing losses", "Taking breaks", "Raising bets after losses", "Playing longer to recover"], answer: 1, explanation: "Take breaks and learn." } },
        ],
      },
    ],
  },
  {
    id: "world-4",
    title: "Jacks or Better Beginner Course",
    subtitle: "Your first real video poker strategy, on the full-pay 9/6 table.",
    premiumRequired: false,
    units: [
      {
        id: "unit-4-1",
        title: "Jacks or Better Fundamentals",
        lessons: [
          { id: "job-name", title: "Why It Is Called Jacks or Better", lessonType: "reading", objectives: ["Explain the name"], contentBlocks: [{ type: "text", text: "The game is named for its lowest paying hand: a pair of Jacks, Queens, Kings, or Aces. A pair of 10s or lower does not pay." }], quizData: { question: "The lowest paying pair is…", options: ["Pair of 2s", "Pair of 10s", "Pair of Jacks", "Pair of Aces only"], answer: 2, explanation: "Jacks or better pays." } },
          { id: "job-pairs-pay", title: "Pairs That Pay", lessonType: "reading", objectives: ["Know paying pairs"], contentBlocks: [{ type: "text", text: "Only a pair of Jacks, Queens, Kings, or Aces pays 1-for-1. Lower pairs do not pay on their own." }], quizData: { question: "A pair of 5s…", options: ["Pays 1", "Does not pay", "Pays 2", "Pays 5"], answer: 1, explanation: "Low pairs don't pay in Jacks or Better." } },
          { id: "job-low-pairs", title: "Low Pairs", lessonType: "reading", objectives: ["Identify low pairs"], contentBlocks: [{ type: "text", text: "A low pair is 2 through 10. It does not pay yet, but you often hold it because it can grow into two pair, three of a kind, a full house, or four of a kind." }], quizData: { question: "A low pair is a pair of…", options: ["Jacks+", "2 through 10", "Aces only", "Face cards"], answer: 1, explanation: "2-10 is low." } },
          { id: "job-high-pairs", title: "High Pairs", lessonType: "reading", objectives: ["Identify high pairs"], contentBlocks: [{ type: "text", text: "A high pair is Jacks, Queens, Kings, or Aces. It already pays, so you usually protect it rather than break it for a risky draw." }], quizData: { question: "A high pair is…", options: ["Jacks or better", "Any pair", "Two pair", "Three of a kind"], answer: 0, explanation: "Jacks or better." } },
          { id: "job-made-hands", title: "Made Hands", lessonType: "reading", objectives: ["Define made hand"], contentBlocks: [{ type: "text", text: "A made hand already qualifies for a payout: a high pair or better. You generally keep all of a made hand unless you have a draw to something much stronger." }], quizData: { question: "A made hand is one that…", options: ["Already pays", "Needs a draw", "Is a flush draw", "Is four to a straight"], answer: 0, explanation: "It already pays." } },
          { id: "job-four-flush", title: "Four Cards to a Flush", lessonType: "reading", objectives: ["Spot four to a flush"], contentBlocks: [{ type: "text", text: "Four cards of the same suit need one more to complete a flush. That is a strong draw — about a 1-in-5 chance by the draw." }], quizData: { question: "Four to a flush needs…", options: ["1 more same suit", "2 same rank", "A pair", "A straight"], answer: 0, explanation: "One more of the suit." } },
          { id: "job-four-straight", title: "Four Cards to a Straight", lessonType: "reading", objectives: ["Spot four to a straight"], contentBlocks: [{ type: "text", text: "Four cards in sequence can be open-ended (two ways to complete) or inside (one rank completes it). Open-ended is stronger." }], quizData: { question: "An open-ended straight has…", options: ["1 way to fill", "2 ways to fill", "No way to fill", "A gap"], answer: 1, explanation: "Two ways." } },
          { id: "job-three-royal", title: "Three Cards to a Royal Flush", lessonType: "reading", objectives: ["Spot three to royal"], contentBlocks: [{ type: "text", text: "Three suited high cards (like 10-J-Q of one suit) can become a royal flush. It is a long shot, but the royal pays the most." }], quizData: { question: "Three to a royal uses…", options: ["Three suited face/ace cards", "Three of a kind", "Three low cards", "Three mixed suits"], answer: 0, explanation: "Three suited high cards." } },
          { id: "job-high-cards", title: "High Cards", lessonType: "reading", objectives: ["Value high cards"], contentBlocks: [{ type: "text", text: "With no made hand or draw, hold high cards (Jack or above) because they can pair on the draw for a paying hand." }], quizData: { question: "High cards are…", options: ["J, Q, K, A", "2-10", "Face cards only", "Aces only"], answer: 0, explanation: "Jack and above." } },
          { id: "job-unsuited-high", title: "Unsuited High Cards", lessonType: "reading", objectives: ["Play unsuited high cards"], contentBlocks: [{ type: "text", text: "When two high cards are different suits, keep the highest one or two — they can still pair, but cannot form a straight flush together." }], quizData: { question: "Unsuited high cards cannot make a…", options: ["Pair", "Straight flush", "Two pair", "Three of a kind"], answer: 1, explanation: "No straight flush without a shared suit." } },
          { id: "job-break-made", title: "When to Break a Made Hand", lessonType: "reading", objectives: ["Decide when to break"], contentBlocks: [{ type: "text", text: "Breaking a made hand is rare. The main case is holding four to a royal flush instead of a made hand that pays less. Most beginners break hands too often — be careful." }], quizData: { question: "Breaking a made hand is…", options: ["Always correct", "Rarely correct", "Never correct", "Required every hand"], answer: 1, explanation: "Usually keep made hands." } },
          { id: "job-no-break", title: "When Not to Break a Made Hand", lessonType: "reading", objectives: ["Avoid breaking"], contentBlocks: [{ type: "text", text: "Do not break a high pair for a flush or straight draw. The pair already pays and has many ways to improve." }], quizData: { question: "You should usually keep a…", options: ["Flush draw over a high pair", "High pair over a flush draw", "Inside straight over a pair", "Low pair over a high pair"], answer: 1, explanation: "Keep the high pair." } },
          { id: "job-errors", title: "Common Beginner Errors", lessonType: "reading", objectives: ["Avoid mistakes"], contentBlocks: [{ type: "text", text: "Common errors: breaking high pairs for weak draws, holding a kicker next to a pair, chasing inside straights, and ignoring the pay table version." }], quizData: { question: "Holding a kicker next to a pair is usually…", options: ["Correct", "A mistake", "Required", "Profitable"], answer: 1, explanation: "Drop the kicker and draw to improve." } },
        ],
      },
    ],
  },
];

export const POKER_HAND_LADDER = [
  { type: "ROYAL_FLUSH", name: "Royal Flush" },
  { type: "STRAIGHT_FLUSH", name: "Straight Flush" },
  { type: "FOUR_OF_A_KIND", name: "Four of a Kind" },
  { type: "FULL_HOUSE", name: "Full House" },
  { type: "FLUSH", name: "Flush" },
  { type: "STRAIGHT", name: "Straight" },
  { type: "THREE_OF_A_KIND", name: "Three of a Kind" },
  { type: "TWO_PAIR", name: "Two Pair" },
  { type: "HIGH_PAIR", name: "Jacks or Better" },
  { type: "LOW_PAIR", name: "Low Pair" },
  { type: "HIGH_CARD", name: "High Card" },
];

export function allLessonsFlat() {
  const out = [];
  for (const w of WORLDS) {
    for (const u of w.units) {
      for (const l of u.lessons) {
        out.push({ ...l, worldId: w.id, worldTitle: w.title, unitId: u.id, unitTitle: u.title, worldPremium: w.premiumRequired });
      }
    }
  }
  return out;
}

export function findLesson(id) {
  return allLessonsFlat().find((l) => l.id === id);
}