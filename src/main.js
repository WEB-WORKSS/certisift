/* Router, global actions and SEO metadata */
(function () {
  const B = CS.business;
  const root = document.getElementById("root");
  let lastView = "";

  function setMeta(title, desc) {
    document.title = title;
    const set = (sel, attr, val) => { let el = document.head.querySelector(sel); if (el) el.setAttribute(attr, val); };
    set('meta[name="description"]', "content", desc);
    set('meta[property="og:title"]', "content", title);
    set('meta[property="og:description"]', "content", desc);
  }

  function render() {
    const hash = location.hash.replace(/^#\/?/, "");
    const [path, ...rest] = hash.split("/");
    const signed = !!CS.store.session();
    const a = CS.app;
    let html, bind, view = path || "home";

    if (path === "app") {
      if (!signed) { location.replace("#/signin"); return; }
      const [sub, id, extra] = rest;
      const map = {
        "": [a.overview], verify: [a.verify, a.bindVerify], verifications: [a.verifications, a.bindVerifications], v: [() => a.detail(id), (r) => a.bindDetail(r, id)],
        specs: id ? [() => a.specEditor(id), (r) => a.bindSpecEditor(r, id)] : [a.specs], suppliers: id ? [() => a.supplierDetail(decodeURIComponent(id)), a.bindSupplier] : [a.suppliers],
        reports: [a.reports], report: [() => a.report(id)], profile: [a.profile, a.bindProfile], center: [() => CS.center.center(id), CS.center.bindCenter],
      };
      const r = map[sub || ""] || map[""];
      html = r[0](); bind = r[1];
      const titles = { "": "Overview", verify: "Verify certificate", verifications: "Verifications", v: "Verification", specs: "Specifications", suppliers: "Suppliers", reports: "Reports", report: "Report", profile: "Profile", center: "Activate Center" };
      setMeta(`${titles[sub || ""] || "Workspace"} · ${B.name}`, B.shortPitch);
      view = "app/" + (sub || "");
    } else if (path === "signin" || path === "signup") {
      if (signed) { location.replace("#/app"); return; }
      html = CS.site[path](); bind = CS.site.bindAuth;
      setMeta(`${path === "signin" ? "Sign in" : "Get started"} · ${B.name}`, B.shortPitch);
    } else if (path === "privacy" || path === "terms") {
      html = CS.site.legal(path);
      setMeta(`${path === "privacy" ? "Privacy" : "Terms"} · ${B.name}`, B.shortPitch);
    } else {
      view = "home";
      if (lastView !== "home" || path !== "s") { html = CS.site.home(); bind = CS.site.bindHome; }
      setMeta(`${B.name} — Supplier CoA verification for food manufacturers`, B.shortPitch);
    }

    if (html !== undefined) {
      root.innerHTML = html;
      if (bind) bind(root);
    }
    if (path === "s" && rest[0]) {
      const el = document.getElementById(rest[0]);
      if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: lastView === "home" && html === undefined ? "smooth" : "auto" }));
      const mm = document.getElementById("mobile-menu"); if (mm) mm.classList.remove("open");
    } else if (html !== undefined) window.scrollTo(0, 0);
    lastView = view;
  }
  CS.render = render;

  document.addEventListener("click", (e) => {
    const act = e.target.closest("[data-act]");
    if (act) {
      const k = act.dataset.act;
      if (k === "sample") { CS.store.enterSample(); location.hash = "#/app"; }
      else if (k === "sample-verify") { CS.store.enterSample(); sessionStorage.setItem("certisift:prefill", "s2"); location.hash = "#/app/verify"; }
      else if (k === "toggle-menu") { const m = document.getElementById("mobile-menu"); const open = m.classList.toggle("open"); act.setAttribute("aria-expanded", open); }
      else if (k === "side") document.getElementById("side").classList.toggle("open");
      else if (k === "csv") CS.app.exportCsv();
      else if (k === "print") window.print();
      else if (k === "signout") { CS.store.signOut(); location.hash = "#/"; }
      else if (k === "new-spec") { const id = "spec-" + CS.store.uid(); CS.store.saveSpec({ id, name: "New specification", product: "", version: "v1", params: [{ key: "moisture", name: "Moisture", aliases: ["moisture"], unit: "%", type: "max", max: 10 }] }); location.hash = "#/app/specs/" + id; }
      return;
    }
    const row = e.target.closest("[data-href]");
    if (row && !e.target.closest("a,button:not([data-href])")) location.hash = row.dataset.href;
    const side = document.getElementById("side");
    if (side && side.classList.contains("open") && !e.target.closest("#side") && !e.target.closest('[data-act="side"]')) side.classList.remove("open");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.matches("tr[data-href]")) location.hash = e.target.dataset.href;
    if (e.key === "Escape") { const s = document.getElementById("side"); if (s) s.classList.remove("open"); const m = document.getElementById("mobile-menu"); if (m) m.classList.remove("open"); }
  });
  window.addEventListener("scroll", () => { const h = document.querySelector(".site-header"); if (h) h.classList.toggle("scrolled", scrollY > 8); }, { passive: true });
  window.addEventListener("hashchange", render);

  // Structured data from the canonical record (URL only when the domain is verified)
  const ld = { "@context": "https://schema.org", "@type": "Organization", name: B.name, slogan: B.tagline, description: B.shortPitch };
  if (B.domain.value) ld.url = `https://www.${B.domain.value}`;
  if (B.linkedin.value) ld.sameAs = [`https://${B.linkedin.value}`];
  const s = document.createElement("script"); s.type = "application/ld+json"; s.textContent = JSON.stringify(ld); document.head.appendChild(s);

  render();
})();
