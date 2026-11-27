import { Ph, SectionHeading } from "@/components/contact/extras/shared";
import { CONTACT_EXTRAS } from "@/lib/contact-extras";
import { cn } from "@/lib/utils";

// Large text links to the club's own accounts. Until an account URL is confirmed in
// lib/contact-extras.ts it shows as a placeholder instead of a link to a platform homepage.
export function FollowClub({ className }: { className?: string }) {
  return (
    <section aria-labelledby="follow-heading" className={cn("border-t border-white/10 pt-14", className)}>
      <SectionHeading id="follow-heading" title="Follow the club" />
      <ul className="mt-6 flex flex-col gap-5 md:flex-row md:flex-wrap md:gap-x-12 md:gap-y-6">
        {CONTACT_EXTRAS.socials.map((account) => (
          <li key={account.label}>
            {account.url ? (
              <a
                href={account.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex flex-col focus-visible:outline-none"
              >
                <span className="font-display text-[28px] font-extrabold uppercase leading-none text-[#f5f1e8] transition-colors group-hover:text-[#3fcfca] group-focus-visible:text-[#3fcfca] md:text-[36px]">
                  {account.label} <span aria-hidden>↗</span>
                </span>
                <span className="mt-1.5 h-5 overflow-hidden text-[13px] text-[#f5f1e8]/60">
                  {/* Follower count slides up into view on hover. */}
                  <span className="block translate-y-full opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:transition-none">
                    {account.followers ?? <Ph>follower count</Ph>}
                  </span>
                </span>
              </a>
            ) : (
              <span className="inline-flex flex-col">
                <span className="font-display text-[28px] font-extrabold uppercase leading-none text-[#f5f1e8]/45 md:text-[36px]">
                  {account.label} <span aria-hidden>↗</span>
                </span>
                <span className="mt-1.5 text-[13px]">
                  <Ph>{account.hint}</Ph>
                </span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
