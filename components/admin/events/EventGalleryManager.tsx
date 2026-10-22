"use client";

import Image from "next/image";
import { useFormState } from "react-dom";
import { Trash2 } from "lucide-react";
import { SubmitButton } from "@/components/admin/SubmitButton";

type FormAction = (prevState: { error?: string } | undefined, formData: FormData) => Promise<{ error?: string }>;

// Photos for the season page gallery: upload several at once, caption them, remove them.
export function EventGalleryManager({
  photos,
  captions,
  bannerImage,
  onAdd,
  onRemove,
  onSaveCaptions,
}: {
  photos: string[];
  captions: Record<string, string>;
  bannerImage: string | null;
  onAdd: FormAction;
  onRemove: (url: string) => Promise<void>;
  onSaveCaptions: FormAction;
}) {
  const [addState, addAction] = useFormState(onAdd, {});
  const [captionState, captionAction] = useFormState(onSaveCaptions, {});

  return (
    <div className="space-y-6">
      {photos.length > 0 ? (
        <form action={captionAction} className="space-y-4">
          <ul className="grid gap-4 sm:grid-cols-2">
            {photos.map((url, index) => (
              <li key={url} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
                  <Image src={url} alt="" fill sizes="(min-width: 640px) 18rem, 90vw" className="object-cover" />
                  {url === bannerImage && (
                    <span className="absolute left-2 top-2 rounded-full bg-night-950/70 px-2 py-0.5 text-xs text-white">Banner</span>
                  )}
                </div>
                <label htmlFor={`caption-${index}`} className="sr-only">
                  Caption for photo {index + 1}
                </label>
                <input
                  id={`caption-${index}`}
                  name={`caption-${index}`}
                  defaultValue={captions[url] ?? ""}
                  maxLength={160}
                  placeholder="Caption (optional)"
                  className="mt-3 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/60 focus:outline-none"
                />
                <button
                  type="submit"
                  formAction={onRemove.bind(null, url)}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs text-red-300 hover:text-red-200"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove photo
                </button>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <SubmitButton pendingLabel="Saving...">Save captions</SubmitButton>
            {captionState?.error && <p className="text-sm text-red-400">{captionState.error}</p>}
          </div>
        </form>
      ) : (
        <p className="text-sm text-slate-400">No photos yet.</p>
      )}

      <form action={addAction} className="rounded-2xl border border-dashed border-white/15 p-4">
        <label htmlFor="photos" className="text-sm font-medium text-slate-300">
          Add photos
        </label>
        <p className="mt-1 text-xs text-slate-500">JPG, PNG or WebP. Upload a few at a time (up to 12MB per batch).</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input
            id="photos"
            type="file"
            name="photos"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="min-w-0 text-sm text-slate-400 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:text-white hover:file:bg-white/20"
          />
          <SubmitButton pendingLabel="Uploading...">Upload</SubmitButton>
        </div>
        {addState?.error && <p className="mt-2 text-sm text-red-400">{addState.error}</p>}
      </form>
    </div>
  );
}
