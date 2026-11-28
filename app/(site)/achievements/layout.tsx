import type { ReactNode } from "react";
import { TrophyRoomPage } from "@/components/achievements/trophy/TrophyRoomPage";

// The Trophy Room stays mounted across /achievements and /achievements/<id>; the pages only
// supply metadata (and a 404 for unknown ids).
export default function AchievementsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <TrophyRoomPage />
      {children}
    </>
  );
}
