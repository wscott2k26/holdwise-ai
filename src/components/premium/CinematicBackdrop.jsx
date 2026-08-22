import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/appContext";
import { setCasinoAmbience, stopCasinoAmbience } from "@/lib/casinoAmbience";

// Free-to-use Unsplash photographs. Each URL has a gradient fallback in CSS so
// the installed app remains readable even when a remote image cannot load.
const CASINO_SCENES = [
  {
    id: "emerald-table",
    label: "Emerald table",
    image: "https://images.unsplash.com/photo-1774660980287-420ea5b70d4f?auto=format&fit=crop&q=78&w=1800",
  },
  {
    id: "poker-night",
    label: "Poker night",
    image: "https://images.unsplash.com/photo-1780091891244-8e6d48ce53a4?auto=format&fit=crop&q=78&w=1800",
  },
  {
    id: "cards-closeup",
    label: "Cards and chips",
    image: "https://images.unsplash.com/photo-1674707173845-0402bc18e174?auto=format&fit=crop&q=78&w=1800",
  },
  {
    id: "casino-table",
    label: "Casino table",
    image: "https://images.unsplash.com/photo-1714865212999-a9817814b080?auto=format&fit=crop&q=78&w=1800",
  },
  {
    id: "chip-play",
    label: "Chip play",
    image: "https://images.unsplash.com/photo-1768839723101-b55bdb4e3ced?auto=format&fit=crop&q=78&w=1800",
  },
];

export default function CinematicBackdrop({ children, intensity = "normal", className = "" }) {
  const { accessibility, settings } = useApp();
  const [sceneIndex, setSceneIndex] = useState(0);
  const rotatingBackgrounds = settings.rotatingBackgrounds !== false;
  const backgroundMotion = settings.backgroundMotion !== false && !accessibility.reducedMotion;

  useEffect(() => {
    setCasinoAmbience(settings.casinoAmbience || "off");
    return () => stopCasinoAmbience();
  }, [settings.casinoAmbience]);

  useEffect(() => {
    if (!rotatingBackgrounds || accessibility.reducedMotion) return undefined;
    const timer = window.setInterval(() => setSceneIndex((current) => (current + 1) % CASINO_SCENES.length), 12000);
    return () => window.clearInterval(timer);
  }, [rotatingBackgrounds, accessibility.reducedMotion]);

  const visibleScenes = useMemo(
    () => CASINO_SCENES.map((scene, index) => ({ ...scene, active: rotatingBackgrounds ? index === sceneIndex : index === 0 })),
    [sceneIndex, rotatingBackgrounds]
  );

  return (
    <div className={cn("relative min-h-screen overflow-x-hidden hw-felt-bg hw-photo-stage", className)} data-intensity={intensity}>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 hw-photo-stack">
        {visibleScenes.map((scene) => (
          <div
            key={scene.id}
            className={cn("hw-photo-scene", scene.active && "hw-photo-scene-active", backgroundMotion && "hw-photo-scene-motion")}
            style={{ backgroundImage: `url(${scene.image})` }}
            data-scene={scene.id}
            data-label={scene.label}
          />
        ))}
        <div className="hw-photo-wash" />
        <div className="hw-photo-glow hw-photo-glow-left" />
        <div className="hw-photo-glow hw-photo-glow-right" />
      </div>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 hw-cinematic-suits" />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 hw-cinematic-vignette" />
      <div className="relative z-10 min-h-screen">{children}</div>
    </div>
  );
}
