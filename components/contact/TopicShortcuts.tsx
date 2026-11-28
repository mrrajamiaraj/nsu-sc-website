"use client";

import { ArrowRight, CalendarDays, Handshake, Users, type LucideIcon } from "lucide-react";
import { ToFormButton } from "@/components/contact/extras/FormLinks";
import type { ContactTopic } from "@/lib/contact";

const SHORTCUTS: { topic: ContactTopic; icon: LucideIcon; title: string; line: string }[] = [
  { topic: "trials", icon: Users, title: "Squads & trials", line: "Try out for a squad or ask about training." },
  { topic: "events", icon: CalendarDays, title: "Events & registration", line: "Sign-ups, fixtures and results." },
  { topic: "partnership", icon: Handshake, title: "Partnerships & sponsorship", line: "Sponsor an event or work with the club." },
];

// Three slim text rows above the form. A click chooses the form's topic and takes you there.
export function TopicShortcuts() {
  return (
    <ul aria-label="Start with a topic" className="grid md:grid-cols-3 md:gap-8">
      {SHORTCUTS.map(({ topic, icon: Icon, title, line }) => (
        <li key={topic} className="border-t border-white/10">
          <ToFormButton topic={topic} className="group flex w-full items-start gap-3.5 py-5 text-left">
            <Icon aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-[#3fcfca]" />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 text-[16px] font-semibold text-[#f5f1e8] transition-colors group-hover:text-[#3fcfca] group-focus-visible:text-[#3fcfca]">
                {title}
                <ArrowRight
                  aria-hidden
                  className="h-4 w-4 -translate-x-1.5 opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                />
              </span>
              <span className="mt-1 block text-[14px] leading-snug text-[#f5f1e8]/60">{line}</span>
            </span>
          </ToFormButton>
        </li>
      ))}
    </ul>
  );
}
