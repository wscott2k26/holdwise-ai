import React from "react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/appContext";
import { hapticPulse } from "@/lib/haptics";

// A single playing card. Supports color-blind suit indicators, large-card
// mode, hold state, and accessible labels (never relies on color alone).
export default function PlayingCard({ card, held = false, faceDown = false, onClick = undefined, size = "md", selected = false }) {
  const { accessibility } = useApp();
  const handleClick = () => { hapticPulse(accessibility.haptics, 14); onClick?.(); };
  const large = accessibility.largeCardMode || size === "lg";
  const colorBlind = accessibility.colorBlindSuitIndicators;

  if (faceDown || !card) {
    return (
      <div
        onClick={onClick ? handleClick : undefined}
        className={cn(
          "rounded-xl hw-card-face border border-black/10 flex items-center justify-center select-none",
          large ? "w-20 h-28 sm:w-24 sm:h-36" : "w-16 h-24 sm:w-20 sm:h-28",
          onClick && "cursor-pointer active:scale-95 transition-transform",
          held && "ring-2 ring-[hsl(var(--hw-gold))] ring-offset-2 ring-offset-transparent"
        )}
        style={{
          background:
            "repeating-linear-gradient(45deg, hsl(220 40% 22%) 0 6px, hsl(220 40% 28%) 6px 12px)",
        }}
        aria-label="Face-down card"
      />
    );
  }

  const isRed = card.colorCategory === "red";
  const colorClass = isRed ? "text-[hsl(var(--hw-red))]" : "text-[hsl(var(--hw-black-suit))]";
  const cardW = large ? "w-20 h-28 sm:w-24 sm:h-36" : "w-16 h-24 sm:w-20 sm:h-28";
  const cornerSize = large ? "text-base sm:text-xl" : "text-sm sm:text-lg";
  const centerSize = large ? "text-4xl sm:text-6xl" : "text-3xl sm:text-4xl";

  return (
    <button
      type="button"
      onClick={onClick ? handleClick : undefined}
      className={cn(
        "relative rounded-xl hw-card-face border flex flex-col justify-between p-1.5 select-none transition-all",
        cardW,
        cornerSize,
        onClick && "cursor-pointer active:scale-95",
        held && "hw-held -translate-y-2 ring-2 ring-[hsl(var(--hw-gold))]",
        selected && "ring-2 ring-[hsl(var(--hw-gold))]"
      )}
      aria-label={`${card.label}${held ? ", held" : ""}`}
    >
      <div className={cn("flex flex-col items-start leading-none font-heading font-bold", colorClass)}>
        <span>{card.displaySymbol}</span>
        <span className="text-[0.8em]">{card.suitSymbol}</span>
      </div>
      <div className={cn("absolute inset-0 flex items-center justify-center", colorClass)}>
        <span className={centerSize}>{card.suitSymbol}</span>
      </div>
      <div className={cn("flex flex-col items-end leading-none font-heading font-bold rotate-180", colorClass)}>
        <span>{card.displaySymbol}</span>
        <span className="text-[0.8em]">{card.suitSymbol}</span>
      </div>
      {colorBlind && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] sm:text-[9px] font-bold uppercase tracking-wide text-black/55">
          {card.suit.slice(0, 1)}
        </span>
      )}
      {held && (
        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold hw-gold-text uppercase tracking-widest">
          Hold
        </span>
      )}
    </button>
  );
}