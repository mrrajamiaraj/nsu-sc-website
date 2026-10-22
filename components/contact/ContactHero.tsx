import { Mail } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

export function ContactHero() {
  return (
    <PageHeader
      icon={Mail}
      eyebrow="Contact"
      title={
        <>
          Talk to the <span className="text-gradient-brand">panel</span>
        </>
      }
      intro="Questions about squads, trials, events or partnerships go straight to the club panel."
    />
  );
}
