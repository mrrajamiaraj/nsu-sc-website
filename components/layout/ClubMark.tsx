import Image from "next/image";

// The club logo used in the navbar and footer, with a text badge until one is uploaded.
// `priority` preloads it in the navbar, where it's the first image painted on every page.
export function ClubMark({ logoUrl, priority }: { logoUrl?: string | null; priority?: boolean }) {
  return logoUrl ? (
    <span className="relative h-9 w-9 shrink-0">
      <Image src={logoUrl} alt="NSU SC logo" fill sizes="36px" priority={priority} className="object-contain" />
    </span>
  ) : (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-[10px] font-bold tracking-tight text-night-950">
      NSU
    </span>
  );
}
