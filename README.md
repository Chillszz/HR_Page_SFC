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
- **Hidden HR portal:** there is no visible link to the dashboard. To open it,
  **press & hold the logo for ~1 second** (mouse or touch), or go to the portal
  path directly (`/admin/`, configurable as `PORTAL_PATH` in `config.js`). The
  portal is `noindex` + blocked in `robots.txt` so search engines won't list it,
  and access is still gated by Google sign-in + the email allowlist.
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
