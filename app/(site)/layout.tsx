import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/motion/PageTransition";
import { ScrollSportsBackground } from "@/components/motion/ScrollSportsBackground";
import { getSiteContent } from "@/lib/data/site-content";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const logoUrl = await getSiteContent("site_logo");

  return (
    <>
      <ScrollSportsBackground />
      <Navbar logoUrl={logoUrl} />
      <main className="relative pt-28">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer logoUrl={logoUrl} />
    </>
  );
}
