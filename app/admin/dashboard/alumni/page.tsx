import Image from "next/image";
import Link from "next/link";
import { Plus, Pencil, Settings, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { mapAlumniClassYearRow, mapAlumniRow } from "@/lib/mappers";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { Button } from "@/components/ui/Button";
import { deleteAlumni } from "./actions";
import type { AlumniProfile } from "@/lib/types";

const TIERS: AlumniProfile["tier"][] = ["Executive", "Sub-Executive"];

function AlumnusRow({ alumnus }: { alumnus: AlumniProfile }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white/10">
          {alumnus.photo ? (
            <Image src={alumnus.photo} alt={alumnus.name} fill sizes="40px" className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-300">
              {alumnus.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{alumnus.name}</p>
          <p className="truncate text-xs text-slate-500">
            {alumnus.team} · {alumnus.currentRole}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Link
          href={`/admin/dashboard/alumni/${alumnus.id}/edit`}
          className="rounded-full border border-white/15 bg-white/5 p-2 text-slate-300 hover:bg-white/10"
          aria-label={`Edit ${alumnus.name}`}
        >
          <Pencil className="h-4 w-4" />
        </Link>
        <ConfirmDeleteButton action={deleteAlumni.bind(null, alumnus.id)} itemLabel={alumnus.name} />
      </div>
    </div>
  );
}

export default async function AdminAlumniPage() {
  const supabase = await createClient();
  const [{ data: yearRows }, { data: alumniRows }] = await Promise.all([
    supabase.from("alumni_class_years").select("*").order("sort_order"),
    supabase.from("alumni").select("*, alumni_class_years(label)").order("name"),
  ]);
  const classYears = (yearRows ?? []).map(mapAlumniClassYearRow);
  const alumni = (alumniRows ?? []).map(mapAlumniRow);

  const groups = classYears.map((year) => ({
    year,
    alumni: alumni.filter((a) => a.classYearId === year.id),
  }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Alumni</h1>
          <p className="mt-1 text-sm text-slate-400">
            {alumni.length} alumni across {classYears.length} class years
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/dashboard/alumni/class-years"
            className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
          >
            <Settings className="h-4 w-4" />
            Manage Class Years
          </Link>
          <Button href="/admin/dashboard/alumni/new" size="sm">
            <Plus className="h-4 w-4" />
            Add Alumnus
          </Button>
        </div>
      </div>

      {classYears.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-6 text-sm text-amber-300">
          No class years exist yet.{" "}
          <Link href="/admin/dashboard/alumni/class-years/new" className="underline">
            Add one
          </Link>{" "}
          before adding alumni.
        </p>
      ) : (
        <>
          <nav className="mt-6 flex flex-wrap gap-2" aria-label="Jump to class year">
            {groups.map(({ year, alumni: yearAlumni }) => (
              <a
                key={year.id}
                href={`#year-${year.id}`}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-300 hover:bg-white/10"
              >
                {year.label} <span className="text-slate-500">({yearAlumni.length})</span>
              </a>
            ))}
          </nav>

          <div className="mt-6 space-y-4">
            {groups.map(({ year, alumni: yearAlumni }) => (
              <details
                key={year.id}
                id={`year-${year.id}`}
                open
                className="group scroll-mt-24 rounded-2xl border border-white/10 bg-white/[0.02]"
              >
                <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden">
                  <div className="flex items-center gap-3">
                    <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
                    <h2 className="text-lg font-semibold text-white">Class of {year.label}</h2>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-300">
                      {yearAlumni.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/dashboard/alumni/class-years/${year.id}/edit`}
                      className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Rename
                    </Link>
                    <Link
                      href={`/admin/dashboard/alumni/new?classYear=${year.id}`}
                      className="flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-xs text-amber-200 hover:bg-amber-300/20"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add to {year.label}
                    </Link>
                  </div>
                </summary>

                <div className="space-y-5 border-t border-white/10 p-4">
                  {yearAlumni.length === 0 ? (
                    <p className="text-center text-sm text-slate-500">No alumni in this class year yet.</p>
                  ) : (
                    TIERS.map((tier) => {
                      const tierAlumni = yearAlumni.filter((a) => a.tier === tier);
                      if (tierAlumni.length === 0) return null;
                      return (
                        <div key={tier}>
                          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            {tier} <span className="text-slate-600">({tierAlumni.length})</span>
                          </h3>
                          <div className="grid gap-2 lg:grid-cols-2">
                            {tierAlumni.map((alumnus) => (
                              <AlumnusRow key={alumnus.id} alumnus={alumnus} />
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </details>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
