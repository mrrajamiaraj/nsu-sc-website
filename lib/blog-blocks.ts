// Fills in the Gazette's list blocks after sanitising: a story's <ul class="events"> gets
// each event's code and thumbnail, and <ul class="people"> gets each person's portrait,
// looked up from the item's own link (/events/<slug>, /members?person=<slug>).

// A member portrait cut out of its background: shown whole (head at the top), not cropped.
export const isCutout = (src: string | null) => Boolean(src && /\/members\//.test(src));

export interface BlockLookups {
  events: Map<string, { code: string; image: string | null }>; // by event slug
  people: Map<string, { name: string; thumb: string | null }>; // by member slug
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const unescapeAttr = (s: string) => s.replace(/&amp;/g, "&");

function fillItems(list: string, thumb: (href: string) => string | null, splitRole = false): string {
  return list.replace(/<li>(<a href="([^"]+)">[\s\S]*?)<\/li>/g, (whole, inner: string, href: string) => {
    const t = thumb(unescapeAttr(href));
    if (!t) return whole;
    // "Name: Role" sets as the name over the role (the colon stays for screen readers).
    const text = splitRole ? inner.replace(/<\/a>:\s*([\s\S]+)$/, '</a><span class="sr-only">: </span><span class="block-role">$1</span>') : inner;
    return `<li>${t}<span class="block-text">${text}</span></li>`;
  });
}

export function enrichBody(html: string, { events, people }: BlockLookups): string {
  return html
    .replace(/<ul class="events">[\s\S]*?<\/ul>/g, (list) =>
      fillItems(list, (href) => {
        const slug = href.match(/^\/events\/([a-z0-9-]+)/)?.[1];
        const event = slug ? events.get(slug) : undefined;
        if (!event) return null;
        const img = event.image ? `<img data-thumb src="${esc(event.image)}" alt="" width="64" height="64" loading="lazy" decoding="async">` : "";
        return `<a class="block-thumb" href="${esc(href)}" tabindex="-1" aria-hidden="true">${img}<span class="block-code">${esc(event.code)}</span></a>`;
      }),
    )
    .replace(/<ul class="people">[\s\S]*?<\/ul>/g, (list) =>
      fillItems(list, (href) => {
        const slug = href.match(/[?&]person=([a-z0-9-]+)/)?.[1];
        const person = slug ? people.get(slug) : undefined;
        if (!person) return null;
        const initials = person.name
          .replace(/^(mr|mrs|ms|dr|md)\.?\s+/i, "")
          .split(/\s+/)
          .slice(0, 2)
          .map((w) => w[0])
          .join("")
          .toUpperCase();
        const face = person.thumb ? `<img data-thumb src="${esc(person.thumb)}" alt="" width="88" height="88" loading="lazy" decoding="async">` : `<span class="block-initials">${esc(initials)}</span>`;
        return `<a class="block-face" href="${esc(href)}" tabindex="-1" aria-hidden="true">${face}</a>`;
      }, true),
    );
}
