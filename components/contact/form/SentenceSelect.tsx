"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { baseLine } from "@/components/contact/form/styles";
import { cn } from "@/lib/utils";

export interface SentenceOption {
  value: string;
  label: string;
  hint?: string;
  icon?: ReactNode;
}

// An inline dropdown that reads as part of a sentence: a button showing the choice, and a
// listbox (arrow keys, Home/End, Enter/Space to choose, Esc or Tab to close). Options slide
// in one after another; the highlighted option shows a one-line hint.
export function SentenceSelect({
  id,
  name,
  label,
  value,
  options,
  placeholder,
  invalid,
  describedBy,
  onChange,
  onClose,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  options: SentenceOption[];
  placeholder: string;
  invalid?: boolean;
  describedBy?: string;
  onChange: (value: string) => void;
  onClose?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrap = useRef<HTMLSpanElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const listId = useId();
  const selected = options.find((option) => option.value === value);

  const openList = (at?: number) => {
    const index = at ?? Math.max(0, options.findIndex((option) => option.value === value));
    setActive(index);
    setOpen(true);
  };
  const close = (refocus = true) => {
    setOpen(false);
    onClose?.();
    if (refocus) button.current?.focus();
  };
  const choose = (index: number) => {
    onChange(options[index].value);
    close();
  };

  useEffect(() => {
    if (open) list.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onButtonKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      openList();
    }
  };

  const onListKey = (e: KeyboardEvent<HTMLUListElement>) => {
    const last = options.length - 1;
    if (e.key === "ArrowDown") setActive((i) => Math.min(last, i + 1));
    else if (e.key === "ArrowUp") setActive((i) => Math.max(0, i - 1));
    else if (e.key === "Home") setActive(0);
    else if (e.key === "End") setActive(last);
    else if (e.key === "Enter" || e.key === " ") choose(active);
    else if (e.key === "Escape") close();
    else if (e.key === "Tab") {
      setOpen(false);
      return;
    } else return;
    e.preventDefault();
  };

  return (
    <span ref={wrap} className="relative inline-flex min-w-[200px] flex-1 md:flex-none">
      <input type="hidden" name={name} value={value} />
      <button
        ref={button}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${label}: ${selected?.label ?? placeholder}`}
        aria-describedby={describedBy}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onButtonKey}
        className="group/select relative inline-flex w-full items-baseline gap-1.5 px-0 pb-[6px] pt-0 text-left focus-visible:outline-none"
      >
        {selected?.icon && (
          // The squad's sport icon spins into the sentence when chosen.
          <motion.span
            key={selected.value}
            initial={{ rotate: -200, scale: 0.4, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 16 }}
            className="inline-flex self-center"
          >
            {selected.icon}
          </motion.span>
        )}
        <span className={selected ? "font-semibold text-[#f5f1e8]" : "font-normal italic text-[#3fcfca]/45"}>{selected?.label ?? placeholder}</span>
        <ChevronDown
          aria-hidden
          className={cn("h-4 w-4 shrink-0 self-center transition-transform duration-200", selected ? "text-[#f5f1e8]" : "text-[#3fcfca]/45", open && "rotate-180")}
        />
        <span aria-hidden className={baseLine(!selected)} />
        <span
          aria-hidden
          className={cn(
            "absolute inset-x-0 bottom-0 h-[2px] origin-left transition-transform duration-300",
            invalid ? "scale-x-100 bg-[#f87171]" : "scale-x-0 bg-[#3fcfca] group-focus-visible/select:scale-x-100",
            open && !invalid && "scale-x-100",
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            ref={list}
            id={listId}
            role="listbox"
            tabIndex={-1}
            aria-label={label}
            aria-activedescendant={`${listId}-${active}`}
            onKeyDown={onListKey}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-40 mt-2 w-[min(20rem,80vw)] rounded-lg border border-white/15 bg-[#082120] p-1.5 text-[15px] shadow-[0_18px_36px_-14px_rgba(0,0,0,0.85)] focus:outline-none"
          >
            {options.map((option, i) => {
              const isActive = i === active;
              const isSelected = option.value === value;
              return (
                <motion.li
                  key={option.value}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={isSelected}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.035, type: "spring", stiffness: 420, damping: 30 }}
                  onPointerEnter={() => setActive(i)}
                  onClick={() => choose(i)}
                  className={cn("cursor-pointer rounded-md px-3 py-2.5", isActive && "bg-white/[0.06]")}
                >
                  <span className="flex items-center gap-2.5">
                    {option.icon && <span className="inline-flex text-[#f5f1e8]/70">{option.icon}</span>}
                    <span className={cn("font-medium", isSelected ? "text-[#3fcfca]" : "text-[#f5f1e8]")}>{option.label}</span>
                  </span>
                  {option.hint && isActive && (
                    <motion.span
                      initial={{ opacity: 0, y: -2 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                      className={cn("mt-0.5 block text-[13px] leading-snug text-[#f5f1e8]/60", option.icon && "pl-[1.85rem]")}
                    >
                      {option.hint}
                    </motion.span>
                  )}
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </span>
  );
}
