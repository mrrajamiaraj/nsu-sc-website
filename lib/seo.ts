import type { Metadata } from "next";

// Meta descriptions get cut off around 160 characters; trim on a word-ish boundary.
function summarize(text: string, max = 160): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat;
}

// Structured data wants absolute URLs; local /images/... paths need the site origin.
export function absoluteUrl(url: string): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  return site && url.startsWith("/") ? new URL(url, site).href : url;
}

// Title, description, canonical URL and link-preview tags for a detail page.
export function detailPageMetadata({
  title,
  description,
  path,
  image,
}: {
  title: string;
  description?: string | null;
  path: string;
  image?: string | null;
}): Metadata {
  const summary = description ? summarize(description) : undefined;
  return {
    title,
    description: summary,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title,
      description: summary,
      url: path,
      images: image ? [{ url: image, alt: title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description: summary,
      images: image ? [image] : undefined,
    },
  };
}
