"use client";

import { useFormState } from "react-dom";
import { FormField } from "@/components/admin/FormField";
import { Input } from "@/components/admin/Input";
import { Select } from "@/components/admin/Select";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { Sponsor } from "@/lib/types";

type FormAction = (prevState: { error?: string } | undefined, formData: FormData) => Promise<{ error?: string }>;

export function SponsorForm({ sponsor, action }: { sponsor?: Sponsor; action: FormAction }) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="space-y-5">
      <FormField label="Name" htmlFor="name">
        <Input id="name" name="name" required defaultValue={sponsor?.name} />
      </FormField>
      <FormField label="Category" htmlFor="category">
        <Select id="category" name="category" defaultValue={sponsor?.category ?? "Corporate"}>
          <option value="Corporate">Corporate Partner</option>
          <option value="Media">Media Partner</option>
        </Select>
      </FormField>
      <ImageUploader name="logo" label="Logo" existingUrl={sponsor?.logo} aspectRatio={1} />

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <SubmitButton>{sponsor ? "Save Changes" : "Add Sponsor"}</SubmitButton>
    </form>
  );
}
