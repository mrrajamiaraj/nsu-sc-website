"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { FlapText } from "@/components/home/matchday/SplitFlap";
import { Ph } from "@/components/contact/extras/shared";
import { CONTACT_EXTRAS } from "@/lib/contact-extras";
import { cn } from "@/lib/utils";

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
    <div aria-hidden className="mt-3 flex items-start gap-2 text-[22px]">
      {(parts ?? ["--", "--", "--", "--"]).map((value, i) => (
        <div key={labels[i]} className="flex flex-col items-center gap-1">
          <FlapText text={value} cycle={false} still={reduce} />
          <span className="text-[11px] tracking-[0.12em] text-[#f5f1e8]/55">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

function Fact({ value, label, children }: { value: ReactNode; label: string; children?: ReactNode }) {
  return (
    <div className="py-6 md:px-8 md:py-2 md:first:pl-0">
      <p className="font-display text-[40px] font-extrabold uppercase leading-none text-[#f5f1e8] sm:text-[48px]">{value}</p>
      <p className="mt-2 text-[14px] text-[#f5f1e8]/60">{label}</p>
      {children}
    </div>
  );
}

export function TrialsStrip({ joinUrl, className }: { joinUrl: string | null; className?: string }) {
  const { trialsDate, membershipFee, trialScheduleUrl } = CONTACT_EXTRAS;
  const dateLabel = trialsDate
    ? new Date(`${trialsDate}T00:00:00+06:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Dhaka" })
    : null;

  return (
    <section aria-labelledby="trials-heading" className={cn("border-t border-white/10 pt-14", className)}>
      <h2 id="trials-heading" className="text-[34px] !font-extrabold uppercase leading-none text-[#f5f1e8] sm:text-[40px]">
        Trials &amp; joining
      </h2>
      <div className="mt-6 grid divide-y divide-white/10 border-y border-white/10 md:grid-cols-3 md:divide-x md:divide-y-0 md:py-6">
        <Fact value={dateLabel ?? <Ph className="font-sans text-[0.45em]">Next trials date</Ph>} label="Next open trials">
          {trialsDate && <TrialsCountdown iso={trialsDate} />}
        </Fact>
        <Fact value={membershipFee ?? <Ph className="font-sans text-[0.45em]">Fee / Free</Ph>} label="Membership fee" />
        <Fact value="All NSU students" label="Who can join" />
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        {joinUrl ? (
          <a
            href={joinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[52px] items-center gap-2 rounded-full bg-[#3fcfca] px-7 text-base font-semibold text-[#002e2c] transition hover:bg-[#6fe0dc] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b2524]"
          >
            Join the club
            <ArrowRight aria-hidden className="h-5 w-5" />
            <span className="sr-only">(opens the sign-up form)</span>
          </a>
        ) : (
          <p className="text-[15px] text-[#f5f1e8]/70">Club sign-ups are closed right now.</p>
        )}
        {trialScheduleUrl ? (
          <a href={trialScheduleUrl} className="inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-[#3fcfca] underline-offset-4 hover:underline">
            See trial schedule
            <ArrowRight aria-hidden className="h-4 w-4" />
          </a>
        ) : (
          <span className="text-[15px] text-[#f5f1e8]/70">
            See trial schedule → <Ph>trial schedule link</Ph>
          </span>
        )}
      </div>
    </section>
  );
}
