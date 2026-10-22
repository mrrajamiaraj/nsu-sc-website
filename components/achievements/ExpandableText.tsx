"use client";

import { useEffect, useRef, useState } from "react";

// Clamped paragraph text with a "Read more" toggle. The toggle only appears
// when the text actually overflows the clamp, so short entries stay clean.
export function ExpandableText({ text, lines = 3 }: { text: string; lines?: number }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el && !expanded) setOverflows(el.scrollHeight > el.clientHeight + 1);
  }, [text, expanded]);

  return (
    <div className="mt-2">
      <p
        ref={ref}
        className="whitespace-pre-line text-sm text-slate-400"
        style={expanded ? undefined : { display: "-webkit-box", WebkitLineClamp: lines, WebkitBoxOrient: "vertical", overflow: "hidden" }}
      >
        {text}
      </p>
      {(overflows || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          className="mt-2 text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
