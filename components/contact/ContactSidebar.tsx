import type { ReactNode } from "react";
import { ArrowUpRight, Clock, Mail, MapPin, Phone, type LucideIcon } from "lucide-react";
import { CopyEmailButton } from "@/components/contact/CopyEmailButton";
import { LocationMap } from "@/components/contact/LocationMap";
import { IconChip, type ChipColor } from "@/components/ui/IconChip";
import { telHref } from "@/lib/utils";

interface ContactSidebarProps {
  address: string;
  phone: string;
  email: string;
  hours: string;
}

type ContactItem = { icon: LucideIcon; color: ChipColor; label: string; value: string; href?: string; extra?: ReactNode };

// Where the map and directions point; the admin address is a postal line and may not name the campus.
const CAMPUS = "North South University, Bashundhara, Dhaka";

export function ContactSidebar({ address, phone, email, hours }: ContactSidebarProps) {
  const items: ContactItem[] = [
    {
      icon: Mail,
      color: "green",
      label: "Email",
      value: email,
      href: `mailto:${email}`,
      extra: <CopyEmailButton email={email} className="mt-2" />,
    },
    { icon: Phone, color: "teal", label: "Phone", value: phone, href: telHref(phone) },
    { icon: Clock, color: "amber", label: "Office hours", value: hours },
    {
      icon: MapPin,
      color: "purple",
      label: "Address",
      value: address,
      // Directions don't depend on the map below having loaded.
      extra: (
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(CAMPUS)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="tap-target mt-2 inline-flex items-center gap-1 text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
        >
          Get directions
          <ArrowUpRight aria-hidden className="h-4 w-4" />
          <span className="sr-only">(opens Google Maps)</span>
        </a>
      ),
    },
  ];

  return (
    <div className="glass-panel overflow-hidden">
      <div className="p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white">Reach us directly</h2>
        <dl className="mt-6 flex flex-col gap-5">
          {items.map((item) => (
            <div key={item.label} className="flex items-start gap-4">
              <IconChip icon={item.icon} color={item.color} />
              <div className="min-w-0">
                <dt className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-slate-400">
                  {item.label}
                </dt>
                <dd className="mt-1 break-words text-sm text-white">
                  {item.href ? (
                    <a
                      href={item.href}
                      className="tap-target font-medium text-blue-400 underline-offset-4 transition-colors hover:text-blue-300 hover:underline"
                    >
                      {item.value}
                    </a>
                  ) : (
                    item.value
                  )}
                  {item.extra && <div>{item.extra}</div>}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </div>

      <LocationMap query={CAMPUS} />
    </div>
  );
}
