import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { mapSponsorRow } from "@/lib/mappers";
import { Button } from "@/components/ui/Button";
import { SponsorCategoryGroup } from "@/components/admin/sponsors/SponsorCategoryGroup";
import { deleteSponsor, reorderSponsors } from "./actions";
import type { SponsorCategory } from "@/lib/types";

const GROUPS: { category: SponsorCategory; title: string }[] = [
  { category: "Corporate", title: "Corporate Partners" },
  { category: "Media", title: "Media Partners" },
];

export default async function AdminSponsorsPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase.from("sponsors").select("*").order("sort_order").order("name");
  const sponsors = (rows ?? []).map(mapSponsorRow);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sponsors</h1>
          <p className="mt-1 text-sm text-slate-400">
            Drag to reorder — this controls the order on the public About page.
          </p>
        </div>
        <Button href="/admin/dashboard/sponsors/new" size="sm">
          <Plus className="h-4 w-4" />
          Add Sponsor
        </Button>
      </div>

      <div className="mt-8 space-y-8">
        {GROUPS.map(({ category, title }) => (
          <SponsorCategoryGroup
            key={category}
            title={title}
            sponsors={sponsors.filter((s) => s.category === category)}
            onReorder={reorderSponsors.bind(null, category)}
            onDelete={deleteSponsor}
          />
        ))}
      </div>
    </div>
  );
}
