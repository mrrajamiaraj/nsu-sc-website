"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useFormState } from "react-dom";
import { GlassCard } from "@/components/ui/GlassCard";
import { FormField } from "@/components/admin/FormField";
import { Input } from "@/components/admin/Input";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { loginAction } from "./actions";

const initialState: { error?: string } = {};

function TimeoutNotice() {
  const searchParams = useSearchParams();
  if (searchParams.get("reason") !== "timeout") return null;

  return (
    <p className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm text-amber-300">
      You were signed out after 60 minutes of inactivity.
    </p>
  );
}

export default function AdminLoginPage() {
  const [state, formAction] = useFormState(loginAction, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-night-950 px-4">
      <GlassCard className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-white">Admin Login</h1>
        <p className="mt-1 text-sm text-slate-400">NSU SC Website Dashboard</p>

        <Suspense fallback={null}>
          <TimeoutNotice />
        </Suspense>

        <form action={formAction} className="mt-6 space-y-5">
          <FormField label="Email" htmlFor="email">
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </FormField>
          <FormField label="Password" htmlFor="password">
            <Input id="password" name="password" type="password" required autoComplete="current-password" />
          </FormField>

          {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

          <SubmitButton className="w-full" pendingLabel="Signing in...">
            Sign In
          </SubmitButton>
        </form>

        <Link href="/admin/forgot-password" className="mt-4 block text-center text-sm text-slate-400 hover:text-white">
          Forgot password?
        </Link>
      </GlassCard>
    </div>
  );
}
