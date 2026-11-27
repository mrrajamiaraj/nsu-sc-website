import type { Achievement } from "@/lib/types";

// Data for the homepage championship banners (a client component), built on the server.

export interface Honour {
  id: string;
  year: number | null;
  sport: string; // "Football", "Club"
  line: string; // the banner's honour line: "Champion & best player"
  detail: string; // competition and/or who: "Futsal League Bangladesh · Kazi Ibrahim Ahamed Mridul"
  individual: boolean; // a player's honour (styled apart from team honours)
  headline: string; // the achievement's full title, for the story panel
  story: string[]; // the full write-up, as paragraphs
  photo: string | null;
  href: string;
}

const CLUB = "NSU Games & Sports Club";

// Banner lettering for honours whose full titles read as headlines. Achievements have no
// separate short-line, competition, honouree or sport fields yet, so these are kept here by
// id; anything not listed falls back to its own title and team below.
const LETTERING: Record<string, Pick<Honour, "sport" | "line" | "detail" | "individual">> = {
  "382c49a4-67c5-4ae2-9453-2503a29aa1a2": {
    sport: "Futsal",
    line: "Champion & best player",
    detail: "Futsal League Bangladesh · Kazi Ibrahim Ahamed Mridul",
    individual: true,
  },
  "d09cef27-371e-4b86-a6a5-d493b57891db": { sport: "Club", line: "Club milestone", detail: CLUB, individual: false },
  "d66e0ea9-6e28-40e8-b1cc-72a34707abf4": { sport: "Football", line: "Champions", detail: "ULAB Fair Play Cup", individual: false },
  "f7611e8d-6850-4319-897d-2b10ce9c60bf": {
    sport: "Football",
    line: "Hat-trick champions",
    detail: "Intra NSU Football · Batch '96",
    individual: false,
  },
};

// "Football Male" -> "Football"
function sportOf(teamName: string): string {
  return teamName.replace(/\s+(Male|Female)$/i, "") || "Club";
}

function fallback(item: Achievement): Pick<Honour, "sport" | "line" | "detail" | "individual"> {
  // "Name: What they won" titles carry the honouree up front.
  const named = item.title.match(/^([^:]{3,60}):\s+(.+)$/);
  return {
    sport: item.teamName ? sportOf(item.teamName) : "Club",
    line: (named ? named[2] : item.title).replace(/!+$/, ""),
    detail: named ? named[1] : item.teamName || CLUB,
    individual: Boolean(named),
  };
}

// Newest first; undated honours last.
export function honourBanners(items: Achievement[]): Honour[] {
  return items
    .map((item) => ({
      id: item.id,
      year: item.date ? Number(item.date.slice(0, 4)) : null,
      ...(LETTERING[item.id] ?? fallback(item)),
      headline: item.title,
      story: item.description
        .split(/\r?\n\s*\r?\n/)
        .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
        .filter(Boolean),
      photo: item.photo,
      href: `/achievements/${item.id}`,
    }))
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
}
