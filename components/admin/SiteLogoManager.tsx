"use client";

import Image from "next/image";
import { useFormState } from "react-dom";
import { Trash2 } from "lucide-react";
import { SubmitButton } from "@/components/admin/SubmitButton";

type UploadAction = (prevState: { error?: string } | undefined, formData: FormData) => Promise<{ error?: string }>;

export function SiteLogoManager({
  logoUrl,
  onUpload,
  onRemove,
}: {
  logoUrl: string;
  onUpload: UploadAction;
  onRemove: () => Promise<void>;
}) {
  const [state, formAction] = useFormState(onUpload, {});

  return (
    <div>
      <div className="flex items-center gap-4">
        {logoUrl ? (
          <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <Image src={logoUrl} alt="Site logo" fill className="object-cover" />
          </div>
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xs font-semibold text-slate-400">
            NSU
          </div>
        )}
        <div>
          <p className="text-sm text-white">{logoUrl ? "Custom logo" : "Default text badge"}</p>
          <p className="text-xs text-slate-500">Shown in the navbar and footer on every page.</p>
        </div>
        {logoUrl && (
          <form action={onRemove}>
            <button
              type="submit"
              className="ml-auto flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-red-300 transition-colors hover:border-red-400/40 hover:bg-red-500/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          </form>
        )}
      </div>

      <form action={formAction} className="mt-4 flex items-center gap-3">
        <input
          type="file"
          name="logo"
          accept="image/jpeg,image/png,image/webp"
          className="text-sm text-slate-400 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:text-white hover:file:bg-white/20"
        />
        <SubmitButton pendingLabel="Uploading...">Upload</SubmitButton>
      </form>
      {state?.error && <p className="mt-2 text-sm text-red-400">{state.error}</p>}
    </div>
  );
}
