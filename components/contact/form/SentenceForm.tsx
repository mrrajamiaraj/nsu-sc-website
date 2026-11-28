"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { CopyEmailButton } from "@/components/contact/CopyEmailButton";
import { SentenceSelect, type SentenceOption } from "@/components/contact/form/SentenceSelect";
import { SmallPrint } from "@/components/contact/form/SmallPrint";
import { FIELD_TEXT, SMALL, SMALL_LINK, baseLine } from "@/components/contact/form/styles";
import { SportIcon } from "@/components/home/SportIcon";
import { Magnetic } from "@/components/contact/interaction/Pointer";
import { CONTACT_TOPICS, contactTopicLabel, type ContactTopic } from "@/lib/contact";
import type { Team } from "@/lib/types";
import { cn } from "@/lib/utils";

// The contact form written as a sentence: "Hi panel, my name is ___ and I'd like to talk
// about ___ …". There's no mail server behind it: sending opens the visitor's own email app
// with the message filled in, addressed to the club's contact email.

const LIMIT = 1000;
const DRAFT_KEY = "nsusc-contact-draft";

const PHRASE: Record<ContactTopic, string> = {
  trials: "squads & trials",
  events: "events & registration",
  partnership: "a partnership",
  other: "something else",
};
const HINT: Record<ContactTopic, string> = {
  trials: "Trials: we'll point you to the next trial date.",
  events: "Events: sign-ups, fixtures and results.",
  partnership: "Partnerships: sponsors, kit and venue partners.",
  other: "Anything else for the panel.",
};
const CHIPS = [
  { label: "Ask about trial dates", text: "When are the next trial dates? " },
  { label: "Ask about fees", text: "Is there a membership fee? " },
  { label: "Ask about venue booking", text: "How can I book a venue or court? " },
];

type Field = "name" | "topic" | "phone" | "message";
type Values = { name: string; topic: string; company: string; squad: string; phone: string; message: string };
type Status = "idle" | "progress" | "check" | "opening" | "sent";

function check(field: Field, v: Values): string | undefined {
  if (field === "name") {
    if (!v.name.trim()) return "Tell the panel your name.";
    if (v.name.trim().length < 2) return "That looks a little short.";
  }
  if (field === "topic" && !v.topic) return "Pick what it's about.";
  if (field === "phone" && v.phone.trim() && v.phone.replace(/\D/g, "").length < 7) return "Check the number, or leave it blank.";
  if (field === "message") {
    if (!v.message.trim()) return "Write a message for the panel.";
    if (v.message.trim().length < 10) return "Add a little more detail (at least 10 characters).";
  }
  return undefined;
}

function buildMailto(to: string, v: Values) {
  const label = contactTopicLabel(v.topic);
  const subject = `${label}: message from ${v.name.trim()}${v.squad ? ` (${v.squad})` : ""}`;
  const details = [
    `Topic: ${label}`,
    `Name: ${v.name.trim()}`,
    v.company.trim() && `Company: ${v.company.trim()}`,
    v.squad && `Squad: ${v.squad}`,
    v.phone.trim() && `Phone: ${v.phone.trim()}`,
  ].filter(Boolean);
  const body = `${v.message.trim()}\n\n—\n${details.join("\n")}\nSent from the NSU SC website contact form`;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// ---- Pieces

// Back of a club shirt with the visitor's name, updating as they type.
function Jersey({ name }: { name: string }) {
  const word = (name.trim().split(/\s+/).pop() ?? "").toUpperCase().slice(0, 12);
  const size = word.length > 9 ? 7 : word.length > 6 ? 8.5 : 10;
  return (
    <svg aria-hidden viewBox="0 0 64 58" className="h-12 w-[52px] shrink-0 self-center">
      <path d="M20 4 L8 10 L2 24 L11 28 L14 22 L14 55 L50 55 L50 22 L53 28 L62 24 L56 10 L44 4 C41 9 23 9 20 4 Z" fill="#004b49" stroke="#3fcfca" strokeOpacity="0.55" strokeWidth="1.5" strokeLinejoin="round" />
      <text x="32" y="33" textAnchor="middle" fill="#f5f1e8" fontSize={size} fontWeight="800" style={{ fontFamily: "var(--font-display)" }}>
        {word}
      </text>
    </svg>
  );
}

function ValidTick({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          aria-hidden
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 520, damping: 20 }}
          className="inline-flex h-5 w-5 items-center justify-center self-center rounded-full bg-[#3fcfca] text-[#002e2c]"
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </motion.span>
      )}
    </AnimatePresence>
  );
}

// An underlined input that sits inside the sentence. The underline draws in on focus,
// shakes and turns red when the entry is wrong.
function LineInput({
  id,
  name,
  value,
  placeholder,
  width,
  invalid,
  shake,
  describedBy,
  inputRef,
  type = "text",
  autoComplete,
  onChange,
  onBlur,
  label,
}: {
  id: string;
  name: string;
  value: string;
  placeholder: string;
  /** Desktop width; on phones the field fills the rest of its line (or wraps under the words). */
  width: string;
  invalid: boolean;
  shake: number;
  describedBy?: string;
  inputRef?: RefObject<HTMLInputElement>;
  type?: string;
  autoComplete?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  label: string;
}) {
  const controls = useAnimationControls();
  useEffect(() => {
    if (shake > 0) controls.start({ x: [0, -7, 7, -5, 5, -2, 0], transition: { duration: 0.38 } });
  }, [shake, controls]);
  return (
    <motion.span animate={controls} className={cn("relative inline-flex min-w-[11rem] flex-1 md:flex-none", width)}>
      <input
        ref={inputRef}
        id={id}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-label={label}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={FIELD_TEXT}
      />
      <span aria-hidden className={baseLine(!value)} />
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 bottom-0 h-[2px] origin-left transition-transform duration-300",
          invalid ? "scale-x-100 bg-[#f87171]" : "scale-x-0 bg-[#3fcfca] peer-focus:scale-x-100",
        )}
      />
    </motion.span>
  );
}

function FieldMessage({ id, children }: { id: string; children?: string }) {
  return (
    <AnimatePresence initial={false}>
      {children && (
        <motion.p
          id={id}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="mt-1.5 basis-full text-[14px] text-[#f87171]"
        >
          {children}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

function Line({ children }: { children: ReactNode }) {
  return <div className="group/line flex flex-wrap items-baseline gap-x-3 gap-y-2">{children}</div>;
}
const Words = ({ children }: { children: ReactNode }) => <span className="font-normal text-[#f5f1e8]/60">{children}</span>;

// Whistle with sound waves, for the "message ready" state.
function Whistle() {
  return (
    <svg aria-hidden viewBox="0 0 64 48" className="h-12 w-16 text-[#3fcfca]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <motion.g initial={{ rotate: -12 }} animate={{ rotate: [-12, 6, -4, 0] }} transition={{ duration: 0.6 }} style={{ transformOrigin: "24px 30px" }}>
        <path d="M8 22h22l6-6h10v10H36a14 14 0 1 1-28 0z" />
        <circle cx="22" cy="30" r="4" />
      </motion.g>
      {[0, 1, 2].map((i) => (
        <motion.path
          key={i}
          d={`M${50 + i * 4} ${12 - i * 3}a${8 + i * 4} ${8 + i * 4} 0 0 1 0 ${12 + i * 6}`}
          initial={{ opacity: 0, pathLength: 0 }}
          animate={{ opacity: [0, 1, 0.4], pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
        />
      ))}
    </svg>
  );
}

// ---- Form

export interface SentenceFormHandle {
  goTo: (target: "auto" | "company" | "message", options?: { fromBelow?: boolean }) => void;
  prefill: (greeting: string) => void;
}

const EMPTY: Values = { name: "", topic: "", company: "", squad: "", phone: "", message: "" };

export const SentenceForm = forwardRef<
  SentenceFormHandle,
  { teams: Team[]; email: string; topic: ContactTopic | ""; onTopicChange: (topic: ContactTopic | "") => void; initialSquad?: string }
>(function SentenceForm({ teams, email, topic, onTopicChange, initialSquad = "" }, ref) {
  const reduce = Boolean(useReducedMotion());
  const [values, setValues] = useState<Values>({ ...EMPTY, topic, squad: topic === "trials" ? initialSquad : "" });
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [shakes, setShakes] = useState<Record<Field, number>>({ name: 0, topic: 0, phone: 0, message: 0 });
  const [status, setStatus] = useState<Status>("idle");
  const [announce, setAnnounce] = useState("");
  const [offer, setOffer] = useState<Values | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const section = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const companyRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const timers = useRef<number[]>([]);
  const lastSaved = useRef("");

  // The topic is shared with the topic cards above the form.
  useEffect(() => setValues((v) => (v.topic === topic ? v : { ...v, topic, company: topic === "partnership" ? v.company : "", squad: topic === "trials" ? v.squad : "" })), [topic]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const set = (field: keyof Values, value: string) => setValues((v) => ({ ...v, [field]: value }));
  const error = (field: Field) => (touched[field] ? check(field, values) : undefined);

  // Grow the message box with its text.
  const grow = useCallback(() => {
    const el = messageRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);
  useEffect(grow, [values.message, grow]);

  // ---- Draft autosave: every 2 s; a returning visitor is offered their unsent message.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = { ...EMPTY, ...(JSON.parse(raw) as Partial<Values>) };
        if (draft.name || draft.message) setOffer(draft);
        lastSaved.current = raw;
      }
    } catch {
      // Storage blocked or bad data: start fresh.
    }
  }, []);

  useEffect(() => {
    if (status === "sent" || offer) return;
    const timer = window.setInterval(() => {
      const hasContent = values.name || values.message || values.phone || values.company;
      const snapshot = JSON.stringify(values);
      if (!hasContent || snapshot === lastSaved.current) return;
      try {
        window.localStorage.setItem(DRAFT_KEY, snapshot);
        lastSaved.current = snapshot;
        setSavedFlash(true);
        window.setTimeout(() => setSavedFlash(false), 1400);
      } catch {
        // Storage full or blocked: no autosave.
      }
    }, 2000);
    return () => window.clearInterval(timer);
  }, [values, status, offer]);

  const clearDraft = () => {
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      // ignore
    }
    lastSaved.current = "";
  };

  // ---- Moving focus here from elsewhere on the page.
  const goTo = useCallback(
    (target: "auto" | "company" | "message", { fromBelow = false } = {}) => {
      // Wait a frame (two, for a field that has only just appeared).
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const el =
            target === "company"
              ? companyRef.current
              : target === "message"
                ? messageRef.current
                : nameRef.current && !nameRef.current.value.trim()
                  ? nameRef.current
                  : messageRef.current;
          if (!el) return;
          if (fromBelow) {
            section.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
            el.focus({ preventScroll: true });
            const pulse = el.closest("span, div") ?? el;
            pulse.classList.remove("field-pulse");
            void (pulse as HTMLElement).offsetWidth;
            pulse.classList.add("field-pulse");
          } else {
            el.focus();
          }
          if (el instanceof HTMLTextAreaElement) el.setSelectionRange(el.value.length, el.value.length);
        }),
      );
    },
    [reduce],
  );

  useImperativeHandle(
    ref,
    () => ({
      goTo,
      prefill: (greeting: string) => {
        setValues((v) => ({ ...v, message: greeting + v.message.replace(/^Hi [^,\n]{1,40}, /, "") }));
        goTo("message", { fromBelow: true });
      },
    }),
    [goTo],
  );

  // ---- Suggestion chips add their question to the message.
  const addChip = (text: string) => {
    const start = values.message && !/\s$/.test(values.message) ? " " : "";
    const full = (start + text).slice(0, Math.max(0, LIMIT - values.message.length));
    setValues((v) => ({ ...v, message: v.message + full }));
    messageRef.current?.focus();
  };

  // ---- Sending
  function submit() {
    if (status !== "idle") return;
    const fields: Field[] = ["name", "topic", "phone", "message"];
    setTouched({ name: true, topic: true, phone: true, message: true });
    const bad = fields.filter((field) => check(field, values));
    if (bad.length > 0) {
      setShakes((s) => ({ ...s, ...Object.fromEntries(bad.map((f) => [f, s[f] + 1])) }));
      setAnnounce(bad.length === 1 ? "One thing to fix before sending." : `${bad.length} things to fix before sending.`);
      const first = bad[0];
      const target =
        first === "name" ? nameRef.current : first === "phone" ? phoneRef.current : first === "message" ? messageRef.current : document.getElementById("contact-topic");
      target?.focus();
      return;
    }
    const mailto = buildMailto(email, values);
    const finish = () => {
      setStatus("sent");
      clearDraft();
    };
    if (reduce) {
      setStatus("opening");
      window.location.href = mailto;
      timers.current.push(window.setTimeout(finish, 300));
      return;
    }
    setStatus("progress");
    timers.current.push(window.setTimeout(() => setStatus("check"), 320));
    timers.current.push(
      window.setTimeout(() => {
        setStatus("opening");
        window.location.href = mailto;
      }, 520),
    );
    timers.current.push(window.setTimeout(finish, 1000));
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit();
  };
  const onKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      submit();
    }
  };

  const reset = () => {
    setValues({ ...EMPTY });
    onTopicChange("");
    setTouched({});
    setStatus("idle");
    clearDraft();
    requestAnimationFrame(() => nameRef.current?.focus());
  };

  const topicOptions: SentenceOption[] = CONTACT_TOPICS.map((t) => ({ value: t.value, label: PHRASE[t.value], hint: HINT[t.value] }));
  const squadOptions: SentenceOption[] = [
    { value: "", label: "not sure yet", hint: "The panel will help you pick." },
    ...teams.map((team) => {
      const sport = team.name.replace(/\s+(Male|Female)$/i, "");
      const side = /Female$/i.test(team.name) ? "women's" : /Male$/i.test(team.name) ? "men's" : "";
      return {
        value: team.name,
        label: side ? `${side} ${sport.toLowerCase()}` : sport.toLowerCase(),
        icon: <SportIcon sport={sport} className="h-4 w-4" />,
      };
    }),
  ];

  const count = values.message.length;
  const countTone = count >= LIMIT ? "text-[#f87171]" : count >= LIMIT * 0.8 ? "text-[#fbbf24]" : "text-[#f5f1e8]/60";
  const nameError = error("name");
  const topicError = error("topic");
  const phoneError = error("phone");
  const messageError = error("message");

  return (
    <section ref={section} id="contact-form" aria-labelledby="form-heading" className="relative scroll-mt-28">
      <h2 id="form-heading" className="![font-family:inherit] text-[13px] !font-semibold uppercase !leading-normal tracking-[0.16em] text-[#f5f1e8]/60">
        Send a message
      </h2>
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>

      <AnimatePresence mode="wait" initial={false}>
        {status === "sent" ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-8 flex flex-col items-start gap-4"
            role="status"
          >
            <Whistle />
            <p className="max-w-lg text-[20px] font-semibold leading-[1.5] text-[#f5f1e8] md:text-[24px]">
              Message ready in your email app. Press send there.
            </p>
            <button type="button" onClick={reset} className={cn(SMALL_LINK, "min-h-[44px] gap-1.5")}>
              Write another
              <ArrowRight aria-hidden className="h-4 w-4" />
            </button>
            <div className={cn(SMALL, "mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-white/10 pt-6")}>
              <span>
                Nothing opened? Write to <span className="font-semibold text-[#f5f1e8]">{email}</span>
              </span>
              <CopyEmailButton email={email} />
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            noValidate
            onSubmit={onSubmit}
            onKeyDown={onKeyDown}
            exit={{ opacity: 0 }}
            className="mt-6 text-[20px] leading-[1.5] md:text-[24px]"
          >
            {offer && (
              <div className={cn(SMALL, "mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-[#3fcfca]/40 bg-[#3fcfca]/[0.06] px-4 py-3")}>
                <span>Continue your message?</span>
                <button
                  type="button"
                  onClick={() => {
                    setValues(offer);
                    onTopicChange((offer.topic as ContactTopic) || "");
                    setOffer(null);
                  }}
                  className={SMALL_LINK}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearDraft();
                    setOffer(null);
                  }}
                  className={SMALL_LINK}
                >
                  Start fresh
                </button>
              </div>
            )}

            <div className="flex flex-col gap-5">
              <Line>
                <Words>Hi panel, my name is</Words>
                <LineInput
                  id="contact-name"
                  name="name"
                  label="Your name"
                  value={values.name}
                  placeholder="your name"
                  width="md:w-[220px]"
                  autoComplete="name"
                  inputRef={nameRef}
                  invalid={Boolean(nameError)}
                  shake={shakes.name}
                  describedBy={nameError ? "name-error" : undefined}
                  onChange={(v) => set("name", v)}
                  onBlur={() => values.name && setTouched((t) => ({ ...t, name: true }))}
                />
                <ValidTick show={!check("name", values)} />
                <AnimatePresence>
                  {values.name.trim() && (
                    <motion.span
                      initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 380, damping: 18 }}
                      className="inline-flex self-center"
                      title="Your name on a club shirt"
                    >
                      <Jersey name={values.name} />
                    </motion.span>
                  )}
                </AnimatePresence>
                <FieldMessage id="name-error">{nameError}</FieldMessage>
              </Line>

              <Line>
                <Words>and I&rsquo;d like to talk about</Words>
                <ShakeWrap shake={shakes.topic}>
                  <SentenceSelect
                    id="contact-topic"
                    name="topic"
                    label="What it's about"
                    value={values.topic}
                    options={topicOptions}
                    placeholder="choose a topic"
                    invalid={Boolean(topicError)}
                    describedBy={topicError ? "topic-error" : undefined}
                    onChange={(v) => {
                      onTopicChange(v as ContactTopic);
                      setTouched((t) => ({ ...t, topic: true }));
                      if (v === "partnership") goTo("company");
                    }}
                  />
                </ShakeWrap>
                <AnimatePresence>
                  {values.topic === "partnership" && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex min-w-0 flex-1 items-baseline gap-3 md:flex-none"
                    >
                      <Words>from</Words>
                      <LineInput
                        id="contact-company"
                        name="company"
                        label="Company name (optional)"
                        value={values.company}
                        placeholder="company name"
                        width="md:w-[220px]"
                        autoComplete="organization"
                        inputRef={companyRef}
                        invalid={false}
                        shake={0}
                        onChange={(v) => set("company", v)}
                        onBlur={() => undefined}
                      />
                    </motion.span>
                  )}
                </AnimatePresence>
                <ValidTick show={Boolean(values.topic)} />
                <FieldMessage id="topic-error">{topicError}</FieldMessage>
              </Line>

              <AnimatePresence initial={false}>
                {values.topic === "trials" && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Line>
                      <Words>for the</Words>
                      <SentenceSelect
                        id="contact-squad"
                        name="squad"
                        label="Squad (optional)"
                        value={values.squad}
                        options={squadOptions}
                        placeholder="not sure yet"
                        onChange={(v) => set("squad", v)}
                      />
                      <Words>squad.</Words>
                    </Line>
                  </motion.div>
                )}
              </AnimatePresence>

              <Line>
                <Words>You can reach me on</Words>
                <LineInput
                  id="contact-phone"
                  name="phone"
                  label="Phone number (optional)"
                  type="tel"
                  value={values.phone}
                  placeholder="+880 1XXX-XXXXXX"
                  width="md:w-[240px]"
                  autoComplete="tel"
                  inputRef={phoneRef}
                  invalid={Boolean(phoneError)}
                  shake={shakes.phone}
                  describedBy={phoneError ? "phone-error" : undefined}
                  onChange={(v) => set("phone", v)}
                  onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                />
                <span className="-ml-1 text-[14px] text-[#f5f1e8]/45">(optional)</span>
                <ValidTick show={Boolean(values.phone.trim()) && !check("phone", values)} />
                <FieldMessage id="phone-error">{phoneError}</FieldMessage>
              </Line>
            </div>

            {/* Message */}
            <div className="mt-5">
              <label htmlFor="contact-message" className="block font-normal text-[#f5f1e8]/60">
                Here&rsquo;s my message:
              </label>
              <div className={cn(SMALL, "mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1")}>
                <span>Try:</span>
                {CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    disabled={count >= LIMIT}
                    onClick={() => addChip(chip.text)}
                    className={cn(SMALL_LINK, "disabled:opacity-40")}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
              <ShakeWrap shake={shakes.message} block>
                <span className="group/line relative mt-3 block">
                  <textarea
                    ref={messageRef}
                    id="contact-message"
                    name="message"
                    rows={3}
                    maxLength={LIMIT}
                    value={values.message}
                    placeholder="What would you like to ask the panel?"
                    aria-invalid={Boolean(messageError) || undefined}
                    aria-describedby={["message-count", messageError && "message-error"].filter(Boolean).join(" ")}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => set("message", e.target.value)}
                    onBlur={() => values.message && setTouched((t) => ({ ...t, message: true }))}
                    className="peer block min-h-[96px] w-full resize-none overflow-hidden border-0 bg-transparent px-0 pb-[6px] pt-0 text-[16px] font-normal leading-[1.6] text-[#f5f1e8] placeholder:italic placeholder:text-[#3fcfca]/45 focus:outline-none md:text-[18px]"
                  />
                  <span aria-hidden className={baseLine(!values.message)} />
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-0 bottom-0 h-[2px] origin-left transition-transform duration-300",
                      messageError ? "scale-x-100 bg-[#f87171]" : "scale-x-0 bg-[#3fcfca] peer-focus:scale-x-100",
                    )}
                  />
                </span>
              </ShakeWrap>
              <div className="mt-2 flex items-start justify-between gap-4">
                <FieldMessage id="message-error">{messageError}</FieldMessage>
                <span id="message-count" className={cn("ml-auto shrink-0 text-[14px] tabular-nums transition-colors", countTone)}>
                  {count} / {LIMIT}
                </span>
              </div>
            </div>

            {/* Send. On phones the button sticks to the bottom of the screen while the form is in view. */}
            {/* The wrapper is display: contents on phones so the sticky button spans the whole form. */}
            <div className="max-md:contents md:mt-8">
              <div className="sticky bottom-3 z-20 mt-8 md:static md:mt-0">
                <Magnetic className="w-full md:w-auto">
                  <motion.button
                    type="submit"
                    data-haptic
                    whileTap={status === "idle" ? { scale: 0.97 } : undefined}
                    aria-describedby="send-note"
                    aria-live="polite"
                    className="group relative inline-flex h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-[#3fcfca] px-7 text-[16px] font-semibold leading-none text-[#0b2524] transition-colors hover:bg-[#6fe0dc] md:w-auto md:min-w-[15rem]"
                  >
                    {status === "progress" && (
                      <motion.span
                        aria-hidden
                        className="absolute inset-y-0 left-0 w-full origin-left bg-[#0b2524]/20"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.32, ease: "easeInOut" }}
                      />
                    )}
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={status}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.12 }}
                        className="relative inline-flex items-center gap-2"
                      >
                        {status === "idle" && (
                          <>
                            Open in email app
                            <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" />
                          </>
                        )}
                        {status === "progress" && "Getting it ready…"}
                        {status === "check" && (
                          <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <motion.path d="M5 12.5l4.5 4.5L19 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.18 }} />
                          </svg>
                        )}
                        {status === "opening" && "Opening your email…"}
                      </motion.span>
                    </AnimatePresence>
                  </motion.button>
                </Magnetic>
              </div>
              <p id="send-note" className={cn(SMALL, "mt-2.5")}>
                Review and send your message in your email app. <span className="hidden md:inline">Ctrl/⌘ + Enter also sends.</span>
              </p>

              {/* Small print: divider with 24px above and below. */}
              <div className={cn(SMALL, "mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-white/10 pt-6")}>
                <span>
                  No email app? Write to <span className="font-semibold text-[#f5f1e8]">{email}</span>
                </span>
                <CopyEmailButton email={email} />
              </div>

              <SmallPrint />
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Autosave note, bottom right of the form. */}
      <AnimatePresence>
        {savedFlash && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(SMALL, "absolute -bottom-7 right-0")}
          >
            Draft saved
          </motion.span>
        )}
      </AnimatePresence>
    </section>
  );
});

// Shakes its contents when `shake` goes up (used for fields that aren't plain inputs).
function ShakeWrap({ shake, block = false, children }: { shake: number; block?: boolean; children: ReactNode }) {
  const controls = useAnimationControls();
  useEffect(() => {
    if (shake > 0) controls.start({ x: [0, -7, 7, -5, 5, -2, 0], transition: { duration: 0.38 } });
  }, [shake, controls]);
  return (
    <motion.span animate={controls} className={block ? "block" : "inline-flex min-w-[200px] flex-1 md:flex-none"}>
      {children}
    </motion.span>
  );
}
