"use client";

import { useFormState } from "react-dom";
import { FormField } from "@/components/admin/FormField";
import { Input } from "@/components/admin/Input";
import { Textarea } from "@/components/admin/Textarea";
import { Select } from "@/components/admin/Select";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { Event } from "@/lib/types";

type FormAction = (prevState: { error?: string } | undefined, formData: FormData) => Promise<{ error?: string }>;

export function EventForm({ event, action }: { event?: Event; action: FormAction }) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="space-y-5">
      <FormField label="Name" htmlFor="name">
        <Input id="name" name="name" required defaultValue={event?.name} />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Date" htmlFor="date">
          <Input id="date" name="date" type="date" required defaultValue={event?.date} />
        </FormField>
        <FormField label="End Date (optional)" htmlFor="endDate">
          <Input id="endDate" name="endDate" type="date" defaultValue={event?.endDate ?? ""} />
        </FormField>
      </div>

      <FormField label="Venue" htmlFor="venue">
        <Input id="venue" name="venue" required defaultValue={event?.venue} />
      </FormField>

      <FormField label="Description" htmlFor="description">
        <Textarea id="description" name="description" rows={4} required defaultValue={event?.description} />
      </FormField>

      <FormField label="Status" htmlFor="status">
        <Select id="status" name="status" defaultValue={event?.status ?? "Upcoming"}>
          <option value="Upcoming">Upcoming</option>
          <option value="Running">Running</option>
          <option value="Finished">Finished</option>
        </Select>
      </FormField>

      <ImageUploader name="bannerImage" label="Banner Image" existingUrl={event?.bannerImage} />

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Team Count (optional)" htmlFor="teamCount">
          <Input id="teamCount" name="teamCount" type="number" min={0} defaultValue={event?.teamCount ?? ""} />
        </FormField>
        <FormField label="Participant Count (optional)" htmlFor="participantCount">
          <Input
            id="participantCount"
            name="participantCount"
            type="number"
            min={0}
            defaultValue={event?.participantCount ?? ""}
          />
        </FormField>
      </div>

      <FormField label="Prize Pool (optional)" htmlFor="prizePool">
        <Input id="prizePool" name="prizePool" defaultValue={event?.prizePool ?? ""} />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Winners (optional)" htmlFor="winners">
          <Input id="winners" name="winners" defaultValue={event?.winners ?? ""} />
        </FormField>
        <FormField label="Runners-Up (optional)" htmlFor="runnersUp">
          <Input id="runnersUp" name="runnersUp" defaultValue={event?.runnersUp ?? ""} />
        </FormField>
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <SubmitButton>{event ? "Save Changes" : "Create Event"}</SubmitButton>
    </form>
  );
}
