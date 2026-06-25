/* Hidden HR portal entrance.
   No visible link exists on the public site. To open the portal, press &
   hold the logo for ~1 second (works with mouse and touch). A normal short
   click just navigates home like any logo. Access is still gated by Google
   sign-in + the email allowlist on the portal page itself. */
(function () {
  var cfg = window.SFC_CONFIG || {};
  var path = cfg.PORTAL_PATH || "/admin/";
  var brand = document.querySelector(".brand");
  if (!brand) return;

  var HOLD_MS = 900;
  var timer = null;
  var fired = false;

  function start() {
    fired = false;
    timer = setTimeout(function () { fired = true; location.href = path; }, HOLD_MS);
  }
  function cancel() {
    if (timer) { clearTimeout(timer); timer = null; }
  }

  brand.addEventListener("mousedown", start);
  brand.addEventListener("touchstart", start, { passive: true });
  ["mouseup", "mouseleave", "touchend", "touchmove", "touchcancel"].forEach(function (ev) {
    brand.addEventListener(ev, cancel);
  });

  // Swallow the normal "go home" click if the long-press already fired.
  brand.addEventListener("click", function (e) {
    if (fired) { e.preventDefault(); fired = false; }
  });
})();
