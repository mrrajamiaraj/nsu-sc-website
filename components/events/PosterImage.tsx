import Image from "next/image";
import { cn } from "@/lib/utils";

// Event artwork comes in every shape (portrait posters, square graphics, wide
// banners) and usually has text on it, so it's shown whole over a blurred copy of
// itself instead of being cropped. The parent sets the frame's size and position.
export function PosterImage({
  src,
  alt,
  sizes,
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <>
      <Image src={src} alt="" aria-hidden fill sizes={sizes} className="scale-110 object-cover opacity-50 blur-2xl" />
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={cn("object-contain", className)} />
    </>
  );
}
