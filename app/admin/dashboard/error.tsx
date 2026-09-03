"use client";

import { AlertTriangle } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";

export default function AdminDashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg pt-16">
      <GlassCard className="text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-amber-400" />
        <h1 className="mt-4 text-lg font-semibold text-white">Something went wrong</h1>
        <p className="mt-2 text-sm text-slate-400">{error.message || "An unexpected error occurred."}</p>
        <Button variant="secondary" size="sm" className="mt-6" onClick={reset}>
          Try Again
        </Button>
      </GlassCard>
    </div>
  );
}
