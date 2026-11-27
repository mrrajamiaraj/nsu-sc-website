// Contact page details the club hasn't confirmed yet. Every `null` renders as a visible
// [placeholder] on the page (search the code for <Ph> to find them). Fill a value in here
// and the placeholder disappears; nothing on the page invents these.

export interface SocialAccount {
  label: string;
  url: string | null; // the club's own account, e.g. https://www.facebook.com/<club page>
  hint: string; // what the placeholder shows until the URL is known
  followers: string | null; // e.g. "12.4k followers"
}

export const CONTACT_EXTRAS = {
  // Visit us in person
  clubRoom: null as string | null, // "Building name, Room number"
  dropInHours: null as string | null, // "Sun–Thu, 12:00 PM – 4:00 PM"
  visitPhoto: null as string | null, // photo of the club room or sports complex entrance

  // Trials & joining
  trialsDate: null as string | null, // ISO date (YYYY-MM-DD) of the next open trials; turns on the countdown
  membershipFee: null as string | null, // "Free" or an amount

  // Small print under the form
  replyTime: null as string | null, // "24–48 hours"
  matchdayPhone: null as string | null,

  // Partner with us
  studentReach: null as string | null, // "5,000"
  sponsorDeckUrl: null as string | null, // PDF

  // Hero reply indicator: average reply time over the last 30 days, e.g. "6 hours".
  averageReplyTime: null as string | null,

  // Hours by day, Sunday first ("7:30 AM – 10:00 PM" or "Closed"). Until every day is
  // confirmed the table shows placeholders and no open/closed status.
  weeklyHours: null as string[] | null,
  // The same seven days as [opening, closing] in Dhaka, 24h ("07:30", "22:00"); null = closed.
  weeklyTimes: null as ([string, string] | null)[] | null,

  // Visit us: the walk from the gate to the club room, in order, and photos along the way.
  routeSteps: [null, null, null] as (string | null)[],
  routePhotos: [null, null, null, null] as (string | null)[],

  // Next trial date per squad (sport name as on the roster -> ISO date), for the schedule panel.
  trialDates: {} as Record<string, string>,

  // Small preview of the latest Instagram posts (image URLs), shown on hover once the account is set.
  instagramPreview: null as string[] | null,

  // Follow the club: the club's own accounts (the footer uses these too).
  socials: [
    { label: "Facebook", url: null, hint: "facebook.com/…", followers: null },
    { label: "Instagram", url: null, hint: "instagram.com/…", followers: null },
    { label: "YouTube", url: null, hint: "youtube.com/@…", followers: null },
    { label: "LinkedIn", url: null, hint: "linkedin.com/company/…", followers: null },
  ] as SocialAccount[],
};

// North South University campus, Bashundhara, for the map. Approximate centre of campus.
export const CAMPUS_POINT = { lat: 23.8151, lon: 90.4256 };

// Topics a directory row can be filtered by.
export const DIRECTORY_FILTERS = ["trials", "events", "partnerships", "media", "squads"] as const;
export type DirectoryTopic = (typeof DIRECTORY_FILTERS)[number];

export const DIRECTORY_LABELS: Record<DirectoryTopic, string> = {
  trials: "Trials",
  events: "Events",
  partnerships: "Partnerships",
  media: "Media",
  squads: "Squads",
};

// Directory roles and how to find their holder on the active panel (by designation).
export const DIRECTORY_ROLES: { role: string; match: RegExp | null; topics: DirectoryTopic[] }[] = [
  { role: "President", match: /^president$/i, topics: [] },
  { role: "General Secretary", match: /general secretary/i, topics: [] },
  { role: "Events & Tournaments", match: /event|tournament/i, topics: ["events"] },
  { role: "Trials & Squad Selection", match: /trial|selection/i, topics: ["trials", "squads"] },
  { role: "Partnerships & Sponsorship", match: /partner|sponsor/i, topics: ["partnerships"] },
  { role: "Media & Photography", match: /media|photo/i, topics: ["media"] },
];
