/**
 * Seafood City Careers — backend (Google Apps Script Web App)
 * ----------------------------------------------------------------
 * One script does everything, for free, from your own Google account:
 *   • receives applications from the website  -> appends a row to the Sheet
 *   • emails HR that someone applied
 *   • serves the admin dashboard (after verifying Google sign-in)
 *   • updates applicant status from the admin dashboard
 *
 * SETUP: see docs/GOOGLE_SETUP.md. Fill in the CONFIG block below,
 * then Deploy > New deployment > Web app.
 */

// ====================== CONFIG — EDIT THESE ======================
var CONFIG = {
  // Google Sheet that holds applicants. Leave "" to use the sheet this
  // script is bound to (recommended: create the sheet, then Extensions > Apps Script).
  SPREADSHEET_ID: "",

  // Tab names inside that spreadsheet.
  APPLICANTS_TAB: "Applicants",
  AUDIT_TAB: "Activity Log",

  // Who gets the "new applicant" email (comma-separated).
  NOTIFY_EMAILS: "hr@seafoodcity.example",

  // OAuth Client ID — MUST match GOOGLE_CLIENT_ID in public/assets/js/config.js.
  GOOGLE_CLIENT_ID: "335125521257-btsi6j4iuqqbkaoqkqe6jbl9ngu8fef3.apps.googleusercontent.com",

  // Only these Google accounts may use the admin dashboard.
  ADMIN_EMAILS: ["hr@seafoodcity.example"],

  // OPTIONAL: separate, restricted spreadsheet for UICIS / government onboarding
  // data (gov ID numbers). Keep this Sheet shared ONLY with HR. Leave "" for now.
  UICIS_SPREADSHEET_ID: "",
  UICIS_TAB: "UICIS_Restricted",

  // Cloudflare Turnstile secret key (anti-spam). Leave "" to skip captcha checks.
  // Must pair with TURNSTILE_SITE_KEY in public/assets/js/config.js.
  TURNSTILE_SECRET: "",

  // Reject the same email applying to the same role within this many hours.
  DEDUP_WINDOW_HOURS: 24
};
// ================================================================

// Column order for the Applicants tab. Keep header row in the Sheet matching this.
var APPLICANT_COLUMNS = [
  "id", "submittedAt", "status",
  "firstName", "lastName", "email", "phone",
  "positionId", "positionTitle", "department",
  "availability", "startDate", "referral",
  "address", "workAuth", "over18",
  "lastEmployer", "experience", "motivation", "days",
  "lastActionBy", "lastActionAt"
];

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents || "{}");
    switch (body.action) {
      case "apply":        return json(handleApply(body));
      case "admin_list":   return json(requireAdmin(body, handleList));
      case "admin_update": return json(requireAdmin(body, function (u) { return handleUpdate(body, u); }));
      default:             return json({ ok: false, error: "Unknown action" });
    }
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

// Simple GET so you can confirm the deployment is live in a browser.
function doGet() {
  return json({ ok: true, service: "Seafood City Careers API" });
}

/* ----------------------------- Applicants ----------------------------- */
function handleApply(body) {
  // 1) Honeypot — bots fill the hidden "website" field. Pretend success, drop it.
  if (body.website) return { ok: true, id: "ignored" };

  // 2) Cloudflare Turnstile — verify the captcha token if enabled.
  if (CONFIG.TURNSTILE_SECRET && !verifyTurnstile(body.turnstileToken)) {
    return { ok: false, error: "Verification failed. Please try again." };
  }

  var sheet = getSheet(CONFIG.APPLICANTS_TAB, APPLICANT_COLUMNS);

  // 3) Dedup — same email + same role within the configured window.
  if (isDuplicate(sheet, body.email, body.positionId)) {
    return { ok: false, duplicate: true, error: "Duplicate application" };
  }

  var id = "APP-" + Utilities.getUuid().slice(0, 8).toUpperCase();
  var record = Object.assign({}, body, {
    id: id,
    submittedAt: body.submittedAt || new Date().toISOString(),
    status: "New"
  });

  var row = APPLICANT_COLUMNS.map(function (c) { return record[c] != null ? record[c] : ""; });
  sheet.appendRow(row);

  sendNewApplicantEmail(record);
  return { ok: true, id: id };
}

function verifyTurnstile(token) {
  if (!token) return false;
  try {
    var resp = UrlFetchApp.fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "post",
      payload: { secret: CONFIG.TURNSTILE_SECRET, response: token },
      muteHttpExceptions: true
    });
    var out = JSON.parse(resp.getContentText());
    return out.success === true;
  } catch (err) {
    return false;
  }
}

function isDuplicate(sheet, email, positionId) {
  if (!email) return false;
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return false;
  var headers = values[0];
  var emailCol = headers.indexOf("email");
  var posCol = headers.indexOf("positionId");
  var tsCol = headers.indexOf("submittedAt");
  var cutoff = new Date().getTime() - (CONFIG.DEDUP_WINDOW_HOURS * 3600 * 1000);

  for (var r = 1; r < values.length; r++) {
    if (lc(values[r][emailCol]) !== lc(email)) continue;
    if (String(values[r][posCol]) !== String(positionId)) continue;
    var when = new Date(values[r][tsCol]).getTime();
    if (!isNaN(when) && when >= cutoff) return true;
  }
  return false;
}

function handleList() {
  var sheet = getSheet(CONFIG.APPLICANTS_TAB, APPLICANT_COLUMNS);
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return { ok: true, applicants: [] };
  var headers = values[0];
  var applicants = [];
  for (var r = 1; r < values.length; r++) {
    var obj = {};
    for (var c = 0; c < headers.length; c++) obj[headers[c]] = values[r][c];
    applicants.push(obj);
  }
  applicants.reverse(); // newest first
  return { ok: true, applicants: applicants };
}

function handleUpdate(body, user) {
  if (!body.id || !body.status) return { ok: false, error: "Missing id or status" };
  var sheet = getSheet(CONFIG.APPLICANTS_TAB, APPLICANT_COLUMNS);
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var idCol = headers.indexOf("id");
  var statusCol = headers.indexOf("status");
  var byCol = headers.indexOf("lastActionBy");
  var atCol = headers.indexOf("lastActionAt");

  for (var r = 1; r < values.length; r++) {
    if (String(values[r][idCol]) === String(body.id)) {
      sheet.getRange(r + 1, statusCol + 1).setValue(body.status);
      if (byCol > -1) sheet.getRange(r + 1, byCol + 1).setValue(user.email);
      if (atCol > -1) sheet.getRange(r + 1, atCol + 1).setValue(new Date().toISOString());
      logActivity(user.email, "status -> " + body.status, body.id);
      return { ok: true };
    }
  }
  return { ok: false, error: "Applicant not found" };
}

/* ----------------------------- Admin auth ----------------------------- */
// Verifies the Google ID token (JWT) and the email allowlist, then runs fn(user).
function requireAdmin(body, fn) {
  var user = verifyGoogleToken(body.idToken);
  if (!user) return { ok: false, error: "Sign-in required or token invalid" };
  if (CONFIG.ADMIN_EMAILS.map(lc).indexOf(lc(user.email)) === -1) {
    return { ok: false, error: "Not authorized: " + user.email };
  }
  return fn(user);
}

function verifyGoogleToken(idToken) {
  if (!idToken) return null;
  try {
    var resp = UrlFetchApp.fetch(
      "https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(idToken),
      { muteHttpExceptions: true });
    if (resp.getResponseCode() !== 200) return null;
    var info = JSON.parse(resp.getContentText());
    if (info.aud !== CONFIG.GOOGLE_CLIENT_ID) return null;       // token meant for our app
    if (String(info.email_verified) !== "true") return null;
    return { email: info.email, name: info.name };
  } catch (err) {
    return null;
  }
}

/* ----------------------------- Email ----------------------------- */
function sendNewApplicantEmail(rec) {
  if (!CONFIG.NOTIFY_EMAILS) return;
  var subject = "New application: " + rec.firstName + " " + rec.lastName + " — " + (rec.positionTitle || "");
  var lines = [
    "A new application was submitted on the careers site.",
    "",
    "Name: " + rec.firstName + " " + rec.lastName,
    "Position: " + (rec.positionTitle || "") + " (" + (rec.department || "") + ")",
    "Email: " + rec.email,
    "Phone: " + rec.phone,
    "Availability: " + (rec.availability || ""),
    "Applied: " + rec.submittedAt,
    "Reference ID: " + rec.id,
    "",
    "Open the HR dashboard to review and advance this candidate."
  ];
  MailApp.sendEmail({ to: CONFIG.NOTIFY_EMAILS, subject: subject, body: lines.join("\n") });
}

/* ----------------------------- Helpers ----------------------------- */
function getSheet(tabName, headers) {
  var ss = CONFIG.SPREADSHEET_ID
    ? SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error("No spreadsheet. Set CONFIG.SPREADSHEET_ID or bind the script to a Sheet.");
  var sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
    if (headers) sheet.appendRow(headers);
  }
  return sheet;
}

function logActivity(email, action, refId) {
  try {
    var sheet = getSheet(CONFIG.AUDIT_TAB, ["when", "who", "action", "ref"]);
    sheet.appendRow([new Date().toISOString(), email, action, refId || ""]);
  } catch (e) { /* non-fatal */ }
}

function lc(s) { return String(s || "").toLowerCase().trim(); }

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
