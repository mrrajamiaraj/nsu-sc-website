import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/validation/shared";

// Cloudflare R2 (S3-compatible). $0 egress, 10GB free storage — see TECH_STACK.md.
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

// NFR-3: images automatically compressed/optimized before storage. Re-encoded to WebP
// (smaller than JPEG/PNG at equivalent quality) and capped at 1920px on the longest
// side — far more than any layout in this app displays an image at.
async function compressImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate() // apply EXIF orientation, then strip EXIF (also drops GPS/location data)
    .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
}

// FR-50: re-validate server-side — never trust the client's own check.
export async function uploadImage(entityFolder: string, file: File): Promise<string> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Image must be JPG, PNG, or WebP.");
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Image must be 5MB or smaller.");
  }

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

export async function deleteImage(publicUrl: string | null | undefined): Promise<void> {
  if (!publicUrl || !publicUrl.startsWith(PUBLIC_URL)) return; // not an R2 URL (e.g. a static /images/... placeholder)
  const key = publicUrl.slice(PUBLIC_URL.length + 1);
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}
