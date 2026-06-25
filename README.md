# Seafood City — Careers & Hiring Portal

A lightweight, $0-to-host hiring website for Seafood City. Replaces the paper
sign-in sheet and application packet: candidates browse open roles, apply online
in two short steps, and HR reviews/advances them from a private dashboard —
backed by a Google Sheet tracker with email notifications.

## What's here

| Path | What it is |
|------|------------|
| `public/index.html` | Public landing page — lists open positions with filters |
| `public/apply.html` | Stage 1 — quick "apply" form (the stand paper) |
| `public/application.html` | Stage 2 — full application, final submit |
| `public/admin/index.html` | HR dashboard (Google sign-in, review + advance candidates) |
| `public/me/index.html` | Optional applicant dashboard — track status + referral link |
| `public/assets/js/config.js` | **Edit me** — positions list + backend URLs |
| `apps-script/Code.gs` | Backend: Sheet writes, email, admin auth |
| `docs/GOOGLE_SETUP.md` | **Start here** — step-by-step Google + Cloudflare setup |
| `docs/ARCHITECTURE.md` | How it all fits together |

## Quick start
1. **Try the UI now** — open `public/index.html` in a browser (or run a static server).
   With the backend unconfigured, forms log their payload to the console and the
   admin page shows demo data, so you can click through the whole flow.
2. **Go live** — follow `docs/GOOGLE_SETUP.md` to create the Sheet, deploy the
   Apps Script backend, set up Google sign-in, and host on Cloudflare Pages.
3. **Make it yours** — edit open roles and form fields (see "Customizing" below).

### Run a local preview
```bash
cd public && python3 -m http.server 8000
# then open http://localhost:8000
```

## Customizing
- **Open positions:** edit `window.SFC_POSITIONS` in `public/assets/js/config.js`.
- **Form fields:** the fields in `apply.html` (stage 1) and `application.html`
  (stage 2) are marked as PLACEHOLDERS — swap them for your real ones. If you add
  a field, also add its name to `APPLICANT_COLUMNS` in `Code.gs` and to the Sheet
  header row so it's saved.
- **Sign in (one door, two destinations):** the public **"Sign in"** link goes to
  `/me/` and signs the user in with Google. **HR** accounts (listed in
  `ADMIN_EMAILS` in `apps-script/Code.gs`) are routed to the admin dashboard;
  **everyone else** lands on their own applicant dashboard (`/me/`) to track their
  application status and get a referral link. Applying never requires sign-in.
  To add/remove HR staff, edit `ADMIN_EMAILS` and redeploy the Apps Script.
- **Referrals:** a signed-in applicant gets a personal link (`/?ref=CODE`). When a
  friend applies through it, the code is saved on their application (`referredBy`),
  and the referrer sees their count. The backend auto-adds the `referredBy` column
  to the Applicants sheet and maintains a `Referrers` tab (code → name) for HR — no
  manual sheet setup needed.
- **Branding/colors:** the `:root` block at the top of `public/assets/css/styles.css`
  (brand red is `--brand: #E11B22`, matching the Seafood City logo).
- **Logo:** the official Seafood City logo lives at `public/assets/img/seafoodcity.png`
  and is shown in every header (sized to ~42px tall). To swap it, replace that file
  (or change the `<img src>` in the page headers). If the image is ever missing, the
  header falls back to a brand-red SVG diamond-fish mark (`logo-mark.svg`) + wordmark.

## Status
Scaffold complete. Pending: real departments + form fields, and the separate
UICIS/onboarding flow for hired candidates (kept in a restricted Sheet).
See the bottom of `docs/GOOGLE_SETUP.md` for what to send next.
