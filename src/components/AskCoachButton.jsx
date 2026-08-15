import React from "react";
import { Sparkles } from "lucide-react";
import { useApp } from "@/lib/appContext";
import { cn } from "@/lib/utils";

// Floating Ask Coach Ace button + the panel. Pass `context` (built facts).
export default function AskCoachButton({ context = null, className = "", label = "Ask Coach Ace" }) {
  const [open, setOpen] = React.useState(false);
  const { canAskCoach } = useApp();
  const CoachAcePanel = React.lazy(() => import("./CoachAcePanel"));

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-2 hw-glass hw-gold-border rounded-full pl-2.5 pr-4 py-2 shadow-lg hover:scale-[1.02] transition-transform",
          className
        )}
        aria-label="Ask Coach Ace"
      >
        <span className="w-7 h-7 rounded-full hw-chip-gold flex items-center justify-center font-heading font-bold text-sm">A</span>
        <span className="text-sm font-semibold">{label}</span>
        {!canAskCoach() && <Sparkles size={13} className="hw-gold-text" />}
      </button>
      <React.Suspense fallback={null}>
        <CoachAcePanel open={open} onClose={() => setOpen(false)} context={context} />
      </React.Suspense>
    </>
  );
}
