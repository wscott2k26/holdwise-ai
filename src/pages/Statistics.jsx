import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, TrendingUp, Trophy, Target, Table2, Compass } from "lucide-react";
import { completionCount } from "@/lib/progress";
import { useApp } from "@/lib/appContext";
import PremiumGate from "@/components/PremiumGate";
import { loadPracticeStats } from "@/lib/practiceStats";
import { getPayTable } from "@/lib/cards/payTables";
import { buildMasterySnapshot } from "@/lib/mastery";
import GlassSurface from "@/components/premium/GlassSurface";
import MasteryMeter from "@/components/premium/MasteryMeter";
import ScreenReveal, { RevealItem } from "@/components/premium/ScreenReveal";
import TactilePressable from "@/components/premium/TactilePressable";

function titleCase(value, fallback = "More practice needed") {
  if (!value) return fallback;
  return String(value).replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function accuracyLabel(row) {
  return row ? `${Math.round(row.accuracy * 100)}%` : "—";
}

export default function Statistics() {
  const navigate = useNavigate();
  const { profile } = useApp();
  const lessonsDone = completionCount();
  const practice = useMemo(() => loadPracticeStats(), []);
  const mistakes = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("holdwise_mistakes_v1") || "[]"); } catch { return []; }
  }, []);
  const snapshot = useMemo(
    () => buildMasterySnapshot({ profile, practice, mistakes, lessonsDone }),
    [profile, practice, mistakes, lessonsDone]
  );

  const bestTable = snapshot.bestPayTableId ? getPayTable(snapshot.bestPayTableId) : null;
  const bestTableStats = snapshot.bestPayTableId ? practice.byPayTable?.[snapshot.bestPayTableId] : null;
  const bestTableAccuracy = bestTableStats?.total ? Math.round((bestTableStats.correct / bestTableStats.total) * 100) : 0;

  const premiumGroups = [
    { label: "Momentum", value: `${snapshot.recentAccuracyPct}% recent accuracy`, icon: TrendingUp },
    { label: "Strength", value: snapshot.strongest ? `${titleCase(snapshot.strongest.category)} · ${accuracyLabel(snapshot.strongest)}` : "More practice needed", icon: Trophy },
    { label: "Focus", value: snapshot.weakest ? `${titleCase(snapshot.weakest.category)} · ${accuracyLabel(snapshot.weakest)}` : titleCase(snapshot.commonMistake), icon: Target },
    { label: "Table familiarity", value: bestTable ? `${bestTable.version} · ${bestTableAccuracy}%` : "No hands yet", icon: Table2 },
    { label: "Weekly focus", value: snapshot.recommendedFocus, icon: Compass },
  ];

  return (
    <div className="mx-auto max-w-2xl px-5 pb-4 pt-7">
      <ScreenReveal>
        <RevealItem order={0} className="mb-5">
          <div className="mb-1 flex items-center gap-2"><BarChart3 size={20} className="hw-gold-text" /><h1 className="font-heading text-3xl font-bold sm:text-4xl">Progress</h1></div>
          <p className="text-sm text-muted-foreground">Educational progress only — never money won or lost.</p>
        </RevealItem>

        <RevealItem order={1} className="mb-4">
          <MasteryMeter
            value={snapshot.masteryPct}
            interpretation={`${snapshot.accuracyPct}% decision accuracy`}
            streak={snapshot.streakDays}
            focus={snapshot.recommendedFocus}
          />
        </RevealItem>

        <RevealItem order={2} className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <GlassSurface strength={2} className="rounded-2xl p-4"><p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Decision accuracy</p><p className="mt-1 font-heading text-2xl font-bold">{snapshot.accuracyPct}%</p></GlassSurface>
          <GlassSurface strength={2} className="rounded-2xl p-4"><p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Current streak</p><p className="mt-1 font-heading text-2xl font-bold">{snapshot.streakDays} days</p></GlassSurface>
          <GlassSurface strength={2} className="rounded-2xl p-4"><p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Practice decisions</p><p className="mt-1 font-heading text-2xl font-bold">{snapshot.totalDecisions}</p></GlassSurface>
          <GlassSurface strength={2} className="rounded-2xl p-4"><p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Lessons completed</p><p className="mt-1 font-heading text-2xl font-bold">{lessonsDone}</p></GlassSurface>
        </RevealItem>

        <RevealItem order={3} className="mb-5">
          <GlassSurface strength={4} goldEdge className="rounded-2xl p-4">
            <div className="mb-1 flex items-center gap-2"><Target size={16} className="hw-gold-text" /><p className="text-[10px] uppercase tracking-[0.16em] hw-gold-text">Next best focus</p></div>
            <p className="font-heading text-xl font-bold">{snapshot.recommendedFocus}</p>
            <p className="mt-1 text-xs text-muted-foreground">Built from the same practice decisions and saved review categories already in HoldWise.</p>
            <TactilePressable onClick={() => navigate("/practice/video-poker?drill=5")} className="hw-lux-button mt-4 w-full rounded-xl px-4 py-3 text-sm font-semibold">Start 5-hand focus drill</TactilePressable>
          </GlassSurface>
        </RevealItem>

        <RevealItem order={3}>
          <div className="mb-2 flex items-center gap-2"><TrendingUp size={16} className="hw-gold-text" /><p className="text-[11px] uppercase tracking-[0.16em] hw-gold-text">Premium analytics</p></div>
          <PremiumGate title="Premium statistics" reason="Accuracy by decision category, strongest and weakest skills, pay-table performance, and a recommended weekly focus.">
            <div className="grid gap-3 sm:grid-cols-2">
              {premiumGroups.map((group) => (
                <GlassSurface key={group.label} strength={2} className="rounded-2xl p-4">
                  <div className="mb-2 flex items-center gap-2"><group.icon size={16} className="hw-gold-text" /><p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{group.label}</p></div>
                  <p className="font-heading text-lg font-bold break-words">{group.value}</p>
                </GlassSurface>
              ))}
            </div>
          </PremiumGate>
        </RevealItem>
      </ScreenReveal>
    </div>
  );
}
