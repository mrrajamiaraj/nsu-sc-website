import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import type { ReactNode } from "react";

// The lamp login uses Outfit; loaded only on this route.
const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function AdminLoginLayout({ children }: { children: ReactNode }) {
  return <div className={outfit.variable}>{children}</div>;
}
