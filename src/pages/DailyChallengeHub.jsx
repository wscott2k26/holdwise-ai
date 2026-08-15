import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Trophy } from 'lucide-react';
import GlassSurface from '@/components/premium/GlassSurface';
import TactilePressable from '@/components/premium/TactilePressable';
import PlayingCard from '@/components/PlayingCard';
import { buildDailyChallengeHands, buildDailyChallengeOptions, buildDailyChallengeRecord, saveDailyChallengeRecord } from '@/lib/dailyChallenge';
import { evaluateHand } from '@/lib/cards/handEvaluator';

export default function DailyChallengeHub() {
  const navigate = useNavigate();
  const hands = useMemo(() => buildDailyChallengeHands(new Date(), 5), []);
  const [index,setIndex] = useState(0);
  const [score,setScore] = useState(0);
  const [answered,setAnswered] = useState(false);
  const [done,setDone] = useState(false);
  const hand = hands[index];
  const options = useMemo(() => buildDailyChallengeOptions(hand, new Date(), index), [hand,index]);

  function choose(name) {
    if (answered) return;
    const correct = name === evaluateHand(hand).name;
    if (correct) setScore(v=>v+1);
    setAnswered(true);
  }
  function next() {
    if (index === hands.length-1) {
      const finalScore = score + (answered ? 0 : 0);
      saveDailyChallengeRecord(buildDailyChallengeRecord(new Date(), finalScore, hands.length));
      setDone(true);
      return;
    }
    setIndex(v=>v+1); setAnswered(false);
  }

  return <div className="min-h-screen px-3 pt-[max(1rem,env(safe-area-inset-top))] text-white"><div className="mx-auto max-w-2xl">
    <GlassSurface strength={4} goldEdge className="rounded-[1.75rem] p-5"><p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.18em] hw-gold-text"><Trophy size={14}/> Daily Challenge</p><h1 className="mt-2 font-heading text-2xl font-black">Five smart decisions</h1><p className="mt-1 text-sm text-white/60">Name the made hand. Come back tomorrow for a fresh deterministic set.</p></GlassSurface>
    {!done ? <GlassSurface strength={3} className="mt-4 rounded-[1.75rem] p-4"><div className="flex justify-between text-xs text-white/50"><span>Hand {index+1}/5</span><span>Score {score}</span></div><div className="mt-5 flex justify-center gap-1.5">{hand.map(card=><PlayingCard key={card.id} card={card} size="md" />)}</div><div className="mt-5 grid grid-cols-2 gap-2">{options.map(option=>{const correct=evaluateHand(hand).name===option;return <TactilePressable key={option} onClick={()=>choose(option)} className={`rounded-xl px-3 py-3 text-sm font-bold ${answered&&correct?'bg-emerald-400 text-black':'bg-white/7 text-white shadow-none'}`}>{option}</TactilePressable>})}</div>{answered&&<TactilePressable onClick={next} className="mt-4 w-full rounded-2xl bg-[hsl(var(--hw-gold))] px-4 py-3 font-black text-[hsl(var(--hw-navy))]">{index===4?'Finish challenge':'Next hand'}</TactilePressable>}</GlassSurface> : <GlassSurface strength={4} goldEdge className="mt-4 rounded-[1.75rem] p-8 text-center"><CheckCircle2 size={50} className="mx-auto hw-gold-text"/><h2 className="mt-3 font-heading text-2xl font-black">Challenge complete</h2><p className="mt-2 text-white/60">You scored {score} of 5.</p><TactilePressable onClick={()=>navigate('/academy')} className="mt-5 rounded-2xl bg-[hsl(var(--hw-gold))] px-5 py-3 font-black text-[hsl(var(--hw-navy))]">Back to Academy</TactilePressable></GlassSurface>}
  </div></div>;
}
