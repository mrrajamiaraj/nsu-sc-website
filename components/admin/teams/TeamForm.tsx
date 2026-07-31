"use client";

import { useFormState } from "react-dom";
import { FormField } from "@/components/admin/FormField";
import { Input } from "@/components/admin/Input";
import { Textarea } from "@/components/admin/Textarea";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { Team } from "@/lib/types";

type FormAction = (prevState: { error?: string } | undefined, formData: FormData) => Promise<{ error?: string }>;

export function TeamForm({ team, action }: { team?: Team; action: FormAction }) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="space-y-5">
      <FormField label="Name" htmlFor="name">
        <Input id="name" name="name" required defaultValue={team?.name} />
      </FormField>
      <FormField label="Description" htmlFor="description">
        <Textarea id="description" name="description" rows={3} required defaultValue={team?.description} />
      </FormField>
      <FormField label="Nickname (optional)" htmlFor="nickname">
        <Input id="nickname" name="nickname" defaultValue={team?.nickname ?? ""} />
      </FormField>
      <FormField label="Achievement (optional)" htmlFor="achievement">
        <Input id="achievement" name="achievement" defaultValue={team?.achievement ?? ""} />
      </FormField>
      <ImageUploader name="bannerImage" label="Banner Image" existingUrl={team?.bannerImage} />

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <SubmitButton>{team ? "Save Changes" : "Create Team"}</SubmitButton>
    </form>
  );
}
