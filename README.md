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
- **Branding/colors:** the `:root` block at the top of `public/assets/css/styles.css`.

## Status
Scaffold complete. Pending: real departments + form fields, and the separate
UICIS/onboarding flow for hired candidates (kept in a restricted Sheet).
See the bottom of `docs/GOOGLE_SETUP.md` for what to send next.
