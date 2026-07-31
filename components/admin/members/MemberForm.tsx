"use client";

import { useFormState } from "react-dom";
import { FormField } from "@/components/admin/FormField";
import { Input } from "@/components/admin/Input";
import { Textarea } from "@/components/admin/Textarea";
import { Select } from "@/components/admin/Select";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { Member } from "@/lib/types";

type FormAction = (prevState: { error?: string } | undefined, formData: FormData) => Promise<{ error?: string }>;

export function MemberForm({ member, action }: { member?: Member; action: FormAction }) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="space-y-5">
      <FormField label="Name" htmlFor="name">
        <Input id="name" name="name" required defaultValue={member?.name} />
      </FormField>
      <FormField label="Designation" htmlFor="designation">
        <Input
          id="designation"
          name="designation"
          required
          defaultValue={member?.designation}
          placeholder="e.g. President"
        />
      </FormField>
      <FormField label="Tier" htmlFor="tier">
        <Select id="tier" name="tier" defaultValue={member?.tier ?? "General"}>
          <option value="Executive">Executive</option>
          <option value="Sub-Executive">Sub-Executive</option>
          <option value="General">General</option>
        </Select>
      </FormField>
      <FormField label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" required defaultValue={member?.email} />
      </FormField>
      <FormField label="Phone" htmlFor="phone">
        <Input id="phone" name="phone" required defaultValue={member?.phone} placeholder="+880 1XXX-XXXXXX" />
      </FormField>
      <FormField label="Additional Info (optional)" htmlFor="additionalInfo">
        <Textarea id="additionalInfo" name="additionalInfo" rows={2} defaultValue={member?.additionalInfo ?? ""} />
      </FormField>
      <ImageUploader name="photo" label="Photo" existingUrl={member?.photo} />

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <SubmitButton>{member ? "Save Changes" : "Add Member"}</SubmitButton>
    </form>
  );
}
