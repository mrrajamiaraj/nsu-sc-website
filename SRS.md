# NSU SC Club Website — Software Requirements Specification

**Project:** NSU SC Club Website
**Organization:** North South University Sports Club (NSU SC)
**Domain:** nsusc.org
**Document Version:** 2.0
**Date:** June 2026
**Status:** Draft for review
**Standard:** IEEE Std 830-1998 (adapted)

---

## Revision History

| Version | Date | Description | Author |
|---------|------|-------------|--------|
| 1.0 | May 2026 | Initial SRS draft | NSU SC Team |
| 2.0 | June 2026 | Gap review; added requirement IDs, traceability, validation rules, admin recovery, audit logging, accessibility, and resolved consistency conflicts | NSU SC Team |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [Functional Requirements](#3-functional-requirements)
4. [External Interface Requirements](#4-external-interface-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Data Requirements](#6-data-requirements)
7. [Use Cases](#7-use-cases)
8. [Traceability Matrix](#8-traceability-matrix)
9. [Future Enhancements (Out of Scope for v1.0)](#9-future-enhancements-out-of-scope-for-v10)
10. [Appendix A: Page Layout Descriptions](#appendix-a-page-layout-descriptions)
11. [Appendix B: Assumptions Made in v2.0](#appendix-b-assumptions-made-in-v20)

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) describes the functional and non-functional requirements for the NSU SC Club Website. Intended audience: developers, designers, testers, and club administrators building and maintaining the site.

Each requirement carries a unique ID (FR-x, NFR-x, DR-x) for traceability and test mapping (see §8).

### 1.2 Scope
The NSU SC website is a fully dynamic, content-managed, custom-built web application hosted at nsusc.org.

- All visitors are public viewers with read-only access — no login required.
- One admin account logs into a secure dashboard to manage all content without writing code.
- Membership registration links to an externally-hosted Google Form, opened manually (target: once per quarter).
- **Five public pages** (Home, Events, About Us, Team, Members) plus **one private Admin Dashboard**.
- No e-commerce or external API integrations beyond Google Forms in v1.0.

> **Note (v2.0 correction):** v1.0 described "six main pages" counting the Admin Dashboard. The dashboard is a private admin tool, not a public page. Corrected count: 5 public + 1 admin.

### 1.3 Definitions and Abbreviations

| Term | Definition |
|------|------------|
| NSU SC | North South University Sports Club |
| SRS | Software Requirements Specification |
| Admin | Privileged single user who manages all website content via the dashboard |
| CMS | Content Management System — lets non-technical users update content |
| Viewer | Any public user visiting the website without logging in |
| Panel | A governing body of the club for a specific tenure (e.g. Panel 2025-26) |
| Google Form | Third-party form used for membership registration intake, opened quarterly |
| CRUD | Create, Read, Update, Delete |
| WYSIWYG | What You See Is What You Get (rich-text editor) |
| RPO / RTO | Recovery Point Objective / Recovery Time Objective |

### 1.4 References
- IEEE Std 830-1998: Recommended Practice for Software Requirements Specifications
- NSU SC club documentation and internal records
- Google Forms documentation
- WCAG 2.1 Accessibility Guidelines (Level AA target)
- OWASP Top 10 (security baseline)

---

## 2. Overall Description

### 2.1 Product Perspective
A standalone custom-built dynamic web application — **not** WordPress or any off-the-shelf CMS. Provides a custom admin dashboard with equivalent ease-of-use. Connects to:

- A domain registrar for nsusc.org
- Google Forms for quarterly membership registration
- A relational database for all dynamic content
- File storage (server or cloud) for uploaded images

### 2.2 Product Functions Summary

| # | Function |
|---|----------|
| 1 | Public website with five pages visible to all visitors |
| 2 | Secure admin login and session management |
| 3 | Admin dashboard for CRUD operations on all site content |
| 4 | Event management with Upcoming / Running / Finished status |
| 5 | Team and player profile management |
| 6 | Member panel management with three membership tiers |
| 7 | Quarterly Google Form registration toggle |
| 8 | Admin account recovery (password reset) |
| 9 | Audit logging of admin actions |

### 2.3 User Classes

| User Class | Description | Access Level |
|------------|-------------|--------------|
| Viewer (Public) | Any person visiting the website. No login required. | Read-only access to all public pages. |
| Admin | Club administrator. Single account. Manages all content. | Full CRUD on all content; admin dashboard access; registration control. |

### 2.4 Operating Environment
- Hosted on a Linux-based web server (VPS or shared hosting) at nsusc.org
- Supported browsers: Chrome, Firefox, Safari, Edge (latest two major versions)
- Fully responsive: desktop, tablet, mobile
- Backend: Node.js / PHP / Python — to be finalized by development team
- Database: MySQL or PostgreSQL
- Frontend: HTML5, CSS3, JavaScript (with or without a framework)

### 2.5 Design Constraints
- Admin must update all content without writing any code
- Registration must use Google Forms — not a custom-built form (v1.0)
- Passwords stored using bcrypt or Argon2 — never plaintext
- Domain must be nsusc.org
- Must not use WordPress or any off-the-shelf CMS

### 2.6 Assumptions and Dependencies
- The club will purchase and maintain the nsusc.org domain
- A web hosting service will be procured separately
- Google Forms will remain the external registration tool in v1.0
- Only one admin account exists in v1.0
- A valid email address is reachable by the admin for password recovery

---

## 3. Functional Requirements

### 3.1 Public Pages

#### 3.1.1 Home Page
- **FR-1** Display club name, logo, and tagline.
- **FR-2** Display a featured upcoming event card (name, date, brief description), selected by admin.
- **FR-3** Display a quick-stats bar: number of members, teams, and events held. Stats computed from the database, not hardcoded.
- **FR-4** Display navigation bar and footer on all pages.
- **FR-5** Footer shows contact info, social media links, and copyright.

#### 3.1.2 Events Page
- **FR-6** Display three sections: Upcoming, Running, Finished.
- **FR-7** Each event card shows banner image, name, date, venue, status badge, and description.
- **FR-8** Sort order: Upcoming = soonest first; Finished = newest first; Running = soonest start first.
- **FR-9** Event status (Upcoming / Running / Finished) is set manually by the admin. The system MAY surface a date-based suggestion to the admin (e.g. "event date passed — mark Finished?") but never auto-changes status without admin action.

#### 3.1.3 About Us Page
- **FR-10** Display club history and description as rich text, editable by admin.
- **FR-11** Support an optional image section.

#### 3.1.4 Team Page
- **FR-12** List all sports teams (e.g. Football, Handball, Cricket; admin can add more).
- **FR-13** Each team shows name, short description, and a grid of player cards.
- **FR-14** Each player card shows photo, name, position, contact email, and short bio.

> **v2.0 correction:** v1.0 used a field named `gmail` for players. Replaced with a generic `email` field (a Gmail address remains acceptable, but the system does not require Gmail). Aligns with the Members email field.

#### 3.1.5 Members Page
- **FR-15** Display the currently active panel only.
- **FR-16** Display three subsections in order: Executive List, Sub-Executive List, General Member List.
- **FR-17** Each member card shows photo, name, designation, email, and phone number.
- **FR-18** Within each tier, members display in admin-defined sort order.

### 3.2 Admin Authentication

- **FR-19** Secure login page at `/admin` requiring username and password.
- **FR-20** Session expires after 60 minutes of inactivity.
- **FR-21** Maximum 5 failed login attempts, then a 15-minute lockout.
- **FR-22** Logout destroys the session immediately.
- **FR-23** Passwords stored hashed (bcrypt or Argon2); never plaintext.
- **FR-24** **Admin password recovery:** admin can request a password reset link sent to the registered admin email. Reset link is single-use and expires after 30 minutes. (Closes the v1.0 gap where a forgotten password locked the only admin out permanently.)

### 3.3 Admin Dashboard — Content Management
The admin dashboard provides a visual interface (no coding required) for managing all site content.

**Home Page**
- **FR-25** Edit welcome text, tagline, and club statistics (or set stats to auto-compute).
- **FR-26** Choose which event is featured on the home page.

**Events**
- **FR-27** Add event: name, date, venue, description, banner image upload, status.
- **FR-28** Edit or delete any event.
- **FR-29** Change event status (Upcoming → Running → Finished), manually.

**Teams & Players**
- **FR-30** Add, edit, delete sports teams.
- **FR-31** Add players to a team: name, photo upload, position, email, bio.
- **FR-32** Edit or remove players; reorder players within a team.

**Members**
- **FR-33** Add members: photo, name, designation, tier, email, phone.
- **FR-34** Tier options: Executive, Sub-Executive, General Member.
- **FR-35** Set which panel is currently active (shown publicly). Only one panel active at a time.
- **FR-36** Old panels are archived (flagged inactive), not deleted.
- **FR-37** Admin can view and re-activate any archived panel from the dashboard. (Closes v1.0 gap: archived data was unreachable.)

**About Us**
- **FR-38** Edit club history and description using a rich-text (WYSIWYG) editor.
- **FR-39** Upload and manage images for the About page.

### 3.4 Registration System
- **FR-40** Admin embeds a Google Form link for membership registration.
- **FR-41** Admin toggles registration Open or Closed from the dashboard.
- **FR-42** When open: a "Register Now" button appears on the site linking to the Google Form.
- **FR-43** When closed: a message displays (e.g. "Registration closed. Next intake: [date]").
- **FR-44** Admin can update the Google Form URL each quarter from the dashboard.
- **FR-45** The system MUST prevent toggling registration Open while no Google Form URL is configured (validation error).
- **FR-46** Registration cadence ("at most once per quarter") is operationally controlled by the admin; the system does not enforce a hard quarterly lock in v1.0.

### 3.5 Input Validation (cross-cutting)
- **FR-47** Email fields validated against standard email format before save.
- **FR-48** Phone fields accept digits, spaces, `+`, `-`, parentheses; length 7–20 chars.
- **FR-49** Required fields enforced on every create/edit form; missing field → clear validation error.
- **FR-50** Uploaded images limited to JPG/PNG/WebP, max **5 MB** per file. Oversized or wrong-type files rejected with an error. (Closes v1.0 gap: "image too large" had no defined threshold.)
- **FR-51** Event date must be a valid calendar date; no format restriction on past/future (past dates valid for Finished events).

### 3.6 Audit Logging
- **FR-52** All admin create/update/delete actions and login/logout events are recorded with timestamp, action type, and affected record. (Closes v1.0 gap: no admin action traceability.)

---

## 4. External Interface Requirements

### 4.1 User Interfaces
- **NFR-UI-1** Responsive layouts at desktop (1920px), tablet (768px), mobile (375px).
- **NFR-UI-2** Admin dashboard usable with zero technical knowledge — all operations via buttons, forms, and drag-and-drop where applicable.
- **NFR-UI-3** Error messages clear and actionable.

### 4.2 Hardware Interfaces
- **NFR-HW-1** Minimum server: 1 vCPU, 1 GB RAM, 20 GB SSD.
- **NFR-HW-2** SSL certificate installed (Let's Encrypt or equivalent).

### 4.3 Software Interfaces

| System | Type | Description |
|--------|------|-------------|
| Google Forms | Third-party form | Hosts quarterly membership registration. Admin configures the URL. |
| Domain Registrar | DNS / Hosting | nsusc.org domain pointing to the web server. |
| File Storage | Server / Cloud | Stores member photos, player photos, and event banners. |
| Relational DB | MySQL / PostgreSQL | Stores all dynamic content. |

### 4.4 Communication Interfaces
- **NFR-COM-1** All traffic over HTTPS (TLS 1.2+).
- **NFR-COM-2** Outbound email (SMTP or transactional email service) for admin password reset.

---

## 5. Non-Functional Requirements

### 5.1 Performance
- **NFR-1** All public pages load within 3 seconds on standard broadband.
- **NFR-2** Admin CRUD operations complete within 2 seconds.
- **NFR-3** Images automatically compressed/optimized before storage.
- **NFR-4** System supports at least 200 concurrent viewers without degradation. *(assumption — see Appendix B)*

### 5.2 Security
- **NFR-5** All pages served over HTTPS — SSL/TLS certificate required.
- **NFR-6** Admin password hashed using bcrypt or Argon2 — never plaintext.
- **NFR-7** Admin routes protected; unauthenticated requests return 401/403.
- **NFR-8** All inputs sanitized against SQL injection and XSS.
- **NFR-9** CSRF protection on all admin form submissions.
- **NFR-10** Rate limiting on the login endpoint to prevent brute-force attacks.
- **NFR-11** Password reset tokens single-use, expiring within 30 minutes.
- **NFR-12** Uploaded files validated by type and size; stored outside the web root or with execution disabled.

### 5.3 Usability
- **NFR-13** Admin dashboard usable with zero technical knowledge.
- **NFR-14** All operations via buttons, forms, and drag-and-drop where applicable.
- **NFR-15** Error messages clear and actionable.

### 5.4 Accessibility
- **NFR-16** Public pages target WCAG 2.1 Level AA: alt text on images, sufficient color contrast, keyboard navigability. *(assumption — see Appendix B)*

### 5.5 Reliability and Availability
- **NFR-17** Target 99.5% uptime.
- **NFR-18** Automated **weekly** database backups (dump to object storage), plus on-demand backup before bulk content changes; retain last 4–8 weeks. RPO ≤ 7 days, RTO ≤ 24h. Image files are stored in redundant object storage (R2) and need no separate DB backup. *(Rationale: content changes rarely and is re-creatable from club records — daily backups would re-copy unchanged data with no benefit. Revisit if member-submitted/applicant data is added per §9.)*
- **NFR-19** Friendly error pages for 404 and 500 errors.

### 5.6 Maintainability
- **NFR-20** All content stored in the database — nothing hardcoded in the frontend.
- **NFR-21** New sports teams addable from the dashboard without code changes.
- **NFR-22** Code modular and well-commented.

### 5.7 Compatibility
- **NFR-23** Fully responsive across desktop (1920px), tablet (768px), mobile (375px).
- **NFR-24** Renders correctly in Chrome, Firefox, Safari, Edge (latest 2 versions each).

### 5.8 SEO
- **NFR-25** Each public page provides title and meta-description tags; semantic HTML and sitemap.xml. *(assumption — see Appendix B)*

---

## 6. Data Requirements

Relational schema. All `*_id` are auto-increment primary keys.

### 6.1 Events
| Field | Type | Notes |
|-------|------|-------|
| event_id | INT (PK) | Auto-increment |
| name | VARCHAR(200) | Event title |
| date | DATE | |
| venue | VARCHAR(200) | |
| description | TEXT | |
| banner_image | VARCHAR(500) | File path or URL |
| status | ENUM | Upcoming / Running / Finished |

### 6.2 Teams
| Field | Type | Notes |
|-------|------|-------|
| team_id | INT (PK) | Auto-increment |
| name | VARCHAR(100) | e.g. Football, Cricket, Handball |
| description | TEXT | |

### 6.3 Players
| Field | Type | Notes |
|-------|------|-------|
| player_id | INT (PK) | Auto-increment |
| team_id | INT (FK) | References Teams |
| name | VARCHAR(100) | |
| photo | VARCHAR(500) | File path or URL |
| email | VARCHAR(200) | Renamed from `gmail` in v2.0 |
| position | VARCHAR(100) | Playing position or role |
| bio | TEXT | |
| sort_order | INT | Display order within team |

### 6.4 Panels
| Field | Type | Notes |
|-------|------|-------|
| panel_id | INT (PK) | Auto-increment |
| name | VARCHAR(100) | e.g. Panel 2025-26 |
| is_active | BOOLEAN | Only one panel active at a time |

### 6.5 Members
| Field | Type | Notes |
|-------|------|-------|
| member_id | INT (PK) | Auto-increment |
| panel_id | INT (FK) | References Panels |
| name | VARCHAR(100) | |
| photo | VARCHAR(500) | File path or URL |
| designation | VARCHAR(100) | e.g. President, Secretary |
| tier | ENUM | Executive / Sub-Executive / General |
| email | VARCHAR(200) | |
| phone | VARCHAR(20) | |
| additional_info | TEXT | Optional; surfaced on member card if present (FR-17) |
| sort_order | INT | Display order within tier |

### 6.6 Registration Settings
| Field | Type | Notes |
|-------|------|-------|
| is_open | BOOLEAN | Whether registration shows on site |
| google_form_url | VARCHAR(500) | Current quarter Google Form link |
| next_intake_date | DATE | Shown when registration is closed |

### 6.7 Admin
| Field | Type | Notes |
|-------|------|-------|
| admin_id | INT (PK) | Auto-increment |
| username | VARCHAR(100) | Unique |
| password_hash | VARCHAR(255) | bcrypt / Argon2 |
| email | VARCHAR(200) | For password recovery |
| failed_attempts | INT | For lockout logic |
| lockout_until | DATETIME | Null if not locked |
| reset_token | VARCHAR(255) | Null unless reset pending |
| reset_token_expiry | DATETIME | |

### 6.8 Audit Log
| Field | Type | Notes |
|-------|------|-------|
| log_id | INT (PK) | Auto-increment |
| admin_id | INT (FK) | References Admin |
| action | VARCHAR(100) | e.g. CREATE_EVENT, DELETE_PLAYER, LOGIN |
| target_table | VARCHAR(100) | Affected table |
| target_id | INT | Affected record id (nullable) |
| timestamp | DATETIME | |

### 6.9 Site Content (Home / About)
| Field | Type | Notes |
|-------|------|-------|
| content_id | INT (PK) | Auto-increment |
| page_key | VARCHAR(50) | e.g. home_tagline, about_history |
| content | TEXT | Rich text / value |
| featured_event_id | INT (FK) | Nullable; used for home featured event |

> v1.0 had no table for Home/About editable text or the featured-event selection (FR-2, FR-10, FR-25, FR-26). Added in v2.0.

---

## 7. Use Cases

### 7.1 Use Case List

| UC ID | Use Case Name | Actor |
|-------|---------------|-------|
| UC-01 | Browse Home Page | Viewer |
| UC-02 | View Events | Viewer |
| UC-03 | View About Us | Viewer |
| UC-04 | View Teams and Players | Viewer |
| UC-05 | View Members Panel | Viewer |
| UC-06 | Register via Google Form | Viewer |
| UC-07 | Admin Login | Admin |
| UC-08 | Manage Events (CRUD) | Admin |
| UC-09 | Manage Teams and Players (CRUD) | Admin |
| UC-10 | Manage Members Panel (CRUD) | Admin |
| UC-11 | Edit About Us Content | Admin |
| UC-12 | Open / Close Registration | Admin |
| UC-13 | Admin Logout | Admin |
| UC-14 | Admin Password Recovery | Admin |
| UC-15 | View / Restore Archived Panel | Admin |

### 7.2 Detailed Use Cases

#### UC-07: Admin Login
| | |
|---|---|
| **Use Case ID** | UC-07 |
| **Actor** | Admin |
| **Precondition** | Admin is not logged in. Login page accessible. |
| **Main Flow** | 1. Admin navigates to `/admin/login`. 2. Enters username and password. 3. System validates credentials. 4. System creates session and redirects to dashboard. |
| **Alternate Flow** | A1: Invalid credentials → error shown. A2: After 5 failed attempts → 15-minute lockout. |
| **Postcondition** | Admin authenticated with full dashboard access. Login recorded in audit log. |

#### UC-08: Manage Events (CRUD)
| | |
|---|---|
| **Use Case ID** | UC-08 |
| **Actor** | Admin |
| **Precondition** | Admin logged into dashboard. |
| **Main Flow** | 1. Admin navigates to Events section. 2. Clicks Add Event; fills name, date, venue, description, status, banner image. 3. System validates and saves; public page reflects change immediately. 4. Admin can Edit or Delete any event. |
| **Alternate Flow** | A1: Missing required field → validation error. A2: Image > 5 MB or wrong type → rejected with error. |
| **Postcondition** | Event created, updated, or deleted. Public page updated. Action logged. |

#### UC-12: Open / Close Registration
| | |
|---|---|
| **Use Case ID** | UC-12 |
| **Actor** | Admin |
| **Precondition** | Admin logged in. |
| **Main Flow** | 1. Admin goes to Registration settings. 2. Enters/updates the Google Form URL. 3. Toggles registration to Open. 4. Website shows Register Now button. 5. After intake, admin toggles to Closed. 6. Website shows closed message with next intake date. |
| **Alternate Flow** | A1: Admin opens registration without a Form URL → system shows error (FR-45). |
| **Postcondition** | Registration status and Google Form link updated site-wide. Action logged. |

#### UC-14: Admin Password Recovery
| | |
|---|---|
| **Use Case ID** | UC-14 |
| **Actor** | Admin |
| **Precondition** | Admin has access to the registered admin email. |
| **Main Flow** | 1. Admin clicks "Forgot password" on login page. 2. Enters registered email. 3. System emails a single-use reset link (30-min expiry). 4. Admin opens link, sets new password. 5. System hashes and stores new password; invalidates token. |
| **Alternate Flow** | A1: Email not registered → generic "if account exists, email sent" message (no user enumeration). A2: Expired/used token → error, prompt to restart. |
| **Postcondition** | Admin password reset. Action logged. |

#### UC-15: View / Restore Archived Panel
| | |
|---|---|
| **Use Case ID** | UC-15 |
| **Actor** | Admin |
| **Precondition** | Admin logged in; at least one archived panel exists. |
| **Main Flow** | 1. Admin opens Members → Panels. 2. Views list of archived (inactive) panels. 3. Selects a panel to re-activate. 4. System deactivates current panel and activates the chosen one. |
| **Alternate Flow** | A1: No archived panels → empty-state message. |
| **Postcondition** | Selected panel active and shown publicly. Previous active panel archived. Action logged. |

---

## 8. Traceability Matrix

| Requirement | Use Case | Data Table | Verification |
|-------------|----------|-----------|--------------|
| FR-1..FR-5 | UC-01 | Site Content, Events, Members, Teams | Inspection |
| FR-6..FR-9 | UC-02, UC-08 | Events | Test |
| FR-10, FR-11 | UC-03, UC-11 | Site Content | Test |
| FR-12..FR-14 | UC-04, UC-09 | Teams, Players | Test |
| FR-15..FR-18 | UC-05, UC-10 | Panels, Members | Test |
| FR-19..FR-23 | UC-07, UC-13 | Admin | Test |
| FR-24 | UC-14 | Admin | Test |
| FR-25..FR-39 | UC-08..UC-11, UC-15 | All content tables | Test |
| FR-40..FR-46 | UC-06, UC-12 | Registration Settings | Test |
| FR-47..FR-51 | UC-08..UC-11 | All tables | Test |
| FR-52 | UC-07..UC-15 | Audit Log | Test |
| NFR-1..NFR-25 | (cross-cutting) | — | Test / Analysis |

---

## 9. Future Enhancements (Out of Scope for v1.0)
- Multiple admin accounts with role-based permissions
- Member login portal — members log in and view their profile
- Social media integration (auto-post events to Facebook / Instagram)
- Event photo gallery module
- Custom registration form replacing Google Forms, with a database-backed applicant list
- Email notification system for event announcements
- Analytics dashboard showing visitor counts and page views

---

## Appendix A: Page Layout Descriptions
Expected layout of each public page to guide UI/UX design.

### A.1 Home Page
- Navigation bar: logo left, page links right
- Hero section: full-width banner, club name, tagline, CTA button
- Featured Event card: name, date, short description
- Quick Stats bar: total members, teams, events
- Footer: contact, social links, copyright

### A.2 Events Page
- Page header: "Events"
- Three tabbed or stacked sections: Upcoming, Running, Finished
- Each section: grid of event cards (banner, name, date, venue, status badge)

### A.3 Team Page
- Page header: "Our Teams"
- Team tabs or accordion: Football, Handball, Cricket, others
- Each team section: description + grid of player cards
- Player card: circular photo, name, position, email

### A.4 Members Page
- Page header: "Current Panel — [Panel Name/Year]"
- Three subsections in order: Executive, Sub-Executive, General Members
- Member card: photo, name, designation, email, phone

### A.5 About Us Page
- Page header: "About Us"
- Rich-text body (club history/description)
- Optional image section

---

## Appendix B: Assumptions Made in v2.0

Where v1.0 left decisions open, v2.0 chose the following defaults. Flag any to override.

| # | Gap in v1.0 | Decision in v2.0 |
|---|-------------|------------------|
| 1 | Page count inconsistent ("six pages" incl. admin) | 5 public + 1 admin dashboard |
| 2 | Player field named `gmail` | Renamed to generic `email` |
| 3 | Event status transition undefined | Manual by admin; system gives date-based hint only (FR-9) |
| 4 | "Running" event sort order missing | Soonest start first (FR-8) |
| 5 | Image size limit undefined | 5 MB, JPG/PNG/WebP (FR-50) |
| 6 | No admin password recovery | Email reset link, single-use, 30-min expiry (FR-24, UC-14) |
| 7 | Archived panels unreachable | View/restore use case added (FR-37, UC-15) |
| 8 | "Once per quarter" enforcement unclear | Admin-controlled, not system-locked in v1.0 (FR-46) |
| 9 | No audit logging | Admin actions logged (FR-52) |
| 10 | No concurrent-load target | ≥ 200 concurrent viewers (NFR-4) |
| 11 | No accessibility requirement | WCAG 2.1 AA target (NFR-16) |
| 12 | No backup RPO/RTO | Weekly automated + on-demand backups; RPO ≤ 7d, RTO ≤ 24h (NFR-18). Downgraded from daily — content changes rarely and is re-creatable. |
| 13 | No SEO requirement | Title/meta/semantic HTML/sitemap (NFR-25) |
| 14 | No table for Home/About editable text | Site Content table added (§6.9) |
| 15 | `additional_info` field unused in FRs | Tied to member card display (FR-17) |
