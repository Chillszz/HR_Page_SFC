/* Landing page: render open positions as cards; click a card to open a
   large details popup (the grid stays put — no layout shifting). */
(function () {
  var grid = document.getElementById("job-grid");
  var empty = document.getElementById("empty");
  var search = document.getElementById("search");
  var deptFilter = document.getElementById("dept-filter");
  var typeFilter = document.getElementById("type-filter");

  var modal = document.getElementById("job-modal");
  var modalContent = document.getElementById("job-modal-content");
  var modalClose = document.getElementById("job-modal-close");

  document.getElementById("year").textContent = new Date().getFullYear();
  if (window.SFC_CONFIG && window.SFC_CONFIG.tagline) {
    document.getElementById("tagline").textContent = window.SFC_CONFIG.tagline;
  }

  var positions = window.SFC_POSITIONS || [];

  // Populate department filter from data.
  var depts = positions.map(function (p) { return p.department; })
    .filter(function (v, i, a) { return a.indexOf(v) === i; })
    .sort();
  depts.forEach(function (d) {
    var o = document.createElement("option");
    o.value = d; o.textContent = d;
    deptFilter.appendChild(o);
  });

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function list(items) {
    if (!items || !items.length) return "";
    return "<ul>" + items.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul>";
  }
  function metaRow(p) {
    var bits = ['<span class="badge">' + esc(p.type) + "</span>"];
    if (p.location) bits.push("<span>📍 " + esc(p.location) + "</span>");
    if (p.pay) bits.push("<span>💵 " + esc(p.pay) + "</span>");
    return '<span class="meta">' + bits.join("") + "</span>";
  }
  function matchesType(p, type) {
    if (!type) return true;
    return (p.type || "").toLowerCase().indexOf(type.toLowerCase()) !== -1;
  }

  /* ---------- Details popup ---------- */
  function openModal(p) {
    modalContent.innerHTML =
      '<span class="dept">' + esc(p.department) + "</span>" +
      "<h2 class='modal-title'>" + esc(p.title) + "</h2>" +
      metaRow(p) +
      "<p class='job-summary'>" + esc(p.summary) + "</p>" +
      (p.schedule ? "<p class='job-line'><strong>Schedule:</strong> " + esc(p.schedule) + "</p>" : "") +
      (p.responsibilities && p.responsibilities.length ? "<h4>What you'll do</h4>" + list(p.responsibilities) : "") +
      (p.requirements && p.requirements.length ? "<h4>What we're looking for</h4>" + list(p.requirements) : "") +
      (p.notes ? '<p class="notice warn">' + esc(p.notes) + "</p>" : "") +
      '<div class="modal-cta"><a class="btn btn-primary btn-block" href="/apply.html?job=' +
        encodeURIComponent(p.id) + '">Apply for this role</a></div>';
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";   // lock background scroll
    modalClose.focus();
  }
  function closeModal() {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  }
  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
  });

  /* ---------- Render grid ---------- */
  function render() {
    var q = (search.value || "").toLowerCase().trim();
    var dept = deptFilter.value;
    var type = typeFilter.value;

    var filtered = positions.filter(function (p) {
      if (dept && p.department !== dept) return false;
      if (!matchesType(p, type)) return false;
      if (q) {
        var hay = (p.title + " " + p.department + " " + p.summary + " " +
          (p.responsibilities || []).join(" ")).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });

    grid.innerHTML = "";
    empty.classList.toggle("hidden", filtered.length !== 0);

    filtered.forEach(function (p) {
      var card = document.createElement("article");
      card.className = "job-card";
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.innerHTML =
        '<span class="dept">' + esc(p.department) + "</span>" +
        "<h3 class='job-title'>" + esc(p.title) + "</h3>" +
        metaRow(p) +
        "<p class='job-snippet'>" + esc(p.summary) + "</p>" +
        '<span class="job-more">View details &amp; apply →</span>';
      card.addEventListener("click", function () { openModal(p); });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal(p); }
      });
      grid.appendChild(card);
    });
  }

  [search, deptFilter, typeFilter].forEach(function (el) {
    el.addEventListener("input", render);
  });
  render();

  // Deep link: /#job=<id> opens that role's popup.
  var hash = new URLSearchParams(location.hash.slice(1)).get("job");
  if (hash) {
    var p = window.SFC_findPosition(hash);
    if (p) openModal(p);
  }
})();
