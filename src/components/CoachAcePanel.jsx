import React, { useState } from "react";
import { X, Sparkles, Send, Volume2, RotateCw, Gauge, HelpCircle, BookOpen, ChevronDown } from "lucide-react";
import { useApp } from "@/lib/appContext";
import { askCoachAce } from "@/lib/coach";
import Mascot from "@/components/mascot/Mascot";
import { cn } from "@/lib/utils";
import GlassSurface from "@/components/premium/GlassSurface";
import TactilePressable from "@/components/premium/TactilePressable";
import { RevealItem } from "@/components/premium/ScreenReveal";

const QUICK = [
  "Why is that the best hold?",
  "What was wrong with my choice?",
  "What could I draw?",
  "Explain this hand",
  "Say that more simply",
  "Show another example",
  "Quiz me on this rule",
];

const MODES = [
  { id: "simple", label: "Explain Simply", icon: Sparkles },
  { id: "visual", label: "Show Me Visually", icon: BookOpen },
  { id: "math", label: "Explain the Math", icon: Gauge },
  { id: "example", label: "Another Example", icon: HelpCircle },
];

export default function CoachAcePanel({ open = false, onClose = () => {}, context = null }) {
  const { canAskCoach, incrementCoach, remainingCoachQuestions, isPremium } = useApp();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("simple");
  const [factsOpen, setFactsOpen] = useState(false);

  async function send(question, selectedMode) {
    if (!canAskCoach()) {
      setMessages((current) => [
        ...current,
        { role: "coach", text: "You have used your five free Coach Ace questions today. Premium unlocks unlimited coaching. Tap Premium to learn more." },
      ]);
      return;
    }
    setLoading(true);
    const ctx = { ...context, explanationLevel: selectedMode || mode };
    const res = await askCoachAce({ context: ctx, mode: selectedMode || mode, question });
    if (res.ok) incrementCoach();
    setMessages((current) => [...current, { role: "user", text: question }, { role: "coach", text: res.text }]);
    setLoading(false);
  }

  function onSubmit(event) {
    event.preventDefault();
    if (!input.trim()) return;
    send(input.trim());
    setInput("");
  }

  function speak(text) {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <GlassSurface
        strength={5}
        variant="modal"
        goldEdge
        className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-[1.75rem] sm:max-w-lg sm:rounded-[1.75rem]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl hw-glass-3 hw-gold-border">
              <Mascot mascotId="ace" mood={loading ? "thinking" : "idle"} talking={loading} size={42} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] hw-gold-text">Private lesson</p>
              <p className="font-heading text-lg font-bold leading-none">Coach Ace</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{isPremium ? "Premium · unlimited" : `${remainingCoachQuestions} free questions left today`}</p>
            </div>
          </div>
          <TactilePressable onClick={onClose} className="hw-glass-1 rounded-xl p-2 shadow-none" aria-label="Close Coach Ace">
            <X size={20} />
          </TactilePressable>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && (
            <RevealItem order={0} className="space-y-3 text-sm text-muted-foreground">
              <p>Ask me about the cards on screen. I’ll teach from the verified rules and strategy already calculated for this hand.</p>
              {context?.facts?.length > 0 && (
                <GlassSurface strength={2} className="overflow-hidden rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFactsOpen((value) => !value)}
                    className="flex min-h-[44px] w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-xs font-semibold text-foreground"
                    aria-expanded={factsOpen}
                  >
                    <span>What I know about this hand</span>
                    <ChevronDown size={16} className={cn("transition-transform", factsOpen && "rotate-180")} />
                  </button>
                  {factsOpen && (
                    <div className="space-y-1 border-t border-white/10 px-3 py-3 text-[12px] text-muted-foreground">
                      {context.facts.map((fact, index) => <p key={index}>• {fact}</p>)}
                    </div>
                  )}
                </GlassSurface>
              )}
            </RevealItem>
          )}

          {messages.map((message, index) => (
            <div key={index} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
              {message.role === "user" ? (
                <div className="max-w-[85%] rounded-2xl rounded-br-sm px-3.5 py-2.5 text-sm hw-chip-gold">
                  <p className="whitespace-pre-wrap">{message.text}</p>
                </div>
              ) : (
                <GlassSurface strength={2} className="max-w-[92%] rounded-2xl rounded-bl-sm p-3.5 text-sm">
                  <RevealItem order={0}>
                    <p className="mb-1 text-[10px] uppercase tracking-[0.16em] hw-gold-text">The answer</p>
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  </RevealItem>
                  <RevealItem order={1} className="mt-3 border-t border-white/10 pt-3">
                    <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Go deeper</p>
                    <div className="flex flex-wrap gap-2 text-muted-foreground">
                      <button onClick={() => speak(message.text)} className="flex min-h-[44px] items-center gap-1.5 rounded-xl px-2.5 text-[11px] hover:hw-gold-text" aria-label="Read aloud"><Volume2 size={14} /> Read</button>
                      <button onClick={() => send("Repeat that explanation.", "simple")} className="flex min-h-[44px] items-center gap-1.5 rounded-xl px-2.5 text-[11px] hover:hw-gold-text"><RotateCw size={14} /> Repeat</button>
                      <button onClick={() => send("Slow down and say that more simply.", "simple")} className="flex min-h-[44px] items-center gap-1.5 rounded-xl px-2.5 text-[11px] hover:hw-gold-text"><Gauge size={14} /> Slow down</button>
                    </div>
                  </RevealItem>
                </GlassSurface>
              )}
            </div>
          ))}

          {loading && (
            <GlassSurface strength={1} className="inline-flex min-h-[44px] items-center gap-2 rounded-xl px-3 text-sm text-muted-foreground" aria-live="polite">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[hsl(var(--hw-gold))]" /> Coach Ace is thinking…
            </GlassSurface>
          )}
        </div>

        <div className="space-y-2 border-t border-white/10 p-3 hw-safe-bottom">
          <div className="flex snap-x gap-2 overflow-x-auto pb-1">
            {MODES.map((item) => (
              <TactilePressable
                key={item.id}
                onClick={() => setMode(item.id)}
                className={cn("shrink-0 snap-start rounded-full border px-3 py-1.5 text-[11px] shadow-none", mode === item.id ? "hw-glass-4 hw-gold-border hw-gold-text" : "hw-glass-1 border-border/60 text-muted-foreground")}
                aria-pressed={mode === item.id}
              >
                <span className="flex items-center gap-1.5"><item.icon size={13} /> {item.label}</span>
              </TactilePressable>
            ))}
          </div>
          <div className="flex snap-x gap-2 overflow-x-auto pb-1">
            {QUICK.map((question) => (
              <TactilePressable key={question} onClick={() => send(question)} className="shrink-0 snap-start rounded-full bg-secondary/65 px-3 py-1.5 text-[11px] text-secondary-foreground shadow-none">
                {question}
              </TactilePressable>
            ))}
          </div>
          <form onSubmit={onSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask Coach Ace…"
              className="min-h-[44px] min-w-0 flex-1 rounded-xl border border-border/60 bg-input/60 px-3.5 py-2.5 text-sm outline-none focus:hw-gold-border"
            />
            <TactilePressable type="submit" disabled={loading} hapticType="selection" className="hw-chip-gold rounded-xl px-4 py-2.5" aria-label="Send">
              <Send size={18} />
            </TactilePressable>
          </form>
        </div>
      </GlassSurface>
    </div>
  );
}
