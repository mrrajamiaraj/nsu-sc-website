"use client";

import { useFormState } from "react-dom";
import { FormField } from "@/components/admin/FormField";
import { Input } from "@/components/admin/Input";
import { Textarea } from "@/components/admin/Textarea";
import { Select } from "@/components/admin/Select";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { AlumniClassYear, AlumniProfile } from "@/lib/types";

type FormAction = (prevState: { error?: string } | undefined, formData: FormData) => Promise<{ error?: string }>;

export function AlumniForm({
  alumnus,
  classYears,
  defaultClassYearId,
  action,
}: {
  alumnus?: AlumniProfile;
  classYears: AlumniClassYear[];
  defaultClassYearId?: string;
  action: FormAction;
}) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="space-y-5">
      <FormField label="Name" htmlFor="name">
        <Input id="name" name="name" required defaultValue={alumnus?.name} />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Class Year" htmlFor="classYearId">
          <Select
            id="classYearId"
            name="classYearId"
            defaultValue={alumnus?.classYearId ?? defaultClassYearId ?? classYears[0]?.id}
          >
            {classYears.map((year) => (
              <option key={year.id} value={year.id}>
                {year.label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Tier" htmlFor="tier">
          <Select id="tier" name="tier" defaultValue={alumnus?.tier ?? "Executive"}>
            <option value="Executive">Executive</option>
            <option value="Sub-Executive">Sub-Executive</option>
          </Select>
        </FormField>
      </div>
      <FormField label="Team (optional)" htmlFor="team">
        <Input id="team" name="team" defaultValue={alumnus?.team ?? ""} placeholder="e.g. Football" />
      </FormField>
      <FormField label="Current Role (optional)" htmlFor="currentRole">
        <Input id="currentRole" name="currentRole" defaultValue={alumnus?.currentRole ?? ""} />
      </FormField>
      <FormField label="Quote (optional)" htmlFor="quote">
        <Textarea id="quote" name="quote" rows={2} defaultValue={alumnus?.quote ?? ""} />
      </FormField>
      <FormField label="Facebook (optional)" htmlFor="facebook">
        <Input
          id="facebook"
          name="facebook"
          type="url"
          defaultValue={alumnus?.facebook ?? ""}
          placeholder="https://www.facebook.com/..."
        />
      </FormField>
      <FormField label="Phone (optional)" htmlFor="phone">
        <Input id="phone" name="phone" type="tel" defaultValue={alumnus?.phone ?? ""} />
      </FormField>
      <ImageUploader name="photo" label="Photo" existingUrl={alumnus?.photo} aspectRatio={1} />

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <SubmitButton>{alumnus ? "Save Changes" : "Add Alumnus"}</SubmitButton>
    </form>
  );
}
