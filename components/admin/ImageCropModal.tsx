"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type SyntheticEvent,
} from "react";

export type CropState = { zoom: number; offsetX: number; offsetY: number };

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const MAX_OUTPUT_WIDTH = 2000;

export function ImageCropModal({
  file,
  aspectRatio,
  initialCrop,
  onCancel,
  onApply,
}: {
  file: File;
  aspectRatio: number;
  initialCrop?: CropState;
  onCancel: () => void;
  onApply: (croppedFile: File, crop: CropState) => void;
}) {
  const [imgUrl] = useState(() => URL.createObjectURL(file));
  const imgRef = useRef<HTMLImageElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [frameSize, setFrameSize] = useState<{ w: number; h: number } | null>(null);
  const [crop, setCrop] = useState<CropState>(initialCrop ?? { zoom: 1, offsetX: 0, offsetY: 0 });

  useEffect(() => () => URL.revokeObjectURL(imgUrl), [imgUrl]);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const measure = () => setFrameSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const baseScale = natural && frameSize ? Math.max(frameSize.w / natural.w, frameSize.h / natural.h) : 1;
  const totalScale = baseScale * crop.zoom;

  const clamp = useCallback(
    (offsetX: number, offsetY: number, zoom: number) => {
      if (!natural || !frameSize) return { offsetX, offsetY };
      const scale = baseScale * zoom;
      const dispW = natural.w * scale;
      const dispH = natural.h * scale;
      const minX = frameSize.w - dispW;
      const minY = frameSize.h - dispH;
      return {
        offsetX: Math.min(0, Math.max(minX, offsetX)),
        offsetY: Math.min(0, Math.max(minY, offsetY)),
      };
    },
    [natural, frameSize, baseScale],
  );

  // Center the image the first time we know both its natural size and the frame size.
  useEffect(() => {
    if (natural && frameSize && !initialCrop) {
      const dispW = natural.w * baseScale;
      const dispH = natural.h * baseScale;
      setCrop({ zoom: 1, offsetX: (frameSize.w - dispW) / 2, offsetY: (frameSize.h - dispH) / 2 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-center when the image/frame first resolve
  }, [natural, frameSize]);

  function handleImageLoad(event: SyntheticEvent<HTMLImageElement>) {
    const img = event.currentTarget;
    setNatural({ w: img.naturalWidth, h: img.naturalHeight });
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { startX: event.clientX, startY: event.clientY, origX: crop.offsetX, origY: crop.offsetY };
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return;
    const dx = event.clientX - dragRef.current.startX;
    const dy = event.clientY - dragRef.current.startY;
    const next = clamp(dragRef.current.origX + dx, dragRef.current.origY + dy, crop.zoom);
    setCrop((c) => ({ ...c, ...next }));
  }

  function handlePointerUp() {
    dragRef.current = null;
  }

  function handleZoomChange(zoom: number) {
    setCrop((c) => ({ zoom, ...clamp(c.offsetX, c.offsetY, zoom) }));
  }

  async function handleApply() {
    if (!natural || !frameSize || !imgRef.current) return;

    const sx = -crop.offsetX / totalScale;
    const sy = -crop.offsetY / totalScale;
    const sWidth = frameSize.w / totalScale;
    const sHeight = frameSize.h / totalScale;

    const outputWidth = Math.round(Math.min(sWidth, MAX_OUTPUT_WIDTH));
    const outputHeight = Math.round(outputWidth / aspectRatio);

    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(imgRef.current, sx, sy, sWidth, sHeight, 0, 0, outputWidth, outputHeight);

    const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, 0.95));
    if (!blob) return;

    const croppedFile = new File([blob], `cropped.${mime === "image/png" ? "png" : "jpg"}`, { type: mime });
    onApply(croppedFile, crop);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-night-900 p-5">
        <h3 className="text-sm font-medium text-slate-200">Adjust image</h3>

        <div
          ref={frameRef}
          className="relative mt-4 w-full touch-none overflow-hidden rounded-xl border border-white/10 bg-black"
          style={{ aspectRatio: `${aspectRatio}` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- object URL crop source, drawn to canvas, not a next/image candidate */}
          <img
            ref={imgRef}
            src={imgUrl}
            alt=""
            draggable={false}
            onLoad={handleImageLoad}
            className="absolute left-0 top-0 max-w-none cursor-grab select-none active:cursor-grabbing"
            style={
              natural
                ? {
                    width: natural.w * totalScale,
                    height: natural.h * totalScale,
                    transform: `translate(${crop.offsetX}px, ${crop.offsetY}px)`,
                  }
                : undefined
            }
          />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className="text-xs text-slate-500">Zoom</span>
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            value={crop.zoom}
            onChange={(e) => handleZoomChange(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
