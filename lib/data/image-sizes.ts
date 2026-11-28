import sharp from "sharp";
import { unstable_cache } from "next/cache";

// Width / height of remote images, so posters render at their natural ratio with no layout
// shift. Uploads get a new file name each time, so a measurement never goes stale.

async function measure(url: string): Promise<number | null> {
  try {
    const response = await fetch(url, { cache: "force-cache" });
    if (!response.ok) return null;
    const meta = await sharp(Buffer.from(await response.arrayBuffer())).metadata();
    return meta.width && meta.height ? meta.width / meta.height : null;
  } catch {
    return null;
  }
}

const measureCached = (url: string) => unstable_cache(() => measure(url), ["image-ratio-v1", url], { revalidate: false })();

export async function getImageRatios(urls: string[]): Promise<Record<string, number>> {
  const unique = Array.from(new Set(urls.filter(Boolean)));
  const ratios = await Promise.all(unique.map(measureCached));
  const out: Record<string, number> = {};
  unique.forEach((url, i) => {
    const ratio = ratios[i];
    if (ratio) out[url] = ratio;
  });
  return out;
}
