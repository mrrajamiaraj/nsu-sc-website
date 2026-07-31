"use client";

import { useState, type ChangeEvent } from "react";
import { ImagePlus } from "lucide-react";
import { validateImageFile } from "@/lib/validation/shared";

export function ImageUploader({
  name,
  label,
  existingUrl,
}: {
  name: string;
  label: string;
  existingUrl?: string | null;
}) {
  const [preview, setPreview] = useState<string | null>(existingUrl ?? null);
  const [error, setError] = useState<string | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      event.target.value = "";
      return;
    }

    setError(null);
    setPreview(URL.createObjectURL(file));
  }

  return (
    <div>
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <div className="mt-2 flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-white/5">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- blob/remote preview, not a next/image candidate
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-6 w-6 text-slate-500" />
          )}
        </div>
        <input
          type="file"
          name={name}
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          className="text-sm text-slate-400 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:text-white hover:file:bg-white/20"
        />
      </div>
      {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
      <p className="mt-1 text-xs text-slate-500">JPG, PNG, or WebP. Max 5MB.</p>
    </div>
  );
}
