"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Split-flap lettering: each character sits on its own small tile with a split line.
// When the text changes (or `play` turns on), tiles shuffle through random letters and
// land left to right, 30 ms apart. Tiles are decoration only (aria-hidden): whatever
// renders a FlapText must also give screen readers the real text.

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const STAGGER = 30;
const TICK = 40;

// ---- Optional flap sound: a short filtered noise click, off until the visitor turns it on.
let soundOn = false;
let audio: AudioContext | null = null;
let clickBuffer: AudioBuffer | null = null;
let lastClick = 0;

export function setFlapSound(on: boolean) {
  soundOn = on;
  if (!on || typeof window === "undefined") return;
  if (!audio) {
    audio = new AudioContext();
    const length = Math.floor(audio.sampleRate * 0.014);
    clickBuffer = audio.createBuffer(1, length, audio.sampleRate);
    const data = clickBuffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3;
  }
  void audio.resume();
}

function flapClick() {
  if (!soundOn || !audio || !clickBuffer) return;
  const now = performance.now();
  if (now - lastClick < 45) return;
  lastClick = now;
  const source = audio.createBufferSource();
  source.buffer = clickBuffer;
  const filter = audio.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1800 + Math.random() * 900;
  const gain = audio.createGain();
  gain.gain.value = 0.12;
  source.connect(filter).connect(gain).connect(audio.destination);
  source.start();
}

// ---- Tiles

type Tiles = { chars: string[]; flips: number[] };

function Tile({ char, flip }: { char: string; flip: number }) {
  return (
    <span className="flap-tile">
      {/* A new key restarts the fold-down animation each time the character changes. */}
      <span key={flip} className={flip > 0 ? "flap-char" : "block"}>
        {char === " " ? " " : char}
      </span>
    </span>
  );
}

export function FlapText({
  text,
  play = true,
  still = false,
  cycle = true,
  delay = 0,
  accent = false,
  replay = 0,
  className,
}: {
  text: string;
  /** Run the flip when this turns true (e.g. once the board scrolls into view). */
  play?: boolean;
  /** Static tiles, no flipping (reduced motion, or inactive rows on phones). */
  still?: boolean;
  /** Shuffle through random letters before landing; false flips straight to the new character (clocks). */
  cycle?: boolean;
  delay?: number;
  accent?: boolean;
  /** Bump to flip the same text again (e.g. when its row becomes active). */
  replay?: number;
  className?: string;
}) {
  const target = Array.from(text.toUpperCase());
  const [tiles, setTiles] = useState<Tiles>(() => ({ chars: target, flips: target.map(() => 0) }));
  const live = useRef(tiles);
  live.current = tiles;

  useEffect(() => {
    const goal = Array.from(text.toUpperCase());
    if (!play || still) {
      const current = live.current;
      if (current.chars.join("") !== goal.join("")) {
        setTiles({ chars: goal, flips: goal.map((_, i) => (current.flips[i] ?? 0) + (still ? 0 : 1)) });
      }
      return;
    }

    const begin = performance.now();
    const startAt = goal.map((_, i) => delay + i * STAGGER);
    const settleAt = startAt.map((t) => t + (cycle ? 140 + Math.random() * 180 : 0));
    const timer = window.setInterval(() => {
      const elapsed = performance.now() - begin;
      const { chars, flips } = live.current;
      let changed = false;
      let done = true;
      const nextChars = goal.map((char, i) => {
        if (elapsed >= settleAt[i]) return char;
        done = false;
        if (cycle && char !== " " && elapsed >= startAt[i]) return CHARSET[Math.floor(Math.random() * CHARSET.length)];
        return chars[i] ?? " ";
      });
      const nextFlips = nextChars.map((char, i) => {
        if (char === chars[i]) return flips[i] ?? 0;
        changed = true;
        return (flips[i] ?? 0) + 1;
      });
      if (changed || nextChars.length !== chars.length) {
        if (changed) flapClick();
        setTiles({ chars: nextChars, flips: nextFlips });
      }
      if (done) window.clearInterval(timer);
    }, TICK);
    return () => window.clearInterval(timer);
  }, [text, play, still, cycle, delay, replay]);

  // Words stay together on one line; the line can wrap between words.
  const words: number[][] = [];
  target.forEach((char, i) => {
    if (char === " ") words.push([]);
    else (words[words.length - 1] ?? (words[words.length] = [])).push(i);
  });

  return (
    <span aria-hidden className={cn("flex flex-wrap gap-x-[0.4em] gap-y-[0.2em]", accent && "flap-accent", className)}>
      {words
        .filter((word) => word.length > 0)
        .map((word) => (
          <span key={word[0]} className="inline-flex whitespace-nowrap">
            {word.map((i) => (
              <Tile key={i} char={tiles.chars[i] ?? target[i]} flip={tiles.flips[i] ?? 0} />
            ))}
          </span>
        ))}
    </span>
  );
}
