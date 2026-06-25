/* Stage 2 (full application). Merges stage-1 data and submits everything to the backend. */
(function () {
  document.getElementById("year").textContent = new Date().getFullYear();

  var stage1 = null;
  try { stage1 = JSON.parse(sessionStorage.getItem("sfc_apply")); } catch (e) {}

  // If someone lands here directly, send them back to step 1.
  if (!stage1 || !stage1.firstName) {
    location.replace("/apply.html");
    return;
  }
  document.getElementById("for-line").textContent =
    "Step 2 of 2 — " + stage1.firstName + ", applying for " + (stage1.positionTitle || "a role");

  var form = document.getElementById("app-form");
  var alertBox = document.getElementById("alert");
  var submitBtn = document.getElementById("submit-btn");

  function showAlert(msg, ok) {
    alertBox.textContent = msg;
    alertBox.className = "alert " + (ok ? "alert-ok" : "alert-err");
    alertBox.classList.remove("hidden");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    alertBox.classList.add("hidden");

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Gather stage-2 fields (handle multi-value checkboxes).
    var stage2 = {};
    var fd = new FormData(form);
    fd.forEach(function (v, k) {
      if (stage2[k] !== undefined) {
        stage2[k] = [].concat(stage2[k], v);
      } else {
        stage2[k] = v;
      }
    });

    var payload = Object.assign({ action: "apply" }, stage1, stage2);
    payload.days = Array.isArray(stage2.days) ? stage2.days.join(", ") : (stage2.days || "");
    payload.submittedAt = new Date().toISOString();

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting…";

    if (!window.SFC_CONFIG.API_URL || window.SFC_CONFIG.API_URL.indexOf("PASTE_") === 0) {
      // Backend not wired yet — let the builder test the UI flow.
      console.warn("API_URL not configured. Payload that WOULD be sent:", payload);
      finishSuccess();
      return;
    }

    // Use text/plain to avoid a CORS preflight against Apps Script.
    fetch(window.SFC_CONFIG.API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res && res.ok) { finishSuccess(); }
        else { throw new Error((res && res.error) || "Submit failed"); }
      })
      .catch(function (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit application";
        showAlert("Sorry, something went wrong submitting your application. Please try again. (" + err.message + ")", false);
      });
  });

  function finishSuccess() {
    sessionStorage.removeItem("sfc_apply");
    form.classList.add("hidden");
    document.getElementById("success").classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
})();
