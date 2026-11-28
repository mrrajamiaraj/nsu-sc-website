"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { QrPopover } from "@/components/contact/interaction/QrPopover";
import { CONTACT_EXTRAS, REPLY_TIME } from "@/lib/contact-extras";
import { telHref } from "@/lib/utils";

const ENGLISH_TEXT = "You can write to us in English or বাংলা.";
// Bengali script in Noto Sans Bengali, so it sits at the same weight as Inter.
const BANGLA_FONT = "[font-family:var(--font-bangla),var(--font-home),sans-serif]";
const BANGLA = "আপনি আমাদের ইংরেজি বা বাংলায় লিখতে পারেন।";

// Response times, urgent contact, privacy and language, under the send button.
// Plain text only: the matchday line appears once a real number is set in lib/contact-extras.ts.
export function SmallPrint() {
  const [bangla, setBangla] = useState(false);
  const { matchdayPhone } = CONTACT_EXTRAS;

  return (
    <ul className="mt-6 space-y-1 text-[14px] font-normal leading-[1.7] text-[#f5f1e8]/60">
      <li>We usually reply within {REPLY_TIME}. During exams or major events, replies may be slower.</li>
      {matchdayPhone && (
        <li>
          Matchday or urgent issue? Call{" "}
          <QrPopover value={telHref(matchdayPhone)} label="Scan to call from your phone">
            <a href={telHref(matchdayPhone)} className="font-medium text-[#3fcfca] underline-offset-4 hover:underline">
              {matchdayPhone}
            </a>
          </QrPopover>{" "}
          on event days.
        </li>
      )}
      <li>We only use your details to reply to you. We never share them.</li>
      <li>
        {/* Hover, focus or tap flips the line between English and Bangla. */}
        <button
          type="button"
          onPointerEnter={(e) => e.pointerType === "mouse" && setBangla(true)}
          onPointerLeave={(e) => e.pointerType === "mouse" && setBangla(false)}
          onFocus={() => setBangla(true)}
          onBlur={() => setBangla(false)}
          onClick={() => setBangla((b) => !b)}
          aria-label={`${ENGLISH_TEXT} ${BANGLA}`}
          className="relative inline-flex text-left [perspective:400px]"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={bangla ? "bn" : "en"}
              aria-hidden
              initial={{ rotateX: -90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              exit={{ rotateX: 90, opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="inline-block origin-center"
            >
              {bangla ? (
                <span lang="bn" className={BANGLA_FONT}>
                  {BANGLA}
                </span>
              ) : (
                <>
                  You can write to us in English or{" "}
                  <span lang="bn" className={BANGLA_FONT}>
                    বাংলা
                  </span>
                  .
                </>
              )}
            </motion.span>
          </AnimatePresence>
        </button>
      </li>
    </ul>
  );
}
