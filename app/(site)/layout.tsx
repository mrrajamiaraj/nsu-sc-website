import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/motion/PageTransition";
import { ScrollSportsBackground } from "@/components/motion/ScrollSportsBackground";
import { getSiteContent } from "@/lib/data/site-content";
import { DEFAULT_CONTACT_EMAIL } from "@/lib/constants";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [logoUrl, contactEmail] = await Promise.all([getSiteContent("site_logo"), getSiteContent("contact_email")]);

  return (
    <div className="site-type">
      <ScrollSportsBackground />
      <Navbar logoUrl={logoUrl} />
      <main className="relative pt-28">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer logoUrl={logoUrl} email={contactEmail ?? DEFAULT_CONTACT_EMAIL} />
    </div>
  );
}
