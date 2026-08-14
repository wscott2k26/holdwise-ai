import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Volume2, Type, HelpCircle, Check } from "lucide-react";
import { useApp } from "@/lib/appContext";
import Mascot from "@/components/mascot/Mascot";
import CinematicBackdrop from "@/components/premium/CinematicBackdrop";
import GlassSurface from "@/components/premium/GlassSurface";
import TactilePressable from "@/components/premium/TactilePressable";
import ScreenReveal, { RevealItem } from "@/components/premium/ScreenReveal";

const GOALS = [
  { id: "new-to-cards", label: "I am completely new to cards" },
  { id: "knows-cards", label: "I know cards but not poker" },
  { id: "knows-poker", label: "I know poker but not video poker" },
  { id: "improve-vp", label: "I want to improve my video-poker decisions" },
  { id: "other-games", label: "I want to learn other card games" },
];

const STYLES = [
  { id: "simple", label: "Simple explanations" },
  { id: "visual", label: "Visual demonstrations" },
  { id: "practice", label: "Step-by-step practice" },
  { id: "math", label: "Math and probability" },
  { id: "mixture", label: "A mixture of everything" },
];

const VOICE = [
  { id: "enabled", label: "Coach Ace voice enabled", icon: Volume2 },
  { id: "text-only", label: "Text only", icon: Type },
  { id: "ask-later", label: "Ask me later", icon: HelpCircle },
];

const SCENE_LABELS = ["Your goal", "Learning style", "Coach voice"];

export default function Onboarding() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const action = params.get("action") || "start";
  const { setProfile, setSettings } = useApp();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState(null);
  const [style, setStyle] = useState(null);
  const [voice, setVoice] = useState(null);

  const isGuest = action === "guest";

  function finish() {
    setProfile((p) => ({
      ...p,
      ageConfirmed: true,
      skillLevel: goal || p.skillLevel,
      learningStyle: style || p.learningStyle,
      onboardingComplete: true,
      displayName: isGuest ? "Guest" : p.displayName,
    }));
    if (voice) setSettings((s) => ({ ...s, voiceEnabled: voice }));
    navigate("/assessment");
  }

  const steps = [
    { title: "What's your learning goal?", options: GOALS, value: goal, set: setGoal },
    { title: "How do you like to learn?", options: STYLES, value: style, set: setStyle },
    { title: "Voice preference", options: VOICE, value: voice, set: setVoice },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <CinematicBackdrop intensity="onboarding" className="text-scale-root">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-8 sm:px-6">
        <ScreenReveal>
          <RevealItem order={0} className="mb-5 flex items-center gap-3">
            <GlassSurface strength={3} goldEdge className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl">
              <Mascot mascotId="ace" mood="idle" size={42} />
            </GlassSurface>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] hw-gold-text">Private Card Academy</p>
              <p className="text-sm text-muted-foreground">Coach Ace is setting up your learning table.</p>
            </div>
          </RevealItem>

          <RevealItem order={1}>
            <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Scene {step + 1} of 3</span>
              <span>{SCENE_LABELS[step]}</span>
            </div>
            <div className="mb-6 flex gap-1.5" aria-label={`Onboarding step ${step + 1} of 3`}>
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${index <= step ? "bg-[hsl(var(--hw-gold))]" : "bg-white/10"}`}
                />
              ))}
            </div>
          </RevealItem>

          <RevealItem order={2}>
            <h1 className="font-heading text-3xl font-bold sm:text-4xl">{current.title}</h1>
            <p className="mb-6 mt-2 text-sm text-muted-foreground">Pick one. You can change it later in Settings.</p>
          </RevealItem>

          <div className="space-y-2.5">
            {current.options.map((option, index) => {
              const Icon = option.icon;
              const active = current.value === option.id;
              return (
                <RevealItem key={option.id} order={Math.min(3 + index, 6)}>
                  <TactilePressable
                    onClick={() => current.set(option.id)}
                    className="w-full rounded-2xl bg-transparent p-0 text-left shadow-none"
                    aria-pressed={active}
                  >
                    <GlassSurface
                      strength={active ? 4 : 2}
                      variant={active ? "selected" : "interactive"}
                      goldEdge={active}
                      className="flex min-h-[58px] w-full items-center gap-3 rounded-2xl px-4 py-3.5"
                    >
                      {Icon ? <Icon size={19} className={active ? "hw-gold-text" : "text-muted-foreground"} /> : <span className="h-2.5 w-2.5 rounded-full border border-[hsl(var(--hw-gold)/.45)]" />}
                      <span className={`flex-1 text-sm font-medium ${active ? "text-foreground" : "text-foreground/90"}`}>{option.label}</span>
                      {active && <Check size={18} className="hw-gold-text" />}
                    </GlassSurface>
                  </TactilePressable>
                </RevealItem>
              );
            })}
          </div>

          <RevealItem order={3} className="mt-8">
            <TactilePressable
              onClick={() => (isLast ? finish() : setStep((value) => value + 1))}
              disabled={!current.value}
              hapticType={isLast ? "success" : "selection"}
              className="hw-chip-gold w-full rounded-2xl px-5 py-3.5 font-semibold"
            >
              <span className="flex items-center justify-center gap-2">
                {isLast ? "Academy ready — quick check" : "Continue"} <ArrowRight size={18} />
              </span>
            </TactilePressable>
            <button onClick={finish} className="mt-3 min-h-[44px] w-full rounded-xl px-3 text-sm text-muted-foreground transition-colors hover:hw-gold-text">
              Skip for now
            </button>
          </RevealItem>
        </ScreenReveal>
      </div>
    </CinematicBackdrop>
  );
}
