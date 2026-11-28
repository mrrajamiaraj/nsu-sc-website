"use client";

import { useEffect, useRef, useState } from "react";
import { CampusMap } from "@/components/contact/CampusMap";
import { DirectLines } from "@/components/contact/DirectLines";
import { CONTACT_FOCUS_EVENT, CONTACT_TOPIC_EVENT } from "@/components/contact/extras/shared";
import { SentenceForm, type SentenceFormHandle } from "@/components/contact/form/SentenceForm";
import { PREFILL_EVENT } from "@/components/contact/interaction/hooks";
import type { ContactTopic } from "@/lib/contact";
import type { Team } from "@/lib/types";

// Contact page main grid: the direct line on the left (cols 1–4), the sentence form on the
// right (cols 6–12). Phones: form first, then the direct line and the map.
export function ContactPanel({
  teams,
  email,
  phone,
  hours,
  address,
  initialTopic,
  initialSquad = "",
  initialGreeting = "",
}: {
  teams: Team[];
  email: string;
  phone: string;
  hours: string;
  address: string;
  initialTopic: ContactTopic | null;
  /** A team name from /contact?squad=…, preselected when the topic is trials. */
  initialSquad?: string;
  /** "Hi Sayedul, " from /contact?to=…, to start the message. */
  initialGreeting?: string;
}) {
  const [topic, setTopic] = useState<ContactTopic | "">(initialTopic ?? "");
  const form = useRef<SentenceFormHandle>(null);

  // Links further down the page ("Still stuck? Send us a message").
  useEffect(() => {
    const onTopic = (e: Event) => {
      const value = (e as CustomEvent<ContactTopic>).detail;
      setTopic(value);
      form.current?.goTo(value === "partnership" ? "company" : "auto", { fromBelow: true });
      // The topic field flashes once so it's clear what changed.
      requestAnimationFrame(() => {
        const field = document.getElementById("contact-topic");
        if (!field) return;
        field.classList.remove("field-pulse");
        void field.offsetWidth;
        field.classList.add("field-pulse");
      });
    };
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

  useEffect(() => {
    if (initialGreeting) form.current?.prefill(initialGreeting);
  }, [initialGreeting]);

  return (
    <div className="flex flex-col gap-16 lg:grid lg:grid-cols-12 lg:gap-x-16">
      {/* The left column stretches to the form's height; the map fills what's left, so both end together. */}
      <section aria-labelledby="reach-heading" className="order-2 flex flex-col lg:order-1 lg:col-span-4">
        <h2 id="reach-heading" className="![font-family:inherit] text-[13px] !font-semibold uppercase !leading-normal tracking-[0.16em] text-[#f5f1e8]/60">
          Direct line
        </h2>
        <div className="mt-4">
          <DirectLines email={email} phone={phone} hours={hours} address={address} />
        </div>
        <CampusMap className="mt-6 lg:flex-1" />
      </section>

      <div className="order-1 lg:order-2 lg:col-span-7 lg:col-start-6">
        <SentenceForm ref={form} teams={teams} email={email} topic={topic} onTopicChange={setTopic} initialSquad={initialSquad} />
      </div>
    </div>
  );
}
