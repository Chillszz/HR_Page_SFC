/* Stage 1 (quick apply). Saves to sessionStorage and moves to the full application. */
(function () {
  document.getElementById("year").textContent = new Date().getFullYear();

  var params = new URLSearchParams(location.search);
  var jobId = params.get("job");
  var positions = window.SFC_POSITIONS || [];
  var select = document.getElementById("position-select");

  // Build the position dropdown.
  positions.forEach(function (p) {
    var o = document.createElement("option");
    o.value = p.id;
    o.textContent = p.title + " — " + p.department;
    select.appendChild(o);
  });
  if (jobId && window.SFC_findPosition(jobId)) {
    select.value = jobId;
    document.getElementById("job-title").textContent = window.SFC_findPosition(jobId).title;
  }
  select.addEventListener("change", function () {
    var p = window.SFC_findPosition(select.value);
    document.getElementById("job-title").textContent = p ? p.title : "a role";
  });

  var form = document.getElementById("apply-form");
  var alertBox = document.getElementById("alert");

  // If they're signed in, prefill the email with their Google account so their
  // application links to their dashboard (and status updates show up there).
  var acct = window.SFC_getUser && window.SFC_getUser();
  if (acct && acct.email) {
    var emailInput = form.querySelector('input[name="email"]');
    if (emailInput && !emailInput.value) {
      emailInput.value = acct.email;
      var hint = document.createElement("div");
      hint.className = "hint";
      hint.textContent = "Using your signed-in email so you can track this application.";
      emailInput.parentNode.appendChild(hint);
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    alertBox.classList.add("hidden");

    if (!form.checkValidity()) {
      alertBox.textContent = "Please fill in all required fields.";
      alertBox.classList.remove("hidden");
      form.reportValidity();
      return;
    }

    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });
    var pos = window.SFC_findPosition(data.positionId);
    data.positionTitle = pos ? pos.title : data.positionId;
    data.department = pos ? pos.department : "";

    // Carry stage-1 data into stage 2.
    sessionStorage.setItem("sfc_apply", JSON.stringify(data));
    location.href = "/application.html";
  });
})();
