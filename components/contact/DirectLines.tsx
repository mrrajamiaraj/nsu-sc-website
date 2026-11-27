"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, Clock, Mail, MapPin, Phone, type LucideIcon } from "lucide-react";
import { Ph } from "@/components/contact/extras/shared";
import { QrPopover } from "@/components/contact/interaction/QrPopover";
import { useCopy, useRichPointer } from "@/components/contact/interaction/hooks";
import { CONTACT_EXTRAS } from "@/lib/contact-extras";
import { cn, telHref } from "@/lib/utils";

const DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent("North South University, Bashundhara, Dhaka")}`;
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// "Copied ✓": the label morphs and the tick draws itself in.
function CopyValue({ text, children, label }: { text: string; children: ReactNode; label: string }) {
  const { copied, failed, copy } = useCopy();
  return (
    <span className="inline-flex flex-col items-start">
      <button
        type="button"
        onClick={() => copy(text)}
        aria-label={`${label}: ${text}. Copy`}
        className="relative text-left text-[15px] font-medium text-[#f5f1e8] transition-colors group-hover/row:text-[#3fcfca]"
      >
        <AnimatePresence mode="wait" initial={false}>
          {copied ? (
            <motion.span
              key="copied"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.14 }}
              className="inline-flex items-center gap-1.5 text-[#3fcfca]"
            >
              Copied
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <motion.path d="M5 12.5l4.5 4.5L19 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.25 }} />
              </svg>
            </motion.span>
          ) : (
            <motion.span key="value" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.14 }} className="break-all">
              {children}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
      <span role="status" className="text-[12px] text-[#f5f1e8]/50">
        {copied ? "Copied to clipboard" : failed ? "Copying was blocked. Select the text instead." : "Click to copy"}
      </span>
    </span>
  );
}

function Row({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div className="group/row relative flex gap-4 border-t border-white/10 py-5">
      <Icon aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-[#3fcfca] transition-transform duration-150 group-hover/row:translate-x-1 group-focus-within/row:translate-x-1" />
      <div className="min-w-0 flex-1">
        <dt className="text-[13px] font-medium text-[#f5f1e8]/60">{label}</dt>
        <dd className="mt-1">{children}</dd>
      </div>
      {/* Hairline that draws under the row on hover. */}
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-[#3fcfca]/60 transition-transform duration-300 group-hover/row:scale-x-100" />
    </div>
  );
}

function minutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// Weekly hours with today highlighted, and a live open/closed line once every day is known.
function HoursRow({ hours }: { hours: string }) {
  const rich = useRichPointer();
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState<{ day: number; mins: number } | null>(null);
  const tableId = useId();
  const { weeklyHours, weeklyTimes } = CONTACT_EXTRAS;

  useEffect(() => {
    const tick = () => {
      const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
      const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
      const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
      setNow({ day, mins: Number(get("hour")) * 60 + Number(get("minute")) });
    };
    tick();
    const timer = window.setInterval(tick, 60000);
    return () => window.clearInterval(timer);
  }, []);

  const today = now?.day ?? -1;
  const slot = weeklyTimes && now ? weeklyTimes[now.day] : undefined;
  const status =
    weeklyTimes && now
      ? slot && now.mins >= minutes(slot[0]) && now.mins < minutes(slot[1])
        ? `Open now · closes ${slot[1]}`
        : "Closed now"
      : null;

  return (
    <div onPointerEnter={() => rich && setOpen(true)} onPointerLeave={() => rich && setOpen(false)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={tableId}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 text-left text-[15px] font-medium text-[#f5f1e8] transition-colors group-hover/row:text-[#3fcfca]"
      >
        {hours}
        <ChevronDown aria-hidden className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")} />
      </button>
      <p className="mt-1 text-[13px] leading-snug text-[#f5f1e8]/60">
        {status ?? "The university's campus hours, not club office hours."}
      </p>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={tableId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <table className="mt-3 w-full text-[13px]">
              <caption className="sr-only">Hours by day</caption>
              <tbody>
                {DAYS.map((day, i) => (
                  <tr key={day} className={cn(i === today ? "text-[#3fcfca]" : "text-[#f5f1e8]/75")}>
                    <th scope="row" className="py-1 pr-4 text-left font-medium">
                      {day}
                      {i === today && <span className="sr-only"> (today)</span>}
                    </th>
                    <td className="py-1 text-right">{weeklyHours?.[i] ?? <Ph>hours</Ph>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DirectLines({ email, phone, hours, address }: { email: string; phone: string; hours: string; address: string }) {
  const fullAddress = `North South University, ${address}`;
  return (
    <dl>
      <Row icon={Mail} label="Email">
        <CopyValue text={email} label="Email">
          {email}
        </CopyValue>
        <a
          href={`mailto:${email}`}
          className="mt-2 flex min-h-[36px] w-fit items-center gap-1 text-[14px] font-semibold text-[#3fcfca] underline-offset-4 hover:underline"
        >
          Open mail app
          <ArrowUpRight aria-hidden className="h-4 w-4" />
        </a>
      </Row>
      <Row icon={Phone} label="University switchboard">
        <QrPopover value={telHref(phone)} label="Scan to call from your phone">
          <a href={telHref(phone)} className="text-[15px] font-medium text-[#f5f1e8] transition-colors group-hover/row:text-[#3fcfca]">
            {phone}
          </a>
        </QrPopover>
        <p className="mt-1 text-[13px] leading-snug text-[#f5f1e8]/60">North South University&rsquo;s main line, not a direct club number.</p>
      </Row>
      <Row icon={Clock} label="Campus hours">
        <HoursRow hours={hours} />
      </Row>
      <Row icon={MapPin} label="North South University campus">
        <CopyValue text={fullAddress} label="Address">
          {address}
        </CopyValue>
        <a
          href={DIRECTIONS}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex min-h-[36px] w-fit items-center gap-1 text-[14px] font-semibold text-[#3fcfca] underline-offset-4 hover:underline"
        >
          Get directions
          <ArrowUpRight aria-hidden className="h-4 w-4" />
          <span className="sr-only">(opens Google Maps)</span>
        </a>
      </Row>
    </dl>
  );
}
