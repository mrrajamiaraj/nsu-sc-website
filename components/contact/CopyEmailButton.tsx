"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

type State = "idle" | "copied" | "failed";

// Fallback for visitors with no email app set up: copies the address so they can
// paste it into webmail. The address itself is always shown as text next to this
// button, so if the browser blocks the clipboard it can still be copied by hand.
export function CopyEmailButton({ email, className }: { email: string; className?: string }) {
  const [state, setState] = useState<State>("idle");

  useEffect(() => {
    if (state !== "copied") return;
    const timer = setTimeout(() => setState("idle"), 3000);
    return () => clearTimeout(timer);
  }, [state]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setState("copied");
    } catch {
      setState("failed");
    }
  }

  return (
    <span className={cn("inline-flex flex-wrap items-center gap-x-3 gap-y-1", className)}>
      <button
        type="button"
        onClick={copy}
        className="inline-flex min-h-[32px] items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
      >
        {state === "copied" ? (
          <Check aria-hidden className="h-3.5 w-3.5 text-green-400" />
        ) : (
          <Copy aria-hidden className="h-3.5 w-3.5" />
        )}
        Copy email address
      </button>
      <span role="status" className="text-xs text-slate-400">
        {state === "copied" && "Copied"}
        {state === "failed" && "Your browser blocked copying. Select the address and copy it instead."}
      </span>
    </span>
  );
}
