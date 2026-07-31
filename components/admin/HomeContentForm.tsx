"use client";

import { useFormState } from "react-dom";
import { FormField } from "@/components/admin/FormField";
import { Input } from "@/components/admin/Input";
import { Select } from "@/components/admin/Select";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { Event } from "@/lib/types";

type FormAction = (
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
) => Promise<{ error?: string; success?: boolean }>;

export function HomeContentForm({
  tagline,
  featuredEventId,
  events,
  action,
}: {
  tagline: string;
  featuredEventId: string | null;
  events: Event[];
  action: FormAction;
}) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="space-y-5">
      <FormField label="Tagline" htmlFor="tagline">
        <Input id="tagline" name="tagline" required defaultValue={tagline} />
      </FormField>
      <FormField label="Featured Event" htmlFor="featuredEventId">
        <Select id="featuredEventId" name="featuredEventId" defaultValue={featuredEventId ?? ""}>
          <option value="">None</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </Select>
      </FormField>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-400">Saved.</p>}

      <SubmitButton>Save Changes</SubmitButton>
    </form>
  );
}
