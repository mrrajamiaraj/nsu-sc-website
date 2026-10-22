import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Shield, Trophy } from "lucide-react";
import { PlayerGrid, RosterFilterView } from "@/components/teams/RosterFilterView";
import { Reveal } from "@/components/motion/Reveal";
import { MemberCard } from "@/components/members/MemberCard";
import { getPlayersByTeam, getTeamById, getTeamStaff, getTeams } from "@/lib/data/teams";
import { countAthletes, findPlayerByRole } from "@/lib/roster";
import type { Member } from "@/lib/types";

export async function generateStaticParams() {
  const teams = await getTeams();
  return teams.map((team) => ({ teamId: team.id }));
}

export async function generateMetadata({ params }: { params: { teamId: string } }): Promise<Metadata> {
  const team = await getTeamById(params.teamId);
  return { title: team?.name ?? "Team" };
}

function RosterHeading({ children }: { children: string }) {
  return (
    <Reveal>
      <h2 className="mb-6 text-2xl font-bold text-white sm:text-3xl">{children}</h2>
    </Reveal>
  );
}

// The section heading names the role, so the cards don't repeat it as a badge.
function StaffSection({ title, members }: { title: string; members: Member[] }) {
  return (
    <section>
      <RosterHeading>{title}</RosterHeading>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member, index) => (
          <Reveal key={member.id} delay={index * 0.08} className="h-full">
            <MemberCard member={member} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export default async function TeamDetailPage({ params }: { params: { teamId: string } }) {
  const team = await getTeamById(params.teamId);
  if (!team) notFound();

  const [players, staff] = await Promise.all([getPlayersByTeam(team.id), getTeamStaff(team.id)]);
  // Prefer the Executive(s) assigned as manager; fall back to a player tagged "Manager".
  const manager = staff.managers.map((member) => member.name).join(", ") || findPlayerByRole(players, "manager");
  const athletes = countAthletes(players);
  const facts = [
    { label: "Coach", value: findPlayerByRole(players, "coach") },
    { label: "Team manager", value: manager },
    { label: "Captain", value: findPlayerByRole(players, "captain") },
    { label: "Athletes", value: athletes > 0 ? String(athletes) : null },
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact.value));
  // Mixed teams (players tagged with both genders) get the Men/Women tabs;
  // single-gender teams like "Football Male" keep the plain grid.
  const isMixedTeam =
    players.some((player) => player.gender === "Male") && players.some((player) => player.gender === "Female");
  const hasRoster = players.length > 0 || staff.managers.length > 0 || staff.inCharges.length > 0;

  return (
    <>
      <div className="px-4 pb-6 pt-4">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/teams"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            All teams
          </Link>
        </div>
      </div>

      <div className="px-4 pb-16">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl sm:aspect-[21/9]">
              {team.bannerImage ? (
                <Image src={team.bannerImage} alt={team.name} fill sizes="(min-width: 1152px) 1152px, 100vw" className="object-cover" priority />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-brand-gradient">
                  <Shield className="h-14 w-14 text-night-950/40" strokeWidth={1.5} />
                </div>
              )}
            </div>
          </Reveal>

          <div className="mt-10 grid gap-10 lg:grid-cols-5">
            <Reveal className="lg:col-span-3">
              <h1 className="text-4xl font-extrabold leading-[0.95] text-white sm:text-6xl">{team.name}</h1>
              {team.nickname && team.nickname !== team.name && (
                <p className="mt-2 text-lg text-slate-400">{team.nickname}</p>
              )}
              {team.achievement && (
                <p className="mt-4 flex items-start gap-2 font-medium text-blue-400">
                  <Trophy className="mt-1 h-4 w-4 shrink-0" />
                  {team.achievement}
                </p>
              )}
              {team.description && (
                <p className="mt-6 max-w-[68ch] whitespace-pre-line leading-relaxed text-slate-300">{team.description}</p>
              )}
            </Reveal>

            {facts.length > 0 && (
              <Reveal delay={0.1} className="lg:col-span-2">
                <dl className="glass-panel divide-y divide-white/10 px-6 py-2">
                  {facts.map((fact) => (
                    <div key={fact.label} className="flex items-baseline justify-between gap-4 py-3">
                      <dt className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-slate-500">
                        {fact.label}
                      </dt>
                      <dd className="text-right font-medium text-white">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pb-20">
        <div className="mx-auto max-w-6xl space-y-14">
          {staff.managers.length > 0 && <StaffSection title="Team manager" members={staff.managers} />}
          {staff.inCharges.length > 0 && <StaffSection title="Team in-charges" members={staff.inCharges} />}

          {players.length > 0 && (
            <section>
              <RosterHeading>Players</RosterHeading>
              {isMixedTeam ? <RosterFilterView players={players} /> : <PlayerGrid players={players} />}
            </section>
          )}

          {!hasRoster && (
            <div className="glass-panel mx-auto max-w-xl p-8 text-center">
              <h2 className="text-xl font-bold text-white">The roster isn&rsquo;t up yet</h2>
              <p className="mt-2 text-sm text-slate-400">
                Players will be listed here once the squad is announced. Want to try out?{" "}
                <Link href="/contact" className="font-medium text-blue-400 hover:text-blue-300">
                  Ask the panel
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
