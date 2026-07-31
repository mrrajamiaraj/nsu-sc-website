"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";

export function ActivatePanelButton({
  panelId,
  action,
}: {
  panelId: string;
  action: (id: string) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button variant="secondary" size="sm" onClick={() => startTransition(() => action(panelId))} disabled={isPending}>
      {isPending ? "Activating..." : "Activate"}
    </Button>
  );
}
