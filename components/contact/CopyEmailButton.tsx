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
        aria-label="Copy email address"
        className="inline-flex min-h-[32px] items-center gap-1.5 text-[14px] font-medium text-[#3fcfca] underline-offset-4 hover:underline"
      >
        {state === "copied" ? (
          <Check aria-hidden className="h-3.5 w-3.5 text-[#3fcfca]" />
        ) : (
          <Copy aria-hidden className="h-3.5 w-3.5" />
        )}
        Copy
      </button>
      <span role="status" className="text-[14px] text-[#f5f1e8]/60">
        {state === "copied" && "Copied"}
        {state === "failed" && "Your browser blocked copying. Select the address and copy it instead."}
      </span>
    </span>
  );
}
