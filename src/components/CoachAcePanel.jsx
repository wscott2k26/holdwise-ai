import React, { useState } from "react";
import { X, Sparkles, Send, Volume2, RotateCw, Gauge, HelpCircle, BookOpen } from "lucide-react";
import { useApp } from "@/lib/appContext";
import { askCoachAce, buildTutorContext } from "@/lib/coach";
import Mascot from "@/components/mascot/Mascot";
import { cn } from "@/lib/utils";

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

  async function send(question, selectedMode) {
    if (!canAskCoach()) {
      setMessages((m) => [
        ...m,
        {
          role: "coach",
          text: "You have used your five free Coach Ace questions today. Premium unlocks unlimited coaching. Tap Premium to learn more.",
        },
      ]);
      return;
    }
    setLoading(true);
    const ctx = { ...context, explanationLevel: selectedMode || mode };
    const res = await askCoachAce({ context: ctx, mode: selectedMode || mode, question });
    if (res.ok) incrementCoach();
    setMessages((m) => [...m, { role: "user", text: question }, { role: "coach", text: res.text }]);
    setLoading(false);
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;
    send(input.trim());
    setInput("");
  }

  function speak(text) {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full sm:max-w-lg max-h-[88vh] hw-glass rounded-t-2xl sm:rounded-2xl border hw-gold-border flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Mascot mascotId="ace" mood={loading ? "thinking" : "idle"} talking={loading} size={40} />
            <div>
              <p className="font-heading font-bold leading-none">Coach Ace</p>
              <p className="text-[11px] text-muted-foreground">{isPremium ? "Premium · unlimited" : `${remainingCoachQuestions} free questions left today`}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5" aria-label="Close Coach Ace">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[160px]">
          {messages.length === 0 && (
            <div className="text-sm text-muted-foreground hw-fade-up">
              <p className="mb-2">Hi, I'm Coach Ace. Ask me anything about the cards on screen — I'll explain using only the verified rules and strategy.</p>
              {context?.facts && (
                <div className="rounded-lg bg-black/20 border border-border/50 p-3 text-[12px] space-y-1">
                  <p className="font-semibold hw-gold-text mb-1">Verified facts I can use:</p>
                  {context.facts.map((f, i) => (
                    <p key={i}>• {f}</p>
                  ))}
                </div>
              )}
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm hw-fade-up",
                  m.role === "user" ? "hw-chip-gold rounded-br-sm" : "bg-secondary/70 rounded-bl-sm"
                )}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
                {m.role === "coach" && (
                  <div className="flex gap-3 mt-2 text-muted-foreground">
                    <button onClick={() => speak(m.text)} className="flex items-center gap-1 text-[11px] hover:hw-gold-text" aria-label="Read aloud">
                      <Volume2 size={13} /> Read
                    </button>
                    <button onClick={() => send("Repeat that explanation.", "simple")} className="flex items-center gap-1 text-[11px] hover:hw-gold-text">
                      <RotateCw size={13} /> Repeat
                    </button>
                    <button onClick={() => send("Slow down and say that more simply.", "simple")} className="flex items-center gap-1 text-[11px] hover:hw-gold-text">
                      <Gauge size={13} /> Slow down
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="w-2 h-2 rounded-full hw-gold-text animate-pulse" /> Coach Ace is thinking…
            </div>
          )}
        </div>

        <div className="border-t border-border/60 p-3 space-y-2">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {MODES.map((mo) => (
              <button
                key={mo.id}
                onClick={() => setMode(mo.id)}
                className={cn(
                  "shrink-0 flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-full border transition-colors",
                  mode === mo.id ? "hw-gold-border hw-gold-text bg-white/5" : "border-border/60 text-muted-foreground"
                )}
              >
                <mo.icon size={12} /> {mo.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {QUICK.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="shrink-0 text-[11px] px-2.5 py-1.5 rounded-full bg-secondary/60 text-secondary-foreground hover:hw-gold-text"
              >
                {q}
              </button>
            ))}
          </div>
          <form onSubmit={onSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Coach Ace…"
              className="flex-1 bg-input/60 border border-border/60 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:hw-gold-border"
            />
            <button type="submit" disabled={loading} className="hw-chip-gold rounded-xl px-3.5 py-2.5 disabled:opacity-50" aria-label="Send">
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}