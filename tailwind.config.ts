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
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(90deg, #818cf8 0%, #60a5fa 50%, #22d3ee 100%)",
        "brand-gradient-vertical": "linear-gradient(180deg, #818cf8 0%, #60a5fa 50%, #22d3ee 100%)",
        "brand-radial": "radial-gradient(60% 60% at 50% 0%, rgba(96,165,250,0.16), transparent 70%)",
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(96, 165, 250, 0.35)",
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
