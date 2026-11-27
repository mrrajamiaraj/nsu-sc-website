import { eventResults } from "@/lib/events";
import { titleCase } from "@/lib/matchday";
import type { Event } from "@/lib/types";

// Data for the homepage "Gazette" (blog) section.

// The club was founded in 1995 (confirmed 2026-11-27); the paper's volume is its age in years.
export const FOUNDED = 1995;

export interface ScoreLine {
  id: string;
  event: string;
  result: string; // "Chess: Ragib Arif Sharar"
}

// The scoreboard brief: one line per recent finished event that has a published winner.
export function scoreLines(finished: Event[], limit = 3): ScoreLine[] {
  const lines: ScoreLine[] = [];
  for (const event of finished) {
    const rows = eventResults(event).filter((row) => row.places.winners.length > 0);
    if (rows.length === 0) continue;
    // An individual title (chess, singles) reads best; otherwise the first category.
    const row = rows.find((r) => r.category && !/doubles|double|pair|team|mix/i.test(r.category)) ?? rows[0];
    const category = row.category ? `${titleCase(row.category)}: ` : "";
    lines.push({ id: event.id, event: event.name, result: `${category}${row.places.winners.map(titleCase).join(", ")}` });
    if (lines.length === limit) break;
  }
  return lines;
}

// The article's opening paragraph as plain text (Markdown marks removed), or null when the
// post has no body yet.
export function leadParagraph(content: string): string | null {
  const first = content
    .split(/\r?\n\s*\r?\n/)
    .map((block) => block.trim())
    .find((block) => block && !block.startsWith("#") && !block.startsWith("!["));
  if (!first) return null;
  return first
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
