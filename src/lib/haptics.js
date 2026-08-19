const SEMANTIC_TYPES = new Set(["selection", "success", "warning"]);
const AUDIO_CONTEXTS = new WeakMap();
const SOUND_PROFILES = {
  selection: [{ frequency: 460, offset: 0, duration: 0.08, volume: 0.022, waveform: "sine" }],
  deal: [
    { frequency: 330, offset: 0, duration: 0.07, volume: 0.018, waveform: "triangle" },
    { frequency: 410, offset: 0.04, duration: 0.08, volume: 0.014, waveform: "triangle" },
  ],
  success: [
    { frequency: 620, offset: 0, duration: 0.09, volume: 0.02, waveform: "sine" },
    { frequency: 820, offset: 0.07, duration: 0.14, volume: 0.018, waveform: "sine" },
  ],
  warning: [
    { frequency: 260, offset: 0, duration: 0.12, volume: 0.018, waveform: "triangle" },
    { frequency: 190, offset: 0.09, duration: 0.18, volume: 0.014, waveform: "triangle" },
  ],
};

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

export function playSoundEffect(enabled, type = "selection", scope = globalThis) {
  if (!enabled) return false;
  try {
    const AudioContext = scope?.AudioContext || scope?.webkitAudioContext;
    if (typeof AudioContext !== "function") return false;
    let context = AUDIO_CONTEXTS.get(scope);
    if (!context || context.state === "closed") {
      context = new AudioContext();
      AUDIO_CONTEXTS.set(scope, context);
    }
    if (context.state === "suspended" && typeof context.resume === "function") context.resume();
    const now = context.currentTime;
    const profile = SOUND_PROFILES[type] || SOUND_PROFILES.selection;

    for (const note of profile) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = now + note.offset;
      const stop = start + note.duration;
      oscillator.type = note.waveform;
      oscillator.frequency.setValueAtTime(note.frequency, start);
      gain.gain.setValueAtTime(note.volume, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, stop);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(stop);
    }
    return true;
  } catch {
    return false;
  }
}
