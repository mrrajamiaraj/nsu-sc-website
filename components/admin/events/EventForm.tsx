"use client";

import type { ReactNode } from "react";
import { useFormState } from "react-dom";
import { FormField } from "@/components/admin/FormField";
import { Input } from "@/components/admin/Input";
import { Textarea } from "@/components/admin/Textarea";
import { Select } from "@/components/admin/Select";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { Event, EventSeries } from "@/lib/types";

type FormAction = (prevState: { error?: string } | undefined, formData: FormData) => Promise<{ error?: string }>;

function Fieldset({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-5 border-t border-white/10 pt-6">
      <legend className="pr-3 text-sm font-semibold uppercase tracking-wide text-slate-200">{legend}</legend>
      {children}
    </fieldset>
  );
}

export function EventForm({
  event,
  series,
  action,
}: {
  event?: Event;
  series: EventSeries[];
  action: FormAction;
}) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-5">
        <FormField label="Name" htmlFor="name" hint="Shown when the event isn't part of a series.">
          <Input id="name" name="name" required defaultValue={event?.name} />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Series (optional)" htmlFor="seriesId" hint="Group this season with others, e.g. NBL.">
            <Select id="seriesId" name="seriesId" defaultValue={event?.seriesId ?? ""}>
              <option value="">Not part of a series</option>
              {series.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.abbreviation} — {s.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Season number (optional)" htmlFor="seasonNumber">
            <Input id="seasonNumber" name="seasonNumber" type="number" min={1} defaultValue={event?.seasonNumber ?? ""} />
          </FormField>
        </div>

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

        <ImageUploader name="bannerImage" label="Banner Image" existingUrl={event?.bannerImage} aspectRatio={16 / 10} />
      </div>

      <Fieldset legend="When & where">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Date" htmlFor="date">
            <Input id="date" name="date" type="date" defaultValue={event?.date ?? ""} />
          </FormField>
          <FormField label="End Date (optional)" htmlFor="endDate">
            <Input id="endDate" name="endDate" type="date" defaultValue={event?.endDate ?? ""} />
          </FormField>
        </div>
        <label className="-mt-2 flex items-center gap-2 text-sm text-slate-400">
          <input type="checkbox" name="yearOnly" defaultChecked={event?.yearOnly} className="h-4 w-4 accent-blue-500" />
          Only the year is known — show just the year. Leave Date empty if even the year is unknown.
        </label>
        <FormField label="Venue (optional)" htmlFor="venue">
          <Input id="venue" name="venue" defaultValue={event?.venue ?? ""} />
        </FormField>
      </Fieldset>

      <Fieldset legend="Registration">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Opens (optional)" htmlFor="registrationOpens">
            <Input id="registrationOpens" name="registrationOpens" type="date" defaultValue={event?.registrationOpens ?? ""} />
          </FormField>
          <FormField label="Deadline (optional)" htmlFor="registrationDeadline">
            <Input
              id="registrationDeadline"
              name="registrationDeadline"
              type="date"
              defaultValue={event?.registrationDeadline ?? ""}
            />
          </FormField>
        </div>
        <FormField
          label="Registration link (optional)"
          htmlFor="registrationUrl"
          hint="A Google Form or similar. The Register button appears between the opening date and the deadline."
        >
          <Input
            id="registrationUrl"
            name="registrationUrl"
            type="url"
            placeholder="https://forms.gle/..."
            defaultValue={event?.registrationUrl ?? ""}
          />
        </FormField>
      </Fieldset>

      <Fieldset legend="Participation">
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Teams" htmlFor="teamCount">
            <Input id="teamCount" name="teamCount" type="number" min={0} defaultValue={event?.teamCount ?? ""} />
          </FormField>
          <FormField label="Athletes" htmlFor="participantCount">
            <Input
              id="participantCount"
              name="participantCount"
              type="number"
              min={0}
              defaultValue={event?.participantCount ?? ""}
            />
          </FormField>
          <FormField label="Matches" htmlFor="matchCount">
            <Input id="matchCount" name="matchCount" type="number" min={0} defaultValue={event?.matchCount ?? ""} />
          </FormField>
        </div>
      </Fieldset>

      <Fieldset legend="Prizes (BDT)">
        <FormField label="Total prize pool" htmlFor="prizePool">
          <Input id="prizePool" name="prizePool" placeholder="e.g. ৳50,000" defaultValue={event?.prizePool ?? ""} />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="1st place" htmlFor="prizeFirst">
            <Input id="prizeFirst" name="prizeFirst" defaultValue={event?.prizeFirst ?? ""} />
          </FormField>
          <FormField label="2nd place" htmlFor="prizeSecond">
            <Input id="prizeSecond" name="prizeSecond" defaultValue={event?.prizeSecond ?? ""} />
          </FormField>
          <FormField label="3rd place" htmlFor="prizeThird">
            <Input id="prizeThird" name="prizeThird" defaultValue={event?.prizeThird ?? ""} />
          </FormField>
        </div>
      </Fieldset>

      <Fieldset legend="Results">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Champion" htmlFor="winners">
            <Textarea id="winners" name="winners" rows={2} defaultValue={event?.winners ?? ""} />
          </FormField>
          <FormField label="Runner-up" htmlFor="runnersUp">
            <Textarea id="runnersUp" name="runnersUp" rows={2} defaultValue={event?.runnersUp ?? ""} />
          </FormField>
          <FormField label="Second runner-up" htmlFor="secondRunnerUp">
            <Textarea id="secondRunnerUp" name="secondRunnerUp" rows={2} defaultValue={event?.secondRunnerUp ?? ""} />
          </FormField>
          <FormField label="Man of the Tournament" htmlFor="manOfTournament">
            <Textarea id="manOfTournament" name="manOfTournament" rows={2} defaultValue={event?.manOfTournament ?? ""} />
          </FormField>
        </div>
      </Fieldset>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <SubmitButton>{event ? "Save Changes" : "Create Event"}</SubmitButton>
    </form>
  );
}
