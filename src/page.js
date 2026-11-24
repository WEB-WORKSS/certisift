/* Behaviour for the generated static pages: mobile menu and header shadow. */
(function () {
  const btn = document.querySelector("[data-menu]");
  const menu = document.getElementById("mobile-menu");
  if (btn && menu) {
    btn.addEventListener("click", () => { const open = menu.classList.toggle("open"); btn.setAttribute("aria-expanded", String(open)); btn.setAttribute("aria-label", open ? "Close menu" : "Open menu"); });
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => menu.classList.remove("open")));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") menu.classList.remove("open"); });
  }
  const h = document.querySelector(".site-header");
  const onScroll = () => h && h.classList.toggle("scrolled", scrollY > 8);
  onScroll(); addEventListener("scroll", onScroll, { passive: true });
})();
