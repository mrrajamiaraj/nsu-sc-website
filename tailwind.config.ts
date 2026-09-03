import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        night: {
          950: "#0a1119",
          900: "#101c26",
          800: "#152331",
          700: "#1c2e3e",
          600: "#25394b",
        },
        // NSU SC brand teal, anchored at #004B49 (shade 900) — replaces the
        // former blue/indigo/cyan accent used site-wide as `blue-*`.
        blue: {
          50: "#effbfa",
          100: "#d9f7f6",
          200: "#a8f0ed",
          300: "#79d8d5",
          400: "#3fcfca",
          500: "#20b6b1",
          600: "#04a49f",
          700: "#008580",
          800: "#006663",
          900: "#004b49",
          950: "#002e2c",
        },
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(90deg, #3fcfca 0%, #04a49f 50%, #004b49 100%)",
        "brand-gradient-vertical": "linear-gradient(180deg, #3fcfca 0%, #04a49f 50%, #004b49 100%)",
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(63, 207, 202, 0.35)",
        panel: "0 8px 30px -12px rgba(0, 0, 0, 0.5)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};
export default config;
