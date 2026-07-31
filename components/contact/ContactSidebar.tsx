import { Mail, MapPin, Phone } from "lucide-react";
import { IconChip } from "@/components/ui/IconChip";
import { Reveal } from "@/components/motion/Reveal";

const CONTACT_ITEMS = [
  { icon: MapPin, color: "purple" as const, label: "Visit Us", value: "Bashundhara, Dhaka 1229, Bangladesh" },
  { icon: Phone, color: "teal" as const, label: "Call Us", value: "+880 2-55668200" },
  { icon: Mail, color: "green" as const, label: "Email Us", value: "sports@northsouth.edu" },
];

const OFFICE_HOURS = [
  { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM" },
  { day: "Saturday", hours: "10:00 AM - 4:00 PM" },
  { day: "Sunday", hours: "Closed" },
];

export function ContactSidebar() {
  return (
    <div className="flex flex-col gap-6">
      <Reveal delay={0.1}>
        <div className="glass-panel p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white">Contact Information</h2>
          <div className="mt-6 flex flex-col gap-5">
            {CONTACT_ITEMS.map((item) => (
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
          <div className="mt-4 divide-y divide-white/10">
            {OFFICE_HOURS.map((entry) => (
              <div key={entry.day} className="flex items-center justify-between py-3 text-sm first:pt-0 last:pb-0">
                <span className="text-slate-300">{entry.day}</span>
                <span
                  className={
                    entry.hours === "Closed" ? "font-semibold text-slate-500" : "font-semibold text-white"
                  }
                >
                  {entry.hours}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="glass-panel flex h-56 flex-col items-center justify-center gap-2 text-slate-500">
          <MapPin className="h-8 w-8 text-teal-400" strokeWidth={1.5} />
          <p className="text-sm">Interactive Map</p>
        </div>
      </Reveal>
    </div>
  );
}
