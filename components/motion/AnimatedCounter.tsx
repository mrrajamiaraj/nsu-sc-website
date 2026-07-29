"use client";

import { animate } from "framer-motion";
import { useEffect, useState } from "react";

// Splits "8+" / "72%" / "1,250" / 12 into a prefix, numeric target, decimal
// precision, and suffix so any stat-bar value can be counted up generically.
function parseValue(raw: number | string) {
  const str = String(raw);
  const match = str.match(/^(\D*)([\d,]+(?:\.\d+)?)(.*)$/);
  if (!match) return { prefix: "", target: 0, suffix: str, decimals: 0 };
  const [, prefix, numStr, suffix] = match;
  const cleaned = numStr.replace(/,/g, "");
  const decimals = cleaned.includes(".") ? cleaned.split(".")[1].length : 0;
  return { prefix, target: parseFloat(cleaned), suffix, decimals };
}

// Mount-triggered (not viewport/whileInView-triggered) for the same reason
// as Reveal — see components/motion/Reveal.tsx for why IntersectionObserver
// based triggers are unreliable here.
export function AnimatedCounter({ value, className }: { value: number | string; className?: string }) {
  const { prefix, target, suffix, decimals } = parseValue(value);
  const [display, setDisplay] = useState(() => (0).toFixed(decimals));

  useEffect(() => {
    const controls = animate(0, target, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        setDisplay(v.toFixed(decimals));
      },
    });
    return () => controls.stop();
  }, [target, decimals]);

  return (
    <span className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
