"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { FormField } from "@/components/admin/FormField";
import { Input } from "@/components/admin/Input";
import { Textarea } from "@/components/admin/Textarea";
import { Select } from "@/components/admin/Select";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { Member, MemberTier } from "@/lib/types";

type FormAction = (prevState: { error?: string } | undefined, formData: FormData) => Promise<{ error?: string }>;

export function MemberForm({ member, action }: { member?: Member; action: FormAction }) {
  const [state, formAction] = useFormState(action, {});
  const [tier, setTier] = useState<MemberTier>(member?.tier ?? "General");
  const designationRequired = tier !== "Sub-Executive";

  return (
    <form action={formAction} className="space-y-5">
      <FormField label="Name" htmlFor="name">
        <Input id="name" name="name" required defaultValue={member?.name} />
      </FormField>
      <FormField label={designationRequired ? "Designation" : "Designation (optional)"} htmlFor="designation">
        <Input
          id="designation"
          name="designation"
          required={designationRequired}
          defaultValue={member?.designation ?? ""}
          placeholder="e.g. President"
        />
      </FormField>
      <FormField label="Tier" htmlFor="tier">
        <Select id="tier" name="tier" value={tier} onChange={(e) => setTier(e.target.value as MemberTier)}>
          <option value="Executive">Executive</option>
          <option value="Sub-Executive">Sub-Executive</option>
          <option value="General">General</option>
          <option value="Faculty Advisor">Faculty Advisor</option>
        </Select>
      </FormField>
      <p className="text-xs text-slate-500">
        Fill in whichever contact options are available — the member card only shows icons for the ones you provide.
        At least one is required.
      </p>
      <FormField label="Email (optional)" htmlFor="email">
        <Input id="email" name="email" type="email" defaultValue={member?.email ?? ""} />
      </FormField>
      <FormField label="Phone (optional)" htmlFor="phone">
        <Input id="phone" name="phone" defaultValue={member?.phone ?? ""} placeholder="+880 1XXX-XXXXXX" />
      </FormField>
      <FormField label="Facebook (optional)" htmlFor="facebook">
        <Input
          id="facebook"
          name="facebook"
          type="url"
          defaultValue={member?.facebook ?? ""}
          placeholder="https://facebook.com/username"
        />
      </FormField>
      <FormField label="LinkedIn (optional)" htmlFor="linkedin">
        <Input
          id="linkedin"
          name="linkedin"
          type="url"
          defaultValue={member?.linkedin ?? ""}
          placeholder="https://linkedin.com/in/username"
        />
      </FormField>
      <FormField label="Additional Info (optional)" htmlFor="additionalInfo">
        <Textarea id="additionalInfo" name="additionalInfo" rows={2} defaultValue={member?.additionalInfo ?? ""} />
      </FormField>
      <ImageUploader name="photo" label="Photo" existingUrl={member?.photo} aspectRatio={16 / 10} />

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <SubmitButton>{member ? "Save Changes" : "Add Member"}</SubmitButton>
    </form>
  );
}
