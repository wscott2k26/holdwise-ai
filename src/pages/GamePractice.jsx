import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw, Crown, Lock, BookOpen } from "lucide-react";
import { ACADEMY_GAMES, gameQuiz, gameContent } from "@/lib/academy";
import Mascot from "@/components/mascot/Mascot";
import { useEntitlement } from "@/lib/billing";
import { useApp } from "@/lib/appContext";
import Paywall from "@/components/Paywall";
import { cn } from "@/lib/utils";

export default function GamePractice() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { isPremium } = useEntitlement();
  const { addPoints, setMascotMood } = useApp();
  const [showPaywall, setShowPaywall] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [complete, setComplete] = useState(false);
  const game = ACADEMY_GAMES.find((item) => item.id === gameId);
  const questions = useMemo(() => gameQuiz(gameId), [gameId]);
  const content = gameContent(gameId);

  if (!game || !content || questions.length === 0) return <div className="px-5 pt-20 text-center text-muted-foreground">Game not found.</div>;

  if (game.premium && !isPremium) {
    return (
      <div className="px-5 pt-16 max-w-md mx-auto text-center">
        <Mascot mascotId={content.mascotId || game.mascot || "ace"} mood="thinking" size={88} className="mx-auto" />
        <Crown size={30} className="hw-gold-text mx-auto mb-3" />
        <h1 className="font-heading text-xl font-bold">Premium rule practice</h1>
        <p className="text-sm text-muted-foreground mt-2">Unlock the complete {game.title} course and game-specific quiz.</p>
        <button type="button" onClick={() => setShowPaywall(true)} className="mt-5 hw-chip-gold rounded-xl px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2"><Lock size={15} /> View Premium</button>
        <Paywall open={showPaywall} onClose={() => setShowPaywall(false)} />
      </div>
    );
  }

  function answer(option) {
    if (selected !== null) return;
    setSelected(option);
    const correct = option === questions[questionIndex].answer;
    if (correct) {
      setScore((value) => value + 1);
      addPoints(5);
      setMascotMood("happy", "Correct — that rule is locked in.");
    } else {
      setMascotMood("thinking", "Good try. Read the explanation, then take the next one.");
    }
  }

  function next() {
    if (questionIndex === questions.length - 1) {
      setComplete(true);
      return;
    }
    setQuestionIndex((value) => value + 1);
    setSelected(null);
  }

  function restart() {
    setQuestionIndex(0);
    setSelected(null);
    setScore(0);
    setComplete(false);
  }

  if (complete) {
    const percent = Math.round((score / questions.length) * 100);
    return (
      <div className="px-5 pt-16 max-w-md mx-auto text-center">
        <div className="w-16 h-16 mx-auto rounded-full hw-chip-gold flex items-center justify-center mb-4"><CheckCircle2 size={28} /></div>
        <h1 className="font-heading text-2xl font-bold">Rule practice complete</h1>
        <p className="text-sm text-muted-foreground mt-2">You scored {score} of {questions.length} ({percent}%) in {game.title}.</p>
        <button type="button" onClick={restart} className="mt-5 w-full hw-chip-gold rounded-xl py-3 font-semibold flex items-center justify-center gap-2"><RotateCcw size={16} /> Practice again</button>
        <button type="button" onClick={() => navigate(`/academy/game/${gameId}`)} className="mt-3 w-full hw-glass border border-border/60 rounded-xl py-3 text-sm flex items-center justify-center gap-2"><BookOpen size={16} /> Review course</button>
      </div>
    );
  }

  const question = questions[questionIndex];
  const answered = selected !== null;

  return (
    <div className="px-5 pt-8 pb-6 max-w-2xl mx-auto">
      <button type="button" onClick={() => navigate(`/academy/game/${gameId}`)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:hw-gold-text mb-4"><ArrowLeft size={16} /> {game.title}</button>

      <div className="flex items-center justify-between mb-3">
        <Mascot mascotId={content.mascotId || game.mascot || "ace"} mood={answered ? (selected === question?.answer ? "happy" : "thinking") : "talk"} talking={!answered} size={62} />
        <div>
          <p className="text-[11px] hw-gold-text tracking-widest uppercase">Rule practice</p>
          <h1 className="font-heading text-xl font-bold">Question {questionIndex + 1} of {questions.length}</h1>
        </div>
        <span className="text-sm text-muted-foreground">Score {score}</span>
      </div>

      <div className="h-2 rounded-full bg-secondary/70 overflow-hidden mb-5" aria-label={`${questionIndex + 1} of ${questions.length} questions`}>
        <div className="h-full bg-[hsl(var(--hw-gold))] transition-all" style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} />
      </div>

      <div className="hw-glass rounded-2xl border hw-gold-border p-5">
        <p className="font-heading text-lg font-bold mb-4">{question.prompt}</p>
        <div className="space-y-2">
          {question.options.map((option) => {
            const isCorrect = answered && option === question.answer;
            const isWrongChoice = answered && option === selected && option !== question.answer;
            return (
              <button
                type="button"
                key={option}
                onClick={() => answer(option)}
                disabled={answered}
                className={cn(
                  "w-full text-left rounded-xl border p-3 text-sm transition-colors",
                  isCorrect && "border-emerald-500/70 bg-emerald-500/10",
                  isWrongChoice && "border-destructive/70 bg-destructive/10",
                  !isCorrect && !isWrongChoice && "border-border/60 hover:bg-white/5",
                  answered && "cursor-default"
                )}
              >
                <span className="flex items-start gap-2">
                  {isCorrect && <CheckCircle2 size={17} className="text-emerald-500 shrink-0 mt-0.5" />}
                  {isWrongChoice && <XCircle size={17} className="text-destructive shrink-0 mt-0.5" />}
                  <span>{option}</span>
                </span>
              </button>
            );
          })}
        </div>

        {answered && (
          <div className="mt-4 rounded-xl bg-black/20 border border-border/50 p-3" aria-live="polite">
            <p className="text-[11px] hw-gold-text tracking-widest uppercase mb-1">Coach explanation</p>
            <p className="text-sm text-muted-foreground">{question.explanation}</p>
            <button type="button" onClick={next} className="mt-3 w-full hw-chip-gold rounded-xl py-2.5 text-sm font-semibold">{questionIndex === questions.length - 1 ? "See results" : "Next question"}</button>
          </div>
        )}
      </div>
    </div>
  );
}
