import { formatDate } from "@/lib/format";
import { todayInDhaka } from "@/lib/events";
import type { RegistrationSettings } from "@/lib/types";

// Club sign-up state, read from the admin's Registration settings only. Hero,
// Join band and every page's closing CTA use this so they never disagree.
// Signing up is one form; the panel then contacts players about trials, so
// "join the club" and "trials" are one process here. Event registration
// (a tournament's own form) is separate and lives on the event.
export interface ClubRegistration {
  open: boolean;
  formUrl: string | null;
  /** Next intake date, only when it is still ahead of today (Dhaka). */
  nextIntake: string | null;
  /** Short status line, e.g. "Club sign-ups are open". */
  status: string;
  /** One or two sentences explaining what happens next. */
  body: string;
}

export const JOIN_LABEL = "Join the club";

export function clubRegistration(settings: RegistrationSettings, today: string = todayInDhaka()): ClubRegistration {
  const formUrl = settings.isOpen ? settings.googleFormUrl : null;
  const nextIntake = settings.nextIntakeDate && settings.nextIntakeDate >= today ? settings.nextIntakeDate : null;

  if (formUrl) {
    return {
      open: true,
      formUrl,
      nextIntake: null,
      status: "Club sign-ups are open",
      body: "Fill in the sign-up form and the panel will contact you about trials for your sport.",
    };
  }

  return {
    open: false,
    formUrl: null,
    nextIntake,
    status: nextIntake ? `Sign-ups closed · next intake ${formatDate(nextIntake)}` : "Sign-ups are closed",
    body: nextIntake
      ? `Sign-ups are closed for now and reopen ${formatDate(nextIntake)}. Until then, ask the panel about trials for your sport.`
      : "Sign-ups are closed for now. Ask the panel when they reopen or how trials work for your sport.",
  };
}
