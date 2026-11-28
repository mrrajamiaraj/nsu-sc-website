import Link from "next/link";
import { ClubMark } from "@/components/layout/ClubMark";
import { BackToTop } from "@/components/layout/BackToTop";
import { FacebookIcon, InstagramIcon, LinkedinIcon, YoutubeIcon } from "@/components/ui/SocialIcons";
import { CONTACT_EXTRAS } from "@/lib/contact-extras";

// Only the club's own accounts, once their URLs are set in lib/contact-extras.ts;
// no links to platform homepages.
const ICONS = { Facebook: FacebookIcon, Instagram: InstagramIcon, YouTube: YoutubeIcon, LinkedIn: LinkedinIcon } as const;
const SOCIAL_LINKS = CONTACT_EXTRAS.socials.flatMap((account) =>
  account.url && account.label in ICONS
    ? [{ href: account.url, label: account.label, icon: ICONS[account.label as keyof typeof ICONS] }]
    : [],
);

const LINKS = [
  { href: "/events", label: "Events" },
  { href: "/teams", label: "Teams" },
  { href: "/achievements", label: "Achievements" },
  { href: "/members", label: "Members" },
  { href: "/alumni", label: "Alumni" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Footer({ logoUrl, email }: { logoUrl?: string | null; email: string }) {
  return (
    <footer className="mt-24 border-t border-white/10 px-4 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-white">
          <ClubMark logoUrl={logoUrl} />
          NSU Games &amp; Sports Club
        </Link>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-400">
            {LINKS.map((link) => (
              <li key={link.href}>
                {/* The underline draws in from the left on hover. */}
                <Link
                  href={link.href}
                  className="tap-target bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[color,background-size] duration-200 hover:bg-[length:100%_1px] hover:text-white focus-visible:bg-[length:100%_1px]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {SOCIAL_LINKS.length > 0 && (
          <div className="flex gap-2">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <social.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        )}
      </div>

      <BackToTop />

      <div className="mx-auto mt-6 flex max-w-6xl flex-col gap-1 text-xs text-slate-500 sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} NSU Games &amp; Sports Club, North South University</p>
        <div className="flex items-center gap-4">
          <a href={`mailto:${email}`} className="tap-target self-start transition-colors hover:text-white">
            {email}
          </a>
        </div>
      </div>
    </footer>
  );
}
