// Every contact message goes to the one club address; the topic leads the subject
// line so the panel can sort trials, events and partnership mail at a glance.
// Links can preselect one with /contact?topic=<value>.
export const CONTACT_TOPICS = [
  { value: "trials", label: "Squads & trials" },
  { value: "events", label: "Events & registration" },
  { value: "partnership", label: "Partnerships & sponsorships" },
  { value: "other", label: "Other" },
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number]["value"];

// Older links used "general" and "alumni"; both now land on Other.
const RETIRED: Record<string, ContactTopic> = { general: "other", alumni: "other" };

export function parseContactTopic(value: string | string[] | undefined): ContactTopic | null {
  if (typeof value !== "string") return null;
  return CONTACT_TOPICS.find((topic) => topic.value === value)?.value ?? RETIRED[value] ?? null;
}

export function contactTopicLabel(value: string): string {
  return CONTACT_TOPICS.find((topic) => topic.value === value)?.label ?? "Other";
}
