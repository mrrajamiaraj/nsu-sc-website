import type { Metadata } from "next";
import { TrophyRoomPage } from "@/components/achievements/trophy/TrophyRoomPage";

export const metadata: Metadata = {
  title: "Achievements",
  description: "The trophy room: every title, podium and personal award won in NSU colours, and the club moments around them, year by year.",
};

// Each achievement opens over the room as its match report (the URL becomes
// /achievements/<slug>); loading that URL directly shows the report as a full page.
export default function AchievementsPage() {
  return <TrophyRoomPage />;
}
