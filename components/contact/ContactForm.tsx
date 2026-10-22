"use client";

import { useState, type FormEvent } from "react";
import { Info, MessageSquare, Phone, Send, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Team } from "@/lib/types";

const fieldClasses =
  "w-full rounded-2xl border border-white/15 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/60 focus:outline-none";

// There's no mail server behind this form: submitting opens the visitor's own
// email app with the message filled in, addressed to the club's contact email.
function buildMailto(to: string, name: string, phone: string, squad: string, message: string) {
  const subject = squad ? `Message from ${name} (${squad})` : `Message from ${name}`;
  const details = [`Name: ${name}`, phone && `Phone: ${phone}`, squad && `Squad: ${squad}`].filter(Boolean);
  const body = `${message}\n\n—\n${details.join("\n")}\nSent from the NSU SC website contact form`;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function ContactForm({ teams, email }: { teams: Team[]; email: string }) {
  const [opened, setOpened] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const field = (key: string) => String(data.get(key) ?? "").trim();
    window.location.href = buildMailto(email, field("name"), field("phone"), field("squad"), field("message"));
    setOpened(true);
  }

  return (
    <div className="glass-panel p-6 sm:p-8">
      <h2 className="text-xl font-bold text-white">Send a message</h2>
      <p className="mt-2 flex items-start gap-2 text-sm text-slate-400">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
        <span>
          Sending opens your email app with this message ready to go to{" "}
          <span className="text-slate-200">{email}</span>. Review it there and press send.
        </span>
      </p>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="contact-name" className="text-sm font-medium text-slate-300">
            Name
          </label>
          <div className="relative mt-2">
            <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              id="contact-name"
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="Your name"
              className={fieldClasses}
            />
          </div>
        </div>

        <div>
          <label htmlFor="contact-phone" className="text-sm font-medium text-slate-300">
            Phone <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <div className="relative mt-2">
            <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              id="contact-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+880 1XXX-XXXXXX"
              className={fieldClasses}
            />
          </div>
        </div>

        <div>
          <label htmlFor="contact-squad" className="text-sm font-medium text-slate-300">
            Which squad is this about? <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <select
            id="contact-squad"
            name="squad"
            defaultValue=""
            className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-400/60 focus:outline-none"
          >
            <option value="" className="bg-night-900">
              Not about a specific squad
            </option>
            {teams.map((team) => (
              <option key={team.id} value={team.name} className="bg-night-900">
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
              name="message"
              rows={5}
              required
              placeholder="What would you like to ask the panel?"
              className={`${fieldClasses} resize-none`}
            />
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg">
          Open in email app
          <Send className="h-4 w-4" />
        </Button>

        {opened && (
          <p role="status" className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            Your email app should have opened with the message filled in. If nothing happened, email us
            directly at{" "}
            <a href={`mailto:${email}`} className="font-medium text-blue-400 hover:text-blue-300">
              {email}
            </a>
            .
          </p>
        )}
      </form>
    </div>
  );
}
