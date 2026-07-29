// Hand-authored mock data standing in for the Supabase tables (SRS.md §6).
// Shapes match the real schema 1:1 so lib/data/*.ts can swap its source without
// touching any component.

import type { Event, Member, Panel, RegistrationSettings, SiteContent, Team } from "./types";

export const mockEvents: Event[] = [
  {
    id: "evt-1",
    name: "Inter-Department Football Cup",
    date: "2026-08-15",
    venue: "NSU Football Ground",
    description:
      "The flagship inter-department football tournament returns with 12 teams competing for the cup. Group stages begin Friday, finals on Sunday.",
    bannerImage: null,
    status: "Upcoming",
  },
  {
    id: "evt-2",
    name: "Summer Badminton Open",
    date: "2026-07-29",
    venue: "NSU Indoor Sports Complex",
    description:
      "Singles and doubles brackets open to all NSU SC members. Sign-ups close two days before the first match.",
    bannerImage: null,
    status: "Running",
  },
  {
    id: "evt-3",
    name: "Cricket Premier League — Season 4",
    date: "2026-06-02",
    venue: "NSU Cricket Ground",
    description:
      "A six-team T10 league that ran across three weekends. Congratulations to the Falcons on a clean sweep in the final.",
    bannerImage: null,
    status: "Finished",
  },
  {
    id: "evt-4",
    name: "Handball Freshers Cup",
    date: "2026-05-10",
    venue: "NSU Indoor Sports Complex",
    description: "First-year students faced off in a friendly handball tournament to kick off the season.",
    bannerImage: null,
    status: "Finished",
  },
];

export const mockTeams: Team[] = [
  { id: "team-1", name: "Football", description: "NSU SC's largest and most competitive squad." },
  { id: "team-2", name: "Cricket", description: "Home ground champions, three-time league winners." },
  { id: "team-3", name: "Handball", description: "Fast-growing team with a strong freshers pipeline." },
];

export const mockPanel: Panel = { id: "panel-2025-26", name: "Panel 2025-26", isActive: true };

export const mockMembers: Member[] = [
  {
    id: "mem-1",
    panelId: "panel-2025-26",
    name: "Ariana Rahman",
    photo: null,
    designation: "President",
    tier: "Executive",
    email: "ariana.rahman@nsusc.org",
    phone: "+880 1711-000001",
    additionalInfo: null,
    sortOrder: 1,
  },
  {
    id: "mem-2",
    panelId: "panel-2025-26",
    name: "Tanvir Ahmed",
    photo: null,
    designation: "General Secretary",
    tier: "Executive",
    email: "tanvir.ahmed@nsusc.org",
    phone: "+880 1711-000002",
    additionalInfo: null,
    sortOrder: 2,
  },
  {
    id: "mem-3",
    panelId: "panel-2025-26",
    name: "Farhan Kabir",
    photo: null,
    designation: "Sports Secretary",
    tier: "Sub-Executive",
    email: "farhan.kabir@nsusc.org",
    phone: "+880 1711-000003",
    additionalInfo: null,
    sortOrder: 1,
  },
];

export const mockRegistrationSettings: RegistrationSettings = {
  isOpen: true,
  googleFormUrl: "https://forms.google.com/nsusc-membership",
  nextIntakeDate: null,
};

export const mockSiteContent: SiteContent[] = [
  {
    pageKey: "home_tagline",
    content: "One club, every sport — compete, connect, and represent NSU.",
    featuredEventId: null,
  },
  {
    pageKey: "home_featured_event",
    content: "",
    featuredEventId: "evt-1",
  },
];
