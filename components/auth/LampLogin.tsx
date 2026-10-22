"use client";

import { Suspense, useEffect, useRef, useState, type CSSProperties, type FormEvent, type PointerEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./lamp-login.module.css";

type FormAction = (prevState: { error?: string } | undefined, formData: FormData) => Promise<{ error?: string }>;

const PULL_LIMIT = 60; // px the cord can be dragged down
const PULL_TRIGGER = 18; // px of drag that counts as a pull
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Deterministic positions so server and client render the same fireflies.
const FIREFLIES = Array.from({ length: 16 }, (_, i) => {
  const r = (n: number) => ((Math.sin((i + 1) * n) * 10000) % 1 + 1) % 1;
  return {
    left: `${(r(12.9898) * 96 + 2).toFixed(1)}%`,
    top: `${(r(78.233) * 92 + 4).toFixed(1)}%`,
    dx: `${Math.round(r(37.719) * 60 - 30)}px`,
    dy: `${Math.round(r(91.113) * 50 - 25)}px`,
    dur: `${(4 + r(53.3) * 5).toFixed(1)}s`,
    delay: `${(-r(17.1) * 6).toFixed(1)}s`,
  };
});

function TimeoutNotice() {
  const searchParams = useSearchParams();
  if (searchParams.get("reason") !== "timeout") return null;
  return <p className={styles.notice}>You were signed out after 60 minutes of inactivity.</p>;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.submit} disabled={pending}>
      {pending && <span className={styles.spinner} aria-hidden />}
      {pending ? "Signing in…" : "Sign In"}
    </button>
  );
}

export function LampLogin({ action }: { action: FormAction }) {
  const [on, setOn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [state, formAction] = useFormState(action, {});

  const cordRef = useRef<HTMLButtonElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const drag = useRef<{ startY: number; dy: number; pointerId: number } | null>(null);

  // Hidden in the dark: the card can't be focused or clicked until the lamp is on.
  // (Set on the element directly; React 18 doesn't handle the `inert` prop.)
  const cardRef = useRef<HTMLElement>(null);
  useEffect(() => {
    cardRef.current?.toggleAttribute("inert", !on);
  }, [on]);

  // Hand keyboard focus to the form once the light comes on.
  const focusAfterToggle = useRef(false);
  useEffect(() => {
    if (on && focusAfterToggle.current) {
      focusAfterToggle.current = false;
      const timer = setTimeout(() => emailRef.current?.focus(), 450);
      return () => clearTimeout(timer);
    }
  }, [on]);

  // Spring the cord back up from wherever it was released.
  const release = (from: number) => {
    const cord = cordRef.current;
    if (!cord) return;
    cord.style.setProperty("--pull", "0px");
    cord.style.setProperty("--from", `${from}px`);
    cord.classList.remove(styles.cordRelease);
    void cord.offsetWidth; // restart the animation
    cord.classList.add(styles.cordRelease);
  };

  const toggle = (fromKeyboard = false) => {
    focusAfterToggle.current = fromKeyboard;
    setOn((value) => !value);
  };

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { startY: event.clientY, dy: 0, pointerId: event.pointerId };
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    const dy = Math.max(0, Math.min(PULL_LIMIT, event.clientY - drag.current.startY));
    drag.current.dy = dy;
    event.currentTarget.style.setProperty("--pull", `${dy}px`);
  };

  const onPointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    const { dy } = drag.current;
    drag.current = null;
    // A drag past the trigger is a pull; a plain tap/click counts as a quick pull too.
    if (dy >= PULL_TRIGGER || dy < 4) toggle();
    release(dy < 4 ? 26 : dy);
  };

  const onPointerCancel = () => {
    if (drag.current) release(drag.current.dy);
    drag.current = null;
  };

  const validate = (event: FormEvent<HTMLFormElement>) => {
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const errors: typeof fieldErrors = {};
    if (!email) errors.email = "Enter your email address.";
    else if (!EMAIL_PATTERN.test(email)) errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Enter your password.";
    setFieldErrors(errors);
    if (errors.email || errors.password) {
      event.preventDefault();
      (errors.email ? emailRef.current : event.currentTarget.querySelector<HTMLInputElement>("#password"))?.focus();
    }
  };

  return (
    <main className={cn(styles.room, on && styles.on)}>
      <div className={styles.roomLight} aria-hidden />

      <div className={styles.fireflies} aria-hidden>
        {FIREFLIES.map((f, i) => (
          <span
            key={i}
            className={styles.firefly}
            style={
              { left: f.left, top: f.top, "--dx": f.dx, "--dy": f.dy, "--dur": f.dur, "--delay": f.delay } as CSSProperties
            }
          />
        ))}
      </div>

      <div className={styles.lampArea}>
        <div className={styles.lamp}>
          <div className={styles.beam} aria-hidden />
          <div className={styles.shade} aria-hidden />
          <button
            ref={cordRef}
            type="button"
            className={styles.cord}
            aria-pressed={on}
            aria-label={on ? "Pull the cord to turn the lamp off" : "Pull the cord to turn the lamp on and show the sign-in form"}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            onClick={(event) => {
              // Pointer pulls are handled above; this is Enter/Space from the keyboard.
              if (event.detail === 0) {
                toggle(true);
                release(26);
              }
            }}
            onAnimationEnd={(event) => event.currentTarget.classList.remove(styles.cordRelease)}
          >
            <span className={styles.string} />
            <span className={styles.bead} />
          </button>
          <div className={styles.pole} aria-hidden />
          <div className={styles.base} aria-hidden />
        </div>
      </div>

      <p className={styles.srOnly} aria-live="polite">
        {on ? "The lamp is on. The sign-in form is shown." : ""}
      </p>

      <section
        className={styles.card}
        aria-labelledby="login-title"
        aria-hidden={!on}
        ref={cardRef}
      >
        <h1 id="login-title" className={styles.title}>
          Welcome Back
        </h1>
        <p className={styles.subtitle}>Enter your details to access your account</p>

        <Suspense fallback={null}>
          <TimeoutNotice />
        </Suspense>

        <form action={formAction} onSubmit={validate} noValidate className={styles.form}>
          <div className={cn(styles.field, fieldErrors.email && styles.fieldInvalid)}>
            <Mail className={styles.icon} aria-hidden />
            <label htmlFor="email" className={styles.srOnly}>
              Email address
            </label>
            <input
              ref={emailRef}
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="Email Address"
              required
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              onInput={() => fieldErrors.email && setFieldErrors((e) => ({ ...e, email: undefined }))}
              className={styles.input}
            />
          </div>
          {fieldErrors.email && (
            <p id="email-error" className={styles.fieldError}>
              {fieldErrors.email}
            </p>
          )}

          <div className={cn(styles.field, fieldErrors.password && styles.fieldInvalid)}>
            <Lock className={styles.icon} aria-hidden />
            <label htmlFor="password" className={styles.srOnly}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Password"
              required
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
              onInput={() => fieldErrors.password && setFieldErrors((e) => ({ ...e, password: undefined }))}
              className={styles.input}
            />
            <button
              type="button"
              className={styles.toggle}
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
            </button>
          </div>
          {fieldErrors.password && (
            <p id="password-error" className={styles.fieldError}>
              {fieldErrors.password}
            </p>
          )}

          <Link href="/admin/forgot-password" className={cn(styles.forgot, "tap-target")}>
            Forgot password?
          </Link>

          {state?.error && (
            <p className={styles.formError} role="alert">
              {state.error}
            </p>
          )}

          <SubmitButton />
        </form>
      </section>
    </main>
  );
}
