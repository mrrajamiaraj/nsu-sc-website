import Link from "next/link";
import { AlertTriangle, CheckCircle2, ChevronRight, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { mapBlogPostRow, mapEventRow, mapRegistrationRow, mapTeamRow } from "@/lib/mappers";
import { todayInDhaka } from "@/lib/events";
import {
  type AttentionCheck,
  checkEmptyBlogPosts,
  checkEmptySquads,
  checkMissingBanner,
  checkRegistrationLink,
  checkResultsMissing,
  checkStaleStatus,
  needsAttentionCount,
  RECENT_DAYS,
} from "@/lib/admin/attention";
import { cn } from "@/lib/utils";

const VISIBLE_ITEMS = 5;

// Runs every check against live data. A failed query marks only its own checks
// as "couldn't check" — never as clear.
async function loadChecks(): Promise<AttentionCheck[]> {
  const supabase = await createClient();
  const today = todayInDhaka();
  const [registration, posts, events, teams, players] = await Promise.all([
    supabase.from("registration_settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("blog_posts").select("*").order("date", { ascending: false }),
    supabase.from("events").select("*").order("date", { ascending: false }),
    supabase.from("teams").select("*").order("name"),
    supabase.from("players").select("team_id"),
  ]);

  const eventList = events.error ? [] : (events.data ?? []).map(mapEventRow);

  return [
    {
      id: "registration",
      title: "Sign-up form link",
      hint: "Sign-ups are open but the link isn't a Google Forms address (docs.google.com/forms/… or forms.gle/…).",
      failed: Boolean(registration.error || !registration.data),
      items: registration.data ? checkRegistrationLink(mapRegistrationRow(registration.data)) : [],
    },
    {
      id: "blog",
      title: "Blog posts with no article text",
      hint: "Add the article body, or delete the post if it was a placeholder.",
      failed: Boolean(posts.error),
      items: posts.error ? [] : checkEmptyBlogPosts((posts.data ?? []).map(mapBlogPostRow)),
    },
    {
      id: "stale-status",
      title: "Events with an out-of-date status",
      hint: "Set the status to Finished (and add results) so the event stops showing as upcoming or live.",
      failed: Boolean(events.error),
      items: checkStaleStatus(eventList, today),
    },
    {
      id: "results",
      title: "Recent events with no results",
      hint: "Add the champions (one category per line) and runners-up. Social events with no winners can be ignored; they drop off this list after 12 months.",
      failed: Boolean(events.error),
      items: checkResultsMissing(eventList, today),
    },
    {
      id: "banner",
      title: "Recent or upcoming events with no banner",
      hint: "Upload the event poster or a photo from the day.",
      failed: Boolean(events.error),
      items: checkMissingBanner(eventList, today),
    },
    {
      id: "squads",
      title: "Squads with no players",
      hint: "Add the roster when the squad is announced. Until then the public page says it's coming soon.",
      failed: Boolean(teams.error || players.error),
      items:
        teams.error || players.error
          ? []
          : checkEmptySquads(
              (teams.data ?? []).map(mapTeamRow),
              new Set((players.data ?? []).map((row) => row.team_id as string)),
            ),
    },
  ];
}

function CheckRow({ check }: { check: AttentionCheck }) {
  const flagged = check.items.length > 0;
  const Icon = check.failed ? XCircle : flagged ? AlertTriangle : CheckCircle2;
  const shown = check.items.slice(0, VISIBLE_ITEMS);
  const hidden = check.items.length - shown.length;

  return (
    <li className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3">
        <Icon
          aria-hidden
          className={cn(
            "mt-0.5 h-5 w-5 shrink-0",
            check.failed ? "text-red-400" : flagged ? "text-amber-300" : "text-emerald-400",
          )}
        />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-baseline gap-x-2 font-semibold text-white">
            {check.title}
            {flagged && <span className="text-sm font-normal text-amber-300">{check.items.length}</span>}
            {!flagged && !check.failed && <span className="text-sm font-normal text-slate-500">All clear</span>}
          </p>

          {check.failed && (
            <p className="mt-1 text-sm text-red-300">Couldn&rsquo;t check this — the data didn&rsquo;t load. Reload to try again.</p>
          )}

          {flagged && (
            <>
              <p className="mt-1 text-sm text-slate-400">{check.hint}</p>
              <ul className="mt-3 space-y-2">
                {shown.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 transition-colors hover:border-blue-400/50 hover:bg-blue-400/10"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-white [overflow-wrap:anywhere]">{item.label}</span>
                        {item.detail && <span className="mt-0.5 block text-xs text-slate-400">{item.detail}</span>}
                      </span>
                      <ChevronRight aria-hidden className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-white" />
                    </Link>
                  </li>
                ))}
              </ul>
              {hidden > 0 && <p className="mt-2 text-xs text-slate-500">…and {hidden} more.</p>}
            </>
          )}
        </div>
      </div>
    </li>
  );
}

// Read-only checklist at the top of the admin home. Nothing here edits content.
export async function NeedsAttention() {
  return <NeedsAttentionPanel checks={await loadChecks()} />;
}

export function NeedsAttentionPanel({ checks }: { checks: AttentionCheck[] }) {
  const count = needsAttentionCount(checks);

  return (
    <section aria-labelledby="needs-attention-title" className="glass-panel p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="needs-attention-title" className="text-xl font-bold text-white">
          Needs attention
        </h2>
        <p className="text-sm text-slate-400">
          {count === 0
            ? "Nothing needs attention."
            : `${count} ${count === 1 ? "check needs" : "checks need"} attention`}
        </p>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Things visitors would see as missing or broken. Events older than {Math.round(RECENT_DAYS / 30)} months
        aren&rsquo;t checked for results or banners.
      </p>

      <ul className="mt-5 divide-y divide-white/10">
        {checks.map((check) => (
          <CheckRow key={check.id} check={check} />
        ))}
      </ul>
    </section>
  );
}
