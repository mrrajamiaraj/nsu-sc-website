"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Magnetic } from "@/components/contact/interaction/Pointer";
import { Baton, UPDATE_EVENT, type UpdateDetail } from "@/components/alumni/relay/shared";
import type { RelayPanel } from "@/lib/alumni-relay";
import { cn } from "@/lib/utils";

type Values = { name: string; role: string; panel: string; title: string; company: string; link: string };
const EMPTY: Values = { name: "", role: "", panel: "", title: "", company: "", link: "" };

function Blank({ id, label, value, onChange, placeholder, width, invalid, inputRef }: { id: string; label: string; value: string; onChange: (v: string) => void; placeholder: string; width: string; invalid?: boolean; inputRef?: React.Ref<HTMLInputElement> }) {
  return (
    <span className="group/line relative inline-block align-baseline">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        ref={inputRef}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        style={{ width }}
        className="peer max-w-full border-0 bg-transparent px-0 pb-1 text-[#f5f1e8] placeholder:italic placeholder:text-[#3fcfca]/45 focus:outline-none"
      />
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-px border-b border-dashed border-[#f5f1e8]/30" />
      {/* The underline draws in on focus. */}
      <span aria-hidden className={cn("absolute inset-x-0 bottom-0 h-[2px] origin-left transition-transform duration-300", invalid ? "scale-x-100 bg-[#f87171]" : "scale-x-0 bg-[#3fcfca] peer-focus:scale-x-100")} />
    </span>
  );
}

const Words = ({ children }: { children: ReactNode }) => <span className="text-[#f5f1e8]/75">{children}</span>;

// "Were you on a past panel?" A sentence the visitor completes; it opens in their email app
// addressed to the club, so the panel can check it before anything changes on the site.
export function UpdateForm({ panels, email }: { panels: RelayPanel[]; email: string }) {
  const reduce = Boolean(useReducedMotion());
  const [v, setV] = useState<Values>(EMPTY);
  const [tried, setTried] = useState(false);
  const [sent, setSent] = useState(false);
  const [shake, setShake] = useState(0);
  const nameRef = useRef<HTMLInputElement>(null);
  const set = (k: keyof Values) => (value: string) => setV((s) => ({ ...s, [k]: value }));

  // "Is this you?" from a profile fills in what we know.
  useEffect(() => {
    const onUpdate = (e: Event) => {
      const d = (e as CustomEvent<UpdateDetail>).detail;
      setSent(false);
      setV((s) => ({ ...s, name: d.name || s.name, role: d.role || s.role, panel: d.panel || s.panel }));
      window.setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 400);
    };
    window.addEventListener(UPDATE_EVENT, onUpdate);
    return () => window.removeEventListener(UPDATE_EVENT, onUpdate);
  }, []);

  const missing = { name: !v.name.trim(), panel: !v.panel };
  const label = panels.find((p) => p.slug === v.panel)?.label ?? "";

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (missing.name || missing.panel) {
      setShake((n) => n + 1);
      return;
    }
    const now = [v.title.trim(), v.company.trim()].filter(Boolean).join(" at ");
    const lines = [
      `Name: ${v.name.trim()}`,
      v.role.trim() ? `Role: ${v.role.trim()}` : null,
      `Panel: ${label}`,
      now ? `Now: ${now}` : null,
      v.link.trim() ? `Profile: ${v.link.trim()}` : null,
      "",
      "Photo: attach a recent photo to this email if you'd like it updated.",
    ].filter((l): l is string => l !== null);
    const subject = `Alumni update: ${v.name.trim()} (Panel ${label})`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
    setSent(true);
  };

  return (
    <section aria-labelledby="update-heading" className="mx-auto mt-28 max-w-[1280px] scroll-mt-24 px-4 sm:px-6 lg:px-8">
      <div className="border-t border-white/15 pt-12 lg:grid lg:grid-cols-12 lg:gap-12 lg:pt-16">
        <div className="lg:col-span-5">
          <h2 id="update-heading" className="scroll-mt-28 text-[40px] !font-extrabold leading-[0.95] text-[#f5f1e8] md:text-[56px]">
            Were you on a past panel?
          </h2>
          <p className="mt-4 max-w-md text-[17px] leading-relaxed text-[#f5f1e8]/70">Missing, or your details are out of date? Tell us where the baton took you.</p>
          <Link href="/members" className="group mt-6 inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-[#3fcfca]">
            Meet the current panel
            <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-10 lg:col-span-7 lg:mt-0">
          <AnimatePresence mode="wait" initial={false}>
            {sent ? (
              <motion.div key="sent" role="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-start gap-4">
                <Baton spin={!reduce} className="h-12 w-12" />
                <p className="max-w-lg text-[22px] font-semibold leading-snug text-[#f5f1e8]">Your email app has the message ready. Send it, and the panel will review it.</p>
                <p className="text-[14px] text-[#f5f1e8]/60">
                  Nothing opened? Write to <span className="font-semibold text-[#f5f1e8]">{email}</span>.
                </p>
                <button type="button" onClick={() => setSent(false)} className="min-h-[44px] text-[15px] font-semibold text-[#3fcfca] underline-offset-4 hover:underline">
                  Edit the details
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" noValidate onSubmit={submit} exit={{ opacity: 0 }}>
                <motion.p
                  key={shake}
                  animate={shake && !reduce ? { x: [0, -7, 7, -5, 5, 0] } : undefined}
                  transition={{ duration: 0.35 }}
                  className="text-[20px] leading-[2.1] md:text-[24px]"
                >
                  <Words>I&rsquo;m </Words>
                  <Blank id="u-name" label="Your name" value={v.name} onChange={set("name")} placeholder="your name" width="12ch" invalid={tried && missing.name} inputRef={nameRef} />
                  <Words>, I was </Words>
                  <Blank id="u-role" label="Your role on the panel" value={v.role} onChange={set("role")} placeholder="your role" width="11ch" />
                  <Words> in panel </Words>
                  <span className="relative inline-block align-baseline">
                    <label htmlFor="u-panel" className="sr-only">
                      Panel
                    </label>
                    <select
                      id="u-panel"
                      value={v.panel}
                      onChange={(e) => set("panel")(e.target.value)}
                      aria-invalid={(tried && missing.panel) || undefined}
                      className={cn(
                        "appearance-none border-0 border-b bg-transparent pb-1 pr-6 focus:outline-none",
                        v.panel ? "text-[#f5f1e8]" : "italic text-[#3fcfca]/60",
                        tried && missing.panel ? "border-[#f87171]" : "border-dashed border-[#f5f1e8]/30 focus:border-solid focus:border-[#3fcfca]",
                      )}
                    >
                      <option value="" disabled>
                        pick one
                      </option>
                      {panels.map((p) => (
                        <option key={p.slug} value={p.slug} className="bg-[#0b2524] not-italic text-[#f5f1e8]">
                          {p.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown aria-hidden className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3fcfca]" />
                  </span>
                  <Words>, and I&rsquo;m now </Words>
                  <Blank id="u-title" label="Your job title now" value={v.title} onChange={set("title")} placeholder="job title" width="10ch" />
                  <Words> at </Words>
                  <Blank id="u-company" label="Organisation" value={v.company} onChange={set("company")} placeholder="organisation" width="12ch" />
                  <Words>.</Words>
                </motion.p>

                <p className="mt-4 text-[16px]">
                  <Words>LinkedIn or profile link </Words>
                  <span className="text-[13px] text-[#f5f1e8]/45">(optional) </span>
                  <Blank id="u-link" label="LinkedIn or profile link" value={v.link} onChange={set("link")} placeholder="linkedin.com/in/…" width="22ch" />
                </p>
                {tried && (missing.name || missing.panel) && (
                  <p role="alert" className="mt-3 text-[14px] text-[#f87171]">
                    Add your {missing.name && missing.panel ? "name and panel" : missing.name ? "name" : "panel"} so the panel can find your entry.
                  </p>
                )}

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Magnetic>
                    <button type="submit" data-haptic className="group inline-flex min-h-[52px] items-center gap-2 rounded-full bg-[#3fcfca] px-7 text-[16px] font-semibold text-[#002e2c] hover:bg-[#6fe0dc]">
                      Send it to the panel
                      <ArrowRight aria-hidden className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </Magnetic>
                  <p className="max-w-xs text-[13px] leading-snug text-[#f5f1e8]/55">Opens in your email app. Attach a photo there if you&rsquo;d like yours updated.</p>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
