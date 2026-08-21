import React, { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { getMascot } from "@/lib/mascots";
import { useApp } from "@/lib/appContext";
import { cn } from "@/lib/utils";

function rankFor(mascot) {
  if (mascot.id === "ace") return "A";
  if (mascot.id === "jax") return "J";
  if (mascot.id === "vee") return "Q";
  if (mascot.id === "king") return "K";
  if (mascot.id === "deuce") return "2";
  if (mascot.id === "trickster") return "10";
  if (mascot.id === "ginny") return "G";
  if (mascot.id === "sol") return "S";
  if (mascot.id === "chip") return "★";
  return mascot.suitSymbol;
}

export default function Mascot({ mascotId = "ace", mood = "idle", size = 96, talking = false, draggable = false, onTap = undefined, className = "" }) {
  const { accessibility } = useApp();
  const reduce = useReducedMotion() || accessibility.reducedMotion;
  const mascot = getMascot(mascotId);
  const [blink, setBlink] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => setImageFailed(false), [mascotId]);
  useEffect(() => {
    if (reduce) return undefined;
    let alive = true;
    let timeout;
    const schedule = () => {
      timeout = window.setTimeout(() => {
        if (!alive) return;
        setBlink(true);
        window.setTimeout(() => alive && setBlink(false), 130);
        schedule();
      }, 2200 + Math.random() * 3200);
    };
    schedule();
    return () => { alive = false; window.clearTimeout(timeout); };
  }, [reduce]);

  const active = talking ? "talk" : mood;
  const motionSpec = useMemo(() => {
    if (reduce) return { animate: { scale: 1, rotate: 0, y: 0 }, transition: { duration: 0 } };
    const map = {
      idle: { animate: { y: [0, -4, 0], rotate: [0, -1.5, 0, 1.5, 0] }, transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" } },
      happy: { animate: { y: [0, -12, 0], rotate: [0, -5, 5, 0], scale: [1, 1.08, 1] }, transition: { duration: 0.75, repeat: Infinity, repeatDelay: 0.5 } },
      celebrate: { animate: { y: [0, -18, 0, -10, 0], rotate: [0, -9, 9, -5, 0], scale: [1, 1.12, 1.03, 1.1, 1] }, transition: { duration: 1.15, repeat: Infinity, repeatDelay: 0.35 } },
      sad: { animate: { y: [0, 5, 5], rotate: [0, -3, -3], scale: [1, 0.96, 0.96] }, transition: { duration: 1.4, repeat: Infinity, repeatDelay: 0.7 } },
      thinking: { animate: { rotate: [0, 4, -2, 4, 0], y: [0, -2, 0] }, transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" } },
      talk: { animate: { y: [0, -2, 0], scaleX: [1, 1.025, 0.99, 1.02, 1], scaleY: [1, 0.98, 1.025, 0.99, 1] }, transition: { duration: 0.48, repeat: Infinity } },
    };
    return map[active] || map.idle;
  }, [active, reduce]);

  if (!mascot) return null;
  const useArtwork = Boolean(mascot.image) && !imageFailed;
  const eyeY = size * 0.42;
  const eyeGap = size * 0.115;

  return (
    <motion.div
      className={cn("relative select-none", draggable && "cursor-grab active:cursor-grabbing", className)}
      style={{ width: size, height: size }}
      drag={draggable}
      dragMomentum={false}
      dragElastic={0.16}
      dragConstraints={{ left: -70, right: 70, top: -70, bottom: 70 }}
      whileTap={{ scale: 0.93 }}
      onClick={onTap}
      role={onTap ? "button" : undefined}
      aria-label={`${mascot.name}, ${mascot.role}`}
    >
      {active === "celebrate" && !reduce && ["♠", "♥", "♦", "♣", "★"].map((symbol, i) => (
        <motion.span key={symbol} className="absolute z-20 hw-gold-text pointer-events-none" style={{ left: `${8 + i * 20}%`, top: "12%", fontSize: Math.max(10, size * 0.12) }} animate={{ y: [0, -size * 0.42, 0], opacity: [0, 1, 0], rotate: [0, 220] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.11 }}>{symbol}</motion.span>
      ))}

      <motion.div className="relative w-full h-full" animate={motionSpec.animate} transition={motionSpec.transition} style={{ originY: 0.86 }}>
        {useArtwork ? (
          <img src={mascot.image} onError={() => setImageFailed(true)} alt="" draggable={false} className="w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.42)]" />
        ) : (
          <div className="absolute inset-[8%] rounded-[18%] border-2 hw-gold-border bg-[linear-gradient(145deg,hsl(var(--card)),hsl(var(--secondary)))] shadow-lg overflow-hidden">
            <div className="absolute inset-1 rounded-[15%] border border-black/10" />
            <span className="absolute left-[10%] top-[6%] font-heading font-bold hw-gold-text" style={{ fontSize: size * 0.21 }}>{rankFor(mascot)}</span>
            <span className="absolute left-[11%] top-[25%] hw-gold-text" style={{ fontSize: size * 0.18 }}>{mascot.suitSymbol}</span>
            <span className="absolute right-[10%] bottom-[6%] rotate-180 font-heading font-bold hw-gold-text" style={{ fontSize: size * 0.21 }}>{rankFor(mascot)}</span>
            <span className="absolute right-[11%] bottom-[25%] rotate-180 hw-gold-text" style={{ fontSize: size * 0.18 }}>{mascot.suitSymbol}</span>
            <div className="absolute left-1/2 -translate-x-1/2 top-[37%] flex gap-2">
              {[0,1].map((eye) => <motion.span key={eye} className="block rounded-full bg-foreground" style={{ width: size * 0.065, height: blink ? 2 : size * 0.075 }} animate={blink ? { scaleY: 0.1 } : { scaleY: 1 }} />)}
            </div>
            <motion.div className="absolute left-1/2 -translate-x-1/2 top-[55%] border-b-2 border-foreground rounded-b-full" style={{ width: size * 0.2, height: talking ? size * 0.12 : size * 0.07 }} animate={talking && !reduce ? { scaleY: [0.6, 1.25, 0.7, 1] } : { scaleY: 1 }} transition={{ duration: 0.34, repeat: talking ? Infinity : 0 }} />
          </div>
        )}

        {!useArtwork && (
          <>
            <motion.div className="absolute left-0 top-[49%] h-[5%] w-[24%] rounded-full bg-foreground/80 origin-right" animate={!reduce && (active === "happy" || active === "celebrate") ? { rotate: [20, -35, 20] } : { rotate: 12 }} transition={{ duration: 0.75, repeat: Infinity }} />
            <motion.div className="absolute right-0 top-[49%] h-[5%] w-[24%] rounded-full bg-foreground/80 origin-left" animate={!reduce && active === "talk" ? { rotate: [-12, 24, -12] } : { rotate: -12 }} transition={{ duration: 0.55, repeat: Infinity }} />
            <div className="absolute left-[28%] bottom-[1%] h-[15%] w-[6%] rounded-full bg-foreground/80" />
            <div className="absolute right-[28%] bottom-[1%] h-[15%] w-[6%] rounded-full bg-foreground/80" />
          </>
        )}

        {useArtwork && blink && <div className="absolute rounded-full bg-white/20 pointer-events-none" style={{ left: size/2-eyeGap*1.7, top: eyeY, width: eyeGap*3.4, height: 3 }} />}
        {active === "thinking" && !reduce && <motion.div className="absolute right-[2%] top-[2%] hw-glass border hw-gold-border rounded-full px-2 py-1 font-bold hw-gold-text" animate={{ y: [0,-5,0], scale: [0.92,1,0.92] }} transition={{ duration: 1.2, repeat: Infinity }}>?</motion.div>}
      </motion.div>
    </motion.div>
  );
}
