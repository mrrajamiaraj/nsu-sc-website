import Image from "next/image";
import { cutoutStyle, type SheetPerson } from "@/lib/team-sheet";
import { cn } from "@/lib/utils";

// A player's transparent cut-out, framed by where the person sits in the image so every
// sport lines up the same way. No photo: a plain silhouette (never the club crest).
// Fills its parent, which must be positioned and sized.
export function Cutout({
  person,
  boxRatio,
  fill = 0.92,
  sizes,
  priority = false,
  alt = "",
  align = "bottom",
  className,
}: {
  person: Pick<SheetPerson, "photo" | "frame" | "name">;
  /** Width / height of the parent box. */
  boxRatio: number;
  fill?: number;
  sizes: string;
  priority?: boolean;
  alt?: string;
  /** "top" frames head and shoulders (round portraits); "bottom" stands the person on the floor. */
  align?: "bottom" | "top";
  className?: string;
}) {
  if (!person.photo) return <Silhouette className={className} />;
  return (
    <div className={cn("absolute", className)} style={cutoutStyle(person.frame, boxRatio, fill, 1.25, align)}>
      <Image
        src={person.photo}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        draggable={false}
        className="select-none object-contain"
      />
    </div>
  );
}

export function Silhouette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMax meet" aria-hidden className={cn("absolute inset-x-0 bottom-0 h-[88%] w-full", className)}>
      <circle cx="50" cy="33" r="17" fill="#1b4540" />
      <path d="M12 100 C12 72 28 56 50 56 C72 56 88 72 88 100 Z" fill="#1b4540" />
    </svg>
  );
}

export const initials = (name: string) =>
  name
    .replace(/^(md\.?|mohammad|mohammed)\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
