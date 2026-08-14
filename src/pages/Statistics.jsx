import React, { useMemo } from "react";
import { BarChart3, TrendingUp } from "lucide-react";
import { completionCount } from "@/lib/progress";
import { useApp } from "@/lib/appContext";
import PremiumGate from "@/components/PremiumGate";
import { loadPracticeStats } from "@/lib/practiceStats";
import { getPayTable } from "@/lib/cards/payTables";

function percent(correct, total) {
  return total ? `${Math.round((correct / total) * 100)}%` : "0%";
}

function titleCase(value) {
  return String(value || "No data").replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function Statistics() {
  const { profile } = useApp();
  const lessonsDone = completionCount();
  const practice = useMemo(() => loadPracticeStats(), []);
  const mistakes = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("holdwise_mistakes_v1") || "[]"); } catch { return []; }
  }, []);

  const categoryRows = Object.entries(practice.byCategory).map(([category, data]) => ({ category, ...data, accuracy: data.total ? data.correct / data.total : 0 }));
  const experiencedRows = categoryRows.filter((row) => row.total >= 2);
  const strongest = [...experiencedRows].sort((a, b) => b.accuracy - a.accuracy || b.total - a.total)[0];
  const weakest = [...experiencedRows].sort((a, b) => a.accuracy - b.accuracy || b.total - a.total)[0];
  const mistakeCounts = mistakes.reduce((map, mistake) => ({ ...map, [mistake.category]: (map[mistake.category] || 0) + 1 }), {});
  const commonMistake = Object.entries(mistakeCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const bestTable = Object.entries(practice.byPayTable)
    .map(([id, data]) => ({ id, ...data, accuracy: data.total ? data.correct / data.total : 0 }))
    .sort((a, b) => b.total - a.total)[0];
  const recent = practice.recent.slice(0, 20);
  const recentAccuracy = recent.length ? percent(recent.filter((item) => item.correct).length, recent.length) : "0%";
  const recommendedFocus = weakest ? titleCase(weakest.category) : commonMistake ? titleCase(commonMistake) : "Complete more practice hands";

  const freeStats = [
    { label: "Lessons completed", value: lessonsDone },
    { label: "Current streak", value: `${profile.streak} days` },
    { label: "Practice hands", value: practice.total },
    { label: "Decision accuracy", value: percent(practice.correct, practice.total) },
    { label: "Overall mastery", value: `${Math.min(lessonsDone * 2 + Math.round((practice.correct / Math.max(1, practice.total)) * 20), 100)}%` },
  ];

  const premiumStats = [
    { label: "Recent accuracy", value: recentAccuracy },
    { label: "Most common mistake", value: titleCase(commonMistake) },
    { label: "Strongest skill", value: strongest ? `${titleCase(strongest.category)} · ${percent(strongest.correct, strongest.total)}` : "More practice needed" },
    { label: "Weakest skill", value: weakest ? `${titleCase(weakest.category)} · ${percent(weakest.correct, weakest.total)}` : "More practice needed" },
    { label: "Most-used pay table", value: bestTable ? `${getPayTable(bestTable.id).version} · ${percent(bestTable.correct, bestTable.total)}` : "No hands yet" },
    { label: "Recommended focus", value: recommendedFocus },
  ];

  return (
    <div className="px-5 pt-8 pb-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-1"><BarChart3 size={20} className="hw-gold-text" /><h1 className="font-heading text-2xl sm:text-3xl font-bold">Statistics</h1></div>
      <p className="text-sm text-muted-foreground mb-5">Educational progress only — never money won or lost.</p>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {freeStats.map((stat) => (
          <div key={stat.label} className="hw-glass rounded-2xl border border-border/60 p-4"><p className="text-[11px] text-muted-foreground uppercase tracking-wide">{stat.label}</p><p className="font-heading text-2xl font-bold mt-1">{stat.value}</p></div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-2"><TrendingUp size={16} className="hw-gold-text" /><p className="text-[11px] hw-gold-text tracking-widest uppercase">Premium analytics</p></div>
      <PremiumGate title="Premium statistics" reason="Accuracy by decision category, strongest and weakest skills, pay-table performance, and a recommended weekly focus.">
        <div className="grid grid-cols-2 gap-3">
          {premiumStats.map((stat) => (
            <div key={stat.label} className="hw-glass rounded-2xl border border-border/60 p-4"><p className="text-[11px] text-muted-foreground uppercase tracking-wide">{stat.label}</p><p className="font-heading text-base font-bold mt-1 break-words">{stat.value}</p></div>
          ))}
        </div>
      </PremiumGate>
    </div>
  );
}
