import React from "react";
import { Flame, TrendingUp, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import GlassSurface from "./GlassSurface";

function clampPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, Math.round(number)));
}

export default function MasteryMeter({
  value,
  label = "Overall mastery",
  interpretation = "",
  streak = null,
  delta = null,
  focus = "",
  compact = false,
}) {
  const percent = clampPercent(value);
  return (
    <GlassSurface strength={compact ? 2 : 3} className={cn("rounded-2xl p-4", compact && "p-3")}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
          <p className={cn("font-heading font-bold", compact ? "text-2xl" : "text-3xl")}>{percent}%</p>
        </div>
        <div className="text-right text-xs text-muted-foreground">{interpretation}</div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10" aria-label={`${label}: ${percent}%`}>
        <div className="h-full rounded-full bg-[hsl(var(--hw-gold))] transition-[width] duration-500" style={{ width: `${percent}%` }} />
      </div>
      {(streak !== null || delta !== null || focus) && (
        <div className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
          {streak !== null && <span className="flex items-center gap-1.5 text-muted-foreground"><Flame size={14} className="hw-gold-text" />{streak} day streak</span>}
          {delta !== null && <span className="flex items-center gap-1.5 text-muted-foreground"><TrendingUp size={14} className="hw-gold-text" />{delta > 0 ? "+" : ""}{delta}% recent</span>}
          {focus && <span className="flex items-center gap-1.5 text-muted-foreground"><Target size={14} className="hw-gold-text" />{focus}</span>}
        </div>
      )}
    </GlassSurface>
  );
}
