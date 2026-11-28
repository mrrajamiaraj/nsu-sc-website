import sharp from "sharp";
import { unstable_cache } from "next/cache";
import type { CutoutFrame } from "@/lib/team-sheet";

// Player photos are transparent cut-outs, but each sport framed them differently (cricket
// fills the canvas, badminton is a small figure in a tall one). Measuring where the person
// sits in each image lets every line-up and card frame them the same way.

const ALPHA = 40; // pixels more opaque than this count as the person
const SAMPLE = 200; // measure on a small copy; plenty for a bounding box

async function measure(url: string): Promise<CutoutFrame | null> {
  try {
    const response = await fetch(url, { cache: "force-cache" });
    if (!response.ok) return null;
    const input = Buffer.from(await response.arrayBuffer());
    const meta = await sharp(input).metadata();
    if (!meta.width || !meta.height || !meta.hasAlpha) return null;
    const { data, info } = await sharp(input).resize({ width: SAMPLE }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let minX = info.width;
    let maxX = -1;
    let minY = info.height;
    let maxY = -1;
    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        if (data[(y * info.width + x) * info.channels + 3] > ALPHA) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0) return null;
    return {
      ratio: meta.width / meta.height,
      x: minX / info.width,
      y: minY / info.height,
      w: (maxX - minX + 1) / info.width,
      h: (maxY - minY + 1) / info.height,
    };
  } catch {
    return null;
  }
}

// Uploads get a new file name each time, so a measurement never goes stale.
const measureCached = (url: string) => unstable_cache(() => measure(url), ["cutout-frame-v1", url], { revalidate: false })();

export async function getCutoutFrames(urls: string[]): Promise<Record<string, CutoutFrame>> {
  const unique = Array.from(new Set(urls.filter(Boolean)));
  const frames = await Promise.all(unique.map(measureCached));
  const out: Record<string, CutoutFrame> = {};
  unique.forEach((url, i) => {
    const frame = frames[i];
    if (frame) out[url] = frame;
  });
  return out;
}
