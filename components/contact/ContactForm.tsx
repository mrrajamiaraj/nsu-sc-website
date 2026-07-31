"use client";

import { Mail, MessageSquare, Phone, Send, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Team } from "@/lib/types";

const fieldClasses =
  "w-full rounded-2xl border border-white/15 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/60 focus:outline-none";

export function ContactForm({ teams }: { teams: Team[] }) {
  return (
    <div className="glass-panel p-6 sm:p-8">
      <h2 className="text-xl font-bold text-white">Send Us a Message</h2>

      <form className="mt-6 space-y-5" onSubmit={(event) => event.preventDefault()}>
        <div>
          <label htmlFor="contact-name" className="text-sm font-medium text-slate-300">
            Full Name
          </label>
          <div className="relative mt-2">
            <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input id="contact-name" type="text" required placeholder="John Doe" className={fieldClasses} />
          </div>
        </div>

        <div>
          <label htmlFor="contact-email" className="text-sm font-medium text-slate-300">
            Email Address
          </label>
          <div className="relative mt-2">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              id="contact-email"
              type="email"
              required
              placeholder="john@example.com"
              className={fieldClasses}
            />
          </div>
        </div>

        <div>
          <label htmlFor="contact-phone" className="text-sm font-medium text-slate-300">
            Phone Number
          </label>
          <div className="relative mt-2">
            <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input id="contact-phone" type="tel" placeholder="+880 1234567890" className={fieldClasses} />
          </div>
        </div>

        <div>
          <label htmlFor="contact-sport" className="text-sm font-medium text-slate-300">
            Interested Sport
          </label>
          <select
            id="contact-sport"
            defaultValue=""
            className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-400/60 focus:outline-none"
          >
            <option value="" disabled className="bg-night-900">
              Select a sport
            </option>
            {teams.map((team) => (
              <option key={team.id} value={team.id} className="bg-night-900">
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="contact-message" className="text-sm font-medium text-slate-300">
            Message
          </label>
          <div className="relative mt-2">
            <MessageSquare className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
            <textarea
              id="contact-message"
              rows={4}
              placeholder="Tell us about your athletic background and goals..."
              className={`${fieldClasses} resize-none`}
            />
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg">
          Send Message
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
