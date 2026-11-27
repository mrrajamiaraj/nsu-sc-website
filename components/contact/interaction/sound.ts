"use client";

// Soft UI sounds for the contact page, synthesised (no audio files). Off until the visitor
// turns them on; the choice is remembered in localStorage.

const KEY = "nsusc-contact-sound";
let enabled = false;
let audio: AudioContext | null = null;
const listeners = new Set<(on: boolean) => void>();

export function loadSoundPreference(): boolean {
  try {
    enabled = window.localStorage.getItem(KEY) === "on";
  } catch {
    enabled = false;
  }
  return enabled;
}

export function setSoundEnabled(on: boolean) {
  enabled = on;
  try {
    window.localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    // Storage blocked: the setting just won't be remembered.
  }
  if (on) context()?.resume();
  listeners.forEach((listener) => listener(on));
}

export function onSoundChange(listener: (on: boolean) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function context() {
  if (typeof window === "undefined") return null;
  if (!audio) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    audio = new Ctor();
  }
  return audio;
}

function tone(frequency: number, duration: number, type: OscillatorType, volume: number, vibrato = 0) {
  const ctx = context();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);
  if (vibrato) {
    const lfo = ctx.createOscillator();
    const depth = ctx.createGain();
    lfo.frequency.value = vibrato;
    depth.gain.value = frequency * 0.04;
    lfo.connect(depth).connect(osc.frequency);
    lfo.start(now);
    lfo.stop(now + duration);
  }
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

// A soft tick for buttons and links.
export function playClick() {
  if (enabled) tone(1400, 0.045, "triangle", 0.05);
}

// A short referee-whistle blip when a message is sent off to the email app.
export function playWhistle() {
  if (!enabled) return;
  tone(2600, 0.16, "sine", 0.06, 32);
  window.setTimeout(() => tone(2750, 0.26, "sine", 0.06, 36), 190);
}
