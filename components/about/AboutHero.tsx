import { Trophy } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

// The admin-set subtitle is the page intro.
export function AboutHero({ subtitle }: { subtitle: string }) {
  return (
    <PageHeader
      icon={Trophy}
      iconClassName="text-amber-300"
      eyebrow="About Us"
      title={
        <>
          About the <span className="text-gradient-brand">club</span>
        </>
      }
      titleClassName="leading-tight"
      intro={subtitle}
      introClassName="max-w-2xl text-lg text-slate-300"
    />
  );
}
