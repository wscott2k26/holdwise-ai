import { getGame, CARD_ACADEMY_GAMES } from './catalog.js';

const RULE_HINTS = {
  'texas-holdem':'Build the best five-card poker hand from two private cards and five community cards while managing bets across four streets.',
  'jacks-or-better':'Hold the cards that maximize the draw, then replace the rest; a pair of Jacks or better is the lowest standard paying hand.',
  'bonus-poker':'Play five-card draw video poker with bonus payouts for four of a kind; pay-table details change the best hold.',
  'double-bonus-poker':'Four-of-a-kind ranks receive larger differentiated bonuses, so the pay table matters on close holds.',
  'double-double-bonus-poker':'Four Aces and selected kicker combinations receive premium payouts, making kicker awareness essential.',
  'deuces-wild':'Every 2 is wild and may substitute for another rank or suit; natural and wild hands score differently.',
  'joker-poker':'A Joker is wild and expands the deck; qualifying hands and strategy differ from standard Jacks or Better.',
  blackjack:'Beat the dealer without exceeding 21 using hit, stand, double, and split when the table rules allow them.',
  klondike:'Build tableau columns downward in alternating colors and move each suit upward to its foundation from Ace to King.',
  spider:'Build descending sequences and clear complete same-suit King-to-Ace runs until all cards leave the tableau.',
  freecell:'Use four open cells and empty columns to rearrange all face-up cards into suit foundations.',
  tripeaks:'Remove exposed tableau cards one rank above or below the waste card to clear all three peaks.',
  pyramid:'Remove exposed pairs totaling 13; Kings remove alone. Clear the pyramid before the stock is exhausted.',
  spades:'Bid expected tricks, follow the led suit when possible, and use Spades as trump after they are broken.',
  hearts:'Avoid point cards, especially the Queen of Spades, while following suit and tracking when Hearts are broken.',
  'gin-rummy':'Draw and discard to form sets and runs, reduce deadwood, then knock or go Gin to score the round.',
  'crazy-eights':'Match the discard by rank or suit; an Eight is wild and lets you name the next suit.',
  'go-fish':'Ask for ranks you already hold, collect four-card books, and fish from the stock when the opponent has none.',
  'war':'Each player reveals a card; higher rank captures both. Ties trigger a war until one side wins the battle.',
  'speed':'Race to empty your hand by playing cards one rank above or below either center pile as quickly as legal moves appear.',
  'color-clash':'Match color, number, or action; use original Block, Flip Flow, Surge Two, and Color Shift cards to empty your hand first.',
};
const MISTAKES = {
  'texas-holdem':'Calling every bet, ignoring position, and forgetting that only the best five cards count.',
  blackjack:'Treating soft totals like hard totals or splitting/doubling when the action is not legal.',
  spades:'Failing to follow suit or leading Spades before they are broken when another suit is available.',
  hearts:'Taking avoidable point tricks or leading Hearts before they are broken.',
  'gin-rummy':'Discarding a card that completes the opponent’s likely meld or knocking with unnecessary deadwood.',
  'color-clash':'Missing a legal match or forgetting Last Spark when only one card remains.',
};
function stepsFor(game){
  const rule = RULE_HINTS[game.id] || `Learn the complete rules and winning objective of ${game.title}.`;
  const mistake = MISTAKES[game.id] || `Do not rush: verify the legal move, score consequence, and next-turn effect before committing.`;
  return [
    {id:'objective',kind:'explain',title:`What is ${game.title}?`,body:rule},
    {id:'table',kind:'explain',title:'Know the table',body:`Identify the cards, play zones, score area, turn indicator, and the controls used in ${game.title}.`},
    {id:'turn',kind:'explain',title:'How a turn works',body:`Follow the real ${game.title} turn order from the start state through the next player or next phase.`},
    {id:'legal-move',kind:'interactive',title:'Make a legal move',body:'Coach Ace highlights only actions the rules engine currently allows. Choose one to continue.'},
    {id:'scoring',kind:'explain',title:'How scoring and winning work',body:`See how a round, hand, deal, or match ends in ${game.title}, including its real score or win condition.`},
    {id:'mistakes',kind:'explain',title:'Common mistake to avoid',body:mistake},
    {id:'guided-game',kind:'interactive',title:'Play with Coach Ace',body:'Play the real game state while Coach Ace explains legal choices before you act.'},
    {id:'coach-review',kind:'review',title:'Review the decision',body:'Compare your action with the verified rules and strategy facts produced by the game engine.'},
    {id:'graduation',kind:'interactive',title:'Graduation play',body:'Finish a reduced-hint stretch using the same full rules before normal play unlocks.'},
    {id:'reward',kind:'reward',title:'Tutorial complete',body:`Earn mastery XP and the ${game.title} tutorial badge, then continue into a full game.`},
  ];
}
export function getTutorial(gameId){ const game=getGame(gameId); if(!game) return null; return {gameId,steps:stepsFor(game)}; }
export const TUTORIALS = Object.fromEntries(CARD_ACADEMY_GAMES.map(game=>[game.id,getTutorial(game.id)]));
