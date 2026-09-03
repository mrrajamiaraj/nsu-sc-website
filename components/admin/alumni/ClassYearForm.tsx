"use client";

import { useFormState } from "react-dom";
import { FormField } from "@/components/admin/FormField";
import { Input } from "@/components/admin/Input";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { AlumniClassYear } from "@/lib/types";

type FormAction = (prevState: { error?: string } | undefined, formData: FormData) => Promise<{ error?: string }>;

export function ClassYearForm({ classYear, action }: { classYear?: AlumniClassYear; action: FormAction }) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="space-y-5">
      <FormField label="Label" htmlFor="label">
        <Input id="label" name="label" required defaultValue={classYear?.label} placeholder="e.g. 2025-2026" />
      </FormField>
      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      <SubmitButton>{classYear ? "Save Changes" : "Add Class Year"}</SubmitButton>
    </form>
  );
}
