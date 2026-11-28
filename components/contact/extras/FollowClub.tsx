import { ArrowUpRight } from "lucide-react";
import type { SocialAccount } from "@/lib/contact-extras";

// Large text links to the club's own accounts. Only accounts with a confirmed URL are passed
// in; the page leaves the section out when there are none.
export function FollowClub({ accounts, matchdayLine }: { accounts: SocialAccount[]; matchdayLine: string | null }) {
  return (
    <div>
      <h2 id="follow-heading" className="text-[40px] !font-extrabold leading-none text-[#f5f1e8]">
        Follow the club
      </h2>
      <ul className="mt-8 flex flex-col gap-4 md:flex-row md:flex-wrap md:gap-x-14">
        {accounts.map((a) => (
          <li key={a.label}>
            <a
              href={a.url!}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 font-display text-[40px] font-extrabold uppercase leading-none text-[#f5f1e8] transition-colors hover:text-[#3fcfca] focus-visible:text-[#3fcfca] md:text-[56px]"
            >
              {a.label}
              <ArrowUpRight
                aria-hidden
                className="h-8 w-8 -translate-x-2 opacity-40 transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
              />
              <span className="sr-only">(opens {a.label})</span>
            </a>
          </li>
        ))}
      </ul>
      {matchdayLine && <p className="mt-8 text-[15px] text-[#f5f1e8]/60">{matchdayLine}</p>}
    </div>
  );
}
