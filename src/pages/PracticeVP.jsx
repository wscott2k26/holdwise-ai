import React, { useEffect, useState, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Spade, Undo2, Table2, RotateCcw, Lightbulb, CheckCircle2, XCircle, Flag, Info, Timer } from "lucide-react";
import { Deck } from "@/lib/cards/deck";
import { evaluateHand, HAND_CATEGORIES, CATEGORY_RANK } from "@/lib/cards/handEvaluator";
import { recommendHold } from "@/lib/cards/strategyEngine";
import { getStrategyRecommendation } from "@/lib/cards/strategyClient";
import { getPayTable, DEFAULT_PAY_TABLE_ID, PAY_TABLES } from "@/lib/cards/payTables";
import PlayingCard from "@/components/PlayingCard";
import AskCoachButton from "@/components/AskCoachButton";
import { buildTutorContext } from "@/lib/coach";
import { useApp } from "@/lib/appContext";
import { useEntitlement } from "@/lib/billing";
import Paywall from "@/components/Paywall";
import { cn } from "@/lib/utils";
import { recordPracticeDecision } from "@/lib/practiceStats";
import { hapticPulse, playSoundEffect } from "@/lib/haptics";
import GlassSurface from "@/components/premium/GlassSurface";
import TactilePressable from "@/components/premium/TactilePressable";
import ScreenReveal, { RevealItem } from "@/components/premium/ScreenReveal";

const MODES = [
  { id: "guided", label: "Guided", desc: "Coach Ace explains each step. Hints always on." },
  { id: "coach", label: "Coach", desc: "You decide, Coach explains after." },
  { id: "challenge", label: "Challenge", desc: "No hints before you decide. Timer off by default." },
];

const FREE_DAILY_HANDS = 10;
const HANDS_KEY = "holdwise_vp_handcount_v1";
const PRACTICE_CREDITS = 5;

function today() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readHandsToday() {
  try {
    const saved = JSON.parse(localStorage.getItem(HANDS_KEY) || "{}");
    return saved.date === today() ? Number(saved.count) || 0 : 0;
  } catch {
    return 0;
  }
}

export default function PracticeVP() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, accessibility, settings, addPoints, setMascotMood, remainingCoachQuestions } = useApp();
  const { isPremium } = useEntitlement();
  const [mode, setMode] = useState("guided");
  const [payTableId, setPayTableId] = useState(DEFAULT_PAY_TABLE_ID);
  const payTable = getPayTable(payTableId);
  const [showPaywall, setShowPaywall] = useState(false);

  const [cards, setCards] = useState(null);
  const [holdMask, setHoldMask] = useState([false, false, false, false, false]);
  const [phase, setPhase] = useState("idle"); // idle | dealt | evaluated | drawn
  const [recommended, setRecommended] = useState(null);
  const [checked, setChecked] = useState(null); // comparison result
  const [finalCards, setFinalCards] = useState(null);
  const [finalResult, setFinalResult] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showPayTable, setShowPayTable] = useState(false);
  const [stats, setStats] = useState({ total: 0, correct: 0, points: 0 });
  const drillGoal = useMemo(() => {
    const value = Number(new URLSearchParams(location.search).get("drill"));
    return value === 5 ? 5 : null;
  }, [location.search]);
  const drillComplete = Boolean(drillGoal && stats.total >= drillGoal);
  const [timerOn, setTimerOn] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [strategyBusy, setStrategyBusy] = useState(false);
  const [strategyNote, setStrategyNote] = useState("");
  const [handsToday, setHandsToday] = useState(() => readHandsToday());
  const [sessionMistakes, setSessionMistakes] = useState([]);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const historyRef = useRef([]);
  const deckRef = useRef(null);
  const handScoredRef = useRef(false);
  const replayLoadedRef = useRef(false);

  useEffect(() => {
    if (!timerOn || phase !== "dealt") return undefined;
    const timerId = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timerId);
  }, [timerOn, phase]);

  useEffect(() => {
    const replay = location.state?.replayMistake;
    if (!replay || replayLoadedRef.current) return;
    replayLoadedRef.current = true;
    dealSpecific(replay.cards, replay.userHold || []);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  function bumpHands() {
    const count = readHandsToday() + 1;
    localStorage.setItem(HANDS_KEY, JSON.stringify({ date: today(), count }));
    setHandsToday(count);
  }

  function deal() {
    if (!isPremium && handsToday >= FREE_DAILY_HANDS) {
      setShowPaywall(true);
      return;
    }
    const nextDeck = new Deck();
    const dealt = nextDeck.draw(5);
    deckRef.current = nextDeck;
    handScoredRef.current = false;
    setCards(dealt);
    setHoldMask([false, false, false, false, false]);
    setPhase("dealt");
    setRecommended(null);
    setChecked(null);
    setFinalCards(null);
    setFinalResult(null);
    setShowHint(false);
    setStrategyNote("");
    setSeconds(0);
    historyRef.current = [];
  }

  function dealSpecific(cardIds, previousHold = []) {
    if (!Array.isArray(cardIds) || cardIds.length !== 5) return;
    const nextDeck = new Deck(1);
    const dealt = nextDeck.drawSpecific(cardIds);
    if (dealt.length !== 5) return;
    deckRef.current = nextDeck;
    handScoredRef.current = false;
    setCards(dealt);
    setHoldMask(Array.isArray(previousHold) && previousHold.length === 5 ? previousHold.map(Boolean) : [false, false, false, false, false]);
    setPhase("dealt");
    setRecommended(null);
    setChecked(null);
    setFinalCards(null);
    setFinalResult(null);
    setShowHint(false);
    setStrategyNote("Replaying a saved mistake. Change the hold, then check your decision again.");
    setSeconds(0);
    historyRef.current = [];
  }

  function toggleHold(index) {
    if (phase !== "dealt" || strategyBusy) return;
    setHoldMask((current) => {
      historyRef.current.push([...current]);
      const next = [...current];
      next[index] = !next[index];
      return next;
    });
  }

  function undoHold() {
    if (phase !== "dealt" || strategyBusy || historyRef.current.length === 0) return;
    const previous = historyRef.current.pop();
    setHoldMask(previous);
  }

  async function calculateRecommendation() {
    if (!cards) return null;
    setStrategyBusy(true);
    setStrategyNote("Coach Ace is checking every legal hold…");
    try {
      const result = await getStrategyRecommendation(cards, payTable, { credits: PRACTICE_CREDITS });
      setRecommended(result);
      setStrategyNote(
        result.source === "exact-enumeration"
          ? `Exact strategy checked ${result.outcomesEvaluated.toLocaleString()} possible final draws.`
          : result.fallbackReason || "Beginner strategy table used."
      );
      return result;
    } catch {
      const fallback = recommendHold(cards, payTable);
      setRecommended(fallback);
      setStrategyNote("Exact strategy was unavailable, so the beginner strategy table was used.");
      return fallback;
    } finally {
      setStrategyBusy(false);
    }
  }

  function scoreDecision(recommendation) {
    const matches = holdMask.filter((held, index) => held === recommendation.holdMask[index]).length;
    const correct = matches === 5;
    const close = !correct && matches === 4;
    const result = {
      correct,
      close,
      category: recommendation.category,
      reason: recommendation.reason,
    };
    setChecked(result);
    setPhase("evaluated");
    hapticPulse(accessibility.haptics, correct ? 22 : 28, correct ? "success" : "warning");
    playSoundEffect(settings.soundEffects !== false, correct ? "success" : "warning");

    if (handScoredRef.current) return result;
    handScoredRef.current = true;
    bumpHands();
    setStats((current) => ({
      total: current.total + 1,
      correct: current.correct + (correct ? 1 : 0),
      points: current.points + (correct ? 10 : 0),
    }));
    recordPracticeDecision({ correct, category: recommendation.category, payTableId, source: recommendation.source });

    if (correct) {
      addPoints(10);
      setMascotMood("celebrate", "That was the exact best hold. Nicely played.");
    } else if (close) {
      setMascotMood("thinking", "Close call — one card separated your hold from the exact best choice.");
    } else {
      setMascotMood("sad", "That one got away — let’s review the exact best hold together.");
    }

    if (!correct) {
      const mistake = {
        cards: cards.map((card) => card.id),
        userHold: [...holdMask],
        recHold: [...recommendation.holdMask],
        category: recommendation.category,
        reason: recommendation.reason,
        source: recommendation.source,
        expectedReturnPerCredit: recommendation.expectedReturnPerCredit ?? null,
        payTableId,
        at: new Date().toISOString(),
      };
      setSessionMistakes((current) => [mistake, ...current]);
      saveMistake(mistake);
    }
    return result;
  }

  async function checkDecision() {
    if (phase !== "dealt" || !cards || strategyBusy) return;
    const result = await calculateRecommendation();
    if (result) scoreDecision(result);
  }

  function saveMistake(mistake) {
    try {
      const list = JSON.parse(localStorage.getItem("holdwise_mistakes_v1") || "[]");
      list.unshift(mistake);
      localStorage.setItem("holdwise_mistakes_v1", JSON.stringify(list.slice(0, 100)));
    } catch {
      localStorage.setItem("holdwise_mistakes_v1", JSON.stringify([mistake]));
    }
  }

  async function draw() {
    if (!cards || strategyBusy || phase === "drawn") return;
    let result = recommended;
    if (!result) result = await calculateRecommendation();
    if (!result) return;
    if (!handScoredRef.current) scoreDecision(result);

    const activeDeck = deckRef.current;
    if (!activeDeck) return;
    const nextCards = [...cards];
    for (let index = 0; index < 5; index += 1) {
      if (!holdMask[index]) nextCards[index] = activeDeck.draw(1)[0];
    }
    setFinalCards(nextCards);
    const handResult = evaluateHand(nextCards);
    setFinalResult(handResult);
    setPhase("drawn");

    const rank = CATEGORY_RANK.indexOf(handResult.category);
    if (rank >= CATEGORY_RANK.indexOf("FLUSH")) setMascotMood("celebrate", `A ${handResult.name}! Nice draw.`);
    else if (rank >= CATEGORY_RANK.indexOf("HIGH_PAIR")) setMascotMood("happy", "That final hand pays on this table.");
    else setMascotMood("thinking", "No pay this time. The decision still counts as good practice.");
  }

  async function hint() {
    if (!cards || strategyBusy) return;
    if (mode === "challenge" && !checked) {
      setStrategyNote("Challenge mode reveals hints only after you check your decision.");
      return;
    }
    const result = recommended || (await calculateRecommendation());
    if (result) setShowHint(true);
  }

  async function explainBestHold() {
    if (!cards || strategyBusy) return;
    if (mode === "challenge" && !checked) {
      setStrategyNote("Check your decision first; then Coach Ace will explain the exact best hold.");
      return;
    }
    const result = recommended || (await calculateRecommendation());
    if (!result) return;
    setChecked((current) => current || { correct: false, category: result.category, reason: result.reason, isExplain: true });
  }

  function endSession() {
    navigate("/home");
  }

  function newHand() {
    if (drillComplete) return;
    deal();
  }

  function restartDrill() {
    setStats({ total: 0, correct: 0, points: 0 });
    setSessionMistakes([]);
    setCards(null);
    setHoldMask([false, false, false, false, false]);
    setPhase("idle");
    setRecommended(null);
    setChecked(null);
    setFinalCards(null);
    setFinalResult(null);
    setShowHint(false);
    setStrategyNote("Focus Drill reset. Deal the first hand when you’re ready.");
    setSeconds(0);
    historyRef.current = [];
    deckRef.current = null;
    handScoredRef.current = false;
  }

  const coachContext = useMemo(() => {
    return buildTutorContext({
      contextType: "practice",
      cards,
      userHoldMask: holdMask,
      recommended,
      handResult: finalResult,
      payTable,
      mistakeCategory: checked?.correct === false ? checked.category : null,
      skillLevel: profile.skillLevel,
    });
  }, [cards, holdMask, recommended, finalResult, checked, payTable, profile.skillLevel]);

  const handPayout = finalResult ? payTable.payouts[finalResult.category]?.[PRACTICE_CREDITS - 1] || 0 : 0;

  function changePayTable(nextId) {
    if (nextId !== DEFAULT_PAY_TABLE_ID && !isPremium) {
      setShowPaywall(true);
      return;
    }
    setPayTableId(nextId);
    if (cards) deal();
  }

  const stageLabel = !cards ? "Deal" : strategyBusy ? "Check" : phase === "dealt" ? "Choose" : phase === "evaluated" ? "Coach reveal" : "Draw";

  return (
    <div className="mx-auto max-w-2xl px-4 pb-32 pt-5 sm:px-5">
      <ScreenReveal>
        <RevealItem order={0} className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-full border border-[hsl(var(--hw-gold)/.28)] bg-black/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] hw-gold-text">{stageLabel}</span>
              {drillGoal && <span className="rounded-full border border-[hsl(var(--hw-emerald)/.45)] bg-[hsl(var(--hw-emerald)/.12)] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[hsl(var(--hw-victory-gold))]">Focus Drill · {Math.min(stats.total, drillGoal)}/{drillGoal}</span>}
              {!isPremium && <span className="text-[10px] text-muted-foreground">{Math.max(0, FREE_DAILY_HANDS - handsToday)} scored hands left</span>}
            </div>
            <h1 className="font-heading text-2xl font-bold">Jacks or Better</h1>
            <label className="mt-1 block text-[11px] text-muted-foreground">
              <span className="sr-only">Select pay table</span>
              <select value={payTableId} onChange={(event) => changePayTable(event.target.value)} className="min-h-[44px] rounded-full border border-white/10 bg-black/15 px-3 text-[11px] text-muted-foreground focus:outline-none">
                {Object.values(PAY_TABLES).map((table) => (
                  <option key={table.id} value={table.id} className="bg-background text-foreground">{table.name}{table.id !== DEFAULT_PAY_TABLE_ID && !isPremium ? " · Premium" : ""}</option>
                ))}
              </select>
            </label>
          </div>
          <TactilePressable onClick={() => setShowPayTable(true)} className="hw-glass-2 rounded-full px-3 py-2 text-xs shadow-none">
            <span className="flex items-center gap-1.5"><Table2 size={14} /> Pay Table</span>
          </TactilePressable>
        </RevealItem>

        <RevealItem order={1} className="mb-4">
          <div className="grid grid-cols-3 gap-2">
            {MODES.map((item) => (
              <TactilePressable
                key={item.id}
                onClick={() => setMode(item.id)}
                className={cn("rounded-xl border px-2 py-2 text-center text-xs shadow-none", mode === item.id ? "hw-glass-4 hw-gold-border hw-gold-text" : "hw-glass-1 border-border/60 text-muted-foreground")}
                aria-pressed={mode === item.id}
              >
                <span className="font-semibold">{item.label}</span>
              </TactilePressable>
            ))}
          </div>
          <div className="mt-2 flex min-h-[44px] items-center justify-between gap-3">
            <p className="text-[11px] text-muted-foreground">{MODES.find((item) => item.id === mode).desc}</p>
            {mode === "challenge" && (
              <TactilePressable onClick={() => setTimerOn((value) => !value)} className={cn("shrink-0 rounded-full border px-3 py-1.5 text-[11px] shadow-none", timerOn ? "hw-glass-4 hw-gold-border hw-gold-text" : "hw-glass-1 border-border/60 text-muted-foreground")}>
                <span className="flex items-center gap-1.5"><Timer size={13} /> {timerOn ? `${seconds}s` : "Timer off"}</span>
              </TactilePressable>
            )}
          </div>
        </RevealItem>

        <RevealItem order={2} className="mb-4">
          <GlassSurface strength={3} goldEdge className="relative overflow-hidden rounded-[1.75rem] p-4 sm:p-5">
            <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(100%_95%_at_50%_0%,hsl(var(--hw-felt)/.72)_0%,hsl(var(--hw-felt-deep)/.88)_72%)]" />
            <div aria-hidden="true" className="absolute inset-x-10 bottom-4 h-16 rounded-[50%] bg-black/25 blur-2xl" />
            <div className="relative">
              {!cards ? (
                <div className="flex min-h-[230px] flex-col items-center justify-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[hsl(var(--hw-gold)/.32)] bg-black/15"><Spade size={30} className="hw-gold-text" /></div>
                  <p className="mb-4 max-w-xs text-sm text-white/70">Deal five cards. Make your hold. Then let Coach Ace show you the exact best decision.</p>
                  <TactilePressable onClick={deal} soundType="deal" className="hw-chip-gold rounded-2xl px-7 py-3 font-semibold">
                    <span className="flex items-center gap-2"><Spade size={16} /> Deal five cards</span>
                  </TactilePressable>
                </div>
              ) : (
                <div className="flex flex-col items-center py-2">
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                    {cards.map((card, index) => {
                      const showCard = finalCards ? finalCards[index] : card;
                      return (
                        <RevealItem key={`${showCard?.id || card.id}-${index}`} order={index} className="flex flex-col items-center gap-2">
                          <PlayingCard card={showCard} held={phase !== "drawn" && holdMask[index]} selected={showHint && Boolean(recommended?.holdMask[index])} onClick={() => toggleHold(index)} />
                          {phase === "dealt" || phase === "evaluated" ? (
                            <TactilePressable onClick={() => toggleHold(index)} className={cn("rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] shadow-none", holdMask[index] ? "hw-glass-4 hw-gold-border hw-gold-text" : "hw-glass-1 border-white/20 text-white/60")} aria-pressed={holdMask[index]}>
                              {holdMask[index] ? "Held" : "Hold"}
                            </TactilePressable>
                          ) : <div className="h-11" />}
                        </RevealItem>
                      );
                    })}
                  </div>
                  {showHint && recommended && (
                    <GlassSurface strength={2} className="mt-4 max-w-md rounded-xl px-3 py-2 text-center text-xs hw-gold-text">
                      <Lightbulb size={13} className="mr-1 inline" />{recommended.reason}
                    </GlassSurface>
                  )}
                </div>
              )}
            </div>
          </GlassSurface>
        </RevealItem>

        {cards && phase !== "drawn" && (
          <RevealItem order={3} className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <TactilePressable onClick={checkDecision} disabled={phase === "evaluated" || strategyBusy} hapticType="selection" className="hw-chip-gold rounded-xl px-2 py-2.5 text-xs font-semibold sm:text-sm">
              <span className="flex items-center justify-center gap-1.5"><CheckCircle2 size={16} /> {strategyBusy ? "Checking" : "Check"}</span>
            </TactilePressable>
            <TactilePressable onClick={draw} disabled={strategyBusy} className="hw-glass-4 rounded-xl px-2 py-2.5 text-xs font-semibold hw-gold-text sm:text-sm">
              <span className="flex items-center justify-center gap-1.5"><Spade size={16} /> Draw</span>
            </TactilePressable>
            <TactilePressable onClick={undoHold} disabled={phase !== "dealt" || historyRef.current.length === 0 || strategyBusy} className="hw-glass-2 rounded-xl px-2 py-2.5 text-xs font-semibold shadow-none sm:text-sm">
              <span className="flex items-center justify-center gap-1.5"><Undo2 size={16} /> Undo</span>
            </TactilePressable>
            <TactilePressable onClick={newHand} disabled={strategyBusy || drillComplete} className="hw-glass-2 rounded-xl px-2 py-2.5 text-xs font-semibold shadow-none sm:text-sm">
              <span className="flex items-center justify-center gap-1.5"><RotateCcw size={16} /> New</span>
            </TactilePressable>
          </RevealItem>
        )}

        {strategyNote && <p className="mb-3 rounded-xl border border-border/50 bg-black/15 px-3 py-2 text-[11px] text-muted-foreground" aria-live="polite">{strategyNote}</p>}

        <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <TactilePressable onClick={hint} disabled={!cards || strategyBusy || (mode === "challenge" && !checked)} className="hw-glass-1 rounded-xl px-2 py-2 text-xs shadow-none"><span className="flex items-center justify-center gap-1.5"><Lightbulb size={15} className="hw-gold-text" /> Hint</span></TactilePressable>
          <TactilePressable onClick={explainBestHold} disabled={!cards || strategyBusy || (mode === "challenge" && !checked)} className="hw-glass-1 rounded-xl px-2 py-2 text-xs shadow-none"><span className="flex items-center justify-center gap-1.5"><Info size={15} className="hw-gold-text" /> Best Hold</span></TactilePressable>
          <TactilePressable onClick={() => setShowPayTable(true)} className="hw-glass-1 rounded-xl px-2 py-2 text-xs shadow-none"><span className="flex items-center justify-center gap-1.5"><Table2 size={15} className="hw-gold-text" /> Pay Table</span></TactilePressable>
          <TactilePressable onClick={endSession} className="hw-glass-1 rounded-xl px-2 py-2 text-xs shadow-none"><span className="flex items-center justify-center gap-1.5"><Flag size={15} /> End</span></TactilePressable>
        </div>

        {checked && phase !== "drawn" && (
          <RevealItem order={0} className="mb-3">
            <GlassSurface strength={4} goldEdge={checked.correct || checked.isExplain} className={cn("rounded-2xl border p-4", !checked.isExplain && !checked.correct && "border-destructive/55")}>
              <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Coach Reveal</p>
              <div className="mb-2 flex items-center gap-2">
                {!checked.isExplain && (checked.correct ? <CheckCircle2 size={20} className="hw-gold-text" /> : <XCircle size={20} className="text-destructive" />)}
                <p className="font-heading text-lg font-bold">{checked.isExplain ? "Recommended hold" : checked.correct ? "Correct decision" : checked.close ? "Close decision" : "Review this decision"}</p>
              </div>
              <RevealItem order={1}><p className="text-sm text-muted-foreground">{checked.reason}</p></RevealItem>
              <RevealItem order={2} className="mt-3 flex flex-wrap items-center gap-2">
                <AskCoachButton context={coachContext} label="Ask Coach Ace" className="text-xs" />
                <button onClick={() => setShowDiagnostic(true)} className="min-h-[44px] rounded-xl px-3 text-xs text-muted-foreground hover:hw-gold-text"><span className="flex items-center gap-1"><Info size={12} /> Diagnostics</span></button>
              </RevealItem>
            </GlassSurface>
          </RevealItem>
        )}

        {phase === "drawn" && finalResult && (
          <RevealItem order={0} className="mb-3">
            <GlassSurface strength={4} goldEdge className="rounded-2xl p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] hw-gold-text">Final hand</p>
              <p className="font-heading text-2xl font-bold">{finalResult.name}</p>
              {handPayout > 0 && <p className="mt-1 text-sm text-muted-foreground">Pays {handPayout} for {PRACTICE_CREDITS} educational credits. No real money.</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                <TactilePressable onClick={newHand} disabled={drillComplete} className="hw-chip-gold rounded-xl px-5 py-2.5 text-sm font-semibold"><span className="flex items-center gap-1.5"><RotateCcw size={15} /> {drillComplete ? "Drill Complete" : "New Hand"}</span></TactilePressable>
                <AskCoachButton context={coachContext} label="Ask Coach Ace" className="text-xs" />
              </div>
            </GlassSurface>
          </RevealItem>
        )}

        {drillComplete && (
          <RevealItem order={0} className="mb-3">
            <GlassSurface strength={5} goldEdge className="rounded-2xl p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] hw-gold-text">Focus Drill Complete</p>
              <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="font-heading text-2xl font-bold">{stats.correct}/{drillGoal} exact holds</p>
                  <p className="mt-1 text-sm text-muted-foreground">A five-decision burst built for fast, focused practice without casino-style pressure.</p>
                </div>
                <span className="rounded-full border border-[hsl(var(--hw-champagne)/.35)] bg-black/20 px-3 py-1 text-xs hw-gold-text">{stats.total ? Math.round((stats.correct / stats.total) * 100) : 0}% accuracy</span>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <TactilePressable onClick={restartDrill} className="hw-lux-button-secondary rounded-xl px-4 py-3 text-sm font-semibold"><span className="flex items-center justify-center gap-2"><RotateCcw size={15} /> Run it again</span></TactilePressable>
                <TactilePressable onClick={() => navigate("/statistics")} className="hw-lux-button rounded-xl px-4 py-3 text-sm font-semibold">Back to Progress</TactilePressable>
              </div>
            </GlassSurface>
          </RevealItem>
        )}

        <GlassSurface strength={2} className="rounded-2xl p-4">
          <div className="grid grid-cols-4 text-center">
            <div><p className="font-heading text-xl font-bold">{stats.correct}</p><p className="text-[10px] uppercase text-muted-foreground">Correct</p></div>
            <div><p className="font-heading text-xl font-bold">{stats.total}</p><p className="text-[10px] uppercase text-muted-foreground">Decisions</p></div>
            <div><p className="font-heading text-xl font-bold">{stats.total ? Math.round((stats.correct / stats.total) * 100) : 0}%</p><p className="text-[10px] uppercase text-muted-foreground">Accuracy</p></div>
            <div><p className="font-heading text-xl font-bold">{sessionMistakes.length}</p><p className="text-[10px] uppercase text-muted-foreground">Reviews</p></div>
          </div>
          {!isPremium && <p className="mt-3 text-center text-[11px] text-muted-foreground">{Math.max(0, FREE_DAILY_HANDS - handsToday)} scored hands left today · {remainingCoachQuestions} free Coach Ace questions</p>}
        </GlassSurface>

        {showPayTable && <PayTableModal payTable={payTable} onClose={() => setShowPayTable(false)} />}
        {showDiagnostic && cards && <DiagnosticModal cards={cards} holdMask={holdMask} recommended={recommended || recommendHold(cards, payTable)} payTable={payTable} onClose={() => setShowDiagnostic(false)} />}
        <Paywall open={showPaywall} onClose={() => setShowPaywall(false)} />
      </ScreenReveal>
    </div>
  );
}

function PayTableModal({ payTable, onClose }) {
  const rows = payTable.categoriesPaid;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-md hw-glass rounded-2xl border hw-gold-border overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-border/60 flex items-center justify-between">
          <div>
            <p className="font-heading font-bold">{payTable.name}</p>
            <p className="text-[11px] text-muted-foreground">{payTable.version}</p>
          </div>
          <button onClick={onClose} className="p-2">✕</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] text-muted-foreground border-b border-border/40">
                <th className="text-left p-2.5">Hand</th>
                {[1, 2, 3, 4, 5].map((c) => (
                  <th key={c} className="text-center p-2.5">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((cat) => (
                <tr key={cat} className="border-b border-border/30">
                  <td className="p-2.5 font-medium">{HAND_CATEGORIES[cat]}</td>
                  {payTable.payouts[cat].map((p, i) => (
                    <td key={i} className="text-center p-2.5">{p}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border/60">
          <p className="text-[11px] text-muted-foreground">{payTable.notes}</p>
        </div>
      </div>
    </div>
  );
}

function DiagnosticModal({ cards, holdMask, recommended, payTable, onClose }) {
  const dealtResult = evaluateHand(cards);
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-md hw-glass rounded-2xl border hw-gold-border p-5 text-xs space-y-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <p className="font-heading font-bold">Developer Diagnostics</p>
          <button onClick={onClose} className="p-2">✕</button>
        </div>
        <Row label="Dealt hand" value={cards.map((c) => c.id).join(" ")} />
        <Row label="Dealt category" value={dealtResult.name} />
        <Row label="User hold mask" value={JSON.stringify(holdMask)} />
        <Row label="Recommended hold mask" value={JSON.stringify(recommended.holdMask)} />
        <Row label="Strategy category" value={recommended.category} />
        <Row label="Pay table ID" value={payTable.id} />
        <Row label="Strategy version" value={recommended.strategyVersion} />
        <Row label="Source" value={recommended.source} />
        <div className="border-t border-border/40 pt-2 mt-2">
          <p className="text-muted-foreground mb-1">Explanation payload:</p>
          <pre className="whitespace-pre-wrap text-muted-foreground">{recommended.reason}</pre>
        </div>
        <p className="text-[10px] text-muted-foreground pt-1">Exact enumeration checks all 32 legal hold masks when the strategy worker is available. A labeled beginner-table fallback is used only if that calculation cannot finish.</p>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right break-all">{value}</span>
    </div>
  );
}
