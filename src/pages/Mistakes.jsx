import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NotebookPen, RotateCcw } from "lucide-react";
import { buildCard } from "@/lib/cards/deck";
import { useEntitlement } from "@/lib/billing";
import PremiumGate from "@/components/PremiumGate";
import PlayingCard from "@/components/PlayingCard";

const FILTERS = ["All", "high-pair", "low-pair", "four-to-flush", "four-to-open-straight", "three-to-royal", "two-unsuited-high-cards", "redraw-all"];

export default function Mistakes() {
  const { isPremium } = useEntitlement();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const mistakes = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("holdwise_mistakes_v1") || "[]");
    } catch {
      return [];
    }
  }, []);

  const filtered = filter === "All" ? mistakes : mistakes.filter((m) => m.category === filter);

  return (
    <div className="px-5 pt-8 pb-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <NotebookPen size={20} className="hw-gold-text" />
        <h1 className="font-heading text-2xl sm:text-3xl font-bold">Mistake Notebook</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-5">Replay tricky hands. Premium feature.</p>

      {!isPremium ? (
        <PremiumGate title="Mistake Notebook is Premium" reason="Save and replay your mistakes to build the skills you need most." />
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-3 mb-3">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`shrink-0 text-xs px-3 py-1.5 rounded-full border ${filter === f ? "hw-gold-border hw-gold-text bg-white/5" : "border-border/60 text-muted-foreground"}`}>
                {f}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="hw-glass rounded-2xl border border-border/60 p-8 text-center text-sm text-muted-foreground">
              No mistakes saved yet. Play a few hands and your tricky decisions will appear here for review.
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((m, i) => (
                <div key={i} className="hw-glass rounded-2xl border border-border/60 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] hw-gold-text uppercase tracking-widest">{m.category}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(m.at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {m.cards.map((id) => {
                      const suit = id.match(/(hearts|diamonds|clubs|spades)$/)[1];
                      return <PlayingCard key={id} card={buildCard(id.replace(suit, ""), suit)} size="sm" />;
                    })}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                    <div className="rounded-lg bg-black/20 border border-border/50 p-2.5">
                      <p className="text-muted-foreground mb-1">You held</p>
                      <p className="font-mono">{JSON.stringify(m.userHold)}</p>
                    </div>
                    <div className="rounded-lg bg-black/20 border hw-gold-border p-2.5">
                      <p className="hw-gold-text mb-1">Recommended</p>
                      <p className="font-mono">{JSON.stringify(m.recHold)}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{m.reason}</p>
                  <button onClick={() => navigate("/practice/video-poker", { state: { replayMistake: m } })} className="hw-chip-gold rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-1.5">
                    <RotateCcw size={13} /> Replay
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}