"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PanelFaces } from "@/components/contact/PanelPeople";
import { CONTACT_EXTRAS, REPLY_TIME } from "@/lib/contact-extras";
import type { PanelPerson } from "@/lib/contact-panel";

// "Usually replies within …" with a pulsing dot. The 30-day average shows on hover, focus or
// tap only once it's measured; until then it's plain text.
function ReplyIndicator() {
  const [open, setOpen] = useState(false);
  const { averageReplyTime } = CONTACT_EXTRAS;
  const dot = (
    <span aria-hidden className="relative flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full rounded-full bg-[#3fcfca] opacity-60 motion-safe:animate-ping" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#3fcfca]" />
    </span>
  );
  const text = <>Usually replies within {REPLY_TIME}</>;

  if (!averageReplyTime) {
    return (
      <p className="inline-flex items-center gap-2.5 text-[14px] text-[#f5f1e8]/75">
        {dot}
        {text}
      </p>
    );
  }
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-expanded={open}
        onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2.5 text-[14px] text-[#f5f1e8]/75"
      >
        {dot}
        {text}
      </button>
      <AnimatePresence>
        {open && (
          <motion.span
            role="status"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-20 mt-2 w-max max-w-[18rem] rounded-lg border border-white/15 bg-[#082120] px-3 py-2 text-[13px] text-[#f5f1e8]/80"
          >
            Average reply time, last 30 days: {averageReplyTime}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

// Compact, left-aligned opening: title, one line, reply time.
export function ContactHeader({ people }: { people: PanelPerson[] }) {
  return (
    <header className="pb-10 pt-12">
      <h1 className="text-[52px] !font-extrabold leading-[0.9] text-[#f5f1e8] md:text-[72px]">
        Talk to the
        <span className="block text-[#3fcfca]">panel.</span>
      </h1>
      <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-[#f5f1e8]/70">
        Squads, trials, events or partnerships. A real person on the panel reads every message.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
        <ReplyIndicator />
        <PanelFaces people={people} />
      </div>
    </header>
  );
}
