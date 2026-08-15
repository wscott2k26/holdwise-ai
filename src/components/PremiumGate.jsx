import React from "react";
import { Lock } from "lucide-react";
import { useEntitlement } from "@/lib/billing";
import Paywall from "./Paywall";

// Wraps premium content. If the user is not premium, shows a locked card that
// opens the Paywall instead of the children.
export default function PremiumGate({ children = null, title = "Premium content", reason = "Unlock with HoldWise Premium." }) {
  const { isPremium } = useEntitlement();
  const [open, setOpen] = React.useState(false);
  if (isPremium) return <>{children}</>;
  return (
    <>
      <div className="hw-glass rounded-2xl border hw-gold-border p-6 text-center">
        <div className="w-12 h-12 mx-auto rounded-full hw-chip-gold flex items-center justify-center mb-3">
          <Lock size={22} />
        </div>
        <p className="font-heading font-bold text-lg">{title}</p>
        <p className="text-sm text-muted-foreground mt-1 mb-4">{reason}</p>
        <button onClick={() => setOpen(true)} className="hw-chip-gold rounded-full px-5 py-2.5 text-sm font-semibold">
          See Premium
        </button>
      </div>
      <Paywall open={open} onClose={() => setOpen(false)} />
    </>
  );
}
