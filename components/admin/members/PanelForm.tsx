"use client";

import { useFormState } from "react-dom";
import { FormField } from "@/components/admin/FormField";
import { Input } from "@/components/admin/Input";
import { SubmitButton } from "@/components/admin/SubmitButton";

type FormAction = (prevState: { error?: string } | undefined, formData: FormData) => Promise<{ error?: string }>;

export function PanelForm({ action }: { action: FormAction }) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="space-y-5">
      <FormField label="Name" htmlFor="name">
        <Input id="name" name="name" required placeholder="e.g. Panel 2026-27" />
      </FormField>
      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      <SubmitButton>Create Panel</SubmitButton>
    </form>
  );
}
