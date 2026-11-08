/**
 * Keyboard access to scrollable areas. A code block or panel that scrolls but holds nothing focusable cannot be
 * scrolled from the keyboard (WCAG 2.1.1; axe rule scrollable-region-focusable). After each render this gives such
 * an element tabindex="0", so pages added later are covered without editing them. It adds no role or label: several
 * same-named regions on one page would themselves be an accessibility error (landmark-unique).
 */
(function () {
  var FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';
  var queued = false;

  function scrolls(el) {
    var style = window.getComputedStyle(el);
    var x = (style.overflowX === "auto" || style.overflowX === "scroll") && el.scrollWidth > el.clientWidth;
    var y = (style.overflowY === "auto" || style.overflowY === "scroll") && el.scrollHeight > el.clientHeight;
    return x || y;
  }

  function mark() {
    queued = false;
    var all = document.body ? document.body.getElementsByTagName("*") : [];
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.hasAttribute("tabindex") || el.offsetParent === null || !scrolls(el)) continue;
      if (el.querySelector(FOCUSABLE)) continue;
      el.setAttribute("tabindex", "0");
      el.setAttribute("data-scroll-region", "");
    }
  }

  function queue() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(mark);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", queue);
  else queue();
  window.addEventListener("resize", queue);
  window.addEventListener("hashchange", queue);
  new MutationObserver(queue).observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["hidden", "class", "style", "open"] });
})();
