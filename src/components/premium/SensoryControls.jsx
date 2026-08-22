import React from "react";
import { AudioLines, Images, Volume2, VolumeX, Vibrate } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/appContext";
import TactilePressable from "@/components/premium/TactilePressable";

const NEXT_AMBIENCE = { off: "low", low: "high", high: "off" };

export default function SensoryControls({ className = "" }) {
  const { accessibility, setAccessibility, settings, setSettings } = useApp();
  const soundEnabled = settings.soundEffects !== false;
  const hapticsEnabled = accessibility.haptics !== false;
  const ambience = settings.casinoAmbience || "off";
  const backgroundsEnabled = settings.rotatingBackgrounds !== false;
  const soundLabel = soundEnabled ? "Turn sound effects off" : "Turn sound effects on";
  const hapticsLabel = hapticsEnabled ? "Turn haptics off" : "Turn haptics on";
  const ambienceLabel = `Casino ambience: ${ambience}. Tap for ${NEXT_AMBIENCE[ambience] || "low"}.`;
  const backgroundLabel = backgroundsEnabled ? "Pause rotating casino backgrounds" : "Resume rotating casino backgrounds";
  const SoundIcon = soundEnabled ? Volume2 : VolumeX;

  return (
    <div className={cn("hw-sensory-controls flex items-center gap-1 rounded-2xl p-1", className)} aria-label="Sound, haptic and atmosphere settings">
      <TactilePressable
        onClick={() => setSettings((current) => ({ ...current, soundEffects: !soundEnabled }))}
        className={cn("rounded-xl p-2 shadow-none", soundEnabled ? "hw-sensory-active" : "hw-sensory-muted")}
        aria-label={soundLabel}
        aria-pressed={soundEnabled}
        title={soundLabel}
      >
        <SoundIcon size={17} />
      </TactilePressable>
      <TactilePressable
        onClick={() => setAccessibility((current) => ({ ...current, haptics: !hapticsEnabled }))}
        className={cn("rounded-xl p-2 shadow-none", hapticsEnabled ? "hw-sensory-active" : "hw-sensory-muted")}
        aria-label={hapticsLabel}
        aria-pressed={hapticsEnabled}
        title={hapticsLabel}
      >
        <Vibrate size={17} />
      </TactilePressable>
      <TactilePressable
        onClick={() => setSettings((current) => ({ ...current, casinoAmbience: NEXT_AMBIENCE[ambience] || "low" }))}
        className={cn("rounded-xl p-2 shadow-none", ambience !== "off" ? "hw-sensory-active" : "hw-sensory-muted")}
        aria-label={ambienceLabel}
        aria-pressed={ambience !== "off"}
        title={ambienceLabel}
      >
        <AudioLines size={17} />
        <span className="sr-only">Casino ambience {ambience}</span>
      </TactilePressable>
      <TactilePressable
        onClick={() => setSettings((current) => ({ ...current, rotatingBackgrounds: !backgroundsEnabled }))}
        className={cn("rounded-xl p-2 shadow-none", backgroundsEnabled ? "hw-sensory-active" : "hw-sensory-muted")}
        aria-label={backgroundLabel}
        aria-pressed={backgroundsEnabled}
        title={backgroundLabel}
      >
        <Images size={17} />
      </TactilePressable>
    </div>
  );
}
