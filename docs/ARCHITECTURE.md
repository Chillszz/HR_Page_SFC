# Architecture

```
                 Applicant's browser                         HR's browser
                        │                                          │
         (public pages) │                                          │ (admin, Google sign-in)
                        ▼                                          ▼
   ┌───────────────────────────────────────────────────────────────────────┐
   │              Cloudflare Pages  (static site, output dir: public/)        │
   │   index.html → apply.html → application.html        admin/index.html     │
   └───────────────────────────────────────────────────────────────────────┘
                        │   POST (text/plain JSON)                 │
                        ▼                                          ▼
   ┌───────────────────────────────────────────────────────────────────────┐
   │           Google Apps Script Web App  (apps-script/Code.gs)             │
   │   action=apply        → append row + email HR                          │
   │   action=admin_list   → verify Google token + allowlist → return rows   │
   │   action=admin_update → verify → update status + audit log              │
   └───────────────────────────────────────────────────────────────────────┘
              │                         │                      │
              ▼                         ▼                      ▼
     Google Sheet "Applicants"   Gmail (MailApp)      Google Sheet (UICIS, RESTRICTED)
     + "Activity Log" tab        notifications        gov/ID data, HR-only sharing
```

## Why this stack
- **$0**: Cloudflare Pages free tier + Apps Script (runs on the HR Google account).
- **No servers/keys to babysit**: Apps Script is the backend; email is sent by the same Google account via `MailApp`.
- **No build step**: the site is plain HTML/CSS/JS, so deploys are instant and anyone can read it.

## Applicant flow (two stages)
1. **Apply (stage 1)** — `apply.html`: the quick "stand paper" (name, contact, position). Saved to `sessionStorage`.
2. **Application (stage 2)** — `application.html`: the full application. On submit, stage 1 + stage 2 are POSTed together to the backend → row in the `Applicants` sheet + email to HR.

## Admin flow
- `admin/index.html` gates on **Sign in with Google** (Google Identity Services).
- The ID token is sent with every admin request; `Code.gs` verifies it against Google and checks `ADMIN_EMAILS`.
- Status changes require a **two-step confirmation modal** before they're written.
- Every change is appended to the `Activity Log` tab (who / when / what).

## Status lifecycle
`New → In Review → Interview → Hired → Rejected`
(The "Hired" tracker is this sheet filtered to `status = Hired`.)

## UICIS / onboarding (sensitive — separate, built later)
Government/ID data is **never** stored in the main tracker. It goes to a separate, HR-only spreadsheet (`UICIS_SPREADSHEET_ID` in `Code.gs`), collected only for candidates you've chosen to hire, via a private per-candidate link. This flow is scaffolded but intentionally not wired until you send the real UICIS fields and confirm the privacy handling.

## Security notes
- Admin data is protected by Google sign-in + an email allowlist verified server-side — not just a secret URL.
- The public `apply` endpoint is open (it must be, to accept applications); it only ever *writes* applicant data, never reads it back.
- Keep the UICIS spreadsheet's sharing restricted to named HR accounts. Do not enable "anyone with the link."
