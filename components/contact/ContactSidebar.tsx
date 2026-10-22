import { Clock, Mail, MapPin, Phone, type LucideIcon } from "lucide-react";
import { IconChip, type ChipColor } from "@/components/ui/IconChip";

export interface ContactSidebarProps {
  address: string;
  phone: string;
  email: string;
  hours: string;
}

type ContactItem = { icon: LucideIcon; color: ChipColor; label: string; value: string; href?: string };

export function ContactSidebar({ address, phone, email, hours }: ContactSidebarProps) {
  const items: ContactItem[] = [
    { icon: Mail, color: "green", label: "Email", value: email, href: `mailto:${email}` },
    { icon: Phone, color: "teal", label: "Phone", value: phone, href: `tel:${phone.replace(/[^\d+]/g, "")}` },
    { icon: Clock, color: "amber", label: "Office hours", value: hours },
    { icon: MapPin, color: "purple", label: "Address", value: address },
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
                      className="font-medium text-blue-400 underline-offset-4 transition-colors hover:text-blue-300 hover:underline"
                    >
                      {item.value}
                    </a>
                  ) : (
                    item.value
                  )}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </div>

      <div className="h-56 border-t border-white/10">
        <iframe
          title="North South University location"
          src="https://www.google.com/maps?q=North+South+University,+Bashundhara,+Dhaka&output=embed"
          className="h-full w-full grayscale invert-[92%] contrast-[90%]"
          loading="lazy"
        />
      </div>
    </div>
  );
}
