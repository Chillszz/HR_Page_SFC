/* ============================================================
   Seafood City Careers — central configuration
   ------------------------------------------------------------
   This is the ONE file you edit most often.
   - Paste your backend URLs after deploying (see docs/GOOGLE_SETUP.md)
   - Add / edit open positions in the POSITIONS array below
   ============================================================ */
window.SFC_CONFIG = {
  companyName: "Seafood City",
  tagline: "Join our team — fresh opportunities, every day.",

  // 1) Apps Script Web App URL (handles Sheet + email). See docs/GOOGLE_SETUP.md step 4.
  API_URL: "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE",

  // 2) Google OAuth Client ID for admin "Sign in with Google". See docs/GOOGLE_SETUP.md step 6.
  GOOGLE_CLIENT_ID: "PASTE_YOUR_GOOGLE_OAUTH_CLIENT_ID_HERE",

  // Hidden HR portal entrance. There is NO visible link to this on the public site —
  // HR opens it by pressing & holding the logo for ~1 second (or visiting this path
  // directly). For extra obscurity you can rename the public/admin folder to something
  // non-obvious and update this path to match.
  PORTAL_PATH: "/admin/",

  // Where applicants land after submitting (kept on-site).
  // (No edits needed.)
};

/* ------------------------------------------------------------
   OPEN POSITIONS
   Add an object per open spot. `id` must be unique (used in URLs).
   These are PLACEHOLDERS — replace titles/descriptions with the real ones.
   ------------------------------------------------------------ */
window.SFC_POSITIONS = [
  {
    id: "cashier",
    title: "Cashier",
    department: "Front End",
    type: "Full-time",
    location: "Store #1",
    summary: "Greet guests, ring up groceries accurately, and keep checkout moving with a smile.",
    responsibilities: [
      "Operate the register and handle cash, card, and EBT transactions",
      "Bag groceries carefully and assist customers",
      "Keep the checkout area clean and stocked"
    ],
    requirements: [
      "Friendly, customer-first attitude",
      "Able to stand for full shifts",
      "Basic math and English communication"
    ]
  },
  {
    id: "seafood-clerk",
    title: "Seafood Clerk",
    department: "Seafood",
    type: "Full-time",
    location: "Store #1",
    summary: "Prepare, display, and sell fresh seafood while delivering great service at the counter.",
    responsibilities: [
      "Clean, cut, and display fresh fish and shellfish",
      "Advise customers and fulfill special requests",
      "Follow food-safety and sanitation standards"
    ],
    requirements: [
      "Comfortable handling fresh seafood",
      "Food handler's card a plus (we can help you get one)",
      "Reliable and team-oriented"
    ]
  },
  {
    id: "grocery-stocker",
    title: "Grocery Stocker",
    department: "Grocery",
    type: "Part-time",
    location: "Store #1",
    summary: "Keep shelves full and the store looking its best.",
    responsibilities: [
      "Stock and rotate product, build displays",
      "Receive and break down deliveries",
      "Maintain a clean, organized sales floor"
    ],
    requirements: [
      "Able to lift up to 50 lbs",
      "Open availability including weekends",
      "Dependable and detail-oriented"
    ]
  }
];

/* Helper used across pages */
window.SFC_findPosition = function (id) {
  return (window.SFC_POSITIONS || []).find(function (p) { return p.id === id; }) || null;
};
