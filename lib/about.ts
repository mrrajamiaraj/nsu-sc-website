import { FOUNDED } from "@/lib/gazette";
import { firstName } from "@/lib/contact-directory";
import { titleCase } from "@/lib/matchday";
import { entryPath, trophyEntries } from "@/lib/trophy";
import type { Achievement, Event, Member, MemberTier, Sponsor, Team } from "@/lib/types";

// Plain data for the About page ("The long game"), built on the server from the club's
// own records. Nothing here is invented; the few unknowns are flagged as placeholders.

export const CREST = "/images/branding/nsu-sc-logo.png";

// ---- Hero tiles: one photo per sport and squad

export interface HeroTile {
  src: string;
  caption: string;
}

const sportOf = (teamName: string) => teamName.replace(/\s+(Male|Female)$/i, "").trim();
const sideOf = (teamName: string) => (/Female$/i.test(teamName) ? "women's" : /Male$/i.test(teamName) ? "men's" : "");

export function heroTiles(teams: Team[], events: Event[]): HeroTile[] {
  const tiles: HeroTile[] = [];
  for (const team of teams) {
    if (team.bannerImage) tiles.push({ src: team.bannerImage, caption: `${sportOf(team.name)} · ${sideOf(team.name) || "squad"}${sideOf(team.name) ? " squad" : ""}` });
  }
  // Sports with no squad photo: the latest event photo for that sport, captioned with the event.
  const covered = new Set(teams.filter((t) => t.bannerImage).map((t) => sportOf(t.name).toLowerCase()));
  const missing = Array.from(new Set(teams.map((t) => sportOf(t.name)))).filter((sport) => !covered.has(sport.toLowerCase()));
  const byNewest = [...events].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  const shuttle = /badminton/i;
  for (const sport of missing) {
    const pattern = shuttle.test(sport) ? /badminton|shuttle/i : new RegExp(sport, "i");
    const event = byNewest.find((e) => pattern.test(e.name) && e.gallery.length > 0);
    if (event) tiles.push({ src: event.gallery[0], caption: `${sport} · ${event.name}` });
  }
  // Top up to nine with photos from the newest events.
  for (const event of byNewest) {
    if (tiles.length >= 9) break;
    if (event.gallery[1] && !tiles.some((t) => t.src === event.gallery[1])) tiles.push({ src: event.gallery[1], caption: event.name });
  }
  return tiles.slice(0, 9);
}

// ---- Scoreboard

export interface ScoreStat {
  value: number;
  label: string;
  detail: string;
}

export function scoreboard(teams: Team[], members: Member[], events: Event[], year: number, panelName: string | null): ScoreStat[] {
  const sports = Array.from(new Set(teams.map((t) => sportOf(t.name).toLowerCase())));
  const years = events.map((e) => e.date?.slice(0, 4)).filter(Boolean).sort() as string[];
  const list = (items: string[]) => (items.length > 1 ? `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}` : items[0] ?? "");
  return [
    { value: year - FOUNDED, label: "Seasons", detail: `Playing since ${FOUNDED}.` },
    { value: teams.length, label: "Squads", detail: `Men's and women's ${list(sports)}.` },
    { value: members.length, label: "Panel members", detail: `${panelName ?? "The current panel"}, including the faculty advisor.` },
    { value: events.length, label: "Events on record", detail: years.length ? `From ${years[0]} to ${years[years.length - 1]}, on the events page.` : "On the events page." },
  ];
}

// ---- Timeline

export interface Milestone {
  key: string;
  year: string;
  title: string;
  story: string; // two lines on the track
  full: string[]; // the full write-up, for the drawer
  photo: string | null;
  photos: string[];
  href: string | null;
  linkLabel: string;
  placeholder?: string; // shown as [placeholder] after the story
}

const paragraphs = (text: string) =>
  text
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);

export function milestones(events: Event[], achievements: Achievement[]): Milestone[] {
  const event = (name: string) => events.find((e) => e.name === name);
  const achievement = (id: string) => achievements.find((a) => a.id === id);
  const paths = new Map(trophyEntries(achievements).map((e) => [e.id, entryPath(e)]));
  const out: Milestone[] = [];

  out.push({
    key: "founded",
    year: String(FOUNDED),
    title: "The club is founded",
    story: "NSU Games & Sports Club starts at North South University.",
    full: ["NSU Games & Sports Club starts at North South University."],
    photo: CREST,
    photos: [],
    href: null,
    linkLabel: "",
    placeholder: "founding students",
  });

  const hatTrick = achievement("f7611e8d-6850-4319-897d-2b10ce9c60bf");
  if (hatTrick)
    out.push({
      key: "hat-trick",
      year: "1997",
      title: "Batch '96 hat-trick",
      story: "Batch '96 win the Intra NSU Football Tournament for a third straight time.",
      full: paragraphs(hatTrick.description),
      photo: hatTrick.photo,
      photos: [hatTrick.photo, ...hatTrick.gallery].filter(Boolean) as string[],
      href: paths.get(hatTrick.id) ?? `/achievements/${hatTrick.id}`,
      linkLabel: "Read the full story",
    });

  const early = events.filter((e) => e.date?.startsWith("2012"));
  const carnival = event("Club Carnival 2012");
  if (early.length > 0)
    out.push({
      key: "2012",
      year: "2012",
      title: "The first events on record",
      story: "Club Carnival 2012 and intra-NSU cricket, football and table tennis tournaments.",
      full: carnival ? paragraphs(carnival.description) : [],
      photo: early.flatMap((e) => e.gallery)[0] ?? null,
      photos: early.flatMap((e) => e.gallery).slice(0, 8),
      href: carnival ? `/events/${carnival.id}` : "/events",
      linkLabel: "See the event",
    });

  const ulab = achievement("d66e0ea9-6e28-40e8-b1cc-72a34707abf4");
  if (ulab)
    out.push({
      key: "ulab",
      year: "2013",
      title: "ULAB Fair Play Cup champions",
      story: "NSU win the 6th ULAB Fair Play Cup, an inter-private university cricket tournament.",
      full: paragraphs(ulab.description),
      photo: ulab.photo,
      photos: [ulab.photo, ...ulab.gallery].filter(Boolean) as string[],
      href: paths.get(ulab.id) ?? `/achievements/${ulab.id}`,
      linkLabel: "Read the full story",
    });

  const biusc = event("Bangabandhu Inter University Sports Championship '22");
  if (biusc)
    out.push({
      key: "biusc",
      year: "2022",
      title: "On the national stage",
      story: "NSU's multi-sport contingent competes at the Bangabandhu Inter University Sports Championship.",
      full: paragraphs(biusc.description),
      photo: biusc.gallery[0] ?? biusc.bannerImage,
      photos: biusc.gallery.slice(0, 8),
      href: `/events/${biusc.id}`,
      linkLabel: "See the event",
    });

  const carnival2 = event("NSUSC Sports Carnival Season 02");
  if (carnival2)
    out.push({
      key: "carnival-2",
      year: "2023",
      title: "Hosting the Sports Carnival",
      story: "NSU hosts the Inter University Sports Carnival Season 2, with athletes from over 70 universities.",
      full: paragraphs(carnival2.description),
      photo: carnival2.gallery[0] ?? carnival2.bannerImage,
      photos: carnival2.gallery.slice(0, 8),
      href: `/events/${carnival2.id}`,
      linkLabel: "See the event",
    });

  const mridul = achievement("382c49a4-67c5-4ae2-9453-2503a29aa1a2");
  if (mridul)
    out.push({
      key: "mridul",
      year: "2026",
      title: "Champion & Best Player",
      story: "Kazi Ibrahim Ahamed Mridul is Champion & Best Player of Futsal League Bangladesh.",
      full: paragraphs(mridul.description),
      photo: mridul.photo,
      photos: [mridul.photo, ...mridul.gallery].filter(Boolean) as string[],
      href: paths.get(mridul.id) ?? `/achievements/${mridul.id}`,
      linkLabel: "Read the full story",
    });

  const chess = event("NSU Chess & Carrom 2026");
  if (chess)
    out.push({
      key: "chess",
      year: "2026",
      title: "Chess & Carrom, Season 2",
      story: "Chess & Carrom returns for a second season at NSU Main Plaza.",
      full: paragraphs(chess.description),
      photo: chess.bannerImage ?? chess.gallery[0] ?? null,
      photos: [chess.bannerImage, ...chess.gallery].filter(Boolean) as string[],
      href: `/events/${chess.id}`,
      linkLabel: "See the event",
    });

  return out;
}

// ---- What we stand for: a real club photo for each statement

export function statementPhotos(events: Event[]): (string | null)[] {
  const photo = (name: string) => events.find((e) => e.name === name)?.gallery[0] ?? null;
  return [photo("NSUSC Sports Carnival Season 02"), photo("Abir Memorial Football Tournament 2025"), photo("Bangabandhu Inter University Sports Championship '22")];
}

// ---- The panel

export interface PanelPerson {
  id: string;
  name: string;
  firstName: string;
  role: string;
  tier: MemberTier;
  photo: string | null;
  email: string | null;
  linkedin: string | null;
  facebook: string | null;
}

const TIER_ORDER: Record<MemberTier, number> = { Executive: 0, "Faculty Advisor": 1, "Sub-Executive": 2, General: 3 };
const rank = (m: Member) => (/^president$/i.test(m.designation ?? "") ? 0 : /general secretary/i.test(m.designation ?? "") ? 1 : 2);

export function panelPeople(members: Member[]): PanelPerson[] {
  return [...members]
    .sort((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier] || rank(a) - rank(b) || a.sortOrder - b.sortOrder)
    .map((m) => ({
      id: m.id,
      name: titleCase(m.name),
      firstName: firstName(m.name),
      role: m.designation ? titleCase(m.designation) : m.tier,
      tier: m.tier,
      photo: m.photo,
      email: m.email,
      linkedin: m.linkedin,
      facebook: m.facebook,
    }));
}

// ---- Partners: the sponsor list without the placeholder "Partner" row.

export interface PartnerLogo {
  id: string;
  name: string;
  src: string;
  /** Optical size, 0.8–1.3. When unset the page balances the logo from its proportions. */
  scale?: number;
  url?: string;
  since?: string;
  event?: string;
}

// Manual size overrides by organisation name, for any logo the automatic balancing gets wrong.
// These files carry a lot of empty space around the mark, so they read small on a plate.
const LOGO_SCALE: Record<string, number> = {
  Yamaha: 1.3,
  Clemon: 1.3,
  "East West Medical College & Hospital": 1.3,
  "Bashundhara Kings": 1.2,
  "Dhaka Bank PLC": 1.2,
  "Radio Today 89.6 FM": 1.2,
  "Daily NSU": 1.25,
  "The Daily Janakantha": 1.3,
  News24: 1.3,
};

export function partnerRows(sponsors: Sponsor[]) {
  const toLogo = (s: Sponsor): PartnerLogo => ({ id: s.id, name: s.name, src: s.logo!, scale: LOGO_SCALE[s.name] });
  const real = sponsors.filter((s) => s.logo && s.name.trim().toLowerCase() !== "partner");
  return {
    corporate: real.filter((s) => s.category === "Corporate").map(toLogo),
    media: real.filter((s) => s.category === "Media").map(toLogo),
  };
}
