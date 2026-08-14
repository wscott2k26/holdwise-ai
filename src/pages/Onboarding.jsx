import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Volume2, Type, HelpCircle } from "lucide-react";
import { useApp } from "@/lib/appContext";

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

  return (
    <div className="min-h-screen hw-felt-bg flex flex-col text-scale-root">
      <div className="flex-1 flex flex-col justify-center px-6 max-w-md mx-auto w-full">
        <div className="flex gap-1.5 mb-6">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "hw-gold-text bg-[hsl(var(--hw-gold))]" : "bg-white/10"}`} />
          ))}
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold">{current.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground mb-6">Pick one — you can change this later in Settings.</p>
        <div className="space-y-2.5">
          {current.options.map((o) => {
            const Icon = o.icon;
            const active = current.value === o.id;
            return (
              <button
                key={o.id}
                onClick={() => current.set(o.id)}
                className={`w-full text-left rounded-xl border px-4 py-3.5 flex items-center gap-3 transition-colors ${
                  active ? "hw-gold-border hw-gold-text bg-white/5" : "border-border/60 hover:bg-white/5"
                }`}
              >
                {Icon && <Icon size={18} />}
                <span className="text-sm font-medium">{o.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => (step < steps.length - 1 ? setStep(step + 1) : finish())}
          disabled={!current.value}
          className="mt-8 w-full hw-chip-gold rounded-xl py-3.5 font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {step < steps.length - 1 ? "Continue" : "Continue to quick check"} <ArrowRight size={18} />
        </button>
        <button onClick={finish} className="mt-2 w-full text-sm text-muted-foreground hover:hw-gold-text py-2">
          Skip for now
        </button>
      </div>
    </div>
  );
}