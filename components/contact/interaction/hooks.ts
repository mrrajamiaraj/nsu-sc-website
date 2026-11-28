"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

export function useMedia(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener("change", update);
    return () => list.removeEventListener("change", update);
  }, [query]);
  return matches;
}

// A real mouse (or trackpad) and motion allowed: cursor effects, magnetism, tilt, parallax.
export function useRichPointer() {
  const fine = useMedia("(hover: hover) and (pointer: fine)");
  const reduce = useReducedMotion();
  return fine && !reduce;
}

// Copy text to the clipboard; `copied` stays true for 2 s so the button can say so.
export function useCopy() {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setFailed(false);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setFailed(true);
    }
  }, []);
  return { copied, failed, copy };
}

// Light haptic tick on supporting phones.
export function haptic() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(10);
}

// Page-level event other parts of the page use to start a message in the contact form.
export const PREFILL_EVENT = "nsusc:contact-prefill"; // detail: { greeting: string }
