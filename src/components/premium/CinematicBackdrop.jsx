import React from "react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/appContext";

const FLOATING_CARDS = [
  { id: "ace-spades", rank: "A", suit: "♠", tone: "ink" },
  { id: "queen-hearts", rank: "Q", suit: "♥", tone: "coral" },
  { id: "king-clubs", rank: "K", suit: "♣", tone: "ink" },
  { id: "ten-diamonds", rank: "10", suit: "♦", tone: "coral" },
  { id: "seven-spades", rank: "7", suit: "♠", tone: "royal" },
  { id: "joker-star", rank: "★", suit: "✦", tone: "royal" },
];

export default function CinematicBackdrop({ children, intensity = "normal", className = "" }) {
  const { accessibility } = useApp();
  return (
    <div className={cn("relative min-h-screen overflow-x-hidden hw-felt-bg", className)} data-intensity={intensity}>
      <div
        aria-hidden="true"
        className={cn("pointer-events-none fixed inset-0 hw-cinematic-breathe", accessibility.reducedMotion && "!animate-none")}
      />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 hw-cinematic-suits" />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 hw-card-room-scene">
        {FLOATING_CARDS.map((card, index) => (
          <span
            key={card.id}
            data-card={card.id}
            className={cn(
              "hw-floating-card",
              `hw-floating-card-${index + 1}`,
              `hw-floating-card-${card.tone}`,
              accessibility.reducedMotion && "!animate-none"
            )}
          >
            <span className="hw-floating-rank">{card.rank}</span>
            <span className="hw-floating-suit">{card.suit}</span>
          </span>
        ))}
      </div>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 hw-cinematic-vignette" />
      <div className="relative z-10 min-h-screen">{children}</div>
    </div>
  );
}
