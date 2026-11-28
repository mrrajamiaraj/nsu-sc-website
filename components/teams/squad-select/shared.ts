import type { Gender, Squad } from "@/lib/squads";

// Page-level event: the at-a-glance table asks Squad Select to show a squad, and Squad
// Select announces its selection so the trials band can follow it.
export const SELECT_EVENT = "nsusc:squad-select"; // detail: { sport, gender, scroll? }
export type SelectDetail = { sport: string; gender: Gender; scroll?: boolean; from?: "select" | "table" };

export function selectSquad(detail: SelectDetail) {
  window.dispatchEvent(new CustomEvent<SelectDetail>(SELECT_EVENT, { detail }));
}

// The trials enquiry on the contact form, with this squad already chosen.
export const trialsHref = (squad: Pick<Squad, "teamName"> | null) =>
  `/contact?topic=trials${squad ? `&squad=${encodeURIComponent(squad.teamName)}` : ""}#contact-form`;

// A flat dark tile while a photo loads (no gradient).
export const BLUR = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='9'%3E%3Crect width='16' height='9' fill='%230f302e'/%3E%3C/svg%3E";

export const EASE = [0.25, 0.7, 0.3, 1] as const;
