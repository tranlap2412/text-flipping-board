"use client";

let audioCtx: AudioContext | null = null;
let soundEnabled = true; // default to true, plays once user interacts with page

export function toggleSound(enabled?: boolean) {
  if (enabled !== undefined) {
    soundEnabled = enabled;
  } else {
    soundEnabled = !soundEnabled;
  }
  return soundEnabled;
}

export function isSoundEnabled() {
  return soundEnabled;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

let lastClickTime = 0;
const CLICK_THROTTLE_MS = 50;

// Play a short mechanical click sound
export function playFlipSound() {
  if (!soundEnabled) return;
  const nowMs = Date.now();
  if (nowMs - lastClickTime < CLICK_THROTTLE_MS) return;
  lastClickTime = nowMs;

  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  // Create oscillator and bandpass filter to simulate a physical mechanical strike
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = "sine";
  
  // Organic variation in pitch
  const pitch = 700 + Math.random() * 500;
  osc.frequency.setValueAtTime(pitch, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.02);

  // Bandpass filter to make it metallic and hollow
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(600, ctx.currentTime);
  filter.Q.setValueAtTime(3.0, ctx.currentTime);

  // Short decay envelope
  gainNode.gain.setValueAtTime(0.06, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.025);

  osc.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.03);
}

// Play a mechanical lock/chime sound when board finishes updating
export function playSuccessSound() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const now = ctx.currentTime;
  
  // Play three quick rising tones
  const tones = [523.25, 659.25, 783.99]; // C5, E5, G5
  
  tones.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now + idx * 0.06);
    
    gainNode.gain.setValueAtTime(0, now + idx * 0.06);
    gainNode.gain.linearRampToValueAtTime(0.03, now + idx * 0.06 + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.15);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(now + idx * 0.06);
    osc.stop(now + idx * 0.06 + 0.16);
  });
}
