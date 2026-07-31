"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { FormField } from "@/components/admin/FormField";
import { Input } from "@/components/admin/Input";
import { Toggle } from "@/components/admin/Toggle";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { RegistrationSettings } from "@/lib/types";

type FormAction = (
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
) => Promise<{ error?: string; success?: boolean }>;

export function RegistrationForm({ settings, action }: { settings: RegistrationSettings; action: FormAction }) {
  const [state, formAction] = useFormState(action, {});
  const [isOpen, setIsOpen] = useState(settings.isOpen);

  return (
    <form action={formAction} className="space-y-5">
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
        <div>
          <p className="text-sm font-semibold text-white">Registration Status</p>
          <p className="text-xs text-slate-500">{isOpen ? "Open" : "Closed"}</p>
        </div>
        <Toggle checked={isOpen} onChange={setIsOpen} label="Registration open" />
        <input type="hidden" name="isOpen" value={String(isOpen)} />
      </div>

      <FormField label="Google Form URL" htmlFor="googleFormUrl">
        <Input
          id="googleFormUrl"
          name="googleFormUrl"
          type="url"
          defaultValue={settings.googleFormUrl ?? ""}
          placeholder="https://forms.google.com/..."
        />
      </FormField>

      <FormField label="Next Intake Date (shown when closed)" htmlFor="nextIntakeDate">
        <Input id="nextIntakeDate" name="nextIntakeDate" type="date" defaultValue={settings.nextIntakeDate ?? ""} />
      </FormField>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-400">Saved.</p>}

      <SubmitButton>Save Changes</SubmitButton>
    </form>
  );
}
