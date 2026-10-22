import Link from "next/link";
import { ClubMark } from "@/components/layout/ClubMark";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "@/components/ui/SocialIcons";

const SOCIAL_LINKS = [
  { href: "https://facebook.com", label: "Facebook", icon: FacebookIcon },
  { href: "https://instagram.com", label: "Instagram", icon: InstagramIcon },
  { href: "https://youtube.com", label: "YouTube", icon: YoutubeIcon },
];

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
          NSU Games and Sports Club
        </Link>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-400">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="tap-target transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

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
      </div>

      <div className="mx-auto mt-6 flex max-w-6xl flex-col gap-1 text-xs text-slate-500 sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} NSU Games and Sports Club, North South University</p>
        <a href={`mailto:${email}`} className="tap-target self-start transition-colors hover:text-white">
          {email}
        </a>
      </div>
    </footer>
  );
}
