import { createClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/GlassCard";
import { AboutContentForm } from "@/components/admin/about/AboutContentForm";
import { AboutHistoryForm } from "@/components/admin/about/AboutHistoryForm";
import { AboutGalleryManager } from "@/components/admin/about/AboutGalleryManager";
import type { CoreValueContent } from "@/components/about/CoreValues";
import { updateAboutPageContent, updateAboutContent, addAboutImage, removeAboutImage } from "./actions";

const CONTENT_KEYS = [
  "about_hero_subtitle",
  "about_story_heading",
  "about_story_highlights",
  "about_stat_established",
  "about_stat_members",
  "about_stat_championships",
  "about_mission_text",
  "about_mission_points",
  "about_vision_text",
  "about_vision_points",
  "about_core_values",
] as const;

const DEFAULT_CORE_VALUES: CoreValueContent[] = [
  { title: "Passion", description: "We fuel athletic excellence through dedication and love for sports." },
  { title: "Teamwork", description: "Together we achieve more, building bonds that last a lifetime." },
  { title: "Excellence", description: "We strive for the highest standards in every game we play." },
  { title: "Innovation", description: "Embracing new training methods and sports technologies." },
];

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default async function AdminAboutPage() {
  const supabase = await createClient();
  const { data: historyRow } = await supabase
    .from("site_content")
    .select("content")
    .eq("page_key", "about_history")
    .maybeSingle();
  const { data: galleryRow } = await supabase
    .from("site_content")
    .select("images")
    .eq("page_key", "about_gallery")
    .maybeSingle();
  const { data: contentRows } = await supabase
    .from("site_content")
    .select("page_key, content")
    .in("page_key", CONTENT_KEYS);

  const get = (key: string) => contentRows?.find((row) => row.page_key === key)?.content ?? "";

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">About Page</h1>
        <GlassCard className="mt-6">
          <AboutContentForm
            values={{
              heroSubtitle: get("about_hero_subtitle"),
              storyHeading: get("about_story_heading"),
              storyHighlights: parseJson(get("about_story_highlights"), []),
              statEstablished: get("about_stat_established"),
              statMembers: get("about_stat_members"),
              statChampionships: get("about_stat_championships"),
              missionText: get("about_mission_text"),
              missionPoints: parseJson(get("about_mission_points"), []),
              visionText: get("about_vision_text"),
              visionPoints: parseJson(get("about_vision_points"), []),
              coreValues: parseJson(get("about_core_values"), DEFAULT_CORE_VALUES),
            }}
            action={updateAboutPageContent}
          />
        </GlassCard>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white">Our Story (Full Text)</h2>
        <GlassCard className="mt-4">
          <AboutHistoryForm defaultValue={historyRow?.content ?? ""} action={updateAboutContent} />
        </GlassCard>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white">Image Gallery</h2>
        <GlassCard className="mt-4">
          <AboutGalleryManager
            images={(galleryRow?.images as string[] | null) ?? []}
            onAdd={addAboutImage}
            onRemove={removeAboutImage}
          />
        </GlassCard>
      </div>
    </div>
  );
}
