import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

// Small uppercase label shown above section and page headings.
export function Eyebrow({
  icon: Icon,
  iconClassName = "text-blue-400",
  className,
  children,
}: {
  icon: LucideIcon;
  iconClassName?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-slate-300",
        className,
      )}
    >
      <Icon className={cn("h-3.5 w-3.5", iconClassName)} />
      {children}
    </div>
  );
}

// Centered page intro: eyebrow, h1 and a short paragraph, each fading in.
export function PageHeader({
  icon,
  iconClassName,
  eyebrow,
  title,
  intro,
  titleClassName,
  introClassName,
}: {
  icon: LucideIcon;
  iconClassName?: string;
  eyebrow: ReactNode;
  title: ReactNode;
  intro: ReactNode;
  titleClassName?: string;
  introClassName?: string;
}) {
  return (
    <div className="px-4 pb-12 pt-4 text-center">
      <Reveal y={16}>
        <Eyebrow icon={icon} iconClassName={iconClassName} className="mb-6">
          {eyebrow}
        </Eyebrow>
      </Reveal>
      <Reveal delay={0.1}>
        <h1 className={cn("text-3xl font-extrabold text-white sm:text-5xl", titleClassName)}>{title}</h1>
      </Reveal>
      <Reveal delay={0.2}>
        <p className={cn("mx-auto mt-4 max-w-xl text-slate-400", introClassName)}>{intro}</p>
      </Reveal>
    </div>
  );
}
