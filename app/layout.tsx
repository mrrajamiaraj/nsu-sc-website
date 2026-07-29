import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

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

export const metadata: Metadata = {
  title: {
    default: "NSU Sports Club",
    template: "%s | NSU Sports Club",
  },
  description:
    "The official home of North South University Sports Club — events, teams, and members.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-night-950 font-sans text-slate-100 antialiased`}
      >
        <div className="bg-brand-radial pointer-events-none fixed inset-x-0 top-0 h-[600px]" />
        <Navbar />
        <main className="relative pt-28">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
