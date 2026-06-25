/* Landing page: render the open positions grid with simple filters. */
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
    .filter(function (v, i, a) { return a.indexOf(v) === i; });
  depts.forEach(function (d) {
    var o = document.createElement("option");
    o.value = d; o.textContent = d;
    deptFilter.appendChild(o);
  });

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function render() {
    var q = (search.value || "").toLowerCase().trim();
    var dept = deptFilter.value;
    var type = typeFilter.value;

    var list = positions.filter(function (p) {
      if (dept && p.department !== dept) return false;
      if (type && p.type !== type) return false;
      if (q) {
        var hay = (p.title + " " + p.department + " " + p.summary).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });

    grid.innerHTML = "";
    empty.classList.toggle("hidden", list.length !== 0);

    list.forEach(function (p) {
      var card = document.createElement("article");
      card.className = "job-card";
      card.innerHTML =
        '<span class="dept">' + esc(p.department) + "</span>" +
        "<h3>" + esc(p.title) + "</h3>" +
        '<div class="meta"><span class="badge">' + esc(p.type) + "</span>" +
        "<span>📍 " + esc(p.location || "") + "</span></div>" +
        "<p>" + esc(p.summary) + "</p>" +
        '<a class="btn btn-primary" href="/apply.html?job=' + encodeURIComponent(p.id) + '">Apply</a>';
      grid.appendChild(card);
    });
  }

  [search, deptFilter, typeFilter].forEach(function (el) {
    el.addEventListener("input", render);
  });
  render();
})();
