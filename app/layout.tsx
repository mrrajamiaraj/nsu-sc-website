import type { Metadata } from "next";
import localFont from "next/font/local";
import { Barlow_Condensed } from "next/font/google";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
// Condensed athletic face for public-site headings and stat numbers only.
const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  // Absolute base for canonical / Open Graph URLs in link previews. Set
  // NEXT_PUBLIC_SITE_URL to the live domain in production.
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
  title: {
    default: "NSU Games and Sports Club",
    template: "%s | NSU Games and Sports Club",
  },
  description:
    "The official home of the NSU Games and Sports Club at North South University — events, teams, and members.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${display.variable} font-sans text-slate-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}
