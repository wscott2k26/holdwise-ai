import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/appContext";
import { hapticPulse, playSoundEffect } from "@/lib/haptics";

export default function TactilePressable({
  children,
  onClick = null,
  hapticType = "selection",
  hapticPattern = 14,
  soundType = null,
  disabled = false,
  className = "",
  type = "button",
  ...props
}) {
  const { accessibility, settings } = useApp();
  const reduced = accessibility.reducedMotion;

  function handleClick(event) {
    if (disabled) return;
    hapticPulse(accessibility.haptics, hapticPattern, hapticType);
    playSoundEffect(settings.soundEffects !== false, soundType || hapticType);
    onClick?.(event);
  }

  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileTap={reduced ? { opacity: 0.86 } : { y: 3, scale: 0.985 }}
      transition={reduced ? { duration: 0.01 } : { type: "spring", stiffness: 520, damping: 32 }}
      onClick={handleClick}
      className={cn(
        "min-h-[44px] min-w-[44px] hw-tactile-depth disabled:opacity-45 disabled:pointer-events-none",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
