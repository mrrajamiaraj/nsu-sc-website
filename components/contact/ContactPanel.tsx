"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, Check, Handshake, Mail, MapPin, Phone, Users, type LucideIcon } from "lucide-react";
import { CampusMap } from "@/components/contact/CampusMap";
import { DirectLines } from "@/components/contact/DirectLines";
import { CONTACT_FOCUS_EVENT, CONTACT_TOPIC_EVENT } from "@/components/contact/extras/shared";
import { SentenceForm, type SentenceFormHandle } from "@/components/contact/form/SentenceForm";
import { PREFILL_EVENT } from "@/components/contact/interaction/hooks";
import { Reveal, RevealItem } from "@/components/contact/interaction/Pointer";
import { contactTopicLabel, type ContactTopic } from "@/lib/contact";
import type { Team } from "@/lib/types";
import { cn, telHref } from "@/lib/utils";

// Contact page body: pick a topic, see how to reach the club, write the message.

const DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent("North South University, Bashundhara, Dhaka")}`;

const PICKS: { value: ContactTopic; icon: LucideIcon; hint: string }[] = [
  { value: "trials", icon: Users, hint: "Try out for a squad or ask about training." },
  { value: "events", icon: CalendarDays, hint: "Sign-ups, fixtures and results." },
  { value: "partnership", icon: Handshake, hint: "Sponsor an event or work with the club." },
];

// Phones: the three ways to reach the club as quick actions above the form.
function QuickActions({ email, phone }: { email: string; phone: string }) {
  const actions = [
    { label: "Email us", sub: "Club inbox", href: `mailto:${email}`, icon: Mail },
    { label: "Call", sub: "NSU switchboard", href: telHref(phone), icon: Phone },
    { label: "Get directions", sub: "NSU campus", href: DIRECTIONS, icon: MapPin, external: true },
  ];
  return (
    <ul className="grid grid-cols-3 gap-2 lg:hidden" aria-label="Quick ways to reach the club">
      {actions.map((action) => (
        <li key={action.label}>
          <a
            href={action.href}
            data-haptic
            target={action.external ? "_blank" : undefined}
            rel={action.external ? "noopener noreferrer" : undefined}
            className="flex h-full min-h-[88px] flex-col items-center justify-center gap-1 rounded-lg border border-white/12 bg-[#0f302e] px-2 py-3 text-center transition hover:-translate-y-0.5 hover:border-white/25"
          >
            <action.icon aria-hidden className="h-5 w-5 text-[#3fcfca]" />
            <span className="text-[14px] font-semibold leading-tight text-[#f5f1e8]">{action.label}</span>
            <span className="text-[12px] leading-tight text-[#f5f1e8]/55">{action.sub}</span>
            {action.external && <span className="sr-only">(opens Google Maps)</span>}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function ContactPanel({
  teams,
  email,
  phone,
  hours,
  address,
  initialTopic,
  initialSquad = "",
}: {
  teams: Team[];
  email: string;
  phone: string;
  hours: string;
  address: string;
  initialTopic: ContactTopic | null;
  /** A team name from /contact?squad=…, preselected when the topic is trials. */
  initialSquad?: string;
}) {
  const [topic, setTopic] = useState<ContactTopic | "">(initialTopic ?? "");
  const form = useRef<SentenceFormHandle>(null);

  const pick = (value: ContactTopic, fromBelow = false) => {
    setTopic(value);
    form.current?.goTo(value === "partnership" ? "company" : "auto", { fromBelow });
  };

  // Buttons elsewhere on the page ("Talk partnerships", "Still stuck?", panel faces).
  useEffect(() => {
    const onTopic = (e: Event) => pick((e as CustomEvent<ContactTopic>).detail, true);
    const onFocus = () => form.current?.goTo("auto", { fromBelow: true });
    const onPrefill = (e: Event) => form.current?.prefill((e as CustomEvent<{ greeting: string }>).detail.greeting);
    window.addEventListener(CONTACT_TOPIC_EVENT, onTopic);
    window.addEventListener(CONTACT_FOCUS_EVENT, onFocus);
    window.addEventListener(PREFILL_EVENT, onPrefill);
    return () => {
      window.removeEventListener(CONTACT_TOPIC_EVENT, onTopic);
      window.removeEventListener(CONTACT_FOCUS_EVENT, onFocus);
      window.removeEventListener(PREFILL_EVENT, onPrefill);
    };
  }, []);

  return (
    <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
      <QuickActions email={email} phone={phone} />

      {/* Topic picker: sets the topic in the sentence and moves on to the form. */}
      <Reveal as="section" className="mt-8 lg:mt-0">
        <h2 id="topic-heading" className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#f5f1e8]/60">
          What&rsquo;s it about?
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {PICKS.map((option) => {
            const selected = topic === option.value;
            return (
              <RevealItem key={option.value}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => pick(option.value)}
                  className={cn(
                    "group flex w-full items-start gap-4 rounded-xl border p-4 text-left transition duration-150 hover:-translate-y-0.5 sm:p-5",
                    selected ? "border-[#3fcfca] bg-[#3fcfca]/[0.07]" : "border-white/12 bg-[#0f302e] hover:border-white/25",
                  )}
                >
                  <option.icon
                    aria-hidden
                    className={cn("mt-0.5 h-5 w-5 shrink-0 transition-transform duration-150 group-hover:scale-110", selected ? "text-[#3fcfca]" : "text-[#f5f1e8]/60")}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[16px] font-semibold text-[#f5f1e8]">{contactTopicLabel(option.value)}</span>
                    <span className="mt-1 block text-[14px] leading-snug text-[#f5f1e8]/65">{option.hint}</span>
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                      selected ? "border-[#3fcfca] bg-[#3fcfca] text-[#002e2c]" : "border-white/25 text-transparent",
                    )}
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                </button>
              </RevealItem>
            );
          })}
        </div>
      </Reveal>

      <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12">
        <Reveal as="section" className="hidden lg:col-span-4 lg:block">
          <h2 id="reach-heading" className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#f5f1e8]/60">
            Reach the club
          </h2>
          <div className="mt-4">
            <DirectLines email={email} phone={phone} hours={hours} address={address} />
          </div>
          <CampusMap className="mt-6" />
        </Reveal>

        <SentenceForm ref={form} teams={teams} email={email} topic={topic} onTopicChange={setTopic} initialSquad={initialSquad} />

        {/* Phones: the map comes after the form. */}
        <CampusMap className="lg:hidden" />
      </div>
    </div>
  );
}
