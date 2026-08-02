"use client";

import { useFormState } from "react-dom";
import { FormField } from "@/components/admin/FormField";
import { Input } from "@/components/admin/Input";
import { Textarea } from "@/components/admin/Textarea";
import { Select } from "@/components/admin/Select";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { Achievement, Team } from "@/lib/types";

type FormAction = (prevState: { error?: string } | undefined, formData: FormData) => Promise<{ error?: string }>;

export function AchievementForm({
  achievement,
  teams,
  action,
}: {
  achievement?: Achievement;
  teams: Team[];
  action: FormAction;
}) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="space-y-5">
      <FormField label="Team" htmlFor="teamId">
        <Select id="teamId" name="teamId" required defaultValue={achievement?.teamId ?? ""}>
          <option value="" disabled>
            Select a team
          </option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Title" htmlFor="title">
        <Input id="title" name="title" required defaultValue={achievement?.title} />
      </FormField>
      <FormField label="Description" htmlFor="description">
        <Textarea id="description" name="description" rows={4} required defaultValue={achievement?.description} />
      </FormField>
      <FormField label="Date" htmlFor="date">
        <Input id="date" name="date" type="date" required defaultValue={achievement?.date} />
      </FormField>
      <ImageUploader name="photo" label="Photo" existingUrl={achievement?.photo} />

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <SubmitButton>{achievement ? "Save Changes" : "Create Achievement"}</SubmitButton>
    </form>
  );
}
