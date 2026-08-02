"use client";

import { useFormState } from "react-dom";
import { FormField } from "@/components/admin/FormField";
import { Input } from "@/components/admin/Input";
import { SubmitButton } from "@/components/admin/SubmitButton";

type FormAction = (
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
) => Promise<{ error?: string; success?: boolean }>;

export function TeamsStatsForm({
  championships,
  medals,
  winRate,
  action,
}: {
  championships: string;
  medals: string;
  winRate: string;
  action: FormAction;
}) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="grid grid-cols-3 gap-4">
      <FormField label="Total Championships" htmlFor="championships">
        <Input id="championships" name="championships" required defaultValue={championships} />
      </FormField>
      <FormField label="Medals Won" htmlFor="medals">
        <Input id="medals" name="medals" required defaultValue={medals} />
      </FormField>
      <FormField label="Win Rate" htmlFor="winRate">
        <Input id="winRate" name="winRate" required defaultValue={winRate} />
      </FormField>

      <div className="col-span-3 space-y-2">
        {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
        {state?.success && <p className="text-sm text-emerald-400">Saved.</p>}
        <SubmitButton>Save Changes</SubmitButton>
      </div>
    </form>
  );
}
