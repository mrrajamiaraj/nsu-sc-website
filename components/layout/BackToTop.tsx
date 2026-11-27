"use client";

import { usePathname } from "next/navigation";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";

// "Back to top" on the Contact page: a football that rolls a full turn as the page scrolls up.
export function BackToTop() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const ball = useAnimationControls();
  if (pathname !== "/contact") return null;

  return (
    <div className="mx-auto mt-4 flex max-w-6xl">
      <button
        type="button"
        onClick={() => {
          if (!reduce)
            ball.start({
              rotate: [0, -360],
              y: [0, -6, 0],
              transition: { duration: 0.6, ease: "easeOut" },
            });
          window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
        }}
        className="group inline-flex min-h-[44px] items-center gap-2 self-start text-sm font-semibold text-slate-300 transition hover:text-white active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3fcfca] focus-visible:ring-offset-[3px] focus-visible:ring-offset-[#0b2524]"
      >
        <motion.svg
          animate={ball}
          aria-hidden
          viewBox="0 0 24 24"
          className="h-6 w-6 transition-transform group-hover:-translate-y-0.5"
        >
          <circle
            cx="12"
            cy="12"
            r="10.5"
            fill="#f5f1e8"
            stroke="#0b2524"
            strokeWidth="1.2"
          />
          <path d="m12 7.5 4.3 3.1-1.6 5h-5.4l-1.6-5z" fill="#0b2524" />
          <path
            d="M12 7.5V2M16.3 10.6l5-1.6M14.7 15.6l3 4M9.3 15.6l-3 4M7.7 10.6l-5-1.6"
            stroke="#0b2524"
            strokeWidth="1.2"
          />
        </motion.svg>
        Back to top
      </button>
    </div>
  );
}
