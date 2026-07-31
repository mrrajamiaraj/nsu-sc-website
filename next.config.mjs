const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;
const r2PublicUrl = process.env.R2_PUBLIC_URL;
const r2Host = r2PublicUrl ? new URL(r2PublicUrl).hostname : undefined;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      ...(supabaseHost ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }] : []),
      ...(r2Host ? [{ protocol: "https", hostname: r2Host, pathname: "/**" }] : []),
    ],
  },
  experimental: {
    // Default is 1MB — too small for FR-50's 5MB image uploads via Server Actions.
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
