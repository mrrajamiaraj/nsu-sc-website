"use client";

import { useFormState } from "react-dom";
import { FormField } from "@/components/admin/FormField";
import { Input } from "@/components/admin/Input";
import { Textarea } from "@/components/admin/Textarea";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { Player } from "@/lib/types";

type FormAction = (prevState: { error?: string } | undefined, formData: FormData) => Promise<{ error?: string }>;

export function PlayerForm({ player, action }: { player?: Player; action: FormAction }) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="space-y-5">
      <FormField label="Name" htmlFor="name">
        <Input id="name" name="name" required defaultValue={player?.name} />
      </FormField>
      <FormField label="Position" htmlFor="position">
        <Input id="position" name="position" required defaultValue={player?.position} placeholder="e.g. Captain, Forward" />
      </FormField>
      <FormField label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" required defaultValue={player?.email} />
      </FormField>
      <FormField label="Bio" htmlFor="bio">
        <Textarea id="bio" name="bio" rows={3} required defaultValue={player?.bio} />
      </FormField>
      <ImageUploader name="photo" label="Photo" existingUrl={player?.photo} />

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <SubmitButton>{player ? "Save Changes" : "Add Player"}</SubmitButton>
    </form>
  );
}
