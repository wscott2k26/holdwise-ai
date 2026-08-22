let audioContext = null;
let masterGain = null;
let noiseSource = null;
let noiseFilter = null;
let chipTimer = null;
let requestedLevel = 'off';

const LEVEL_GAIN = { off: 0, low: 0.018, high: 0.04 };

function createNoiseBuffer(context) {
  const length = context.sampleRate * 2;
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1;
    const envelope = 0.62 + Math.sin((i / context.sampleRate) * Math.PI * 0.55) * 0.08;
    data[i] = white * envelope;
  }
  return buffer;
}

function scheduleChipTick(context, gain) {
  if (!context || context.state === 'closed') return;
  const oscillator = context.createOscillator();
  const tickGain = context.createGain();
  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(1450 + Math.random() * 520, context.currentTime);
  tickGain.gain.setValueAtTime(0.0001, context.currentTime);
  tickGain.gain.exponentialRampToValueAtTime(gain, context.currentTime + 0.008);
  tickGain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.055);
  oscillator.connect(tickGain);
  tickGain.connect(masterGain);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.07);
}

function clearChipTimer() {
  if (chipTimer) window.clearInterval(chipTimer);
  chipTimer = null;
}

function ensureGraph() {
  if (typeof window === 'undefined') return null;
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) return null;
  if (audioContext && audioContext.state !== 'closed') return audioContext;

  audioContext = new AudioContextCtor();
  masterGain = audioContext.createGain();
  noiseFilter = audioContext.createBiquadFilter();
  noiseSource = audioContext.createBufferSource();

  masterGain.gain.value = 0;
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.value = 820;
  noiseFilter.Q.value = 0.6;
  noiseSource.buffer = createNoiseBuffer(audioContext);
  noiseSource.loop = true;
  noiseSource.connect(noiseFilter);
  noiseFilter.connect(masterGain);
  masterGain.connect(audioContext.destination);
  noiseSource.start();
  return audioContext;
}

export async function setCasinoAmbience(level = 'off') {
  requestedLevel = Object.hasOwn(LEVEL_GAIN, level) ? level : 'off';
  if (requestedLevel === 'off') {
    clearChipTimer();
    if (masterGain && audioContext) masterGain.gain.setTargetAtTime(0, audioContext.currentTime, 0.16);
    return;
  }

  const context = ensureGraph();
  if (!context) return;
  try {
    if (context.state === 'suspended') await context.resume();
  } catch {
    return;
  }

  const target = LEVEL_GAIN[requestedLevel];
  masterGain.gain.setTargetAtTime(target, context.currentTime, 0.22);
  clearChipTimer();
  chipTimer = window.setInterval(() => {
    if (requestedLevel === 'off' || document.visibilityState === 'hidden') return;
    if (Math.random() > 0.58) scheduleChipTick(context, requestedLevel === 'high' ? 0.015 : 0.008);
  }, 1800);
}

export function stopCasinoAmbience() {
  requestedLevel = 'off';
  clearChipTimer();
  if (masterGain && audioContext) masterGain.gain.setTargetAtTime(0, audioContext.currentTime, 0.12);
}

export function casinoAmbienceLevel() {
  return requestedLevel;
}
