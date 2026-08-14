import React from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Star, Play, Calendar, BookOpen, Spade, GraduationCap, Sparkles, Lightbulb, ChevronRight, AlertCircle } from "lucide-react";
import { useApp } from "@/lib/appContext";
import { allLessonsFlat } from "@/lib/lessons";
import { useEntitlement } from "@/lib/billing";

const CARD_FACTS = [
  "A standard deck has 52 cards because 13 ranks times 4 suits equals 52.",
  "The Ace is the only card that can be both the highest and the lowest card in a straight.",
  "A royal flush is the rarest made hand — 10, Jack, Queen, King, and Ace of the same suit.",
  "Hearts and Diamonds are red; Clubs and Spades are black. Always check the suit symbol, not just the color.",
  "In Jacks or Better, only a pair of Jacks or higher pays — a pair of 10s does not.",
];

export default function Home() {
  const { profile, bumpStreak } = useApp();
  const { isPremium } = useEntitlement();
  const navigate = useNavigate();
  const [fact] = React.useState(() => CARD_FACTS[new Date().getDate() % CARD_FACTS.length]);

  React.useEffect(() => {
    bumpStreak();
  }, []);

  const lessons = allLessonsFlat();
  const nextLesson = lessons[0]; // first lesson as the "continue" target

  const stats = [
    { label: "Streak", value: profile.streak, icon: Flame, unit: "days" },
    { label: "Points", value: profile.learningPoints, icon: Star },
    { label: "Level", value: profile.level, icon: Sparkles, small: true },
  ];

  return (
    <div className="px-5 pt-8 pb-4 max-w-2xl mx-auto">
      <header className="mb-6">
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold">{profile.displayName === "Guest" ? "Let's learn some cards" : `Hi, ${profile.displayName}`}</h1>
      </header>

      {/* Continue learning hero */}
      <button
        onClick={() => navigate(`/learn/lesson/${nextLesson.id}`)}
        className="w-full text-left hw-glass rounded-2xl border hw-gold-border p-5 mb-4 hover:bg-white/5 transition-colors hw-fade-up"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] hw-gold-text tracking-widest uppercase">Continue Learning</span>
          <Play size={16} className="hw-gold-text" />
        </div>
        <h2 className="font-heading text-lg font-bold mt-1.5">{nextLesson.unitTitle}</h2>
        <p className="text-sm text-muted-foreground">{nextLesson.title}</p>
        <div className="mt-4 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full hw-gold-text bg-[hsl(var(--hw-gold))]" style={{ width: "12%" }} />
        </div>
        <p className="text-[11px] text-muted-foreground mt-1.5">Mastery 12%</p>
      </button>

      {/* Stat row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {stats.map((s) => (
          <div key={s.label} className="hw-glass rounded-2xl border border-border/60 p-3.5 text-center">
            <s.icon size={18} className="hw-gold-text mx-auto mb-1" />
            <p className={`font-heading font-bold ${s.small ? "text-xs" : "text-xl"}`}>{s.value}{s.unit ? ` ${s.unit}` : ""}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Daily challenge */}
      <button onClick={() => navigate("/daily-challenge")} className="w-full text-left hw-glass rounded-2xl border border-border/60 p-4 mb-4 flex items-center gap-3 hover:bg-white/5">
        <div className="w-10 h-10 rounded-xl hw-glass hw-gold-border flex items-center justify-center">
          <Calendar size={18} className="hw-gold-text" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">Today's five-minute challenge</p>
          <p className="text-xs text-muted-foreground">Identify five poker hands</p>
        </div>
        <ChevronRight size={18} className="text-muted-foreground" />
      </button>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button onClick={() => navigate("/practice/video-poker")} className="hw-glass rounded-2xl border border-border/60 p-4 text-left hover:bg-white/5">
          <Spade size={18} className="hw-gold-text mb-2" />
          <p className="font-semibold text-sm">Practice a Hand</p>
          <p className="text-xs text-muted-foreground">Video poker table</p>
        </button>
        <button onClick={() => navigate("/learn")} className="hw-glass rounded-2xl border border-border/60 p-4 text-left hover:bg-white/5">
          <BookOpen size={18} className="hw-gold-text mb-2" />
          <p className="font-semibold text-sm">Browse Lessons</p>
          <p className="text-xs text-muted-foreground">4 worlds of content</p>
        </button>
      </div>

      {/* Recent mistakes to review */}
      <button onClick={() => navigate("/mistakes")} className="w-full text-left hw-glass rounded-2xl border border-border/60 p-4 mb-4 flex items-center gap-3 hover:bg-white/5">
        <div className="w-10 h-10 rounded-xl hw-glass border border-border/60 flex items-center justify-center">
          <AlertCircle size={18} className="text-muted-foreground" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">Recent mistakes to review</p>
          <p className="text-xs text-muted-foreground">{isPremium ? "Tap to replay your tricky hands" : "Premium feature — see your mistakes"}</p>
        </div>
        <ChevronRight size={18} className="text-muted-foreground" />
      </button>

      {/* Daily card fact */}
      <div className="hw-glass rounded-2xl border border-border/60 p-4 mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <Lightbulb size={16} className="hw-gold-text" />
          <p className="text-[11px] hw-gold-text tracking-widest uppercase">Daily Card Fact</p>
        </div>
        <p className="text-sm">{fact}</p>
      </div>

      {/* Premium preview */}
      {!isPremium && (
        <button onClick={() => navigate("/premium")} className="w-full text-left rounded-2xl p-5 mb-4 bg-gradient-to-br from-[hsl(var(--hw-felt-deep))] to-[hsl(var(--hw-charcoal))] hw-gold-border border">
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap size={18} className="hw-gold-text" />
            <p className="text-[11px] hw-gold-text tracking-widest uppercase">Premium Academy Preview</p>
          </div>
          <p className="font-heading text-lg font-bold">Turn Every Hand Into a Lesson</p>
          <p className="text-xs text-muted-foreground mt-1">Unlock every card-game course and unlimited coaching.</p>
        </button>
      )}
    </div>
  );
}