"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";

// The Google Maps embed pulls in about 1 MB of scripts, and on phones it sits in
// the first screen, so it loads only when asked. Directions are linked separately
// and work without it.
export function LocationMap({ query }: { query: string }) {
  const [show, setShow] = useState(false);
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

  return (
    <div className="h-56 border-t border-white/10">
      {show ? (
        <iframe
          title="Map of North South University"
          src={src}
          className="h-full w-full grayscale invert-[92%] contrast-[90%]"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-3 bg-white/[0.02] px-6 text-center">
          <MapPin aria-hidden className="h-6 w-6 text-slate-500" />
          <button
            type="button"
            onClick={() => setShow(true)}
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
          >
            Show map
          </button>
          <p className="text-xs text-slate-500">Loads Google Maps</p>
        </div>
      )}
    </div>
  );
}
