const SEMANTIC_TYPES = new Set(["selection", "success", "warning"]);

export function hapticPulse(enabled, pattern = 18, type = "selection", scope = globalThis) {
  if (!enabled) return false;
  const semantic = SEMANTIC_TYPES.has(type) ? type : "selection";
  try {
    const native = scope?.webkit?.messageHandlers?.holdwiseHaptics;
    if (native && typeof native.postMessage === "function") {
      native.postMessage(semantic);
      return true;
    }
    if (typeof scope?.navigator?.vibrate === "function") return Boolean(scope.navigator.vibrate(pattern));
  } catch {
    return false;
  }
  return false;
}
