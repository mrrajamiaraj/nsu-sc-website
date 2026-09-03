import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { mapAlumniClassYearRow } from "@/lib/mappers";
import { Button } from "@/components/ui/Button";
import { ClassYearList } from "@/components/admin/alumni/ClassYearList";
import { deleteClassYear, reorderClassYears } from "../actions";

export default async function ClassYearsPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase.from("alumni_class_years").select("*").order("sort_order");
  const classYears = (rows ?? []).map(mapAlumniClassYearRow);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Alumni Class Years</h1>
          <p className="mt-1 text-sm text-slate-400">
            Drag to reorder — this controls the filter pills and section order on the public Alumni page.
          </p>
        </div>
        <Button href="/admin/dashboard/alumni/class-years/new" size="sm">
          <Plus className="h-4 w-4" />
          Add Year
        </Button>
      </div>

      <div className="mt-6">
        {classYears.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center text-sm text-slate-500">
            No class years yet.
          </p>
        ) : (
          <ClassYearList classYears={classYears} onReorder={reorderClassYears} onDelete={deleteClassYear} />
        )}
      </div>
    </div>
  );
}
