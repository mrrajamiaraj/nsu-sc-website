import type { Metadata } from "next";
import localFont from "next/font/local";
import { Barlow_Condensed, Inter, Newsreader, Noto_Sans_Bengali } from "next/font/google";
import { SITE_URL } from "@/lib/constants";
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
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
});
// Homepage body text (matchday trial). Other pages keep Geist.
const homeBody = Inter({
  subsets: ["latin"],
  variable: "--font-home",
});
// Newspaper serif for the homepage "Gazette" (blog) section only: headlines, decks and body.
// Bengali script (e.g. বাংলা on the Contact page), matched to Inter's weight.
const bangla = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-bangla",
});
const news = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-news",
});

const SITE_NAME = "NSU Games and Sports Club";
const SITE_DESCRIPTION =
  "The official home of the NSU Games and Sports Club at North South University — events, teams, and members.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${display.variable} ${homeBody.variable} ${news.variable} ${bangla.variable} font-sans text-slate-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}
