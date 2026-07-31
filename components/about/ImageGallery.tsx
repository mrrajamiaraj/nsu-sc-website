import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";

export function ImageGallery({ images }: { images: string[] }) {
  if (!images.length) return null;

  return (
    <section className="px-4 pb-16">
      <Reveal className="mx-auto grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3">
        {images.map((url) => (
          <div key={url} className="relative aspect-square overflow-hidden rounded-2xl">
            <Image src={url} alt="" fill sizes="(min-width: 640px) 33vw, 50vw" className="object-cover" />
          </div>
        ))}
      </Reveal>
    </section>
  );
}
