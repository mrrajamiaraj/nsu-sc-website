"use client";

import { useFormState } from "react-dom";
import { FormField } from "@/components/admin/FormField";
import { Input } from "@/components/admin/Input";
import { SubmitButton } from "@/components/admin/SubmitButton";

type FormAction = (
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
) => Promise<{ error?: string; success?: boolean }>;

export function ContactContentForm({
  address,
  phone,
  email,
  hours,
  action,
}: {
  address: string;
  phone: string;
  email: string;
  hours: string;
  action: FormAction;
}) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="space-y-5">
      <FormField label="Visit Us (Address)" htmlFor="address">
        <Input id="address" name="address" required defaultValue={address} />
      </FormField>
      <FormField label="Call Us (Phone)" htmlFor="phone">
        <Input id="phone" name="phone" required defaultValue={phone} />
      </FormField>
      <FormField label="Email Us" htmlFor="email">
        <Input id="email" name="email" type="email" required defaultValue={email} />
      </FormField>
      <FormField label="Office Hours" htmlFor="hours" hint="Shown as one range covering all days.">
        <Input id="hours" name="hours" required defaultValue={hours} />
      </FormField>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-400">Saved.</p>}

      <SubmitButton>Save Changes</SubmitButton>
    </form>
  );
}
