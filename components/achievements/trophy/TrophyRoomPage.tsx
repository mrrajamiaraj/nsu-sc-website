import { Suspense } from "react";
import { TrophyRoom } from "@/components/achievements/trophy/TrophyRoom";
import { YourTurn } from "@/components/about/long-game/YourTurn";
import { ContactStage } from "@/components/contact/interaction/ContactStage";
import { HomeMotionConfig } from "@/components/home/HomeMotion";
import { getAchievements } from "@/lib/data/achievements";
import { getRegistrationSettings } from "@/lib/data/registration";
import { getSiteContentImages } from "@/lib/data/site-content";
import { clubRegistration } from "@/lib/registration";
import { DEFAULT_JOIN_PHOTO } from "@/lib/home";
import { honourBanners } from "@/lib/honours";
import { trophyEntries } from "@/lib/trophy";

// The Trophy Room, server-rendered with every entry and count. It's rendered by the
// /achievements layout, so /achievements/<id> shows the same room with that story open.
export async function TrophyRoomPage() {
  const [achievements, registration, joinImages] = await Promise.all([getAchievements(), getRegistrationSettings(), getSiteContentImages("home_join_image")]);
  const entries = trophyEntries(achievements);
  const winIds = new Set(entries.filter((e) => e.type === "title" || e.type === "individual").map((e) => e.id));
  const banners = honourBanners(achievements.filter((a) => winIds.has(a.id)));
  const maxYear = Number(new Date().toLocaleDateString("en-CA", { year: "numeric", timeZone: "Asia/Dhaka" }));

  return (
    <HomeMotionConfig>
      <div className="-mt-28 bg-[#0b2524] pt-28 [font-family:var(--font-home),system-ui,sans-serif]">
        <ContactStage pitch={false}>
          <Suspense>
            <TrophyRoom entries={entries} banners={banners} maxYear={maxYear} />
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
