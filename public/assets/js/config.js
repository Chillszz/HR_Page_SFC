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
  API_URL: "https://script.google.com/macros/s/AKfycbz6glpI-X268CvFY527hvNZTSO3h40Yy-p6d6dre5n5CQZ4glmXZ3Ihn8U83yaCRBpI/exec",

  // 2) Google OAuth Client ID for admin "Sign in with Google". See docs/GOOGLE_SETUP.md step 6.
  GOOGLE_CLIENT_ID: "335125521257-btsi6j4iuqqbkaoqkqe6jbl9ngu8fef3.apps.googleusercontent.com",

  // 3) Cloudflare Turnstile site key (anti-spam on the application form).
  //    Leave blank to disable the captcha. See docs/GOOGLE_SETUP.md step 7.
  TURNSTILE_SITE_KEY: "0x4AAAAAADqt2N8ZROtqGFeY",

  // Where applicants land after submitting (kept on-site).
  // (No edits needed.)
};

/* ------------------------------------------------------------
   OPEN POSITIONS
   Add/remove an object per open spot. `id` must be unique (used in URLs).

   These are realistic PLACEHOLDERS built around Seafood City's actual
   departments (Front End, Seafood, Meat, Produce, Grocery, Utility,
   Grill City food court, Baker's Ave bakery, Admin). Replace the details,
   and especially `location` and `pay` (placeholders), with your real info.

   Fields: id, title, department, type, location, schedule, pay, summary,
           responsibilities[], requirements[], notes (optional)
   ------------------------------------------------------------ */
window.SFC_POSITIONS = [
  {
    id: "cashier",
    title: "Cashier",
    department: "Front End",
    type: "Full-time / Part-time",
    location: "Store location — TBD",
    schedule: "Day & evening shifts, weekends required",
    pay: "$16–$19 / hour (placeholder)",
    summary: "Be the friendly face of Seafood City — ring up orders accurately and keep checkout moving.",
    responsibilities: [
      "Operate the register and handle cash, card, and EBT transactions",
      "Scan and bag groceries carefully; assist customers with their needs",
      "Keep the checkout lane clean, stocked, and organized",
      "Answer basic customer questions and direct them to the right department"
    ],
    requirements: [
      "Friendly, customer-first attitude",
      "Able to stand for full shifts and lift light items",
      "Basic math and clear communication",
      "Available weekends and some holidays"
    ],
    notes: "Food handler's card and a pre-employment drug test required upon hire."
  },
  {
    id: "courtesy-clerk",
    title: "Courtesy Clerk (Bagger)",
    department: "Front End",
    type: "Part-time",
    location: "Store location — TBD",
    schedule: "Flexible shifts, great for first-time workers",
    pay: "$16–$17 / hour (placeholder)",
    summary: "Bag groceries, gather carts, and help customers out — a great entry-level start.",
    responsibilities: [
      "Bag groceries quickly and carefully",
      "Collect shopping carts from the lot and keep them stocked",
      "Help customers carry items to their vehicles",
      "Keep the front end and entrance areas tidy"
    ],
    requirements: [
      "Positive, helpful attitude",
      "Able to work outdoors and push carts in all weather",
      "Able to lift up to 25 lbs",
      "No experience needed — we'll train you"
    ]
  },
  {
    id: "customer-service-clerk",
    title: "Customer Service Clerk",
    department: "Front End",
    type: "Full-time",
    location: "Store location — TBD",
    schedule: "Day & evening shifts, weekends required",
    pay: "$17–$20 / hour (placeholder)",
    summary: "Handle the service counter — returns, money services, and making things right for customers.",
    responsibilities: [
      "Process returns, refunds, and money/remittance services",
      "Resolve customer questions and concerns with care",
      "Support cashiers and balance the front-end office",
      "Promote loyalty programs and store services"
    ],
    requirements: [
      "Prior cashier or customer service experience preferred",
      "Comfortable handling cash and balancing a till",
      "Patient, professional, and a strong communicator",
      "Available weekends and holidays"
    ],
    notes: "Pre-employment drug test required upon hire."
  },
  {
    id: "seafood-clerk",
    title: "Seafood Clerk / Fish Cleaner",
    department: "Seafood",
    type: "Full-time",
    location: "Store location — TBD",
    schedule: "Early day shifts, weekends required",
    pay: "$17–$21 / hour (placeholder)",
    summary: "Prepare, clean, and display fresh fish and shellfish while delivering great counter service.",
    responsibilities: [
      "Clean, scale, fillet, and cut fresh fish to customer requests",
      "Build and maintain attractive, fresh seafood displays",
      "Advise customers on selection and preparation",
      "Follow strict food-safety, temperature, and sanitation standards"
    ],
    requirements: [
      "Comfortable handling and cutting fresh seafood",
      "Able to stand for full shifts in a cold, wet environment",
      "Able to lift up to 50 lbs",
      "Team-oriented and reliable"
    ],
    notes: "Food handler's card and a pre-employment drug test required upon hire."
  },
  {
    id: "meat-cutter",
    title: "Meat Cutter",
    department: "Meat",
    type: "Full-time",
    location: "Store location — TBD",
    schedule: "Early day shifts, weekends required",
    pay: "$20–$26 / hour (placeholder)",
    summary: "Cut, trim, and prepare quality meats to spec for our display cases and customers.",
    responsibilities: [
      "Cut, trim, grind, and portion beef, pork, and poultry",
      "Stock and rotate the meat case; ensure freshness and labeling",
      "Fulfill custom cut requests for customers",
      "Maintain a clean, sanitary cutting room and equipment"
    ],
    requirements: [
      "Prior meat-cutting / butcher experience required",
      "Knowledge of cuts and safe knife/saw handling",
      "Able to work in a cold environment and lift up to 50 lbs",
      "Food-safety minded"
    ],
    notes: "Food handler's card and a pre-employment drug test required upon hire."
  },
  {
    id: "meat-clerk",
    title: "Meat Clerk / Wrapper",
    department: "Meat",
    type: "Full-time / Part-time",
    location: "Store location — TBD",
    schedule: "Day shifts, weekends required",
    pay: "$16–$19 / hour (placeholder)",
    summary: "Package, label, and stock meat products while keeping the case full and fresh.",
    responsibilities: [
      "Wrap, weigh, and label meat products",
      "Stock and rotate the meat and poultry cases",
      "Keep work areas clean and sanitized",
      "Assist customers at the counter"
    ],
    requirements: [
      "Able to work in a cold environment",
      "Able to lift up to 50 lbs",
      "Detail-oriented and dependable",
      "Weekend availability"
    ],
    notes: "Food handler's card and a pre-employment drug test required upon hire."
  },
  {
    id: "produce-clerk",
    title: "Produce Clerk",
    department: "Produce",
    type: "Full-time / Part-time",
    location: "Store location — TBD",
    schedule: "Early day shifts, weekends required",
    pay: "$16–$19 / hour (placeholder)",
    summary: "Keep fruits and vegetables fresh, full, and beautifully displayed.",
    responsibilities: [
      "Stock, rotate, and cull produce to ensure freshness",
      "Trim, mist, and build colorful produce displays",
      "Unload and process produce deliveries",
      "Assist customers and answer product questions"
    ],
    requirements: [
      "Able to lift up to 50 lbs and stand for full shifts",
      "Early-morning availability a plus",
      "Eye for fresh, attractive displays",
      "Reliable and team-oriented"
    ],
    notes: "Food handler's card and a pre-employment drug test required upon hire."
  },
  {
    id: "grocery-stocker",
    title: "Grocery Stocker (Night Crew)",
    department: "Grocery",
    type: "Full-time / Part-time",
    location: "Store location — TBD",
    schedule: "Overnight / early-morning shifts",
    pay: "$16–$20 / hour (placeholder)",
    summary: "Keep shelves full and the store looking its best, mostly before doors open.",
    responsibilities: [
      "Stock and rotate product; build and face displays",
      "Receive, break down, and put away deliveries",
      "Maintain a clean, organized sales floor and backroom",
      "Operate pallet jacks and stocking equipment safely"
    ],
    requirements: [
      "Able to lift up to 50 lbs repeatedly",
      "Available for overnight / early-morning shifts and weekends",
      "Dependable, fast, and detail-oriented",
      "Prior stocking experience a plus"
    ],
    notes: "Pre-employment drug test required upon hire."
  },
  {
    id: "utility-clerk",
    title: "Utility Clerk (Sanitation)",
    department: "Utility",
    type: "Part-time",
    location: "Store location — TBD",
    schedule: "Evening / overnight shifts",
    pay: "$16–$18 / hour (placeholder)",
    summary: "Keep the whole store clean and safe — floors, restrooms, and common areas.",
    responsibilities: [
      "Sweep, mop, and maintain floors throughout the store",
      "Clean restrooms, break rooms, and common areas",
      "Manage trash, recycling, and cardboard baling",
      "Report maintenance and safety issues"
    ],
    requirements: [
      "Able to lift up to 50 lbs and be on your feet all shift",
      "Available evenings/overnights and weekends",
      "Dependable and thorough",
      "No experience needed — we'll train you"
    ]
  },
  {
    id: "food-service-grill",
    title: "Food Service Worker — Grill City",
    department: "Grill City",
    type: "Full-time / Part-time",
    location: "Store food court — TBD",
    schedule: "Day & evening shifts, weekends required",
    pay: "$16–$20 / hour (placeholder)",
    summary: "Cook and serve Filipino favorites at our Grill City food court counter.",
    responsibilities: [
      "Prepare, cook, and plate menu items to recipe and quality standards",
      "Serve customers quickly and courteously at the counter",
      "Keep cooking and serving areas clean and sanitized",
      "Monitor food temperatures and freshness"
    ],
    requirements: [
      "Food prep or kitchen experience a plus",
      "Comfortable around grills, fryers, and hot surfaces",
      "Able to stand for full shifts and lift up to 40 lbs",
      "Weekend availability"
    ],
    notes: "Food handler's card and a pre-employment drug test required upon hire."
  },
  {
    id: "baker",
    title: "Baker — Baker's Ave",
    department: "Baker's Ave",
    type: "Full-time",
    location: "Store bakery — TBD",
    schedule: "Early-morning / overnight shifts",
    pay: "$17–$22 / hour (placeholder)",
    summary: "Bake fresh breads, cakes, and Filipino pastries that keep customers coming back.",
    responsibilities: [
      "Mix, proof, bake, and finish breads, cakes, and pastries",
      "Follow recipes and maintain consistent quality",
      "Stock and display fresh bakery items",
      "Keep the bakery clean and food-safe"
    ],
    requirements: [
      "Baking experience preferred (Filipino bakery a plus)",
      "Available for early-morning / overnight shifts",
      "Able to stand for full shifts and lift up to 50 lbs",
      "Detail-oriented with a passion for quality"
    ],
    notes: "Food handler's card and a pre-employment drug test required upon hire."
  },
  {
    id: "bakery-clerk",
    title: "Bakery Clerk",
    department: "Baker's Ave",
    type: "Part-time",
    location: "Store bakery — TBD",
    schedule: "Day shifts, weekends required",
    pay: "$16–$18 / hour (placeholder)",
    summary: "Package, display, and sell fresh bakery products with great customer service.",
    responsibilities: [
      "Slice, package, and label bakery items",
      "Stock and arrange attractive bakery displays",
      "Assist customers with orders, including custom cakes",
      "Keep the bakery area clean and stocked"
    ],
    requirements: [
      "Friendly, customer-first attitude",
      "Able to lift up to 40 lbs and stand for full shifts",
      "Weekend availability",
      "No experience needed — we'll train you"
    ],
    notes: "Food handler's card required upon hire."
  },
  {
    id: "office-clerk",
    title: "Office / Admin Clerk",
    department: "Admin",
    type: "Full-time",
    location: "Store office — TBD",
    schedule: "Daytime business hours",
    pay: "$18–$23 / hour (placeholder)",
    summary: "Support store operations with bookkeeping, cash handling, and office administration.",
    responsibilities: [
      "Count and reconcile daily cash and deposits",
      "Maintain records, reports, and basic bookkeeping",
      "Support hiring paperwork and employee files",
      "Handle phones, filing, and general office tasks"
    ],
    requirements: [
      "Prior office, bookkeeping, or cash-handling experience",
      "Comfortable with spreadsheets and basic computer tasks",
      "Organized, accurate, and discreet with confidential info",
      "Strong communication skills"
    ],
    notes: "Pre-employment drug test required upon hire."
  }
];

/* Helper used across pages */
window.SFC_findPosition = function (id) {
  return (window.SFC_POSITIONS || []).find(function (p) { return p.id === id; }) || null;
};

/* If someone arrives via a friend's referral link (?ref=CODE), remember it so
   it can be attached when they submit an application. */
(function () {
  try {
    var ref = new URLSearchParams(location.search).get("ref");
    if (ref) localStorage.setItem("sfc_ref", ref);
  } catch (e) { /* ignore */ }
})();
window.SFC_getRef = function () {
  try { return localStorage.getItem("sfc_ref") || ""; } catch (e) { return ""; }
};

/* ------------------------------------------------------------
   Signed-in display state (cosmetic only — real auth is always
   re-verified server-side with a fresh Google token per request).
   Lets the public nav greet the user by name across pages.
   ------------------------------------------------------------ */
window.SFC_setUser = function (u) {
  try { localStorage.setItem("sfc_user", JSON.stringify(u || {})); } catch (e) {}
};
window.SFC_clearUser = function () {
  try { localStorage.removeItem("sfc_user"); } catch (e) {}
};
window.SFC_getUser = function () {
  try { return JSON.parse(localStorage.getItem("sfc_user") || "null"); } catch (e) { return null; }
};

(function () {
  function paint() {
    var link = document.querySelector('.nav-links a[href="/me/"]');
    if (!link) return;                       // only the public pages have this link
    var u = window.SFC_getUser();
    if (u && (u.firstName || u.email)) {
      link.textContent = "Hi, " + (u.firstName || u.email);
      if (!document.getElementById("nav-signout")) {
        var out = document.createElement("a");
        out.href = "#"; out.id = "nav-signout"; out.textContent = "Sign out";
        out.addEventListener("click", function (e) {
          e.preventDefault();
          window.SFC_clearUser();
          if (window.google && google.accounts && google.accounts.id) google.accounts.id.disableAutoSelect();
          location.reload();
        });
        link.parentNode.appendChild(out);
      }
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", paint);
  else paint();
})();
