import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, CheckCircle2, X, Trophy } from "lucide-react";
import { buildCard } from "@/lib/cards/deck";
import { evaluateHand } from "@/lib/cards/handEvaluator";
import PlayingCard from "@/components/PlayingCard";
import { useApp } from "@/lib/appContext";

// Deterministic daily challenge based on the date, so everyone gets the same
// challenge on a given day.
function seedFromDate() {
  const d = new Date();
  return d.getFullYear() * 1000 + (d.getMonth() + 1) * 50 + d.getDate();
}

function pick(n, arr, rng) {
  const a = arr.slice();
  const out = [];
  for (let i = 0; i < n; i++) out.push(a.splice(Math.floor(rng() * a.length), 1)[0]);
  return out;
}

const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const SUITS = ["hearts", "diamonds", "clubs", "spades"];

function makeHand(seed) {
  let s = seed;
  const rng = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  const ranks = pick(5, RANKS, rng);
  const suits = pick(5, SUITS, rng);
  return ranks.map((r, i) => buildCard(r, suits[i]));
}

export default function DailyChallenge() {
  const navigate = useNavigate();
  const { addPoints, bumpStreak } = useApp();
  const seed = seedFromDate();
  const [idx, setIdx] = useState(0);
  const hands = useMemo(() => [makeHand(seed), makeHand(seed + 1), makeHand(seed + 2), makeHand(seed + 3), makeHand(seed + 4)], []);
  const [answers, setAnswers] = useState([]);

  const task = hands[idx];
  const result = evaluateHand(task);
  const options = useMemo(() => {
    const all = ["Royal Flush", "Straight Flush", "Four of a Kind", "Full House", "Flush", "Straight", "Three of a Kind", "Two Pair", "Jacks or Better", "Low Pair", "High Card"];
    const correct = result.name;
    const wrong = all.filter((n) => n !== correct).sort(() => 0.5 - Math.random()).slice(0, 3);
    return [...wrong, correct].sort(() => 0.5 - Math.random());
  }, [idx]);

  function answer(name) {
    const correct = name === result.name;
    setAnswers((a) => [...a, { guess: name, correct, actual: result.name }]);
    if (correct) addPoints(15);
  }

  function next() {
    if (idx < hands.length - 1) setIdx(idx + 1);
    else { bumpStreak(); }
  }

  const done = idx === hands.length - 1 && answers.length === hands.length;

  return (
    <div className="px-5 pt-8 pb-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <Calendar size={20} className="hw-gold-text" />
        <h1 className="font-heading text-2xl sm:text-3xl font-bold">Daily Challenge</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-5">Identify {hands.length} poker hands. {idx + 1} of {hands.length}.</p>

      {!done ? (
        <div className="hw-glass rounded-2xl border hw-gold-border p-5">
          <p className="text-sm font-medium mb-4">What hand is this?</p>
          <div className="flex flex-wrap justify-center gap-2 mb-5">
            {task.map((c) => (
              <PlayingCard key={c.id} card={c} size="md" />
            ))}
          </div>
          {answers.length <= idx && (
            <div className="grid grid-cols-2 gap-2">
              {options.map((o) => (
                <button key={o} onClick={() => answer(o)} className="rounded-xl border border-border/60 px-3 py-2.5 text-sm hover:bg-white/5">
                  {o}
                </button>
              ))}
            </div>
          )}
          {answers.length > idx && (
            <div className="text-center hw-fade-up">
              {answers[idx].correct ? (
                <p className="hw-gold-text flex items-center justify-center gap-1.5"><CheckCircle2 size={16} /> Correct!</p>
              ) : (
                <p className="text-destructive flex items-center justify-center gap-1.5"><X size={16} /> It was {answers[idx].actual}</p>
              )}
              <button onClick={next} className="mt-4 hw-chip-gold rounded-xl px-5 py-2.5 text-sm font-semibold">Next hand</button>
            </div>
          )}
        </div>
      ) : (
        <div className="hw-glass rounded-2xl border hw-gold-border p-6 text-center">
          <Trophy size={32} className="hw-gold-text mx-auto mb-3" />
          <p className="font-heading text-xl font-bold">Challenge complete</p>
          <p className="text-sm text-muted-foreground mt-1">You got {answers.filter((a) => a.correct).length} of {hands.length} right. +{answers.filter((a) => a.correct).length * 15} learning points.</p>
          <button onClick={() => navigate("/home")} className="mt-5 hw-chip-gold rounded-xl px-5 py-2.5 text-sm font-semibold">Back home</button>
        </div>
      )}
    </div>
  );
}