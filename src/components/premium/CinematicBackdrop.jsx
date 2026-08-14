import React from "react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/appContext";

export default function CinematicBackdrop({ children, intensity = "normal", className = "" }) {
  const { accessibility } = useApp();
  return (
    <div className={cn("relative min-h-screen overflow-x-hidden hw-felt-bg", className)} data-intensity={intensity}>
      <div
        aria-hidden="true"
        className={cn("pointer-events-none fixed inset-0 hw-cinematic-breathe", accessibility.reducedMotion && "!animate-none")}
      />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 hw-cinematic-suits" />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 hw-cinematic-vignette" />
      <div className="relative z-10 min-h-screen">{children}</div>
    </div>
  );
}
