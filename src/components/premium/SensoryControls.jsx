import React from "react";
import { Volume2, VolumeX, Vibrate } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/appContext";
import TactilePressable from "@/components/premium/TactilePressable";

export default function SensoryControls({ className = "" }) {
  const { accessibility, setAccessibility, settings, setSettings } = useApp();
  const soundEnabled = settings.soundEffects !== false;
  const hapticsEnabled = accessibility.haptics !== false;
  const soundLabel = soundEnabled ? "Turn sound effects off" : "Turn sound effects on";
  const hapticsLabel = hapticsEnabled ? "Turn haptics off" : "Turn haptics on";
  const SoundIcon = soundEnabled ? Volume2 : VolumeX;

  return (
    <div className={cn("hw-sensory-controls flex items-center gap-1 rounded-2xl p-1", className)} aria-label="Sound and haptic settings">
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
    </div>
  );
}
