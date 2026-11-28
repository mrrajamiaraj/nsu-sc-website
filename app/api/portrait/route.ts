import sharp from "sharp";
import { NextResponse, type NextRequest } from "next/server";

// Small round-portrait thumbnails from the transparent cut-outs: head and shoulders, square,
// WebP with transparency, a few KB each instead of a 1920px original. Only images from the
// site's own media host are processed. Responses are cached for a year (uploads get a new
// file name each time, so a thumbnail never goes stale).

const SIZES = new Set([80, 112, 176, 240]);
const ALPHA = 170; // high enough to ignore soft glows some cut-outs have around them
const SAMPLE = 240;

function allowed(src: string): boolean {
  const base = process.env.R2_PUBLIC_URL;
  if (!base) return false;
  try {
    const u = new URL(src);
    return u.protocol === "https:" && u.hostname === new URL(base).hostname;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const src = request.nextUrl.searchParams.get("src") ?? "";
  const size = Number(request.nextUrl.searchParams.get("s") ?? 176);
  if (!allowed(src) || !SIZES.has(size)) return NextResponse.json({ error: "Not allowed" }, { status: 400 });

  const upstream = await fetch(src, { cache: "force-cache" });
  if (!upstream.ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const input = Buffer.from(await upstream.arrayBuffer());

  try {
    const meta = await sharp(input).metadata();
    const W = meta.width ?? 0;
    const H = meta.height ?? 0;
    let crop = { left: 0, top: 0, side: Math.min(W, H) };

    if (meta.hasAlpha && W && H) {
      // Find the person: their top edge, and the middle of the head (the opaque pixels in the
      // first eighth of their height), on a small copy.
      const { data, info } = await sharp(input).resize({ width: SAMPLE }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const at = (x: number, y: number) => data[(y * info.width + x) * info.channels + 3] > ALPHA;
      let top = -1;
      let bottom = -1;
      for (let y = 0; y < info.height && top < 0; y++) for (let x = 0; x < info.width; x++) if (at(x, y)) (top = y), (x = info.width);
      for (let y = info.height - 1; y >= 0 && bottom < 0; y--) for (let x = 0; x < info.width; x++) if (at(x, y)) (bottom = y), (x = info.width);
      if (top >= 0) {
        const height = bottom - top + 1;
        const headRows = Math.max(4, Math.round(height / 8));
        let sum = 0;
        let count = 0;
        for (let y = top; y < Math.min(info.height, top + headRows); y++)
          for (let x = 0; x < info.width; x++)
            if (at(x, y)) {
              sum += x;
              count++;
            }
        const scale = W / info.width;
        const side = Math.round(height * 0.62 * scale);
        const cx = (count ? sum / count : info.width / 2) * scale;
        crop = { left: Math.round(cx - side / 2), top: Math.round(top * scale - side * 0.08), side };
      }
    }

    // Pad with transparency where the square runs past the image edge.
    const pad = {
      left: Math.max(0, -crop.left),
      top: Math.max(0, -crop.top),
      right: Math.max(0, crop.left + crop.side - W),
      bottom: Math.max(0, crop.top + crop.side - H),
    };
    const out = await sharp(input)
      .extend({ ...pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extract({ left: crop.left + pad.left, top: crop.top + pad.top, width: crop.side, height: crop.side })
      .resize(size, size)
      .webp({ quality: 72, alphaQuality: 80, effort: 5 })
      .toBuffer();

    return new NextResponse(new Uint8Array(out), {
      headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable" },
    });
  } catch {
    return NextResponse.json({ error: "Could not process image" }, { status: 422 });
  }
}
