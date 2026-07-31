"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { GlassCard } from "@/components/ui/GlassCard";
import { FormField } from "@/components/admin/FormField";
import { Input } from "@/components/admin/Input";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { requestPasswordResetAction } from "./actions";

const initialState: { message?: string; error?: string } = {};

export default function ForgotPasswordPage() {
  const [state, formAction] = useFormState(requestPasswordResetAction, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-night-950 px-4">
      <GlassCard className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-white">Forgot Password</h1>
        <p className="mt-1 text-sm text-slate-400">
          Enter your admin email and we&apos;ll send a password reset link.
        </p>

        <form action={formAction} className="mt-6 space-y-5">
          <FormField label="Email" htmlFor="email">
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </FormField>

          {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
          {state?.message && <p className="text-sm text-emerald-400">{state.message}</p>}

          <SubmitButton className="w-full" pendingLabel="Sending...">
            Send Reset Link
          </SubmitButton>
        </form>

        <Link href="/admin/login" className="mt-4 block text-center text-sm text-slate-400 hover:text-white">
          Back to login
        </Link>
      </GlassCard>
    </div>
  );
}
