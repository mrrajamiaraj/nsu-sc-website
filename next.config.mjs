const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;
const r2PublicUrl = process.env.R2_PUBLIC_URL;
const r2Host = r2PublicUrl ? new URL(r2PublicUrl).hostname : undefined;

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  images: {
    // Uploads are already resized and re-encoded to WebP by lib/storage.ts, and the
    // static images in /public are small, so Vercel's optimizer only burned through
    // the free Image Optimization quota without making pages meaningfully lighter.
    unoptimized: true,
    remotePatterns: [
      ...(supabaseHost ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }] : []),
      ...(r2Host ? [{ protocol: "https", hostname: r2Host, pathname: "/**" }] : []),
    ],
  },
  experimental: {
    // Default is 1MB — too small for 10MB image uploads via Server Actions.
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
