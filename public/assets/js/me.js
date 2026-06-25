/* Applicant dashboard (/me/): optional Google sign-in to track applications
   and get a referral link. HR accounts are redirected to the admin portal. */
(function () {
  document.getElementById("year").textContent = new Date().getFullYear();
  var cfg = window.SFC_CONFIG || {};
  var idToken = null;

  var gate = document.getElementById("gate");
  var dash = document.getElementById("dash");

  /* ---- Google Identity Services ---- */
  function initGoogle() {
    if (!window.google || !cfg.GOOGLE_CLIENT_ID || cfg.GOOGLE_CLIENT_ID.indexOf("PASTE_") === 0) return;
    google.accounts.id.initialize({ client_id: cfg.GOOGLE_CLIENT_ID, callback: onCredential, auto_select: true });
    var btn = document.querySelector(".g_id_signin");
    if (btn) google.accounts.id.renderButton(btn, { type: "standard", size: "large", theme: "filled_blue", shape: "pill" });
    // Returning user on this device? Silently resume the session (no re-click).
    if (window.SFC_getUser && window.SFC_getUser()) google.accounts.id.prompt();
  }
  function onCredential(resp) {
    idToken = resp.credential;
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
        gate.querySelector(".sub").textContent = "Sorry, sign-in failed: " + err.message;
      });
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function statusClass(s) {
    return ({ "New": "status-new", "In Review": "status-review", "Interview": "status-interview",
      "Hired": "status-hired", "Rejected": "status-rejected" })[s] || "status-new";
  }

  function showDash(data) {
    gate.classList.add("hidden");
    dash.classList.remove("hidden");
    document.getElementById("signout").classList.remove("hidden");
    var who = document.getElementById("who");
    who.textContent = data.name || ""; who.classList.remove("hidden");
    document.getElementById("greeting").textContent = "Welcome" + (data.name ? ", " + data.name.split(" ")[0] : "") + " 👋";

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
      card.innerHTML =
        "<div style='display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap'>" +
          "<div>" +
            "<div style='font-size:18px;font-weight:800'>" + esc(a.positionTitle || "Role") + "</div>" +
            "<div class='sub' style='margin:3px 0 0'>" + esc(a.department || "") +
              " · applied " + esc((a.submittedAt || "").slice(0, 10)) + "</div>" +
          "</div>" +
          "<span class='status-pill " + statusClass(a.status) + "' style='font-size:13px;padding:5px 12px'>" + esc(a.status || "New") + "</span>" +
        "</div>" +
        (rid ? "<div style='margin-top:14px'><a class='btn btn-outline' style='padding:7px 14px;font-size:13px' href='/#job=" + encodeURIComponent(rid) + "'>View role details</a></div>" : "");
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
