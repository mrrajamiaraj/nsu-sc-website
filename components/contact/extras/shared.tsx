import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// A clearly marked stand-in for content the club hasn't confirmed yet ("[Room number]").
// Each value lives in lib/contact-extras.ts; filling it in there removes the placeholder.
export function Ph({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span data-placeholder className={cn("rounded-sm border border-dashed border-[#f5f1e8]/35 px-1 font-mono text-[0.85em] text-[#f5f1e8]/60", className)}>
      [{children}]
    </span>
  );
}

export function SectionHeading({ id, title, intro }: { id: string; title: string; intro?: string }) {
  return (
    <div>
      <h2 id={id} className="text-[34px] !font-extrabold uppercase leading-none text-[#f5f1e8] sm:text-[40px]">
        {title}
      </h2>
      {intro && <p className="mt-2 text-[16px] text-[#f5f1e8]/60">{intro}</p>}
    </div>
  );
}

// Sections further down the page talk to the contact form through these window events:
// pick a topic (and go to the form), or just go to the form.
export const CONTACT_TOPIC_EVENT = "nsusc:contact-topic";
export const CONTACT_FOCUS_EVENT = "nsusc:contact-focus";
