import type { Metadata } from "next";
import { RelayPage } from "@/components/alumni/relay/RelayPage";
import { ContactStage } from "@/components/contact/interaction/ContactStage";
import { HomeMotionConfig } from "@/components/home/HomeMotion";
import { getAchievements } from "@/lib/data/achievements";
import { getAlumni, getAlumniClassYears } from "@/lib/data/alumni";
import { getCutoutFrames } from "@/lib/data/cutouts";
import { getSiteContent } from "@/lib/data/site-content";
import { buildRelay, uniquePeople } from "@/lib/alumni-relay";
import { DEFAULT_CONTACT_EMAIL } from "@/lib/constants";
import { FOUNDED } from "@/lib/gazette";

const TITLE = "Alumni: past panels";
const DESCRIPTION = "Every panel that has run NSU Games & Sports Club, one leg of the relay at a time: the people, their roles, and where they are now.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/alumni" },
  openGraph: { title: `${TITLE} | NSU Games & Sports Club`, description: DESCRIPTION, url: "/alumni" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

type Search = { panel?: string | string[]; view?: string | string[]; person?: string | string[] };
const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

// "The relay": past panels as legs of a relay, newest first. The chosen panel (latest by
// default), the directory data and any open profile are all rendered on the server.
export default async function AlumniPage({ searchParams }: { searchParams: Search }) {
  const [alumni, classYears, achievements, email] = await Promise.all([getAlumni(), getAlumniClassYears(), getAchievements(), getSiteContent("contact_email")]);
  const frames = await getCutoutFrames(alumni.map((a) => a.photo).filter(Boolean) as string[]);
  const panels = buildRelay(classYears, alumni, frames, achievements);

  const person = one(searchParams.person) ?? null;
  const owner = person ? panels.find((p) => [...p.executives, ...p.subExecutives].some((x) => x.slug === person)) : undefined;
  const asked = one(searchParams.panel);
  const panel = panels.find((p) => p.slug === asked)?.slug ?? owner?.slug ?? panels[0]?.slug ?? "";

  return (
    <HomeMotionConfig>
      <div className="-mt-28 overflow-x-clip bg-[#0b2524] pb-4 pt-28 [font-family:var(--font-home),system-ui,sans-serif]">
        <ContactStage>
          {panels.length > 0 ? (
            <RelayPage
              panels={panels}
              people={uniquePeople(panels)}
              founded={FOUNDED}
              email={email ?? DEFAULT_CONTACT_EMAIL}
              initial={{ panel, view: one(searchParams.view) === "all" ? "all" : "panel", person: owner ? person : null }}
            />
          ) : (
            <p className="mx-auto max-w-[1280px] px-6 py-24 text-[#f5f1e8]/60 lg:px-8">Past panels will appear here once they&rsquo;re added.</p>
          )}
        </ContactStage>
      </div>
    </HomeMotionConfig>
  );
}
