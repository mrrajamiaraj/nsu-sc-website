"use client";

import { useFormState } from "react-dom";
import { GlassCard } from "@/components/ui/GlassCard";
import { FormField } from "@/components/admin/FormField";
import { Input } from "@/components/admin/Input";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { updatePasswordAction } from "./actions";

const initialState: { error?: string } = {};

export default function ResetPasswordPage() {
  const [state, formAction] = useFormState(updatePasswordAction, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-night-950 px-4">
      <GlassCard className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-white">Set New Password</h1>
        <p className="mt-1 text-sm text-slate-400">Choose a new password for your admin account.</p>

        <form action={formAction} className="mt-6 space-y-5">
          <FormField label="New Password" htmlFor="password">
            <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
          </FormField>
          <FormField label="Confirm Password" htmlFor="confirmPassword">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </FormField>

          {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

          <SubmitButton className="w-full" pendingLabel="Saving...">
            Update Password
          </SubmitButton>
        </form>
      </GlassCard>
    </div>
  );
}
