"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const MotionLink = motion.create(Link);

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-gradient text-night-950 font-semibold shadow-glow hover:brightness-110 active:brightness-95",
  secondary:
    "border border-white/15 bg-white/5 text-white hover:bg-white/10 hover:border-white/25",
  ghost: "text-slate-300 hover:text-white hover:bg-white/5",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

const baseClasses =
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-night-950";

const tapAnimation = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.96 },
  transition: { type: "spring" as const, stiffness: 400, damping: 25 },
};

function Shine({ variant }: { variant: ButtonVariant }) {
  if (variant !== "primary") return null;
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
    />
  );
}

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}

// framer-motion's motion.button redefines onDrag/onAnimationStart/etc with
// its own (event, info) signature, which conflicts with the native DOM
// handler signatures from ButtonHTMLAttributes — omit them here.
type NativeConflictingHandlers =
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration";

interface ButtonAsButton
  extends CommonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | NativeConflictingHandlers> {
  href?: undefined;
}

interface ButtonAsLink extends CommonProps {
  href: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) {
  const classes = cn(baseClasses, variantClasses[variant], sizeClasses[size], className);

  if ("href" in props && props.href) {
    const { href, target, rel, onClick } = props;
    return (
      <MotionLink href={href} target={target} rel={rel} onClick={onClick} className={classes} {...tapAnimation}>
        <Shine variant={variant} />
        <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      </MotionLink>
    );
  }

  return (
    <motion.button
      className={classes}
      {...tapAnimation}
      {...(props as Omit<ButtonHTMLAttributes<HTMLButtonElement>, NativeConflictingHandlers>)}
    >
      <Shine variant={variant} />
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </motion.button>
  );
}
