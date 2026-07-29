"use client";

import { CheckCircle2, Mail, Send, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";

const BENEFITS = [
  "Exclusive event invitations",
  "Early access to registrations",
  "Championship results and highlights",
];

export function Newsletter() {
  return (
    <section className="px-4 pb-20">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <GlassCard className="relative overflow-hidden p-8 sm:p-10">
            <div className="absolute right-6 top-6 hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-teal-300 sm:inline-flex">
              <Sparkles className="h-3.5 w-3.5" />
              Weekly Updates
            </div>

            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300">
                  <Mail className="h-3.5 w-3.5 text-blue-400" />
                  Stay Connected
                </div>
                <h2 className="text-3xl font-bold text-white sm:text-4xl">
                  Never Miss an <span className="text-gradient-brand">Update</span>
                </h2>
                <p className="mt-4 max-w-md text-slate-400">
                  Subscribe to our newsletter and get exclusive updates about upcoming events, championship
                  results, and inspiring stories from our athletes.
                </p>
                <ul className="mt-6 space-y-2">
                  {BENEFITS.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <form className="glass-panel p-6" onSubmit={(event) => event.preventDefault()}>
                <label htmlFor="newsletter-email" className="text-sm font-semibold text-white">
                  Email Address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  className="mt-2 w-full rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/60 focus:outline-none"
                />
                <Button type="submit" className="mt-4 w-full">
                  Subscribe Now
                  <Send className="h-4 w-4" />
                </Button>
                <p className="mt-3 text-center text-xs text-slate-500">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </form>
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}
