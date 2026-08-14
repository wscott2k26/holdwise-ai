import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, CheckCircle2, RotateCcw, Sparkles, Trophy, X } from "lucide-react";
import { evaluateHand } from "@/lib/cards/handEvaluator";
import PlayingCard from "@/components/PlayingCard";
import { useApp } from "@/lib/appContext";
import GlassSurface from "@/components/premium/GlassSurface";
import TactilePressable from "@/components/premium/TactilePressable";
import ScreenReveal, { RevealItem } from "@/components/premium/ScreenReveal";
import {
  buildDailyChallengeHands,
  buildDailyChallengeOptions,
  buildDailyChallengeRecord,
  loadDailyChallengeRecord,
  saveDailyChallengeRecord,
} from "@/lib/dailyChallenge";

const QUESTION_COUNT = 5;

export default function DailyChallenge() {
  const navigate = useNavigate();
  const { addPoints, bumpStreak } = useApp();
  const challengeDate = useMemo(() => new Date(), []);
  const hands = useMemo(() => buildDailyChallengeHands(challengeDate, QUESTION_COUNT), [challengeDate]);
  const [previous, setPrevious] = useState(() => loadDailyChallengeRecord(challengeDate));
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [complete, setComplete] = useState(false);
  const [awardedThisRun, setAwardedThisRun] = useState(false);

  const task = hands[idx];
  const result = evaluateHand(task);
  const options = useMemo(() => buildDailyChallengeOptions(task, challengeDate, idx), [task, challengeDate, idx]);
  const currentAnswer = answers[idx];
  const score = answers.filter((answer) => answer.correct).length;

  function answer(name) {
    if (currentAnswer) return;
    const correct = name === result.name;
    const nextAnswer = { guess: name, correct, actual: result.name };
    setAnswers((current) => [...current, nextAnswer]);
    if (correct && !previous) addPoints(15);
  }

  function next() {
    if (!currentAnswer) return;
    if (idx < hands.length - 1) {
      setIdx((value) => value + 1);
      return;
    }

    const finalScore = answers.filter((answer) => answer.correct).length;
    const record = buildDailyChallengeRecord(challengeDate, finalScore, hands.length);
    const bestScore = previous ? Math.max(previous.score || 0, record.score) : record.score;
    const savedRecord = saveDailyChallengeRecord({ ...record, score: bestScore });
    if (!previous) {
      bumpStreak();
      setAwardedThisRun(true);
    }
    setPrevious(savedRecord);
    setComplete(true);
  }

  function replay() {
    setIdx(0);
    setAnswers([]);
    setComplete(false);
    setAwardedThisRun(false);
  }

  return (
    <div className="mx-auto max-w-2xl px-5 pb-24 pt-7">
      <ScreenReveal>
        <RevealItem order={0} className="mb-5">
          <div className="mb-1 flex items-center gap-2">
            <Calendar size={20} className="hw-gold-text" />
            <h1 className="font-heading text-3xl font-bold sm:text-4xl">Daily Challenge</h1>
          </div>
          <p className="text-sm text-muted-foreground">Five deterministic hand-ID questions. Same challenge all day, no random reshuffling.</p>
        </RevealItem>

        {previous && !complete && answers.length === 0 && (
          <RevealItem order={1} className="mb-4">
            <GlassSurface strength={3} goldEdge className="rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <Trophy size={20} className="mt-0.5 hw-gold-text" />
                <div>
                  <p className="font-semibold">Today’s challenge is already complete</p>
                  <p className="mt-1 text-sm text-muted-foreground">Best score: {previous.score}/{previous.total}. Replay for practice; bonus learning points are awarded only on the first completion.</p>
                </div>
              </div>
            </GlassSurface>
          </RevealItem>
        )}

        {!complete ? (
          <RevealItem order={2}>
            <GlassSurface strength={4} goldEdge className="overflow-hidden rounded-3xl p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] hw-gold-text">Hand recognition</p>
                  <p className="font-heading text-xl font-bold">What hand is this?</p>
                </div>
                <span className="rounded-full border border-[hsl(var(--hw-champagne)/.34)] bg-black/20 px-3 py-1 text-xs text-muted-foreground">{idx + 1}/{hands.length}</span>
              </div>

              <div className="relative mb-6 overflow-hidden rounded-2xl border border-[hsl(var(--hw-champagne)/.2)] bg-[radial-gradient(circle_at_50%_25%,hsl(var(--hw-emerald)/.28),transparent_58%),linear-gradient(180deg,hsl(var(--hw-midnight-teal)/.72),hsl(var(--hw-obsidian)/.9))] p-5">
                <div className="pointer-events-none absolute inset-x-14 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--hw-victory-gold)/.65)] to-transparent" />
                <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                  {task.map((card, cardIndex) => (
                    <RevealItem key={card.id} order={cardIndex}>
                      <PlayingCard card={card} size="md" />
                    </RevealItem>
                  ))}
                </div>
              </div>

              {!currentAnswer ? (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {options.map((option) => (
                    <TactilePressable key={option} onClick={() => answer(option)} hapticType="selection" className="hw-glass-2 rounded-xl border border-white/12 px-4 py-3 text-left text-sm font-medium shadow-none hover:hw-gold-border">
                      {option}
                    </TactilePressable>
                  ))}
                </div>
              ) : (
                <div className="text-center" aria-live="polite">
                  {currentAnswer.correct ? (
                    <p className="flex items-center justify-center gap-2 font-semibold hw-gold-text"><CheckCircle2 size={18} /> Exact.</p>
                  ) : (
                    <p className="flex items-center justify-center gap-2 font-semibold text-destructive"><X size={18} /> It was {currentAnswer.actual}.</p>
                  )}
                  <TactilePressable onClick={next} className="hw-lux-button mt-4 min-w-40 rounded-xl px-6 py-3 text-sm font-semibold">
                    {idx === hands.length - 1 ? "Finish challenge" : "Next hand"}
                  </TactilePressable>
                </div>
              )}
            </GlassSurface>
          </RevealItem>
        ) : (
          <RevealItem order={2}>
            <GlassSurface strength={5} goldEdge className="rounded-3xl p-7 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl hw-lux-button"><Trophy size={28} /></div>
              <p className="text-[10px] uppercase tracking-[0.18em] hw-gold-text">Challenge complete</p>
              <h2 className="mt-1 font-heading text-3xl font-bold">{score}/{hands.length} correct</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{awardedThisRun ? `You earned ${score * 15} learning points and moved today’s Academy Missions forward.` : "Replay complete — your best score for today is saved."}</p>
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                <TactilePressable onClick={replay} className="hw-lux-button-secondary rounded-xl px-5 py-3 text-sm font-semibold"><span className="flex items-center justify-center gap-2"><RotateCcw size={16} /> Replay</span></TactilePressable>
                <TactilePressable onClick={() => navigate("/home")} className="hw-lux-button rounded-xl px-5 py-3 text-sm font-semibold"><span className="flex items-center justify-center gap-2"><Sparkles size={16} /> Back home</span></TactilePressable>
              </div>
            </GlassSurface>
          </RevealItem>
        )}
      </ScreenReveal>
    </div>
  );
}
