/* HR dashboard: Google sign-in gate + applicant table + multi-step approval modal. */
(function () {
  document.getElementById("year").textContent = new Date().getFullYear();

  var cfg = window.SFC_CONFIG || {};
  var idToken = null;            // Google ID token (JWT) sent to the backend for verification
  var currentEmail = null;
  var applicants = [];

  var gate = document.getElementById("gate");
  var dash = document.getElementById("dash");
  var gateAlert = document.getElementById("gate-alert");
  var dashAlert = document.getElementById("dash-alert");

  /* ---------- Google Identity Services ---------- */
  function initGoogle() {
    if (!window.google || !cfg.GOOGLE_CLIENT_ID || cfg.GOOGLE_CLIENT_ID.indexOf("PASTE_") === 0) {
      return; // not configured yet
    }
    google.accounts.id.initialize({
      client_id: cfg.GOOGLE_CLIENT_ID,
      callback: onCredential,
      auto_select: true
    });
    // Render the button into the placeholder div.
    var btn = document.querySelector(".g_id_signin");
    if (btn) {
      google.accounts.id.renderButton(btn, { type: "standard", size: "large", theme: "outline", shape: "pill" });
    }
    // No valid saved token but signed in before? Try a silent resume.
    if (!window.SFC_getToken() && window.SFC_getUser && window.SFC_getUser()) google.accounts.id.prompt();
  }

  var currentName = "";
  function adoptToken(token) {
    idToken = token;
    try {
      var payload = JSON.parse(atob(idToken.split(".")[1]));
      currentEmail = payload.email;
      currentName = payload.name || "";
      window.SFC_setUser({ email: currentEmail, name: currentName, firstName: (currentName || "").split(" ")[0] });
    } catch (e) {}
  }
  function onCredential(resp) {
    adoptToken(resp.credential);
    window.SFC_setToken && window.SFC_setToken(idToken);   // remember for ~1h
    enterDashboard();
  }

  // Resume immediately from a saved token so HR isn't re-prompted.
  var savedToken = window.SFC_getToken && window.SFC_getToken();
  if (savedToken) { adoptToken(savedToken); enterDashboard(); }

  // After Google sign-in, verify the email is allowlisted (server-side).
  // HR -> show the dashboard. Anyone else -> bounce back to the normal site,
  // so non-HR never see that a portal exists here.
  function enterDashboard() {
    if (notConfigured()) { showDashboard(); return; }   // demo mode: always show for testing
    gate.querySelector("h1").textContent = "Signing in…";
    api("admin_list").then(function (res) {
      if (res.ok) {
        applicants = res.applicants || [];
        showDashboard(true);
      } else {
        // Not HR — send them to their applicant dashboard instead.
        location.replace("/me/");
      }
    }).catch(function () { location.replace("/me/"); });
  }

  function showDashboard(alreadyLoaded) {
    gate.classList.add("hidden");
    dash.classList.remove("hidden");
    var who = document.getElementById("who");
    who.textContent = currentEmail || "";
    who.classList.remove("hidden");
    document.getElementById("signout").classList.remove("hidden");
    if (alreadyLoaded) { render(); } else { loadApplicants(); }
  }

  document.getElementById("signout").addEventListener("click", function (e) {
    e.preventDefault();
    idToken = null; currentEmail = null;
    window.SFC_clearUser();
    if (window.google) google.accounts.id.disableAutoSelect();
    location.href = "/";
  });

  // GIS loads async; poll briefly until ready.
  var tries = 0;
  var gi = setInterval(function () {
    if (window.google || tries++ > 40) { clearInterval(gi); initGoogle(); }
  }, 100);

  /* ---------- Backend helpers ---------- */
  function api(action, extra) {
    var body = Object.assign({ action: action, idToken: idToken }, extra || {});
    return fetch(cfg.API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body)
    }).then(function (r) { return r.json(); });
  }

  function notConfigured() {
    return !cfg.API_URL || cfg.API_URL.indexOf("PASTE_") === 0;
  }

  /* ---------- Load + render ---------- */
  function loadApplicants() {
    if (notConfigured()) {
      applicants = demoData();
      render();
      flash(dashAlert, "Showing demo data — backend not configured yet (see docs/GOOGLE_SETUP.md).", "warn");
      return;
    }
    setRowsMessage("Loading…");
    api("admin_list").then(function (res) {
      if (!res.ok) throw new Error(res.error || "Failed to load");
      applicants = res.applicants || [];
      render();
    }).catch(function (err) {
      setRowsMessage("Could not load applicants: " + err.message);
    });
  }

  function statusClass(s) {
    return ({ "New": "status-new", "In Review": "status-review", "Interview": "status-interview",
      "Hired": "status-hired", "Rejected": "status-rejected" })[s] || "status-new";
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function setRowsMessage(msg) {
    document.getElementById("rows").innerHTML =
      '<tr><td colspan="7" style="padding:24px;color:var(--muted)">' + esc(msg) + "</td></tr>";
  }

  function render() {
    var filter = document.getElementById("status-filter").value;
    var rows = document.getElementById("rows");
    var list = applicants.filter(function (a) { return !filter || a.status === filter; });
    if (!list.length) { setRowsMessage("No applicants" + (filter ? " with status " + filter : "") + " yet."); return; }

    rows.innerHTML = "";
    list.forEach(function (a) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + esc((a.submittedAt || "").slice(0, 10)) + "</td>" +
        "<td>" + esc((a.firstName || "") + " " + (a.lastName || "")) + "</td>" +
        "<td>" + esc(a.positionTitle) + "</td>" +
        "<td>" + esc(a.department) + "</td>" +
        '<td>' + esc(a.email) + "<br><span style='color:var(--muted)'>" + esc(a.phone) + "</span></td>" +
        '<td><span class="status-pill ' + statusClass(a.status) + '">' + esc(a.status || "New") + "</span></td>" +
        "<td></td>";
      var actions = tr.lastChild;
      addAction(actions, "Interview", "btn-primary", function () { confirmAdvance(a, "Interview"); }, a.status === "Interview" || a.status === "Hired");
      addAction(actions, "Hire", "btn-outline", function () { confirmAdvance(a, "Hired"); }, a.status === "Hired");
      addAction(actions, "Reject", "btn-outline", function () { confirmAdvance(a, "Rejected"); }, a.status === "Rejected");
      rows.appendChild(tr);
    });
  }

  function addAction(cell, label, cls, fn, disabled) {
    var b = document.createElement("button");
    b.className = "btn " + cls;
    b.style.cssText = "padding:5px 12px;font-size:13px;margin-right:6px";
    b.textContent = label;
    if (disabled) b.disabled = true;
    else b.addEventListener("click", fn);
    cell.appendChild(b);
  }

  document.getElementById("status-filter").addEventListener("change", render);
  document.getElementById("refresh").addEventListener("click", loadApplicants);

  /* ---------- Multi-step approval modal ---------- */
  var overlay = document.getElementById("modal-overlay");
  var mStep = document.getElementById("modal-step");
  var mTitle = document.getElementById("modal-title");
  var mBody = document.getElementById("modal-body");
  var mConfirm = document.getElementById("modal-confirm");
  var mCancel = document.getElementById("modal-cancel");

  function openModal(step, title, body, confirmLabel) {
    return new Promise(function (resolve) {
      mStep.textContent = step;
      mTitle.textContent = title;
      mBody.textContent = body;
      mConfirm.textContent = confirmLabel || "Continue";
      overlay.classList.remove("hidden");

      function cleanup(val) {
        overlay.classList.add("hidden");
        mConfirm.removeEventListener("click", onYes);
        mCancel.removeEventListener("click", onNo);
        resolve(val);
      }
      function onYes() { cleanup(true); }
      function onNo() { cleanup(false); }
      mConfirm.addEventListener("click", onYes);
      mCancel.addEventListener("click", onNo);
    });
  }

  // Two-step confirmation before any status change ("multiple approval / warning popups").
  function confirmAdvance(a, newStatus) {
    var name = (a.firstName || "") + " " + (a.lastName || "");
    var verb = { "Interview": "move to FIRST INTERVIEW", "Hired": "mark as HIRED", "Rejected": "REJECT" }[newStatus];

    openModal("Step 1 of 2", "Please confirm", "You're about to " + verb + ' "' + name.trim() + '" for ' + (a.positionTitle || "this role") + ". Continue?", "Yes, continue")
      .then(function (ok1) {
        if (!ok1) return null;
        var warn = newStatus === "Rejected"
          ? "This will notify the team that the candidate is rejected. This action is hard to undo."
          : "This will update the tracker and notify the team. Make sure you've reviewed the application.";
        return openModal("Step 2 of 2 — final", "Are you absolutely sure?", warn + "\n\nClick confirm to " + verb + ".", "Confirm " + newStatus);
      })
      .then(function (ok2) {
        if (ok2) applyStatus(a, newStatus);
      });
  }

  function applyStatus(a, newStatus) {
    // Optimistic UI; revert on failure.
    var prev = a.status;
    a.status = newStatus;
    render();

    if (notConfigured()) {
      flash(dashAlert, "Demo mode: would set " + ((a.firstName||"") ) + " → " + newStatus + ".", "ok");
      return;
    }
    api("admin_update", { id: a.id, status: newStatus, actor: currentEmail }).then(function (res) {
      if (!res.ok) throw new Error(res.error || "Update failed");
      flash(dashAlert, "Updated to " + newStatus + ".", "ok");
    }).catch(function (err) {
      a.status = prev; render();
      flash(dashAlert, "Could not update: " + err.message, "err");
    });
  }

  function flash(el, msg, kind) {
    el.textContent = msg;
    el.className = "alert " + (kind === "ok" ? "alert-ok" : kind === "warn" ? "alert-err" : "alert-err");
    if (kind === "warn") el.style.cssText = "background:#fff7e6;border:1px solid #ffe1a6;color:#7a5a00";
    else el.style.cssText = "";
    el.classList.remove("hidden");
    setTimeout(function () { el.classList.add("hidden"); }, 5000);
  }

  /* ---------- Demo data (used until backend is wired) ---------- */
  function demoData() {
    return [
      { id: "demo1", submittedAt: "2026-06-24T10:00:00Z", firstName: "Maria", lastName: "Santos", positionTitle: "Cashier", department: "Front End", email: "maria@example.com", phone: "555-0100", status: "New" },
      { id: "demo2", submittedAt: "2026-06-23T15:30:00Z", firstName: "Jon", lastName: "Cruz", positionTitle: "Seafood Clerk", department: "Seafood", email: "jon@example.com", phone: "555-0111", status: "In Review" },
      { id: "demo3", submittedAt: "2026-06-22T09:10:00Z", firstName: "Aileen", lastName: "Reyes", positionTitle: "Grocery Stocker", department: "Grocery", email: "aileen@example.com", phone: "555-0122", status: "Interview" }
    ];
  }
})();
