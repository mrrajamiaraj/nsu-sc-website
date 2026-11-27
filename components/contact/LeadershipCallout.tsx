import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Compact callout under the contact section: an outline button, not a second bright one,
// so the form's "Open in email app" stays the page's main action.
export function LeadershipCallout({ href, external }: { href: string; external: boolean }) {
  return (
    <section aria-labelledby="leadership-heading" className="mx-auto max-w-[1280px] px-6 pb-20 pt-12 lg:px-8 lg:pt-16">
      <div className="flex flex-col gap-5 rounded-xl border border-white/10 p-6 sm:p-8 md:flex-row md:items-center md:justify-between md:gap-10">
        <div className="max-w-2xl">
          <h2 id="leadership-heading" className="text-[28px] !font-extrabold uppercase leading-none text-[#f5f1e8] sm:text-[32px]">
            Interested in leadership?
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-[#f5f1e8]/70">
            We&rsquo;re always looking for passionate people to join the executive panel. Elections are held every year.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 md:shrink-0">
          <a
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-white/30 px-6 text-[15px] font-semibold text-[#f5f1e8] transition hover:border-white/60 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3fcfca]"
          >
            Get involved
            <ArrowRight aria-hidden className="h-4 w-4" />
            {external && <span className="sr-only">(opens the sign-up form)</span>}
          </a>
          <Link href="/members" className="text-[15px] font-semibold text-[#3fcfca] underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none">
            Meet the panel
          </Link>
        </div>
      </div>
    </section>
  );
}
