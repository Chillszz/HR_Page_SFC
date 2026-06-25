/* Landing page: render open positions as expandable cards with simple filters. */
(function () {
  var grid = document.getElementById("job-grid");
  var empty = document.getElementById("empty");
  var search = document.getElementById("search");
  var deptFilter = document.getElementById("dept-filter");
  var typeFilter = document.getElementById("type-filter");

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

  // matches the type filter ("Full-time" / "Part-time") against combined types.
  function matchesType(p, type) {
    if (!type) return true;
    return (p.type || "").toLowerCase().indexOf(type.toLowerCase()) !== -1;
  }

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

      var metaBits = ['<span class="badge">' + esc(p.type) + "</span>"];
      if (p.location) metaBits.push("<span>📍 " + esc(p.location) + "</span>");
      if (p.pay) metaBits.push("<span>💵 " + esc(p.pay) + "</span>");

      card.innerHTML =
        '<button class="job-head" type="button" aria-expanded="false">' +
          "<span class='job-head-text'>" +
            '<span class="dept">' + esc(p.department) + "</span>" +
            "<span class='job-title'>" + esc(p.title) + "</span>" +
            '<span class="meta">' + metaBits.join("") + "</span>" +
          "</span>" +
          '<span class="chev" aria-hidden="true">⌄</span>' +
        "</button>" +
        '<div class="job-body" hidden>' +
          "<p class='job-summary'>" + esc(p.summary) + "</p>" +
          (p.schedule ? "<p class='job-line'><strong>Schedule:</strong> " + esc(p.schedule) + "</p>" : "") +
          (p.responsibilities && p.responsibilities.length ? "<h4>What you'll do</h4>" + list(p.responsibilities) : "") +
          (p.requirements && p.requirements.length ? "<h4>What we're looking for</h4>" + list(p.requirements) : "") +
          (p.notes ? '<p class="notice warn">' + esc(p.notes) + "</p>" : "") +
          '<a class="btn btn-primary" href="/apply.html?job=' + encodeURIComponent(p.id) + '">Apply for this role</a>' +
        "</div>";

      var head = card.querySelector(".job-head");
      var body = card.querySelector(".job-body");
      head.addEventListener("click", function () {
        var open = head.getAttribute("aria-expanded") === "true";
        head.setAttribute("aria-expanded", String(!open));
        body.hidden = open;
        card.classList.toggle("open", !open);
      });

      grid.appendChild(card);
    });
  }

  [search, deptFilter, typeFilter].forEach(function (el) {
    el.addEventListener("input", render);
  });
  render();

  // If linked with #job=<id>, open that card on load.
  var hash = new URLSearchParams(location.hash.slice(1)).get("job");
  if (hash) {
    var btns = grid.querySelectorAll(".job-head");
    positions.forEach(function (p, i) {
      if (p.id === hash && btns[i]) { btns[i].click(); btns[i].scrollIntoView({ behavior: "smooth", block: "center" }); }
    });
  }
})();
