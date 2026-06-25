/* Applicant dashboard (/me/): optional Google sign-in to track applications
   and get a referral link. HR accounts are redirected to the admin portal. */
(function () {
  document.getElementById("year").textContent = new Date().getFullYear();
  var cfg = window.SFC_CONFIG || {};
  var idToken = null;
  var usingSaved = false;

  var gate = document.getElementById("gate");
  var dash = document.getElementById("dash");

  // Sign-in UI states
  function showSigning() {
    var a = document.getElementById("signin-area"); if (a) a.classList.add("hidden");
    document.getElementById("signing").classList.remove("hidden");
    document.getElementById("gate-error").classList.add("hidden");
  }
  function showSignin(errMsg) {
    var a = document.getElementById("signin-area"); if (a) a.classList.remove("hidden");
    document.getElementById("signing").classList.add("hidden");
    var e = document.getElementById("gate-error");
    if (errMsg) { e.textContent = errMsg; e.classList.remove("hidden"); }
    else { e.classList.add("hidden"); }
  }

  // Try the saved token FIRST so returning users never see a sign-in prompt
  // (the token is valid ~1 hour and is re-verified server-side each request).
  var saved = window.SFC_getToken && window.SFC_getToken();
  if (saved) { idToken = saved; usingSaved = true; showSigning(); loadSpace(); }

  /* ---- Google Identity Services ---- */
  function initGoogle() {
    if (!window.google || !cfg.GOOGLE_CLIENT_ID || cfg.GOOGLE_CLIENT_ID.indexOf("PASTE_") === 0) return;
    google.accounts.id.initialize({ client_id: cfg.GOOGLE_CLIENT_ID, callback: onCredential });
    var btn = document.querySelector(".g_id_signin");
    if (btn) google.accounts.id.renderButton(btn, { type: "standard", size: "large", theme: "filled_blue", shape: "pill" });
  }
  function onCredential(resp) {
    idToken = resp.credential;
    usingSaved = false;
    window.SFC_setToken && window.SFC_setToken(idToken);
    showSigning();
    loadSpace();
  }
  var tries = 0;
  var gi = setInterval(function () {
    if (window.google || tries++ > 40) { clearInterval(gi); initGoogle(); }
  }, 100);

  document.getElementById("signout").addEventListener("click", function (e) {
    e.preventDefault();
    idToken = null;
    window.SFC_clearUser();
    window.SFC_clearToken && window.SFC_clearToken();
    if (window.google) google.accounts.id.disableAutoSelect();
    location.href = "/";
  });

  /* ---- Load applicant space ---- */
  function loadSpace() {
    if (!cfg.API_URL || cfg.API_URL.indexOf("PASTE_") === 0) {
      showDash({ name: "there", referralCode: "R-DEMO123", referralCount: 0, applications: [] });
      return;
    }
    fetch(cfg.API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "applicant_space", idToken: idToken })
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.error || "Sign-in failed");
        if (res.isAdmin) { location.replace("/admin/"); return; }   // HR -> portal
        showDash(res);
      })
      .catch(function (err) {
        // A stale saved token just means "sign in again" — show the button, no scary error.
        if (usingSaved) {
          usingSaved = false;
          window.SFC_clearToken && window.SFC_clearToken();
          showSignin();
          return;
        }
        showSignin("Sorry, sign-in didn't work: " + err.message + " Please try again.");
      });
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  // Map internal HR status -> friendly applicant-facing label + pill colour.
  var STATUS = {
    "New":       { label: "Submitted",       cls: "status-new" },
    "In Review": { label: "In Review",       cls: "status-review" },
    "Interview": { label: "First Interview", cls: "status-interview" },
    "Hired":     { label: "Hired 🎉",        cls: "status-hired" },
    "Rejected":  { label: "Not selected",    cls: "status-rejected" }
  };
  function statusInfo(s) { return STATUS[s] || STATUS["New"]; }

  // Progress stepper: Submitted -> In Review -> First Interview -> Hired.
  var STAGE_ORDER = ["New", "In Review", "Interview", "Hired"];
  var STAGE_LABELS = ["Submitted", "In Review", "First Interview", "Hired"];
  function stepperHtml(status) {
    if (status === "Rejected") {
      // Show the journey ended; mark the last reached point in red.
      return '<div class="stages rejected">' + STAGE_LABELS.map(function (lab, i) {
        return '<div class="stage' + (i === 0 ? " current" : "") + '"><span class="dot"></span>' +
          (i === STAGE_LABELS.length - 1 ? "Not selected" : esc(lab)) + "</div>";
      }).join("") + "</div>";
    }
    var idx = STAGE_ORDER.indexOf(status); if (idx < 0) idx = 0;
    return '<div class="stages">' + STAGE_LABELS.map(function (lab, i) {
      var cls = i < idx ? "done" : (i === idx ? "current" : "");
      return '<div class="stage ' + cls + '"><span class="dot"></span>' + esc(lab) + "</div>";
    }).join("") + "</div>";
  }

  function showDash(data) {
    gate.classList.add("hidden");
    dash.classList.remove("hidden");
    document.getElementById("signout").classList.remove("hidden");
    var who = document.getElementById("who");
    who.textContent = data.name || ""; who.classList.remove("hidden");
    document.getElementById("greeting").textContent = "Welcome" + (data.name ? ", " + data.name.split(" ")[0] : "") + " 👋";
    document.getElementById("dash-sub").textContent = "Showing applications linked to " + (data.email || "your account") + ".";

    // Remember signed-in state so the public nav greets them on other pages.
    window.SFC_setUser({ email: data.email, name: data.name, firstName: (data.name || "").split(" ")[0] });

    // Referral link + count
    var link = location.origin + "/?ref=" + encodeURIComponent(data.referralCode || "");
    document.getElementById("reflink").value = link;
    var n = data.referralCount || 0;
    document.getElementById("refcount").textContent = n > 0
      ? n + (n === 1 ? " friend has" : " friends have") + " applied with your link. Thank you! 🎉"
      : "Share your personal link — when a friend applies through it, we'll know you sent them.";

    // Applications
    var apps = document.getElementById("apps");
    var heading = document.getElementById("apps-heading");
    var n = (data.applications || []).length;

    if (!n) {
      heading.textContent = "Your applications";
      apps.innerHTML = '<div class="form-wrap" style="margin:0"><p class="sub" style="margin:0 0 14px">You haven\'t applied to a role yet.</p><a class="btn btn-primary" href="/">Browse open roles</a></div>';
      return;
    }

    heading.textContent = "Your applications (" + n + ")";
    apps.innerHTML = "";
    data.applications.forEach(function (a) {
      var rid = roleIdByTitle(a.positionTitle);
      var card = document.createElement("div");
      card.className = "form-wrap applied-card";
      card.style.cssText = "margin:0 0 14px;padding:18px 20px";
      var info = statusInfo(a.status);
      card.innerHTML =
        "<div style='display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap'>" +
          "<div>" +
            "<div style='font-size:18px;font-weight:800'>" + esc(a.positionTitle || "Role") + "</div>" +
            "<div class='sub' style='margin:3px 0 0'>" + esc(a.department || "") +
              " · applied " + esc((a.submittedAt || "").slice(0, 10)) + "</div>" +
          "</div>" +
          "<span class='status-pill " + info.cls + "' style='font-size:13px;padding:5px 12px'>" + esc(info.label) + "</span>" +
        "</div>" +
        stepperHtml(a.status) +
        (rid ? "<div style='margin-top:16px'><a class='btn btn-outline' style='padding:7px 14px;font-size:13px' href='/#job=" + encodeURIComponent(rid) + "'>View role details</a></div>" : "");
      apps.appendChild(card);
    });

    // Quick way to apply to another role.
    var more = document.createElement("a");
    more.className = "btn btn-primary";
    more.href = "/";
    more.textContent = "Apply to another role";
    apps.appendChild(more);
  }

  // Match an application's role title back to a position id so we can link to it.
  function roleIdByTitle(title) {
    var p = (window.SFC_POSITIONS || []).find(function (x) { return x.title === title; });
    return p ? p.id : null;
  }

  /* ---- Refresh status without a full reload / re-login ---- */
  document.getElementById("refresh-apps").addEventListener("click", function () {
    var btn = this;
    btn.disabled = true; var label = btn.textContent; btn.textContent = "Refreshing…";
    loadSpace();
    setTimeout(function () { btn.disabled = false; btn.textContent = label; }, 1200);
  });

  /* ---- Copy referral link ---- */
  document.getElementById("copylink").addEventListener("click", function () {
    var input = document.getElementById("reflink");
    input.select();
    var done = function () {
      var b = document.getElementById("copylink");
      var t = b.textContent; b.textContent = "Copied! ✓";
      setTimeout(function () { b.textContent = t; }, 1800);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(input.value).then(done, function () { document.execCommand("copy"); done(); });
    else { document.execCommand("copy"); done(); }
  });
})();
