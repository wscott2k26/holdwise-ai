import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, GraduationCap, Sparkles } from 'lucide-react';
import GlassSurface from '@/components/premium/GlassSurface';
import TactilePressable from '@/components/premium/TactilePressable';
import { getGame } from '@/games/catalog';
import { getEngine } from '@/games/engineRegistry';
import { recordTutorialCompletion } from '@/lib/cardAcademyProgress';

const GUIDES = {
  'texas-holdem': {objective:'Make the best five-card poker hand from your two hole cards and the five community cards.',table:'Four seats, dealer button, small blind, big blind, community board and a shared pot.',turn:'Betting runs preflop, flop, turn and river. Fold, check, call, bet, raise or go all-in only when legal.',scoring:'At showdown the strongest five-card hand wins each pot. Side pots protect all-in contribution limits.',mistakes:'Do not call every hand, ignore position, or raise below the legal minimum.'},
  'jacks-or-better': {objective:'Hold the right cards, draw once, and finish with a paying five-card hand.',table:'Five cards, credit selector and a visible pay table. Jacks or Better pays one pair only at Jacks or higher.',turn:'Deal, choose Holds, then Draw once. Held cards stay; every other card is replaced.',scoring:'Your final category pays the selected credit row. Five credits unlock the full royal-flush top payout on standard tables.',mistakes:'Never judge a hold without reading the exact pay table first.'},
  'bonus-poker': {objective:'Play five-card draw video poker with bonus payouts for selected four-of-a-kind hands.',table:'The flow matches classic video poker but the pay table changes the value of premium quads.',turn:'Deal, hold any subset, draw once, then settle the final hand.',scoring:'Use the displayed Bonus Poker pay table; strategy follows the table, not a generic Jacks chart.',mistakes:'Do not assume every four of a kind has the same value.'},
  'double-bonus-poker': {objective:'Build paying poker hands while chasing the larger quad bonuses in Double Bonus Poker.',table:'Five cards, credits and a variant-specific 10/7-style pay table.',turn:'Deal, Hold, Draw and settle exactly once per hand.',scoring:'Four Aces and other quad groups receive enhanced payouts, so exact hold priorities can shift.',mistakes:'Do not reuse a Jacks-or-Better strategy chart blindly.'},
  'double-double-bonus-poker': {objective:'Use kicker-aware video-poker strategy to maximize Double Double Bonus payouts.',table:'The pay table separates four Aces and four 2–4 hands with premium kickers.',turn:'Deal, Hold, Draw, then score the final five cards.',scoring:'Certain four-of-a-kind plus kicker combinations pay much more than ordinary quads.',mistakes:'Throwing away a valuable kicker can destroy the best payout path.'},
  'deuces-wild': {objective:'Use every Deuce as a wild card to build the strongest paying hand.',table:'Five-card draw with a wild-card pay table and special categories such as Four Deuces and Wild Royal.',turn:'Deal, choose Holds with wild-card possibilities in mind, then Draw once.',scoring:'Wild-hand categories and payouts differ from natural poker, so use the Deuces Wild table shown.',mistakes:'Do not apply ordinary non-wild hand rankings to every decision.'},
  'joker-poker': {objective:'Use the Joker as a wild card while building a Kings-or-Better paying hand.',table:'A 53-card deck adds one Joker and a separate wild-card pay table.',turn:'Deal five, Hold, Draw once, and settle the final hand.',scoring:'Five of a Kind and wild combinations become possible; lower pair requirements also change by table.',mistakes:'Never treat the Joker as a fixed rank or suit.'},
  blackjack: {objective:'Beat the dealer without going over 21.',table:'You face a dealer using a six-deck shoe. HoldWise defaults to S17 and pays natural Blackjack 3:2.',turn:'Set a bet, Deal, then Hit, Stand, Double or Split when legal. Insurance appears only against a dealer Ace.',scoring:'Winning ordinary hands return 1:1 profit; Blackjack pays 3:2; pushes return the wager.',mistakes:'Do not take Insurance automatically or ignore the dealer upcard when choosing a basic-strategy action.'},
  klondike: {objective:'Move all 52 cards to four suit foundations from Ace through King.',table:'Seven tableau columns, stock, waste and four foundations.',turn:'Build tableau downward in alternating colors. Only Kings move to empty columns. Flip newly exposed cards.',scoring:'The game is won when every foundation contains all 13 cards of its suit.',mistakes:'Avoid burying low foundation cards or emptying a column without a useful King plan.'},
  spider: {objective:'Clear eight complete same-suit King-to-Ace runs.',table:'Ten tableau columns and a stock that deals a new card to every column.',turn:'Move descending runs; only same-suit ordered runs move together as a unit. Complete K–A runs clear automatically.',scoring:'Win after eight full suited runs are removed.',mistakes:'Do not block empty-column access or deal a new row while an empty column remains.'},
  freecell: {objective:'Move all cards to foundations using four free cells as temporary storage.',table:'Eight face-up tableau columns, four free cells and four foundations.',turn:'Build down in alternating colors. Empty cells and columns increase how many ordered cards can move together.',scoring:'All 52 cards in foundations completes the game.',mistakes:'Filling every free cell too early can trap otherwise movable sequences.'},
  tripeaks: {objective:'Clear all 28 mountain cards by chaining ranks one above or below the waste.',table:'Three peaks, a stock and one active waste card.',turn:'Only exposed cards may clear. Keep a chain going when possible; draw stock when no useful exposed card remains.',scoring:'Clear the entire mountain before the stock runs out. HoldWise allows Ace to connect with both King and Two.',mistakes:'Breaking a long chain too early wastes the strongest source of board progress.'},
  pyramid: {objective:'Clear the 28-card pyramid by removing exposed cards that total 13.',table:'Pyramid tableau, stock and waste. Kings equal 13 and remove alone.',turn:'Pair exposed values totaling 13 or remove an exposed King. Covered cards unlock as blockers disappear.',scoring:'Win when every pyramid card is removed.',mistakes:'Do not spend an exposed partner if it strands a harder covered card unnecessarily.'},
  spades: {objective:'With your partner, make your bid while Spades remain permanent trump.',table:'Four seats, two partnerships, bids, tricks, team scores and bag counters.',turn:'Bid first, then follow the led suit when possible. Spades cannot lead until broken unless your hand is all Spades.',scoring:'Made contracts score 10 per bid trick plus bags. Ten bags cost 100. Nil succeeds only with zero personal tricks.',mistakes:'Overbidding, collecting careless bags and accidentally breaking a Nil are the classic errors.'},
  hearts: {objective:'Finish the match with the lowest score by avoiding Hearts and the Queen of Spades.',table:'Four seats, 13-card hands, a passing phase and trick center.',turn:'Pass three cards left, right, across, then hold on the fourth round. The 2♣ opens play and everyone follows suit when able.',scoring:'Each Heart is 1 point and Q♠ is 13. Taking all 26 points Shoots the Moon and gives opponents 26 instead.',mistakes:'Do not dump points illegally on the first trick or lead Hearts before they are broken unless you have no alternative.'},
  'gin-rummy': {objective:'Build sets and runs while reducing deadwood, then Knock or go GIN before the opponent.',table:'Two hands, stock, discard pile, score and always-visible deadwood.',turn:'Draw one from stock or discard, then discard one. You may Knock when the remaining ten cards have 10 or fewer deadwood points.',scoring:'GIN earns a 25-point bonus plus opponent deadwood. A normal knock scores the difference; an undercut rewards the defender.',mistakes:'Do not take a discard without knowing what card you will release or ignore opponent layoffs after a normal knock.'},
  'crazy-eights': {objective:'Be the first player to empty your hand by matching suit or rank.',table:'Four hands, draw stock, discard pile and an active suit.',turn:'Play a matching suit/rank or any Eight. An Eight is wild and chooses the next active suit. Draw when no legal card exists.',scoring:'The round winner scores the value left in opponents hands; Eights are expensive leftovers.',mistakes:'Do not waste an Eight when a normal match protects a better future suit.'},
  'go-fish': {objective:'Collect more four-of-a-kind books than the other players.',table:'Four hands, a face-down pond and book counters.',turn:'Ask one opponent for a rank you already hold. A successful ask gives you every card of that rank and another turn; otherwise Go Fish.',scoring:'Every four matching ranks becomes one book. The player with the most books after all 13 books are claimed wins.',mistakes:'Do not ask for a rank that is not in your hand, and remember ranks opponents requested.'},
  war: {objective:'Capture the entire deck by winning automatic high-card battles.',table:'Two face-down decks and a center battle pot.',turn:'Each side flips one card. Higher rank takes the pot. A tie triggers War: up to three face down, then another face-up battle.',scoring:'The game ends when one player owns all available cards; HoldWise cycle protection can declare an endless repeated deal a draw.',mistakes:'War has no strategic card choice, so focus on understanding the tie sequence rather than inventing decisions that do not exist.'},
  speed: {objective:'Empty your hand and personal stock before the opponent.',table:'Each player has a five-card hand, a 15-card stock, two center piles and two five-card reserve piles.',turn:'Play a card one rank above or below either center pile and refill your hand to five. Ace connects with King and Two on this table.',scoring:'First player with no hand and no personal stock wins. When both players stall, the reserve piles flip new center cards.',mistakes:'Do not stare at one center pile; scan both and keep your five-card hand cycling.'},
  'color-clash': {objective:'Empty your hand first by matching color or symbol in HoldWise original color-shedding game.',table:'Four players, a 108-card original deck, draw stack, discard stack and active color.',turn:'Match color/symbol or use Color Shift and Prism Four wild cards. Block skips, Flip Flow reverses and Surge Two forces a draw.',scoring:'Round winners score opponents remaining card points; first to the match target wins.',mistakes:'If your play leaves one card, call Last Spark or take the two-card penalty.'},
};

function buildSteps(game) {
  const guide = GUIDES[game.id];
  return [
    {id:'objective',kind:'explain',title:'What is this game?',body:guide.objective},
    {id:'table',kind:'explain',title:'Know the table',body:guide.table},
    {id:'turn',kind:'explain',title:'How a turn works',body:guide.turn},
    {id:'legal-move',kind:'interactive',title:'Try a legal move',body:'This practice control is connected to the same rules engine used by full play.'},
    {id:'scoring',kind:'explain',title:'Scoring and winning',body:guide.scoring},
    {id:'mistakes',kind:'explain',title:'Common mistake',body:guide.mistakes},
    {id:'guided-game',kind:'guided-game',title:'Guided first game',body:'Make another real engine-validated move with Coach facts visible.'},
    {id:'coach-review',kind:'review',title:'Coach review',body:'Read the live rule facts below and connect the move to the current game state.'},
    {id:'graduation',kind:'graduation',title:'Graduation move',body:'Complete one more legal move with reduced prompting.'},
    {id:'reward',kind:'reward',title:'Tutorial complete',body:'You unlocked the full table and earned tutorial mastery progress.'},
  ];
}

function actorFor(state) {
  if (Number.isInteger(state?.actor)) return state.actor;
  return Number.isInteger(state?.humanSeat) ? state.humanSeat : 0;
}

function hydrateAction(gameId, action, state, actor) {
  if (!action) return null;
  if (gameId === 'hearts' && action.type === 'pass' && !action.cardIds) {
    return { ...action, actor, cardIds:(state.players?.[actor]?.hand || []).slice(0,3).map(card=>card.id) };
  }
  if (gameId === 'blackjack' && action.type === 'set-bet') {
    return { type:'set-bet', amount:Math.max(1,Math.min(state.bankroll || 10,state.bet || 10)) };
  }
  if (action.actor === undefined && ['spades','hearts','gin-rummy','crazy-eights','go-fish','speed','color-clash'].includes(gameId)) return { ...action, actor };
  return action;
}

function actionLabel(action) {
  if (!action) return 'No legal move';
  const text = action.type.replaceAll('-', ' ');
  if (action.cardId) return `${text}: ${action.cardId}`;
  if (action.bid !== undefined) return `${text}: ${action.bid}`;
  if (action.rank) return `${text}: ${action.rank}`;
  return text;
}

export default function GameTutorial() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const game = getGame(gameId);
  const engine = getEngine(gameId);
  const steps = useMemo(() => game ? buildSteps(game) : [], [game]);
  const [stepIndex,setStepIndex] = useState(0);
  const [practiceState,setPracticeState] = useState(() => engine?.createGame({seed:20260815,humanSeat:0}) || null);
  const [practiceMessage,setPracticeMessage] = useState('Ready for a real rules-engine move.');
  const [completed,setCompleted] = useState(false);
  const step = steps[stepIndex];

  useEffect(() => {
    setStepIndex(0);
    setPracticeState(engine?.createGame({seed:20260815,humanSeat:0}) || null);
    setPracticeMessage('Ready for a real rules-engine move.');
    setCompleted(false);
  }, [gameId]);

  useEffect(() => {
    if (step?.kind === 'reward' && !completed) {
      recordTutorialCompletion(gameId);
      setCompleted(true);
    }
  }, [step?.kind,completed,gameId]);

  if (!game || !engine || !step) return <div className="p-6 text-white">Tutorial unavailable.</div>;

  const actor = actorFor(practiceState);
  const coachFacts = engine.coachFacts(practiceState,actor) || [];
  const liveKinds = new Set(['interactive','guided-game','graduation']);

  function tryLegalMove() {
    let state = practiceState;
    if (engine.isTerminal(state)) state = engine.createGame({seed:20260815 + stepIndex + 1,humanSeat:0});
    const currentActor = actorFor(state);
    const actions = engine.legalActions(state,currentActor) || [];
    const ordered = actions.slice().sort((a,b) => {
      const low = new Set(['undo','new-round','new-game','set-bet']);
      return Number(low.has(a.type)) - Number(low.has(b.type));
    });
    let lastError = null;
    for (const candidate of ordered) {
      const action = hydrateAction(gameId,candidate,state,currentActor);
      try {
        const next = engine.applyAction(state,action);
        setPracticeState(next);
        setPracticeMessage(`PASS · ${actionLabel(action)}`);
        return;
      } catch (error) {
        lastError = error;
      }
    }
    setPracticeMessage(lastError ? `Coach blocked that path: ${lastError.message}` : 'No legal move is available in this sandbox state. Reset it and try again.');
  }

  function resetPractice() {
    setPracticeState(engine.createGame({seed:20260815 + stepIndex + 41,humanSeat:0}));
    setPracticeMessage('Practice state reset.');
  }

  return <div className="mx-auto min-h-screen max-w-3xl px-4 pb-28 pt-[max(1rem,env(safe-area-inset-top))] text-white">
    <div className="flex items-center justify-between gap-3">
      <button type="button" onClick={()=>navigate('/academy')} className="flex min-h-[44px] items-center gap-2 text-sm font-bold text-white/60"><ArrowLeft size={18}/>Academy</button>
      <span className="rounded-full border border-amber-200/15 bg-amber-200/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.16em] hw-gold-text">Tutorial {stepIndex+1}/{steps.length}</span>
    </div>

    <div className="mt-5">
      <p className="text-[10px] font-black uppercase tracking-[.18em] hw-gold-text">{game.title}</p>
      <h1 className="mt-1 font-heading text-3xl font-black">{step.title}</h1>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-[hsl(var(--hw-gold))] transition-all" style={{width:`${((stepIndex+1)/steps.length)*100}%`}}/></div>
    </div>

    <GlassSurface strength={4} goldEdge className="mt-5 rounded-[1.8rem] p-5">
      <div className="flex items-start gap-3"><div className="rounded-2xl border border-amber-200/15 bg-amber-200/7 p-3"><BookOpen className="hw-gold-text"/></div><p className="text-sm leading-7 text-white/72">{step.body}</p></div>
    </GlassSurface>

    {(liveKinds.has(step.kind) || step.kind === 'review') && <GlassSurface strength={3} className="mt-4 rounded-[1.8rem] p-4">
      <div className="flex items-center justify-between gap-3"><div><p className="text-[9px] font-black uppercase tracking-[.16em] text-emerald-200/70">Live engine sandbox</p><p className="mt-1 text-sm font-black">Seat {actor+1} · {practiceState?.phase || 'active'}</p></div><CheckCircle2 size={22} className="text-emerald-300"/></div>
      <p className="mt-3 rounded-xl border border-white/7 bg-black/15 p-3 text-xs leading-5 text-white/58">{practiceMessage}</p>
      <div className="mt-3 space-y-1.5">{coachFacts.slice(0,4).map((fact,index)=><p key={index} className="text-[11px] leading-5 text-white/48">• {fact}</p>)}</div>
      {liveKinds.has(step.kind) && <div className="mt-4 grid grid-cols-2 gap-2"><TactilePressable onClick={tryLegalMove} className="rounded-2xl bg-[hsl(var(--hw-gold))] px-3 py-3 font-black text-[hsl(var(--hw-navy))]">Try a legal move</TactilePressable><TactilePressable onClick={resetPractice} className="rounded-2xl bg-white/7 px-3 py-3 font-black text-white shadow-none">Reset practice</TactilePressable></div>}
    </GlassSurface>}

    {step.kind === 'reward' && <GlassSurface strength={5} goldEdge className="mt-4 rounded-[1.8rem] p-6 text-center"><GraduationCap size={44} className="mx-auto hw-gold-text"/><h2 className="mt-3 font-heading text-2xl font-black">Graduated</h2><p className="mt-2 text-sm text-white/58">The tutorial reward is saved. Full play uses the same rules engine you just practiced against.</p><TactilePressable onClick={()=>navigate(`/game/${gameId}`)} className="mt-5 w-full rounded-2xl bg-[hsl(var(--hw-gold))] py-3.5 font-black text-[hsl(var(--hw-navy))]"><Sparkles size={17} className="mr-2 inline"/>Open full table</TactilePressable></GlassSurface>}

    <div className="mt-5 grid grid-cols-2 gap-2"><TactilePressable disabled={stepIndex===0} onClick={()=>setStepIndex(index=>Math.max(0,index-1))} className="rounded-2xl bg-white/7 px-3 py-3 text-sm font-black text-white shadow-none"><ArrowLeft size={16} className="mr-1 inline"/>Back</TactilePressable>{stepIndex<steps.length-1?<TactilePressable onClick={()=>setStepIndex(index=>Math.min(steps.length-1,index+1))} className="rounded-2xl bg-[hsl(var(--hw-gold))] px-3 py-3 text-sm font-black text-[hsl(var(--hw-navy))]">Next<ArrowRight size={16} className="ml-1 inline"/></TactilePressable>:<TactilePressable onClick={()=>navigate(`/game/${gameId}`)} className="rounded-2xl bg-[hsl(var(--hw-gold))] px-3 py-3 text-sm font-black text-[hsl(var(--hw-navy))]">Open full table</TactilePressable>}</div>
  </div>;
}
