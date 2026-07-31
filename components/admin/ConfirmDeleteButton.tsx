"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "./Modal";
import { SubmitButton } from "./SubmitButton";

export function ConfirmDeleteButton({
  action,
  itemLabel,
}: {
  action: () => Promise<void>;
  itemLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-red-400/25 bg-red-400/10 p-2 text-red-300 transition-colors hover:bg-red-400/20"
        aria-label={`Delete ${itemLabel}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Confirm Delete">
        <p className="text-sm text-slate-300">
          Are you sure you want to delete <span className="text-white">{itemLabel}</span>? This cannot be undone.
        </p>
        <form action={action} className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
          >
            Cancel
          </button>
          <SubmitButton pendingLabel="Deleting..." className="!bg-red-500 !shadow-none hover:!brightness-110">
            Delete
          </SubmitButton>
        </form>
      </Modal>
    </>
  );
}
