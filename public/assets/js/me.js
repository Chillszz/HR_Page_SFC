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
    google.accounts.id.initialize({ client_id: cfg.GOOGLE_CLIENT_ID, callback: onCredential });
    var btn = document.querySelector(".g_id_signin");
    if (btn) google.accounts.id.renderButton(btn, { type: "standard", size: "large", theme: "filled_blue", shape: "pill" });
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
    if (window.google) google.accounts.id.disableAutoSelect();
    location.reload();
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

    // Referral link + count
    var link = location.origin + "/?ref=" + encodeURIComponent(data.referralCode || "");
    document.getElementById("reflink").value = link;
    var n = data.referralCount || 0;
    document.getElementById("refcount").textContent = n > 0
      ? n + (n === 1 ? " friend has" : " friends have") + " applied with your link. Thank you! 🎉"
      : "Share your personal link — when a friend applies through it, we'll know you sent them.";

    // Applications
    var apps = document.getElementById("apps");
    if (!data.applications || !data.applications.length) {
      apps.innerHTML = '<div class="form-wrap" style="margin:0"><p class="sub" style="margin:0 0 14px">You haven\'t applied to a role yet.</p><a class="btn btn-primary" href="/">Browse open roles</a></div>';
      return;
    }
    apps.innerHTML = "";
    data.applications.forEach(function (a) {
      var row = document.createElement("div");
      row.className = "form-wrap";
      row.style.cssText = "margin:0 0 12px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:18px 20px";
      row.innerHTML =
        "<div><div style='font-weight:700'>" + esc(a.positionTitle || "Role") + "</div>" +
        "<div class='sub' style='margin:2px 0 0'>" + esc(a.department || "") +
        " · applied " + esc((a.submittedAt || "").slice(0, 10)) + "</div></div>" +
        '<span class="status-pill ' + statusClass(a.status) + '">' + esc(a.status || "New") + "</span>";
      apps.appendChild(row);
    });
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
