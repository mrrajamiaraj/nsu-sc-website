import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { MatchReport } from "@/components/achievements/report/MatchReport";
import { ContactStage } from "@/components/contact/interaction/ContactStage";
import { HomeMotionConfig } from "@/components/home/HomeMotion";
import { findReport } from "@/lib/report";
import { detailPageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const report = await findReport(params.slug);
  if (!report) return { title: "Achievement" };
  const { entry } = report;
  // The poster is the link preview, so shared links on Facebook and WhatsApp show it.
  return detailPageMetadata({ title: entry.title, description: entry.summary, path: report.href, image: entry.photos[0] });
}

// "Match report" for one achievement, at /achievements/<slug>. Old /achievements/<uuid>
// links redirect here. The trophy room opens the same report as an overlay.
export default async function AchievementPage({ params }: { params: { slug: string } }) {
  const report = await findReport(params.slug);
  if (!report) notFound();
  if (params.slug !== report.entry.slug) permanentRedirect(report.href);

  return (
    <HomeMotionConfig>
      <div className="contact-page -mt-28 bg-[#0b2524] pt-28 text-[#f5f1e8] [font-family:var(--font-home),system-ui,sans-serif]">
        <ContactStage progress={false}>
          <MatchReport data={report} mode="page" />
        </ContactStage>
      </div>
    </HomeMotionConfig>
  );
}
