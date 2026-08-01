import { Mail, MapPin, Phone } from "lucide-react";
import { IconChip } from "@/components/ui/IconChip";
import { Reveal } from "@/components/motion/Reveal";

export interface ContactSidebarProps {
  address: string;
  phone: string;
  email: string;
  hours: string;
}

export function ContactSidebar({ address, phone, email, hours }: ContactSidebarProps) {
  const contactItems = [
    { icon: MapPin, color: "purple" as const, label: "Visit Us", value: address },
    { icon: Phone, color: "teal" as const, label: "Call Us", value: phone },
    { icon: Mail, color: "green" as const, label: "Email Us", value: email },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Reveal delay={0.1}>
        <div className="glass-panel p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white">Contact Information</h2>
          <div className="mt-6 flex flex-col gap-5">
            {contactItems.map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <IconChip icon={item.icon} color={item.color} />
                <div>
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="text-sm text-slate-400">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="glass-panel p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white">Office Hours</h2>
          <div className="mt-4 flex items-center justify-between py-3 text-sm">
            <span className="text-slate-300">All Days</span>
            <span className="font-semibold text-white">{hours}</span>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="glass-panel h-56 overflow-hidden">
          <iframe
            title="North South University location"
            src="https://www.google.com/maps?q=North+South+University,+Bashundhara,+Dhaka&output=embed"
            className="h-full w-full grayscale invert-[92%] contrast-[90%]"
            loading="lazy"
          />
        </div>
      </Reveal>
    </div>
  );
}
