import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { validateImageFile, validateVideoFile } from "@/lib/validation/shared";

// Cloudflare R2 (S3-compatible).
// requestChecksumCalculation/responseChecksumValidation must be forced to WHEN_REQUIRED:
// newer AWS SDK v3 versions default to always sending flexible-checksum headers, which
// R2 doesn't support the same way as S3 and causes "signature does not match" errors.
const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!;

// Re-encoded to WebP and capped at 1920px on the longest side — larger than any
// layout on the site displays an image at.
async function compressImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate() // apply EXIF orientation, then strip EXIF (also drops GPS/location data)
    .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
}

// Uploads re-validate server-side — the client's own check can't be trusted.
export async function uploadImage(entityFolder: string, file: File): Promise<string> {
  const invalid = validateImageFile(file);
  if (invalid) throw new Error(invalid);

  const originalBuffer = Buffer.from(await file.arrayBuffer());
  const compressed = await compressImage(originalBuffer);
  const key = `${entityFolder}/${crypto.randomUUID()}.webp`;

  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: compressed,
      ContentType: "image/webp",
    }),
  );

  return `${PUBLIC_URL}/${key}`;
}

// No compression — sharp can't touch video, so this uploads the file as-is.
export async function uploadVideo(entityFolder: string, file: File): Promise<string> {
  const invalid = validateVideoFile(file);
  if (invalid) throw new Error(invalid);

  const extension = file.type === "video/webm" ? "webm" : "mp4";
  const key = `${entityFolder}/${crypto.randomUUID()}.${extension}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
    }),
  );

  return `${PUBLIC_URL}/${key}`;
}

// Despite the name, this deletes any R2 object by its public URL (video included) — it
// only ever inspects the URL prefix, never the file's content type.
export async function deleteImage(publicUrl: string | null | undefined): Promise<void> {
  if (!publicUrl || !publicUrl.startsWith(PUBLIC_URL)) return; // not an R2 URL (e.g. a static /images/... placeholder)
  const key = publicUrl.slice(PUBLIC_URL.length + 1);
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}
