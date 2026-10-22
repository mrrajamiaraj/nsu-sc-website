"use client";

import { useFormState } from "react-dom";
import { FormField } from "@/components/admin/FormField";
import { Input } from "@/components/admin/Input";
import { Textarea } from "@/components/admin/Textarea";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { EventSeries } from "@/lib/types";

type FormAction = (prevState: { error?: string } | undefined, formData: FormData) => Promise<{ error?: string }>;

export function SeriesForm({ series, action }: { series?: EventSeries; action: FormAction }) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="space-y-5">
      <FormField label="Name" htmlFor="name" hint="The event's name without the season or year, e.g. NSU Basketball League.">
        <Input id="name" name="name" required defaultValue={series?.name} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Abbreviation" htmlFor="abbreviation" hint="Shown large on event cards, e.g. NBL.">
          <Input id="abbreviation" name="abbreviation" required maxLength={8} defaultValue={series?.abbreviation} className="uppercase" />
        </FormField>
        <FormField label="Sport (optional)" htmlFor="sport" hint="Used by the sport filter, e.g. Basketball.">
          <Input id="sport" name="sport" defaultValue={series?.sport ?? ""} />
        </FormField>
      </div>
      <FormField label="Description (optional)" htmlFor="description" hint="Used when a season has no description of its own.">
        <Textarea id="description" name="description" rows={3} defaultValue={series?.description ?? ""} />
      </FormField>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <SubmitButton>{series ? "Save Changes" : "Create Series"}</SubmitButton>
    </form>
  );
}
