"use client";

import { useFormState } from "react-dom";
import { FormField } from "@/components/admin/FormField";
import { Input } from "@/components/admin/Input";
import { Textarea } from "@/components/admin/Textarea";
import { Select } from "@/components/admin/Select";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { AlumniProfile } from "@/lib/types";

type FormAction = (prevState: { error?: string } | undefined, formData: FormData) => Promise<{ error?: string }>;

export function AlumniForm({ alumnus, action }: { alumnus?: AlumniProfile; action: FormAction }) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="space-y-5">
      <FormField label="Name" htmlFor="name">
        <Input id="name" name="name" required defaultValue={alumnus?.name} />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Graduation Year" htmlFor="graduationYear">
          <Input
            id="graduationYear"
            name="graduationYear"
            type="number"
            min={1900}
            max={2100}
            required
            defaultValue={alumnus?.graduationYear}
          />
        </FormField>
        <FormField label="Tier" htmlFor="tier">
          <Select id="tier" name="tier" defaultValue={alumnus?.tier ?? "Executive"}>
            <option value="Executive">Executive</option>
            <option value="Sub-Executive">Sub-Executive</option>
          </Select>
        </FormField>
      </div>
      <FormField label="Team" htmlFor="team">
        <Input id="team" name="team" required defaultValue={alumnus?.team} placeholder="e.g. Football" />
      </FormField>
      <FormField label="Current Role" htmlFor="currentRole">
        <Input id="currentRole" name="currentRole" required defaultValue={alumnus?.currentRole} />
      </FormField>
      <FormField label="Quote (optional)" htmlFor="quote">
        <Textarea id="quote" name="quote" rows={2} defaultValue={alumnus?.quote ?? ""} />
      </FormField>
      <ImageUploader name="photo" label="Photo" existingUrl={alumnus?.photo} />

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <SubmitButton>{alumnus ? "Save Changes" : "Add Alumnus"}</SubmitButton>
    </form>
  );
}
