"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AlertCircle, ArrowUpRight, Check, ChevronDown, Mail, MapPin, Phone, Send, Users, CalendarDays, Handshake, type LucideIcon } from "lucide-react";
import { CopyEmailButton } from "@/components/contact/CopyEmailButton";
import { CONTACT_FOCUS_EVENT, CONTACT_TOPIC_EVENT, Ph } from "@/components/contact/extras/shared";
import { CONTACT_EXTRAS } from "@/lib/contact-extras";
import { CONTACT_TOPICS, contactTopicLabel, type ContactTopic } from "@/lib/contact";
import type { Team } from "@/lib/types";
import { cn, telHref } from "@/lib/utils";

// Contact page body: pick a topic, see how to reach the club, write the message.
// There's no mail server behind the form: sending opens the visitor's own email app
// with the message filled in, addressed to the club's contact email.

const CAMPUS = "North South University, Bashundhara, Dhaka";
const DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(CAMPUS)}`;

const PICKS: { value: ContactTopic; icon: LucideIcon; hint: string }[] = [
  { value: "trials", icon: Users, hint: "Try out for a squad or ask about training." },
  { value: "events", icon: CalendarDays, hint: "Sign-ups, fixtures and results." },
  { value: "partnership", icon: Handshake, hint: "Sponsor an event or work with the club." },
];

type Field = "name" | "topic" | "message";
type Errors = Partial<Record<Field, string>>;

const input =
  "w-full rounded-lg border bg-[#082120] px-4 text-[15px] text-[#f5f1e8] placeholder:text-[#f5f1e8]/40 transition-colors focus:outline-none focus:ring-2";
const inputState = (error?: string) =>
  error
    ? "border-[#ff8f80] focus:border-[#ff8f80] focus:ring-[#ff8f80]/30"
    : "border-white/15 hover:border-white/25 focus:border-[#3fcfca] focus:ring-[#3fcfca]/30";

function buildMailto(to: string, topic: string, name: string, phone: string, squad: string, message: string) {
  const label = contactTopicLabel(topic);
  const subject = `${label}: message from ${name}${squad ? ` (${squad})` : ""}`;
  const details = [`Topic: ${label}`, `Name: ${name}`, phone && `Phone: ${phone}`, squad && `Squad: ${squad}`].filter(Boolean);
  const body = `${message}\n\n—\n${details.join("\n")}\nSent from the NSU SC website contact form`;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function validate(values: { name: string; topic: string; message: string }): Errors {
  const errors: Errors = {};
  if (!values.name) errors.name = "Enter your name so the panel knows who to reply to.";
  if (!values.topic) errors.topic = "Choose a subject.";
  if (!values.message) errors.message = "Write a message for the panel.";
  else if (values.message.length < 10) errors.message = "Add a little more detail (at least 10 characters).";
  return errors;
}

function without(errors: Errors, field: Field): Errors {
  const copy = { ...errors };
  delete copy[field];
  return copy;
}

function FieldError({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-2 flex items-start gap-1.5 text-[13px] text-[#ffb4a8]">
      <AlertCircle aria-hidden className="mt-px h-4 w-4 shrink-0" />
      {children}
    </p>
  );
}

function Label({ htmlFor, children, optional }: { htmlFor: string; children: ReactNode; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="text-[14px] font-medium text-[#f5f1e8]/90">
      {children}
      {optional && <span className="font-normal text-[#f5f1e8]/50"> (optional)</span>}
    </label>
  );
}

// ---- Contact details

function DetailsColumn({ email, phone, hours, address }: { email: string; phone: string; hours: string; address: string }) {
  const rows: { label: string; body: ReactNode }[] = [
    {
      label: "Email",
      body: (
        <>
          <a href={`mailto:${email}`} className="break-all text-[15px] font-medium text-[#3fcfca] underline-offset-4 hover:underline">
            {email}
          </a>
          <CopyEmailButton email={email} className="mt-2.5 flex" />
        </>
      ),
    },
    {
      label: "University switchboard",
      body: (
        <>
          <a href={telHref(phone)} className="text-[15px] font-medium text-[#3fcfca] underline-offset-4 hover:underline">
            {phone}
          </a>
          <p className="mt-1 text-[13px] leading-snug text-[#f5f1e8]/60">North South University&rsquo;s main line, not a direct club number.</p>
        </>
      ),
    },
    {
      label: "Campus hours",
      body: (
        <>
          <p className="text-[15px] text-[#f5f1e8]">{hours}</p>
          <p className="mt-1 text-[13px] leading-snug text-[#f5f1e8]/60">The university&rsquo;s campus hours, not club office hours.</p>
        </>
      ),
    },
    {
      label: "Location",
      body: (
        <>
          <p className="text-[15px] text-[#f5f1e8]">North South University campus</p>
          <p className="text-[13px] text-[#f5f1e8]/60">{address}</p>
          <a
            href={DIRECTIONS}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex min-h-[44px] items-center gap-1 text-[14px] font-semibold text-[#3fcfca] underline-offset-4 hover:underline"
          >
            Get directions
            <ArrowUpRight aria-hidden className="h-4 w-4" />
            <span className="sr-only">(opens Google Maps)</span>
          </a>
        </>
      ),
    },
  ];

  return (
    <aside aria-labelledby="reach-heading" className="hidden lg:col-span-4 lg:block">
      <h2 id="reach-heading" className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#f5f1e8]/60">
        Reach the club
      </h2>
      <dl className="mt-4">
        {rows.map((row) => (
          <div key={row.label} className="border-t border-white/10 py-5">
            <dt className="text-[13px] font-medium text-[#f5f1e8]/60">{row.label}</dt>
            <dd className="mt-1.5">{row.body}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}

// Phones: the three ways to reach the club as quick actions above the form.
function QuickActions({ email, phone }: { email: string; phone: string }) {
  const actions = [
    { label: "Email us", sub: "Club inbox", href: `mailto:${email}`, icon: Mail },
    { label: "Call", sub: "NSU switchboard", href: telHref(phone), icon: Phone },
    { label: "Get directions", sub: "NSU campus", href: DIRECTIONS, icon: MapPin, external: true },
  ];
  return (
    <ul className="grid grid-cols-3 gap-2 lg:hidden" aria-label="Quick ways to reach the club">
      {actions.map((action) => (
        <li key={action.label}>
          <a
            href={action.href}
            target={action.external ? "_blank" : undefined}
            rel={action.external ? "noopener noreferrer" : undefined}
            className="flex h-full min-h-[88px] flex-col items-center justify-center gap-1 rounded-lg border border-white/12 bg-[#0f302e] px-2 py-3 text-center transition-colors hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3fcfca]"
          >
            <action.icon aria-hidden className="h-5 w-5 text-[#3fcfca]" />
            <span className="text-[14px] font-semibold leading-tight text-[#f5f1e8]">{action.label}</span>
            <span className="text-[12px] leading-tight text-[#f5f1e8]/55">{action.sub}</span>
            {action.external && <span className="sr-only">(opens Google Maps)</span>}
          </a>
        </li>
      ))}
    </ul>
  );
}

// ---- Panel

export function ContactPanel({
  teams,
  email,
  phone,
  hours,
  address,
  initialTopic,
}: {
  teams: Team[];
  email: string;
  phone: string;
  hours: string;
  address: string;
  initialTopic: ContactTopic | null;
}) {
  const [topic, setTopic] = useState<ContactTopic | "">(initialTopic ?? "");
  const [errors, setErrors] = useState<Errors>({});
  const [opened, setOpened] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const summary = useRef<HTMLDivElement>(null);

  const errorCount = Object.keys(errors).length;

  // Move on to the form: focus the first field still to fill in. Coming from further down
  // the page, scroll back up smoothly and pulse that field once so it's easy to spot.
  const goToForm = ({ fromBelow = false } = {}) => {
    requestAnimationFrame(() => {
      const fields = form.current;
      if (!fields) return;
      const name = fields.elements.namedItem("name") as HTMLInputElement | null;
      const message = fields.elements.namedItem("message") as HTMLTextAreaElement | null;
      const target = name && !name.value.trim() ? name : message;
      if (!target) return;
      if (fromBelow) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        fields.closest("section")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        target.focus({ preventScroll: true });
        target.classList.remove("field-pulse");
        void target.offsetWidth; // restart the animation if it ran before
        target.classList.add("field-pulse");
      } else {
        target.focus();
      }
    });
  };

  const pick = (value: ContactTopic, fromBelow = false) => {
    setTopic(value);
    setErrors((current) => without(current, "topic"));
    goToForm({ fromBelow });
  };

  // "Talk partnerships" and "Still stuck?" further down the page.
  useEffect(() => {
    const onTopic = (event: Event) => pick((event as CustomEvent<ContactTopic>).detail, true);
    const onFocus = () => goToForm({ fromBelow: true });
    window.addEventListener(CONTACT_TOPIC_EVENT, onTopic);
    window.addEventListener(CONTACT_FOCUS_EVENT, onFocus);
    return () => {
      window.removeEventListener(CONTACT_TOPIC_EVENT, onTopic);
      window.removeEventListener(CONTACT_FOCUS_EVENT, onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Once a field has shown an error, re-check it as the visitor types.
  const recheck = (field: Field, value: string) => {
    if (!errors[field]) return;
    const next = validate({ name: "x", topic: "x", message: "xxxxxxxxxx", [field]: value.trim() });
    setErrors((current) => (next[field] ? { ...current, [field]: next[field] } : without(current, field)));
  };

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const field = (key: string) => String(data.get(key) ?? "").trim();
    const values = { name: field("name"), topic: field("topic"), message: field("message") };
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setOpened(false);
      requestAnimationFrame(() => summary.current?.focus());
      return;
    }
    window.location.href = buildMailto(email, values.topic, values.name, field("phone"), field("squad"), values.message);
    setOpened(true);
  }

  const describedBy = (fieldName: Field, extra?: string) => [errors[fieldName] && `${fieldName}-error`, extra].filter(Boolean).join(" ") || undefined;

  return (
    <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
      <QuickActions email={email} phone={phone} />

      {/* Topic picker: prefills the Subject and moves on to the form. */}
      <section aria-labelledby="topic-heading" className="mt-8 lg:mt-0">
        <h2 id="topic-heading" className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#f5f1e8]/60">
          What&rsquo;s it about?
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {PICKS.map((option) => {
            const selected = topic === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                onClick={() => pick(option.value)}
                className={cn(
                  "group flex items-start gap-4 rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3fcfca] sm:p-5",
                  selected ? "border-[#3fcfca] bg-[#3fcfca]/[0.07]" : "border-white/12 bg-[#0f302e] hover:border-white/25",
                )}
              >
                <option.icon aria-hidden className={cn("mt-0.5 h-5 w-5 shrink-0", selected ? "text-[#3fcfca]" : "text-[#f5f1e8]/60")} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-semibold text-[#f5f1e8]">{contactTopicLabel(option.value)}</span>
                  <span className="mt-1 block text-[14px] leading-snug text-[#f5f1e8]/65">{option.hint}</span>
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                    selected ? "border-[#3fcfca] bg-[#3fcfca] text-[#002e2c]" : "border-white/25 text-transparent",
                  )}
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12">
        <DetailsColumn email={email} phone={phone} hours={hours} address={address} />

        <section aria-labelledby="form-heading" className="scroll-mt-28 rounded-xl border border-white/10 bg-[#0f302e] p-5 sm:p-8 lg:col-span-8">
          <h2 id="form-heading" className="text-[28px] !font-extrabold uppercase leading-none text-[#f5f1e8] sm:text-[32px]">
            Send a message
          </h2>

          {errorCount > 0 && (
            <div
              ref={summary}
              tabIndex={-1}
              role="alert"
              className="mt-5 rounded-lg border border-[#ff8f80]/60 bg-[#ff8f80]/[0.08] p-4 text-[14px] text-[#ffd2cb] focus:outline-none"
            >
              <p className="font-semibold">
                {errorCount === 1 ? "One thing to fix before sending:" : `${errorCount} things to fix before sending:`}
              </p>
              <ul className="mt-1.5 list-disc space-y-0.5 pl-5">
                {(["name", "topic", "message"] as Field[]).map((key) =>
                  errors[key] ? (
                    <li key={key}>
                      <a href={`#contact-${key}`} className="underline underline-offset-2">
                        {errors[key]}
                      </a>
                    </li>
                  ) : null,
                )}
              </ul>
            </div>
          )}

          <form ref={form} noValidate onSubmit={handleSubmit} className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="contact-name">Name</Label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={describedBy("name")}
                aria-required
                onChange={(e) => recheck("name", e.target.value)}
                className={cn(input, inputState(errors.name), "mt-2 h-12")}
              />
              <FieldError id="name-error">{errors.name}</FieldError>
            </div>

            <div>
              <Label htmlFor="contact-phone" optional>
                Phone
              </Label>
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+880 1XXX-XXXXXX"
                className={cn(input, inputState(), "mt-2 h-12")}
              />
            </div>

            <div className={topic === "trials" ? "" : "sm:col-span-2"}>
              <Label htmlFor="contact-topic">Subject</Label>
              <div className="relative mt-2">
                <select
                  id="contact-topic"
                  name="topic"
                  value={topic}
                  aria-invalid={Boolean(errors.topic)}
                  aria-describedby={describedBy("topic")}
                  aria-required
                  onChange={(e) => {
                    setTopic(e.target.value as ContactTopic | "");
                    recheck("topic", e.target.value);
                  }}
                  className={cn(input, inputState(errors.topic), "h-12 appearance-none pr-11")}
                >
                  <option value="" disabled className="bg-[#082120]">
                    Choose a subject
                  </option>
                  {CONTACT_TOPICS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-[#082120]">
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown aria-hidden className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#f5f1e8]/70" />
              </div>
              <FieldError id="topic-error">{errors.topic}</FieldError>
            </div>

            {/* Only asked when the message is about squads and trials. */}
            {topic === "trials" && (
              <div>
                <Label htmlFor="contact-squad" optional>
                  Squad
                </Label>
                <div className="relative mt-2">
                  <select
                    id="contact-squad"
                    name="squad"
                    defaultValue=""
                    className={cn(input, inputState(), "h-12 appearance-none pr-11")}
                  >
                    <option value="" className="bg-[#082120]">
                      Not sure yet
                    </option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.name} className="bg-[#082120]">
                        {team.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown aria-hidden className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#f5f1e8]/70" />
                </div>
              </div>
            )}

            <div className="sm:col-span-2">
              <Label htmlFor="contact-message">Message</Label>
              <textarea
                id="contact-message"
                name="message"
                rows={6}
                placeholder="What would you like to ask the panel?"
                aria-invalid={Boolean(errors.message)}
                aria-describedby={describedBy("message")}
                aria-required
                onChange={(e) => recheck("message", e.target.value)}
                className={cn(input, inputState(errors.message), "mt-2 resize-y py-3 leading-relaxed")}
              />
              <FieldError id="message-error">{errors.message}</FieldError>
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                aria-describedby="send-note"
                className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#3fcfca] px-7 text-base font-semibold text-[#002e2c] transition hover:bg-[#6fe0dc] active:scale-[0.99] active:bg-[#2fbab5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f302e] sm:w-auto"
              >
                Open in email app
                <Send aria-hidden className="h-4 w-4" />
              </button>
              <p id="send-note" className="mt-2.5 text-[14px] text-[#f5f1e8]/70">
                Review and send your message in your email app.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-white/10 pt-5 text-[14px] text-[#f5f1e8]/70">
                <span>
                  No email app? Write to{" "}
                  <a href={`mailto:${email}`} className="font-semibold text-[#f5f1e8] underline-offset-4 hover:underline">
                    {email}
                  </a>
                </span>
                <CopyEmailButton email={email} />
              </div>

              {opened && (
                <p role="status" className="mt-4 rounded-lg border border-white/10 bg-[#082120] p-4 text-[14px] text-[#f5f1e8]/80">
                  Your email app should have opened with the message filled in. Review it there and press send. If nothing
                  happened, copy the address above and write to the club from your usual email.
                </p>
              )}

              {/* Small print: response times, urgent contact, privacy, language. */}
              <ul className="mt-5 space-y-1.5 text-[13px] leading-relaxed text-[#f5f1e8]/60">
                <li>
                  We reply within {CONTACT_EXTRAS.replyTime ?? <Ph>24–48 hours</Ph>} on working days. During exams or major events, replies may be slower.
                </li>
                <li>Matchday or urgent issue? Call {CONTACT_EXTRAS.matchdayPhone ?? <Ph>matchday contact number</Ph>} on event days.</li>
                <li>We only use your details to reply to you. We never share them.</li>
                <li>
                  You can write to us in English or <span lang="bn">বাংলা</span>.
                </li>
              </ul>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
