import Image from "next/image";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/Reveal";

// The first photo leads at double size (2×2 cells); the rest fill in around it.
export function ImageGallery({ images }: { images: string[] }) {
  if (!images.length) return null;

  return (
    <section className="px-4 pb-16">
      <Reveal className="mx-auto grid max-w-6xl grid-flow-dense grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((url, index) => (
          <div
            key={url}
            className={cn("relative aspect-square overflow-hidden rounded-2xl", index === 0 && "col-span-2 row-span-2")}
          >
            <Image
              src={url}
              alt=""
              fill
              sizes={index === 0 ? "(min-width: 1024px) 50vw, (min-width: 640px) 66vw, 100vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"}
              className="object-cover"
            />
          </div>
        ))}
      </Reveal>
    </section>
  );
}
