import React from "react";
import { X, Check, Crown, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BillingService, useEntitlement } from "@/lib/billing";
import { cn } from "@/lib/utils";

const BENEFITS = [
  "Unlimited personalized coaching",
  "All 34 complete card-game courses",
  "Full video-poker strategy training",
  "Voice explanations",
  "Mistake review and custom drills",
  "Advanced pay-table lessons",
  "Animated mascot guides across the Academy",
];

export default function Paywall({ open = false, onClose = () => {}, onOpenLegal = null }) {
  const navigate = useNavigate();
  const { purchase, restore, isAdmin, storeAvailable, storePlatform } = useEntitlement();
  const [busy, setBusy] = React.useState(null);
  const [message, setMessage] = React.useState("");
  const [products, setProducts] = React.useState(() => BillingService.fallbackProducts());

  React.useEffect(() => {
    if (!open) return;
    setMessage("");
    let active = true;
    BillingService.getProducts().then((items) => { if (active) setProducts(items); });
    return () => { active = false; };
  }, [open]);

  async function buy(product) {
    setBusy(product.id);
    setMessage("");
    try {
      const result = await purchase(product.id);
      setMessage(result.note || (result.ok ? "Premium enabled." : "Purchase could not be completed."));
      if (result.ok && result.adminBypass) {
        window.setTimeout(onClose, 700);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Purchase could not be completed.");
    } finally {
      setBusy(null);
    }
  }

  async function restoreNow() {
    setBusy("restore");
    setMessage("");
    try {
      const result = await restore();
      setMessage(result.note || (result.restored ? "Purchases restored." : "No purchases were restored."));
    } finally {
      setBusy(null);
    }
  }

  function openLegal(page) {
    if (onOpenLegal) onOpenLegal(page);
    else navigate(`/${page}`);
    onClose?.();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-md max-h-[92vh] overflow-y-auto hw-glass rounded-2xl border hw-gold-border hw-fade-up"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="premium-title"
      >
        <div className="relative p-6 text-center bg-gradient-to-b from-[hsl(var(--hw-felt-deep))] to-transparent">
          <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-lg hover:bg-white/5" aria-label="Close premium options">
            <X size={20} />
          </button>
          <div className="w-14 h-14 mx-auto rounded-full hw-chip-gold flex items-center justify-center mb-3">
            <Crown size={26} />
          </div>
          <h2 id="premium-title" className="text-2xl font-heading font-bold">Turn Every Hand Into a Lesson</h2>
          <p className="text-sm text-muted-foreground mt-1.5">
            Unlock unlimited coaching, all 34 card-game courses, animated guides, and personalized practice built around the decisions you need to strengthen.
          </p>
        </div>

        <div className="px-6 pb-2 space-y-2">
          {BENEFITS.map((benefit) => (
            <div key={benefit} className="flex items-start gap-2.5 text-sm">
              <Check size={16} className="hw-gold-text mt-0.5 shrink-0" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        <div className="p-6 space-y-2.5">
          <div className="rounded-xl border border-border/60 bg-black/15 p-3 flex items-start gap-2 text-xs text-muted-foreground">
            <Smartphone size={16} className="hw-gold-text shrink-0 mt-0.5" />
            <p>
              {storeAvailable
                ? `Purchases are securely processed by ${storePlatform === "apple" ? "Apple" : "Google Play"}.`
                : "Store purchases are processed inside the installed HoldWise mobile app. The web classroom remains fully usable for free lessons."}
            </p>
          </div>

          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => buy(product)}
              disabled={Boolean(busy)}
              className={cn(
                "w-full flex items-center justify-between rounded-xl border px-4 py-3 transition-colors disabled:opacity-60",
                product.bestValue ? "hw-gold-border bg-white/5" : "border-border/60 hover:bg-white/5"
              )}
            >
              <div className="text-left">
                <p className="font-semibold flex items-center gap-2">
                  {product.name}
                  {product.bestValue && <span className="text-[10px] hw-chip-gold rounded-full px-2 py-0.5 font-bold uppercase">Best Value</span>}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {product.period === "lifetime" ? "one-time access" : `per ${product.period}`}
                </p>
              </div>
              <span className="font-heading font-bold text-lg">{busy === product.id ? "…" : product.price}</span>
            </button>
          ))}

          {message && (
            <p className="rounded-xl border border-border/60 bg-black/15 p-3 text-xs text-center" aria-live="polite">
              {message}
            </p>
          )}

          {isAdmin && (
            <p className="text-[11px] text-center text-muted-foreground pt-1">
              Administrator preview accounts may use these buttons as a developer entitlement. Normal users cannot unlock Premium in preview.
            </p>
          )}

          <button onClick={restoreNow} disabled={Boolean(busy)} className="w-full text-center text-sm text-muted-foreground hover:hw-gold-text py-2 disabled:opacity-60">
            {busy === "restore" ? "Checking…" : "Restore Purchases"}
          </button>
          <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground pt-1">
            <button onClick={() => openLegal("terms")} className="hover:underline">Terms</button>
            <button onClick={() => openLegal("privacy")} className="hover:underline">Privacy Policy</button>
            <span>Manage in your app store</span>
          </div>
        </div>
      </div>
    </div>
  );
}
