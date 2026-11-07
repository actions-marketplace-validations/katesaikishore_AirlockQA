/**
 * Small-screen menu for the console sidebar. On wide screens the sidebar is always visible and the button is hidden
 * (see styles.css); below 861px the sidebar collapses to the brand and a Menu button so the page content is not pushed
 * below a screenful of navigation.
 */
(function () {
  var toggle = document.getElementById("nav-toggle");
  var aside = toggle && toggle.closest("aside");
  if (!toggle || !aside) return;
  var narrow = window.matchMedia("(max-width: 860px)");

  function setOpen(open) {
    if (open) aside.setAttribute("data-open", "true");
    else aside.removeAttribute("data-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.textContent = open ? "Close" : "Menu";
  }

  toggle.addEventListener("click", function () {
    setOpen(aside.getAttribute("data-open") !== "true");
  });

  // Choosing a destination closes the menu so the page shows.
  aside.addEventListener("click", function (event) {
    var link = event.target.closest("a[href]");
    if (link && narrow.matches && link.id !== "nav-toggle") setOpen(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && aside.getAttribute("data-open") === "true") {
      setOpen(false);
      toggle.focus();
    }
  });

  // Leaving the narrow layout resets the state so the desktop sidebar is never left in "closed".
  var onChange = function () { if (!narrow.matches) setOpen(false); };
  if (narrow.addEventListener) narrow.addEventListener("change", onChange);
  else if (narrow.addListener) narrow.addListener(onChange);
})();
