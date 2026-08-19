import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/appContext";
import { hapticPulse, playSoundEffect } from "@/lib/haptics";

// A single playing card. Supports color-blind suit indicators, large-card
// mode, hold state, and accessible labels (never relies on color alone).
export default function PlayingCard({ card, held = false, faceDown = false, onClick = undefined, size = "md", selected = false }) {
  const { accessibility, settings } = useApp();
  const handleClick = () => {
    hapticPulse(accessibility.haptics, 14, "selection");
    playSoundEffect(settings.soundEffects !== false, "selection");
    onClick?.();
  };
  const large = accessibility.largeCardMode || size === "lg";
  const colorBlind = accessibility.colorBlindSuitIndicators;
  const cardW = large ? "w-20 h-28 sm:w-24 sm:h-36" : "w-16 h-24 sm:w-20 sm:h-28";

  if (faceDown || !card) {
    return (
      <motion.div
        onClick={onClick ? handleClick : undefined}
        whileTap={onClick && !accessibility.reducedMotion ? { y: 2, scale: 0.985 } : undefined}
        className={cn(
          "rounded-xl hw-card-back flex items-center justify-center select-none",
          cardW,
          onClick && "cursor-pointer",
          held && "ring-2 ring-[hsl(var(--hw-gold))] ring-offset-2 ring-offset-transparent"
        )}
        aria-label="Face-down card"
      />
    );
  }

  const isRed = card.colorCategory === "red";
  const colorClass = isRed ? "text-[hsl(var(--hw-red))]" : "text-[hsl(var(--hw-black-suit))]";
  const cornerSize = large ? "text-base sm:text-xl" : "text-sm sm:text-lg";
  const centerSize = large ? "text-4xl sm:text-6xl" : "text-3xl sm:text-4xl";

  return (
    <motion.button
      type="button"
      onClick={onClick ? handleClick : undefined}
      whileTap={onClick ? (accessibility.reducedMotion ? { opacity: 0.88 } : { y: 2, scale: 0.985 }) : undefined}
      transition={accessibility.reducedMotion ? { duration: 0.01 } : { type: "spring", stiffness: 520, damping: 34 }}
      className={cn(
        "relative rounded-xl hw-glass-card flex flex-col justify-between p-1.5 select-none",
        cardW,
        cornerSize,
        onClick && "cursor-pointer",
        held && "-translate-y-1 hw-glass-card-held",
        selected && "ring-2 ring-[hsl(var(--hw-victory-gold))] ring-offset-1 ring-offset-[hsl(var(--hw-felt-deep))]"
      )}
      aria-label={`${card.label}${held ? ", held" : ""}`}
      aria-pressed={onClick ? held : undefined}
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
        <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-full bg-[hsl(var(--hw-victory-gold))] px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.14em] text-[hsl(var(--hw-navy))] shadow-sm">
          Hold
        </span>
      )}
    </motion.button>
  );
}
