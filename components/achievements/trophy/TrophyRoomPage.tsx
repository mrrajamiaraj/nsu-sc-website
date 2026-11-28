import { Suspense } from "react";
import { TrophyRoom } from "@/components/achievements/trophy/TrophyRoom";
import { YourTurn } from "@/components/about/long-game/YourTurn";
import { ContactStage } from "@/components/contact/interaction/ContactStage";
import { HomeMotionConfig } from "@/components/home/HomeMotion";
import { getRegistrationSettings } from "@/lib/data/registration";
import { getSiteContentImages } from "@/lib/data/site-content";
import { clubRegistration } from "@/lib/registration";
import { DEFAULT_JOIN_PHOTO } from "@/lib/home";
import { honourBanners } from "@/lib/honours";
import { getReports } from "@/lib/report";
import { getAchievements } from "@/lib/data/achievements";

// The Trophy Room, server-rendered with every entry and count, plus each entry's match
// report so a story opens over the room straight away (at /achievements/<slug>).
export async function TrophyRoomPage() {
  const [achievements, { entries, reports }, registration, joinImages] = await Promise.all([
    getAchievements(),
    getReports(),
    getRegistrationSettings(),
    getSiteContentImages("home_join_image"),
  ]);
  const winIds = new Set(entries.filter((e) => e.type === "title" || e.type === "individual").map((e) => e.id));
  const banners = honourBanners(achievements.filter((a) => winIds.has(a.id)));
  const maxYear = Number(new Date().toLocaleDateString("en-CA", { year: "numeric", timeZone: "Asia/Dhaka" }));

  return (
    <HomeMotionConfig>
      <div className="-mt-28 bg-[#0b2524] pt-28 [font-family:var(--font-home),system-ui,sans-serif]">
        <ContactStage>
          <Suspense>
            <TrophyRoom entries={entries} reports={reports} banners={banners} maxYear={maxYear} />
          </Suspense>
          <YourTurn
            photo={joinImages[0] ?? DEFAULT_JOIN_PHOTO}
            club={clubRegistration(registration)}
            title="Your name could be next."
            secondary={{ label: "See fixtures & results", href: "/events" }}
          />
        </ContactStage>
      </div>
    </HomeMotionConfig>
  );
}
