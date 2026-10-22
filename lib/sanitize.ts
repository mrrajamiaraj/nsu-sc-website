import sanitize from "sanitize-html";

// Allows the markup the admin rich-text editor (TipTap StarterKit + Image + Link) produces.
// Pure JS, so it runs in serverless functions (jsdom-based sanitizers don't on Vercel).
const OPTIONS: sanitize.IOptions = {
  allowedTags: [
    "p", "br", "h1", "h2", "h3", "h4", "h5", "h6",
    "strong", "b", "em", "i", "u", "s", "code", "pre", "blockquote",
    "ul", "ol", "li", "hr", "a", "img",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "title"],
    ol: ["start"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https"] },
};

export function sanitizeHtml(html: string) {
  return sanitize(html, OPTIONS);
}
