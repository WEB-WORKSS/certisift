/* Live demo router (demo.html). There are no accounts: the demo always runs on the sample workspace,
   stored in this browser's localStorage. */
(function () {
  const B = CS.business;
  const root = document.getElementById("root");
  const S = CS.store;

  function ensureSample() { if (!S.isSample()) S.enterSample(); }

  function render() {
    const hash = location.hash.replace(/^#\/?/, "");
    if (hash === "try") { ensureSample(); sessionStorage.setItem("certisift:prefill", "s2"); location.replace("#/app/verify"); return; }
    const [path, ...rest] = hash.split("/");
    if (path !== "app") { location.replace("#/app"); return; }
    ensureSample();
    const a = CS.app;
    const [sub, id] = rest;
    const map = {
      "": [a.overview], verify: [a.verify, a.bindVerify], verifications: [a.verifications, a.bindVerifications], v: [() => a.detail(id), (r) => a.bindDetail(r, id)],
      specs: id ? [() => a.specEditor(id), (r) => a.bindSpecEditor(r, id)] : [a.specs], suppliers: id ? [() => a.supplierDetail(decodeURIComponent(id)), a.bindSupplier] : [a.suppliers],
      reports: [a.reports], report: [() => a.report(id)], profile: [a.profile, a.bindProfile],
    };
    const r = map[sub || ""] || map[""];
    const titles = { "": "Overview", verify: "Verify certificate", verifications: "Verifications", v: "Verification", specs: "Specifications", suppliers: "Suppliers", reports: "Reports", report: "Report", profile: "Settings" };
    document.title = `${titles[sub || ""] || "Live demo"} · Live demo | ${B.name}`;
    root.innerHTML = r[0]();
    if (r[1]) r[1](root);
    window.scrollTo(0, 0);
  }
  CS.render = render;

  document.addEventListener("click", (e) => {
    const act = e.target.closest("[data-act]");
    if (act) {
      const k = act.dataset.act;
      if (k === "sample-verify") { sessionStorage.setItem("certisift:prefill", "s2"); location.hash = "#/app/verify"; }
      else if (k === "side") document.getElementById("side").classList.toggle("open");
      else if (k === "csv") CS.app.exportCsv();
      else if (k === "print") window.print();
      else if (k === "new-spec") { const id = "spec-" + S.uid(); S.saveSpec({ id, name: "New specification", product: "", version: "v1", params: [{ key: "moisture", name: "Moisture", aliases: ["moisture"], unit: "%", type: "max", max: 10 }] }); location.hash = "#/app/specs/" + id; }
      return;
    }
    const row = e.target.closest("[data-href]");
    if (row && !e.target.closest("a,button:not([data-href])")) location.hash = row.dataset.href;
    const side = document.getElementById("side");
    if (side && side.classList.contains("open") && !e.target.closest("#side") && !e.target.closest('[data-act="side"]')) side.classList.remove("open");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.matches("tr[data-href]")) location.hash = e.target.dataset.href;
    if (e.key === "Escape") { const s = document.getElementById("side"); if (s) s.classList.remove("open"); }
  });
  window.addEventListener("hashchange", render);
  render();
})();
