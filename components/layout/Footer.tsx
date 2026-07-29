import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "@/components/ui/SocialIcons";

const SOCIAL_LINKS = [
  { href: "https://facebook.com", label: "Facebook", icon: FacebookIcon },
  { href: "https://instagram.com", label: "Instagram", icon: InstagramIcon },
  { href: "https://youtube.com", label: "YouTube", icon: YoutubeIcon },
];

const QUICK_LINKS = [
  { href: "/events", label: "Events" },
  { href: "/about", label: "About Us" },
  { href: "/teams", label: "Teams" },
  { href: "/members", label: "Members" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 px-4 pb-8">
      <div className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-white/[0.02] p-8 sm:p-10">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-sm text-night-950">
                SC
              </span>
              NSU Sports Club
            </div>
            <p className="mt-3 text-sm text-slate-400">
              One club, every sport — compete, connect, and represent NSU.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Quick Links</h3>
            <ul className="mt-3 space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-400 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Contact</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-slate-500" />
                <a href="mailto:sportsclub@nsu.edu.bd" className="transition-colors hover:text-white">
                  sportsclub@nsu.edu.bd
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-slate-500" />
                North South University, Bashundhara, Dhaka
              </li>
            </ul>
            <div className="mt-4 flex gap-2">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-colors hover:border-white/25 hover:text-white"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
          © {year} NSU Sports Club. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
