"use client";

import Image from "next/image";
import { useFormState } from "react-dom";
import { Trash2 } from "lucide-react";
import { SubmitButton } from "@/components/admin/SubmitButton";

type AddAction = (prevState: { error?: string } | undefined, formData: FormData) => Promise<{ error?: string }>;

export function AboutGalleryManager({
  images,
  onAdd,
  onRemove,
}: {
  images: string[];
  onAdd: AddAction;
  onRemove: (url: string) => Promise<void>;
}) {
  const [state, formAction] = useFormState(onAdd, {});

  return (
    <div>
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((url) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-xl border border-white/10">
              <Image src={url} alt="" fill className="object-cover" />
              <form action={onRemove.bind(null, url)} className="absolute right-1 top-1">
                <button
                  type="submit"
                  className="rounded-full bg-black/60 p-1.5 text-red-300 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Remove image"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      <form action={formAction} className="mt-4 flex items-center gap-3">
        <input
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp"
          className="text-sm text-slate-400 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:text-white hover:file:bg-white/20"
        />
        <SubmitButton pendingLabel="Uploading...">Add</SubmitButton>
      </form>
      {state?.error && <p className="mt-2 text-sm text-red-400">{state.error}</p>}
    </div>
  );
}
