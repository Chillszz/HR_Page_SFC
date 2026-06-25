# Google + Cloudflare setup guide

This is the checklist for **you** (the things I can't create from code). Do these once and the site is live. Takes ~30–40 minutes the first time.

There are 3 things to set up:
1. The **Google Sheet** (your tracker)
2. The **Apps Script** backend (writes to the Sheet + sends email + admin auth)
3. **Cloudflare Pages** hosting + the **Google sign-in** Client ID

---

## 1. Create the Google Sheet (your tracker)

1. Go to <https://sheets.google.com> and create a new spreadsheet. Name it **`Seafood City — Hiring Tracker`**.
2. Rename the first tab to **`Applicants`**.
3. In row 1 of the `Applicants` tab, paste these column headers **exactly** (one per cell, left to right):

```
id	submittedAt	status	firstName	lastName	email	phone	positionId	positionTitle	department	availability	startDate	referral	address	workAuth	over18	lastEmployer	experience	motivation	days	lastActionBy	lastActionAt
```

> Tip: copy the line above and Paste — Google Sheets splits the tabs into columns automatically. **Don't rename or reorder** these; the backend matches them by name.

4. Add a second tab named **`Activity Log`** with these headers in row 1:

```
when	who	action	ref
```

This is your audit trail — every status change (interview / hire / reject) gets logged here with who did it.

5. (Optional, later) Freeze row 1: **View → Freeze → 1 row**, and bold it.

### The two trackers
- **`Applicants`** = everyone who applied (your first tracker). The `status` column moves them through `New → In Review → Interview → Hired → Rejected`.
- Your **"Hired" tracker** is simply this same sheet filtered to `status = Hired`. (If you'd rather have a fully separate Hired tab/sheet, tell me and I'll add an auto-copy step.)

### UICIS / government onboarding data (sensitive — kept separate)
Because UICIS contains government/ID numbers, it does **not** go in the tracker above. Create a **second, separate spreadsheet** named **`Seafood City — UICIS (RESTRICTED)`** and share it with HR only. We'll wire the onboarding form to it as a later step (it's only collected for people you've decided to hire, via a private link). Keep its sharing locked down — do **not** set it to "anyone with the link."

---

## 2. Deploy the Apps Script backend

1. In your `Applicants` spreadsheet, go to **Extensions → Apps Script**. A new script project opens, already bound to your sheet.
2. Delete the default `Code.gs` content and paste the contents of **`apps-script/Code.gs`** from this repo.
3. At the top, edit the **`CONFIG`** block:
   - `NOTIFY_EMAILS` — the email(s) that should get "new applicant" notifications (e.g. the HR Gmail).
   - `ADMIN_EMAILS` — the Google account(s) allowed into the admin dashboard.
   - `GOOGLE_CLIENT_ID` — leave for now; you'll paste it in step 3 below.
   - Leave `SPREADSHEET_ID` empty (the script is bound to this sheet).
4. Click **Save**.
5. Click **Deploy → New deployment → (gear) Web app**.
   - **Description:** `Careers API`
   - **Execute as:** **Me**
   - **Who has access:** **Anyone**  *(required so the public apply form can reach it; admin actions are still protected by Google sign-in + the email allowlist)*
6. Click **Deploy**, approve the permissions prompt (it asks to manage the sheet and send email as you — that's expected).
7. Copy the **Web app URL** (ends in `/exec`). Paste it into **`public/assets/js/config.js`** as `API_URL`.

> Whenever you change `Code.gs`, do **Deploy → Manage deployments → edit → Version: New version** to publish the change.

---

## 3. Google sign-in for the admin dashboard

1. Go to <https://console.cloud.google.com> and create (or pick) a project.
2. **APIs & Services → OAuth consent screen**: choose **Internal** if HR uses Google Workspace, otherwise **External**; fill in app name + support email; save.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - Application type: **Web application**
   - **Authorized JavaScript origins:** add your site origin(s), e.g.
     - `https://careers.seafoodcity...` (your real subdomain)
     - your Cloudflare Pages preview URL (e.g. `https://hr-page-sfc.pages.dev`)
   - Create, then copy the **Client ID**.
4. Paste that Client ID into **two** places:
   - `public/assets/js/config.js` → `GOOGLE_CLIENT_ID`
   - `apps-script/Code.gs` → `CONFIG.GOOGLE_CLIENT_ID` (then re-deploy a new version, step 2.7 note)

Now only the emails in `ADMIN_EMAILS` can sign in and load/modify applicants.

---

## 4. Host on Cloudflare Pages

1. Push this repo to GitHub (already set up on branch `claude/hopeful-wright-8vz7zm`).
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**, pick this repo.
3. Build settings:
   - **Framework preset:** None
   - **Build command:** *(leave blank)*
   - **Build output directory:** `public`
4. Deploy. You'll get a `*.pages.dev` URL.
5. Add your custom subdomain under **Custom domains** (e.g. `careers.seafoodcity...`). Cloudflare walks you through the DNS record.
6. Go back to step 3 and make sure your final subdomain is in the OAuth **Authorized JavaScript origins**.

---

## 5. Test the whole flow
1. Open your site → pick a role → **Apply** → fill step 1 → step 2 → **Submit**.
2. Check: a new row appears in the `Applicants` sheet **and** you got the email.
3. Open `/admin/` → sign in with an `ADMIN_EMAILS` account → you should see the applicant.
4. Click **Interview** → confirm both popups → the `status` updates in the sheet and `Activity Log` records it.

If any step fails, the browser console (F12) and the Apps Script **Executions** log will show why.

---

## What to send me next
To replace the placeholders with your real content, send me:
- The **list of departments/positions** with short descriptions.
- The exact **fields on the stand paper** (stage 1) and the **full application** (stage 2).
- The **UICIS form fields** + any other onboarding papers, so I can build the restricted onboarding flow.
- Your final **subdomain** name.
