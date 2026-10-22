export const FOUNDING_YEAR = 1995;

// Used until a contact email is set in the admin (Contact settings).
export const DEFAULT_CONTACT_EMAIL = "sports@northsouth.edu";

// Public origin for canonical URLs, the sitemap and link previews.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://nsusc.org").replace(/\/$/, "");
