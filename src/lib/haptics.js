export function hapticPulse(enabled, pattern = 18) {
  if (!enabled || typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return false;
  try { return navigator.vibrate(pattern); } catch { return false; }
}
