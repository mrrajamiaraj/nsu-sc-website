"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { FlapText } from "@/components/home/matchday/SplitFlap";
import { Magnetic } from "@/components/contact/interaction/Pointer";
import { CONTACT_EXTRAS } from "@/lib/contact-extras";
import type { ClubRegistration } from "@/lib/registration";

function untilTrials(iso: string) {
  const ms = new Date(`${iso}T00:00:00+06:00`).getTime() - Date.now();
  if (ms <= 0) return null;
  const s = Math.floor(ms / 1000);
  const pad = (v: number) => String(v).padStart(2, "0");
  return [pad(Math.floor(s / 86400)), pad(Math.floor((s % 86400) / 3600)), pad(Math.floor((s % 3600) / 60)), pad(s % 60)];
}

// Split-flap countdown to the trials day, in the Matchday Board style.
function TrialsCountdown({ iso }: { iso: string }) {
  const reduce = Boolean(useReducedMotion());
  const [parts, setParts] = useState<string[] | null | undefined>(undefined);
  useEffect(() => {
    const tick = () => setParts(untilTrials(iso));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [iso]);
  if (parts === null) return null;
  const labels = ["days", "hrs", "min", "sec"];
  return (
    <div className="mt-8 flex items-start gap-2 text-[22px]">
      <span className="sr-only">Time until the next trials</span>
      {(parts ?? ["--", "--", "--", "--"]).map((value, i) => (
        <div key={labels[i]} aria-hidden className="flex flex-col items-center gap-1">
          <FlapText text={value} cycle={false} still={reduce} />
          <span className="text-[11px] tracking-[0.12em] text-[#f5f1e8]/55">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

// One big fact; it flips in when it scrolls into view (a plain fade with reduced motion).
function Fact({ value, label, index }: { value: ReactNode; label: string; index: number }) {
  const reduce = Boolean(useReducedMotion());
  return (
    <div className="py-6 md:px-8 md:py-1 md:first:pl-0 [perspective:600px]">
      <motion.p
        initial={reduce ? { opacity: 0 } : { rotateX: -80, opacity: 0 }}
        whileInView={reduce ? { opacity: 1 } : { rotateX: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={reduce ? { duration: 0.3 } : { delay: index * 0.12, type: "spring", stiffness: 220, damping: 18 }}
        style={{ transformOrigin: "50% 0%" }}
        className="font-display text-[40px] font-extrabold uppercase leading-[0.95] text-[#f5f1e8]"
      >
        {value}
      </motion.p>
      <p className="mt-2 text-[14px] text-[#f5f1e8]/60">{label}</p>
    </div>
  );
}

// Trials & joining: three facts, a countdown once a trials date is set, and the way in.
// Unconfirmed values use their real fallback ("Announced on our Facebook", "Ask the panel").
export function TrialsStrip({ club }: { club: ClubRegistration }) {
  const { trialsDate, membershipFee } = CONTACT_EXTRAS;
  const upcoming = trialsDate && untilTrials(trialsDate) ? trialsDate : null;
  const dateLabel = upcoming ? new Date(`${upcoming}T00:00:00+06:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Dhaka" }) : null;

  return (
    <div>
      <h2 id="trials-heading" className="text-[40px] !font-extrabold leading-none text-[#f5f1e8]">
        Trials &amp; joining
      </h2>
      <div className="mt-8 grid divide-y divide-white/10 md:grid-cols-3 md:divide-x md:divide-y-0">
        <Fact index={0} value={dateLabel ?? "Announced on our Facebook"} label="Next trials" />
        <Fact index={1} value={membershipFee ?? "Ask the panel"} label="Membership fee" />
        <Fact index={2} value="All NSU students" label="Who can join" />
      </div>
      {upcoming && <TrialsCountdown iso={upcoming} />}
      <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
        {club.formUrl ? (
          <Magnetic>
            <a
              href={club.formUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex min-h-[52px] items-center gap-2 rounded-full bg-[#3fcfca] px-7 text-base font-semibold text-[#002e2c] transition hover:bg-[#6fe0dc] active:scale-[0.97]"
            >
              Join the club
              <ArrowRight aria-hidden className="h-5 w-5 transition-transform duration-150 group-hover:translate-x-1" />
              <span className="sr-only">(opens the sign-up form)</span>
            </a>
          </Magnetic>
        ) : (
          <p className="max-w-md text-[15px] leading-relaxed text-[#f5f1e8]/70">{club.body}</p>
        )}
        <Link href="/teams" className="group inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-[#3fcfca] underline-offset-4 hover:underline">
          See the squads
          <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
