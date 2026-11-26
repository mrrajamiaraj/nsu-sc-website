// Every contact message goes to the one club address; the topic leads the subject
// line so the panel can sort partnership, trials and alumni mail at a glance.
// Links can preselect one with /contact?topic=<value>.
export const CONTACT_TOPICS = [
  { value: "general", label: "General question" },
  { value: "trials", label: "Trials and joining a squad" },
  { value: "events", label: "Events and fixtures" },
  { value: "partnership", label: "Partnership or sponsorship" },
  { value: "alumni", label: "Alumni and past panels" },
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number]["value"];

export function parseContactTopic(value: string | string[] | undefined): ContactTopic {
  return CONTACT_TOPICS.find((topic) => topic.value === value)?.value ?? "general";
}

export function contactTopicLabel(value: string): string {
  return CONTACT_TOPICS.find((topic) => topic.value === value)?.label ?? CONTACT_TOPICS[0].label;
}
