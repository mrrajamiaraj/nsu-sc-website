"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, CalendarPlus } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { FlapText } from "@/components/home/matchday/SplitFlap";
import { Ph } from "@/components/contact/extras/shared";
import { Dialog } from "@/components/contact/interaction/Dialog";
import { Magnetic } from "@/components/contact/interaction/Pointer";
import { useMedia } from "@/components/contact/interaction/hooks";
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

// A big fact that flips in when it scrolls into view. Its detail line shows on hover or
// focus with a mouse, and is always shown on touch screens.
function Fact({ value, label, detail, index, children }: { value: ReactNode; label: string; detail: ReactNode; index: number; children?: ReactNode }) {
  const touch = !useMedia("(hover: hover) and (pointer: fine)");
  return (
    <div tabIndex={0} className="group/fact py-6 focus-visible:outline-none md:px-8 md:py-2 md:first:pl-0 [perspective:600px]">
      <motion.p
        initial={{ rotateX: -80, opacity: 0 }}
        whileInView={{ rotateX: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ delay: index * 0.12, type: "spring", stiffness: 220, damping: 18 }}
        style={{ transformOrigin: "50% 0%" }}
        className="font-display text-[40px] font-extrabold uppercase leading-none text-[#f5f1e8] sm:text-[48px]"
      >
        {value}
      </motion.p>
      <p className="mt-2 text-[14px] text-[#f5f1e8]/60">{label}</p>
      <p
        className={cn(
          "mt-1 text-[13px] text-[#3fcfca] transition duration-200",
          touch ? "opacity-100" : "translate-y-1 opacity-0 group-hover/fact:translate-y-0 group-hover/fact:opacity-100 group-focus-visible/fact:translate-y-0 group-focus-visible/fact:opacity-100",
        )}
      >
        {detail}
      </p>
      {children}
    </div>
  );
}

function downloadIcs(sport: string, iso: string) {
  const day = iso.replace(/-/g, "");
  const next = new Date(`${iso}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  const end = next.toISOString().slice(0, 10).replace(/-/g, "");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NSU Games and Sports Club//Trials//EN",
    "BEGIN:VEVENT",
    `UID:trials-${sport.toLowerCase().replace(/\W+/g, "-")}-${day}@nsusc`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${day}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:NSU SC ${sport} trials`,
    "LOCATION:North South University\\, Bashundhara\\, Dhaka",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `nsusc-${sport.toLowerCase().replace(/\W+/g, "-")}-trials.ics`;
  link.click();
  URL.revokeObjectURL(url);
}

// Slide-over listing each squad's trial date with an "Add to calendar" file.
function Schedule({ open, onClose, sports }: { open: boolean; onClose: () => void; sports: string[] }) {
  const dates = CONTACT_EXTRAS.trialDates;
  return (
    <Dialog open={open} onClose={onClose} labelledBy="schedule-title" variant="slideover">
      <h2 id="schedule-title" className="pr-14 text-[28px] !font-extrabold uppercase leading-none text-[#f5f1e8]">
        Trial schedule
      </h2>
      <p className="mt-2 text-[14px] text-[#f5f1e8]/60">One row per squad. Add a date to your calendar once it&rsquo;s set.</p>
      <ul className="mt-6">
        {sports.map((sport, i) => {
          const iso = dates[sport];
          return (
            <motion.li
              key={sport}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="flex items-center justify-between gap-4 border-t border-white/10 py-4"
            >
              <div>
                <p className="text-[16px] font-semibold text-[#f5f1e8]">{sport}</p>
                <p className="text-[14px] text-[#f5f1e8]/65">
                  {iso ? new Date(`${iso}T00:00:00+06:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", timeZone: "Asia/Dhaka" }) : <Ph>trial date</Ph>}
                </p>
              </div>
              <button
                type="button"
                disabled={!iso}
                onClick={() => iso && downloadIcs(sport, iso)}
                className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full border border-white/20 px-3.5 text-[13px] font-semibold text-[#f5f1e8] transition hover:-translate-y-0.5 hover:border-[#3fcfca] hover:text-[#3fcfca] disabled:pointer-events-none disabled:opacity-40"
              >
                <CalendarPlus aria-hidden className="h-4 w-4" />
                Add to calendar
                <span className="sr-only">(.ics file{iso ? "" : ", available once the date is set"})</span>
              </button>
            </motion.li>
          );
        })}
      </ul>
    </Dialog>
  );
}

export function TrialsStrip({ joinUrl, sports, className }: { joinUrl: string | null; sports: string[]; className?: string }) {
  const { trialsDate, membershipFee } = CONTACT_EXTRAS;
  const [schedule, setSchedule] = useState(false);
  const dateLabel = trialsDate
    ? new Date(`${trialsDate}T00:00:00+06:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Dhaka" })
    : null;

  return (
    <section aria-labelledby="trials-heading" className={cn("border-t border-white/10 pt-14", className)}>
      <h2 id="trials-heading" className="text-[34px] !font-extrabold uppercase leading-none text-[#f5f1e8] sm:text-[40px]">
        Trials &amp; joining
      </h2>
      <div className="mt-6 grid divide-y divide-white/10 border-y border-white/10 md:grid-cols-3 md:divide-x md:divide-y-0 md:py-6">
        <Fact index={0} value={dateLabel ?? <Ph className="font-sans text-[0.45em]">Next trials date</Ph>} label="Next open trials" detail={<Ph>where trials are held</Ph>}>
          {trialsDate && <TrialsCountdown iso={trialsDate} />}
        </Fact>
        <Fact index={1} value={membershipFee ?? <Ph className="font-sans text-[0.45em]">Fee / Free</Ph>} label="Membership fee" detail={<Ph>what the fee covers</Ph>} />
        <Fact index={2} value="All NSU students" label="Who can join" detail="Any current NSU student can sign up." />
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        {joinUrl ? (
          <Magnetic>
            <a
              href={joinUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-haptic
              className="group inline-flex min-h-[52px] items-center gap-2 rounded-full bg-[#3fcfca] px-7 text-base font-semibold text-[#002e2c] transition hover:bg-[#6fe0dc] active:scale-[0.97]"
            >
              Join the club
              <ArrowRight aria-hidden className="h-5 w-5 transition-transform duration-150 group-hover:translate-x-1" />
              <span className="sr-only">(opens the sign-up form)</span>
            </a>
          </Magnetic>
        ) : (
          <p className="text-[15px] text-[#f5f1e8]/70">Club sign-ups are closed right now.</p>
        )}
        <button
          type="button"
          onClick={() => setSchedule(true)}
          className="group inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-[#3fcfca] underline-offset-4 hover:underline"
        >
          See trial schedule
          <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" />
        </button>
      </div>
      <Schedule open={schedule} onClose={() => setSchedule(false)} sports={sports} />
    </section>
  );
}
