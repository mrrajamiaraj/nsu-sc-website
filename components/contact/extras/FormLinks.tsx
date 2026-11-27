"use client";

import type { ReactNode } from "react";
import { CONTACT_FOCUS_EVENT, CONTACT_TOPIC_EVENT } from "@/components/contact/extras/shared";
import type { ContactTopic } from "@/lib/contact";

// A button elsewhere on the page that takes the visitor back up to the form,
// optionally choosing its topic first.
export function ToFormButton({ topic, className, children }: { topic?: ContactTopic; className?: string; children: ReactNode }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() =>
        window.dispatchEvent(topic ? new CustomEvent(CONTACT_TOPIC_EVENT, { detail: topic }) : new CustomEvent(CONTACT_FOCUS_EVENT))
      }
    >
      {children}
    </button>
  );
}
