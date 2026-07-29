import { cn } from "@/lib/utils";

interface SectionLabelProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionLabel({ eyebrow, title, description, align = "left", className }: SectionLabelProps) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">{eyebrow}</span>
      )}
      <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">{title}</h2>
      {description && <p className="mt-2 text-slate-400">{description}</p>}
    </div>
  );
}
