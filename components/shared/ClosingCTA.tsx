import type { ReactNode } from "react";
import { ArrowRight, type LucideIcon, UserPlus } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/PageHeader";
import { formatDate } from "@/lib/format";
import type { RegistrationSettings } from "@/lib/types";

interface CTALink {
  label: string;
  href: string;
  external?: boolean;
}

interface ClosingCTAProps {
  icon: LucideIcon;
  eyebrow: ReactNode;
  title: ReactNode;
  body: ReactNode;
  primary: CTALink;
  secondary?: CTALink;
}

// Closing block at the bottom of a public page. Each page passes the next step
// that fits its visitors; Home has its own Join band and Contact has none.
export function ClosingCTA({ icon, eyebrow, title, body, primary, secondary }: ClosingCTAProps) {
  return (
    <section className="px-4 pb-20">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <GlassCard className="flex flex-col items-center gap-6 p-10 text-center sm:p-14">
            <Eyebrow icon={icon} iconClassName="" className="text-teal-300">
              {eyebrow}
            </Eyebrow>

            <h2 className="text-3xl font-bold text-white sm:text-4xl">{title}</h2>

            <p className="max-w-xl text-slate-400">{body}</p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                href={primary.href}
                target={primary.external ? "_blank" : undefined}
                rel={primary.external ? "noopener noreferrer" : undefined}
                size="lg"
              >
                {primary.label}
                <ArrowRight className="h-4 w-4" />
              </Button>
              {secondary && (
                <Button href={secondary.href} variant="secondary" size="lg">
                  {secondary.label}
                </Button>
              )}
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}

// Player sign-up version. Links to the form only while registration is open;
// otherwise it says when the next intake opens and points to the panel instead.
export function TrialsCTA({
  registration,
  title,
  secondary,
}: {
  registration: RegistrationSettings;
  title: ReactNode;
  secondary?: CTALink;
}) {
  const formUrl = registration.isOpen ? registration.googleFormUrl : null;
  const primary: CTALink = formUrl
    ? { label: "Register now", href: formUrl, external: true }
    : { label: "Ask the panel", href: "/contact" };

  const body = formUrl
    ? "Registration is open. Sign up and the panel will get in touch about trials for your sport."
    : registration.isOpen
      ? "Registration is open. Ask the panel how to sign up for trials in your sport."
      : registration.nextIntakeDate
        ? `Registration is closed for now. The next intake opens ${formatDate(registration.nextIntakeDate)}.`
        : "Registration is closed for now. Ask the panel when it reopens.";

  return (
    <ClosingCTA
      icon={UserPlus}
      eyebrow={registration.isOpen ? "Registration open" : "Registration closed"}
      title={title}
      body={body}
      primary={primary}
      secondary={secondary?.href === primary.href ? undefined : secondary}
    />
  );
}
