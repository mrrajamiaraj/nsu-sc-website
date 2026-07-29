# NSU SC Club Website — Tech Stack & Infrastructure Plan

**Project:** NSU SC Club Website
**Domain:** nsusc.org
**Date:** June 2026
**Companion to:** [SRS.md](./SRS.md)
**Primary constraint:** Near-zero budget — maximize free tiers without breaking SRS uptime/performance targets.

---

## Table of Contents
1. [Architecture Decision](#1-architecture-decision-the-constraint-that-shapes-everything)
2. [Recommended Stack (layer by layer)](#2-recommended-stack-layer-by-layer)
3. [Full-Stack Options Compared](#3-full-stack-options-compared)
4. [Cost Breakdown](#4-cost-breakdown)
5. [Hidden / Easy-to-Miss Costs](#5-hidden--easy-to-miss-costs)
6. [Bottom Line](#6-bottom-line)
7. [Sources](#7-sources)

---

## 1. Architecture Decision — the constraint that shapes everything

The SRS requires **99.5% uptime + <3s page loads + daily backups**.

Most "free" backend hosts (Render, Railway, Fly) violate this on their free tier — they **sleep after inactivity and cold-start for ~30–60s**, and Fly.io killed its free tier entirely in 2026. A club site gets sporadic traffic, so a free always-on server would be asleep most of the time → the first visitor each hour waits a minute. **Fails the SRS.**

**Decision:** Do **not** run a separate always-on backend server. Use a Backend-as-a-Service (BaaS) for data/auth/storage, and serve the frontend from an edge CDN. This dodges cold starts entirely and stays free.

---

## 2. Recommended Stack (layer by layer)

### 2.1 Frontend — Next.js (React), static-first
- **Recommendation:** **Next.js (React)** — largest ecosystem, easy to hire/learn, strong image optimization, fits responsive 1920/768/375 targets.
- **Alternatives:** Astro (best *technical* fit — content site + island for the dashboard, ships near-zero JS), SvelteKit (lighter/faster), Vite + React.
- **Why:** Public pages are read-only and content-heavy → static generation hits <3s trivially. Admin dashboard is a client-rendered section talking to the BaaS.

### 2.2 Backend — No separate server; BaaS (Supabase) + thin serverless functions
- **Recommendation:** Supabase supplies Postgres + Auth + Storage + auto-generated REST/realtime APIs. Row-Level Security (RLS) enforces "public reads, admin writes." A few edge functions handle image-upload validation and the registration toggle.
- **Alternatives:** Custom Node/Express or PHP/Laravel on a VPS (more control, but a paid always-on server + ops burden); Firebase (NoSQL — wrong data model here).
- **Why:** One admin + mostly-read public site is the textbook BaaS case. Custom backend is wasted cost/effort for v1.0.

### 2.3 Database — Managed Postgres (SQL)
- **Recommendation:** **SQL, managed cloud.** Schema (SRS §6) is fully relational (Events↔Players↔Teams↔Panels↔Members with FKs). NoSQL would fight the model.
- **Realistic options this size:**
  - **Supabase free** — 500 MB DB. ⚠️ Pauses after 7 days inactivity.
  - **Neon free** — 512 MB, scale-to-zero, no 7-day pause (cold resume adds latency to first query after idle).
  - **Self-host Postgres on a VPS** — only if a server already exists; otherwise not worth it.
- **Why:** 500 MB holds tens of thousands of text rows — far more than a club needs. Images live in object storage, not the DB, so the DB stays tiny.

### 2.4 Image / file storage — Cloudflare R2
- **Recommendation:** **Cloudflare R2** — 10 GB free, and **$0 egress forever** → image bandwidth never produces a surprise bill. Served via Cloudflare CDN.
- **Alternatives:** Supabase Storage (1 GB free, 5 GB egress/mo — fine to start, smaller); server disk (no CDN/redundancy, lost on redeploy — avoid); AWS S3 (free tier expires after 12 months, then egress charges — avoid).
- **Cost impact:** With R2, even viral traffic = $0 bandwidth. Biggest hidden-cost killer, neutralized. Compress before upload (SRS NFR-3) to stay under 10 GB.

### 2.5 Hosting / deployment — Cloudflare Pages
- **Recommendation:** **Cloudflare Pages** — unlimited bandwidth, commercial use allowed, free, never sleeps.
- **Alternatives:** Vercel Hobby (great DX but ⚠️ **prohibits commercial use** — club site is a gray-to-no zone; Pro is $20/mo); Netlify free (100 GB bandwidth cap, overage billed).
- **Why:** Static frontend on an edge CDN = no cold starts, <3s globally, $0.

### 2.6 Domain registrar — Cloudflare Registrar
- **Recommendation:** **Cloudflare Registrar** — wholesale, no markup: `.org` ≈ **$10–11/yr, same on renewal**. Integrates with Pages/R2/DNS.
- **Alternatives:** Namecheap — `.org` **$9.98 first year, then $14.98/yr renewal** ⚠️ (promo-vs-renewal trap); GoDaddy — higher renewals + upsells.
- **Why:** No-markup renewal beats Namecheap renewal and keeps everything in one dashboard.

### 2.7 Authentication — Supabase Auth (managed)
- **Recommendation:** **Supabase Auth** — ships with the DB; gives bcrypt-equivalent hashing, session management, rate limiting, and **password-reset emails** out of the box (satisfies SRS FR-24 / UC-14).
- **Alternatives:** Custom auth (don't — reimplementing bcrypt + lockout + reset + CSRF for one account is pure risk); Clerk/Auth0 (overkill); Firebase Auth (ties you to NoSQL DB).
- **Why:** One admin account = auth complexity should be zero custom code. Covers SRS §3.2 (sessions, lockout) and §3.3 (reset) for free.

---

## 3. Full-Stack Options Compared

| Layer | A — Fully Free | B — Low-cost Robust (recommended) | C — Traditional VPS |
|---|---|---|---|
| Frontend host | Cloudflare Pages (free) | Cloudflare Pages (free) | Same VPS (Nginx) |
| Backend | Supabase BaaS | Supabase BaaS | Custom Node/PHP |
| Database | Supabase free (500 MB) | Supabase Pro Postgres OR Neon free | Self-hosted Postgres |
| **Inactivity risk** | ⚠️ DB pauses after 7d idle | ✅ No pause (Pro) / fast resume (Neon) | ✅ Always on |
| Storage | R2 free (10 GB) | R2 free (10 GB) | Server disk + manual CDN |
| Auth | Supabase Auth (free) | Supabase Auth (free) | Custom (build + maintain) |
| Weekly backups (SRS NFR-18) | ✅ Scripted `pg_dump`→R2 (free) | ✅ Scripted, or Pro daily | ⚠️ You script it |
| Monthly cost | **$0** | **~$0–25** | **~$5–7** |
| Tradeoff | Risks SRS uptime/backup reqs; needs cron-ping to keep DB awake | Meets all SRS reqs cleanly | Cheap but you own all ops |

**Verdict:** Launch on **Option A**. Mitigate the 7-day pause with a free uptime-monitor cron pinging the site every few days. Backups: SRS NFR-18 needs only **weekly** (content changes rarely, is re-creatable) — a scheduled `pg_dump` → R2 covers this on the free tier at $0. Supabase Pro ($25/mo) is now optional, justified mainly by removing the 7-day pause, not by backups.

---

## 4. Cost Breakdown

### Option A — Fully Free (launch config)

| Item | Provider | Monthly | Annual | Free/Paid |
|---|---|---|---|---|
| Frontend hosting | Cloudflare Pages | $0 | $0 | **Free** (unlimited bandwidth, commercial OK) |
| Database | Supabase free (500 MB) | $0 | $0 | **Free** ⚠️ pauses after 7d idle |
| Auth | Supabase Auth | $0 | $0 | **Free** |
| File/image storage | Cloudflare R2 (10 GB) | $0 | $0 | **Free** ($0 egress) |
| Backend functions | Supabase / CF Workers | $0 | $0 | **Free** |
| SSL/TLS | Cloudflare (auto) | $0 | $0 | **Free** |
| Email (password reset) | Supabase built-in | $0 | $0 | **Free** (rate-limited — see §5) |
| Domain `.org` | Cloudflare Registrar | — | ~$10 | **Paid** |
| **TOTAL** | | **$0** | **~$10/yr** | |

### Option B — Low-cost Robust (production-grade)

| Item | Provider | Monthly | Annual | Free/Paid |
|---|---|---|---|---|
| Frontend hosting | Cloudflare Pages | $0 | $0 | **Free** |
| Database | Supabase Pro | $25 | $300 | **Paid** (no pause, auto daily backups, 8 GB DB) — optional; free + scripted weekly backup also meets SRS |
| Auth | Supabase Auth (incl. in Pro) | $0 | $0 | **Free** |
| Storage | Cloudflare R2 | $0 | $0 | **Free** |
| Domain | Cloudflare Registrar | — | ~$10 | **Paid** |
| Email (reset + future notices) | Resend free (3k/mo) | $0 | $0 | **Free** |
| **TOTAL** | | **$25** | **~$310/yr** | |

> **Middle ground:** keep Supabase free but swap DB to **Neon free** (no 7-day pause) + free cron pinger → stays **$0 + $10 domain** while avoiding the pause. Backups still manual until budget exists.

---

## 5. Hidden / Easy-to-Miss Costs

1. **Domain renewal vs promo** ⚠️ — Namecheap `.org` $9.98 first year → $14.98 renewal. Cloudflare Registrar ~$10 every year, no jump. Use Cloudflare.
2. **Supabase 7-day inactivity pause** ⚠️ — *the* free-tier gotcha. Paused DB = site errors until manually resumed. Mitigate free with cron-ping, or pay $25/mo Pro.
3. **Backups (SRS NFR-18 = weekly)** — Supabase free has no managed backups, but the SRS only needs **weekly** (content rarely changes, is re-creatable). Free path = scheduled `pg_dump` → R2, retain 4–8 weeks, at $0. Pro's managed daily backups are nice-to-have, not required. Images already safe in R2 — no DB-side backup needed for them.
4. **Vercel commercial-use clause** ⚠️ — Hobby prohibits commercial use; club site is a gray zone → potential forced $20/mo Pro. Cloudflare Pages has no such clause.
5. **Bandwidth/egress** — neutralized: Cloudflare Pages unlimited, R2 $0 egress. AWS S3 / Netlify would risk surprise bills under traffic.
6. **Email sending** — Supabase auth emails are rate-limited (a few/hour) from a shared domain (spam risk). Fine for one admin's occasional reset. For member notifications (SRS §9 future scope), wire **Resend free (3,000/mo)** + verify domain for deliverability.
7. **SSL** — Free everywhere via Cloudflare / Let's Encrypt. Never pay for it.
8. **R2 request limits** — 1M Class-A (write)/mo, 10M Class-B (read)/mo free. Image counts are tiny → irrelevant here.

---

## 6. Bottom Line

**Recommended stack:**
**Cloudflare Pages** (frontend) + **Supabase** (Postgres DB + Auth + functions) + **Cloudflare R2** (images) + **Cloudflare Registrar** (domain).

- **Launch cost: ~$10/year** (just the domain), on free tiers.
- **Two honest gaps on pure-free:** the 7-day DB pause and lack of automatic daily backups. Both fixed by **Supabase Pro ($25/mo)** when budget exists — that single upgrade brings full SRS compliance.
- Avoids the cold-start trap that would sink the <3s / 99.5%-uptime requirements on free "backend hosts."

---

## 7. Sources
- [Supabase free tier & pricing](https://uibakery.io/blog/supabase-pricing)
- [Vercel Hobby commercial-use restriction](https://deploywise.dev/blog/vercel-free-tier-limits-2026)
- [Cloudflare Pages & R2 pricing/limits](https://www.devtoolreviews.com/reviews/cloudflare-pages-pricing-bandwidth-limits-2026)
- [Cloudflare R2 free egress](https://cloudcredits.io/providers/cloudflare/programs/cloudflare-r2-storage-free-tier)
- [Neon free tier](https://neon.com/blog/how-to-make-the-most-of-neons-free-plan)
- [Namecheap .org renewal pricing](https://priceworld.com/domains/namecheap/)
- [Render / Railway / Fly free tiers 2026](https://render.com/articles/platforms-with-a-real-free-tier-for-developers-in-2026)
