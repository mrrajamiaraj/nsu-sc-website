import { initials } from "@/components/teams/announcement/Cutout";
import { thumbUrl, type PanelPerson } from "@/lib/members-sheet";
import { cn } from "@/lib/utils";

/**
 * Round head-and-shoulders portrait from the small thumbnail endpoint (a few KB each).
 * `size` is the displayed size in px; the image is fetched at 2x.
 */
export function Face({ person, size, className }: { person: Pick<PanelPerson, "photo" | "name">; size: number; className?: string }) {
  const src = thumbUrl(person.photo, size <= 40 ? 80 : size <= 56 ? 112 : size <= 88 ? 176 : 240);
  return (
    <span className={cn("relative block shrink-0 overflow-hidden rounded-full bg-[#13312d]", className)} style={{ width: size, height: size }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- already a sized thumbnail
        <img src={src} alt="" width={size} height={size} decoding="async" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <span aria-hidden className="absolute inset-0 flex items-center justify-center font-semibold text-[#f5f1e8]/60" style={{ fontSize: size * 0.3 }}>
          {initials(person.name)}
        </span>
      )}
    </span>
  );
}
