"use client";

import { useFormState } from "react-dom";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { SubmitButton } from "@/components/admin/SubmitButton";

type FormAction = (
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
) => Promise<{ error?: string; success?: boolean }>;

export function AboutHistoryForm({ defaultValue, action }: { defaultValue: string; action: FormAction }) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="space-y-5">
      <RichTextEditor name="history" defaultValue={defaultValue} />
      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-400">Saved.</p>}
      <SubmitButton>Save History</SubmitButton>
    </form>
  );
}
