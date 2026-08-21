"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Crop, ImagePlus } from "lucide-react";
import { validateImageFile } from "@/lib/validation/shared";
import { ImageCropModal, type CropState } from "@/components/admin/ImageCropModal";

export function ImageUploader({
  name,
  label,
  existingUrl,
  aspectRatio = 1,
}: {
  name: string;
  label: string;
  existingUrl?: string | null;
  /** width / height of the crop frame, e.g. 16 / 10 for a banner or 1 for a square photo */
  aspectRatio?: number;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(existingUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [lastCrop, setLastCrop] = useState<CropState | undefined>(undefined);
  const [cropping, setCropping] = useState(false);

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
    setLastCrop(undefined);
    setRawFile(file);
    setCropping(true);
  }

  function applyCroppedFile(croppedFile: File, crop: CropState) {
    if (inputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(croppedFile);
      inputRef.current.files = dataTransfer.files;
    }
    setPreview(URL.createObjectURL(croppedFile));
    setLastCrop(crop);
    setCropping(false);
  }

  function cancelCrop() {
    setCropping(false);
    if (!lastCrop) {
      // No crop has ever been applied for this pick — drop the raw selection entirely.
      if (inputRef.current) inputRef.current.value = "";
      setRawFile(null);
    }
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
        <div className="flex flex-col items-start gap-2">
          <input
            ref={inputRef}
            type="file"
            name={name}
            accept="image/jpeg,image/png,image/webp"
            onChange={handleChange}
            className="text-sm text-slate-400 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:text-white hover:file:bg-white/20"
          />
          {rawFile && (
            <button
              type="button"
              onClick={() => setCropping(true)}
              className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300"
            >
              <Crop className="h-3.5 w-3.5" />
              Adjust crop
            </button>
          )}
        </div>
      </div>
      {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
      <p className="mt-1 text-xs text-slate-500">JPG, PNG, or WebP. Max 10MB.</p>

      {cropping && rawFile && (
        <ImageCropModal
          file={rawFile}
          aspectRatio={aspectRatio}
          initialCrop={lastCrop}
          onCancel={cancelCrop}
          onApply={applyCroppedFile}
        />
      )}
    </div>
  );
}
