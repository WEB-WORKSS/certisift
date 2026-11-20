/* Product app: dashboard, verification, specifications, suppliers, reports, profile */
window.CS = window.CS || {};

(function () {
  const { esc, logo, icon, verdictLabel, statusLabel, decisionLabel, fmtDate, toast, download, sparkline } = CS.ui;
  const E = CS.engine;

  const NAV = [
    ["", "Overview", "home"],
    ["verify", "Verify certificate", "scan"],
    ["verifications", "Verifications", "list"],
    ["specs", "Specifications", "spec"],
    ["suppliers", "Suppliers", "truck"],
    ["reports", "Reports", "report"],
  ];

  function shell(active, title, body, actions = "") {
    const u = CS.store.user();
    const ws = CS.store.ws();
    const link = ([p, l, ic]) => `<a href="#/app${p ? "/" + p : ""}" class="${active === p ? "active" : ""}">${icon(ic)}${l}</a>`;
    return `<div class="app">
      <aside class="side" id="side">
        ${logo("#/", true)}
        <nav aria-label="Workspace">${NAV.map(link).join("")}
          <div class="grp">Company</div>
          ${link(["center", "Activate Center", "rocket"])}
          ${link(["profile", "Profile", "user"])}
          <a href="#/">${icon("globe")}Public website</a>
        </nav>
        <div class="foot"><b>${esc(ws.name)}</b>${esc(u.email === CS.store.SAMPLE_EMAIL ? "Sample data · fictional suppliers" : u.email)}</div>
      </aside>
      <div class="main">
        <div class="topbar">
          <button class="app-toggle" data-act="side" aria-label="Open navigation">${icon("menu")}</button>
          <h1>${title}</h1>
          ${ws.sample ? '<span class="badge sample">Sample workspace</span>' : ""}
          <div class="right">${actions}</div>
        </div>
        <div class="page">${body}</div>
      </div>
    </div>`;
  }

  const verdictBadge = (v) => `<span class="badge ${v}">${verdictLabel[v]}</span>`;
  const decisionText = (d) => (d ? `<span class="pill">${decisionLabel[d.status]}</span>` : '<span class="muted" style="font-size:13px">Awaiting decision</span>');
  const sorted = (list) => list.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  function vRow(v) {
    return `<tr class="click" data-href="#/app/v/${v.id}">
      <td>${verdictBadge(v.verdict)}</td>
      <td><b style="font-weight:500">${esc(v.supplier || "Unknown supplier")}</b><div class="muted" style="font-size:13px">${esc(v.specName)}</div></td>
      <td class="num">${esc(v.lot || "N/A")}</td>
      <td class="num">${v.summary.fail ? `<span style="color:var(--fail)">${v.summary.fail} fail</span> ` : ""}${v.summary.warn ? `<span style="color:var(--hold)">${v.summary.warn} review</span> ` : ""}${v.summary.missing ? `${v.summary.missing} missing` : ""}${!v.summary.fail && !v.summary.warn && !v.summary.missing ? `<span style="color:var(--pass)">all pass</span>` : ""}</td>
      <td>${decisionText(v.decision)}</td>
      <td class="num">${fmtDate(v.createdAt)}</td>
    </tr>`;
  }
  const vTable = (list) => list.length
    ? `<div class="table-wrap"><table class="t"><thead><tr><th>Verdict</th><th>Supplier / spec</th><th>Lot</th><th>Findings</th><th>Decision</th><th>Checked</th></tr></thead><tbody>${list.map(vRow).join("")}</tbody></table></div>`
    : `<div class="empty"><h3>No certificates checked yet</h3><p>Verify your first certificate, or try one of the samples.</p><a class="btn btn-primary" href="#/app/verify">Verify a certificate</a></div>`;

  /* ---------------- Overview ---------------- */
  function overview() {
    const ws = CS.store.ws();
    const list = ws.verifications;
    const n = list.length;
    const acc = list.filter((v) => v.verdict === "accept").length;
    const awaiting = list.filter((v) => !v.decision);
    const suppliers = new Set(list.map((v) => v.supplier).filter(Boolean));
    const issues = {};
    list.forEach((v) => v.checks.filter((c) => c.status !== "pass").forEach((c) => { const k = c.kind === "param" ? `${c.label} (${statusLabel[c.status].toLowerCase()})` : c.label; issues[k] = (issues[k] || 0) + 1; }));
    const top = Object.entries(issues).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const max = top.length ? top[0][1] : 1;
    const body = `
      <div class="grid g4">
        <div class="card kpi"><div class="l">Certificates checked</div><div class="v">${n}</div><div class="d">${ws.specs.length} specifications</div></div>
        <div class="card kpi"><div class="l">First-pass accept rate</div><div class="v">${n ? Math.round((acc / n) * 100) : 0}%</div><div class="d">${acc} of ${n} with no findings</div></div>
        <div class="card kpi"><div class="l">Awaiting decision</div><div class="v">${awaiting.length}</div><div class="d">${awaiting.filter((v) => v.verdict === "reject").length} recommended reject</div></div>
        <div class="card kpi"><div class="l">Suppliers tracked</div><div class="v">${suppliers.size}</div><div class="d">from verified certificates</div></div>
      </div>
      <div class="grid g21" style="margin-top:18px">
        <div class="card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><div><h2>Recent verifications</h2><p class="sub" style="margin:0">Latest certificates across all suppliers</p></div><a class="btn btn-ghost btn-sm" href="#/app/verifications">View all</a></div>${vTable(sorted(list).slice(0, 7))}</div>
        <div class="grid" style="align-content:start">
          <div class="card" style="background:var(--ink);color:#e9ece6;border-color:var(--ink)"><h2 style="color:#fff">Check a certificate</h2><p class="sub" style="color:#b9c3be">Paste or upload a CoA and pick the specification.</p><a class="btn btn-teal" href="#/app/verify" style="background:var(--mark);color:var(--ink)">Verify certificate</a></div>
          <div class="card"><h2>Most frequent findings</h2><p class="sub">Across all verifications</p>
            ${top.length ? top.map(([k, c]) => `<div style="margin:10px 0"><div style="display:flex;justify-content:space-between;font-size:14px"><span>${esc(k)}</span><span class="mono">${c}</span></div><div class="bar"><i style="width:${(c / max) * 100}%"></i></div></div>`).join("") : '<p class="muted">No findings yet.</p>'}
          </div>
        </div>
      </div>`;
    return shell("", "Overview", body, `<a class="btn btn-primary btn-sm" href="#/app/verify">Verify certificate</a>`);
  }

  /* ---------------- Verify ---------------- */
  function verify() {
    const ws = CS.store.ws();
    const body = `
      <div class="grid g21">
        <div class="card">
          <h2>Certificate</h2><p class="sub">Paste the certificate text, or upload a .txt or .csv file. Scanned PDFs will be supported through document AI in the hosted platform.</p>
          <div class="drop" id="drop">
            <p style="margin:0 0 10px"><b style="font-weight:500">Drop a .txt or .csv file here</b> <span class="muted">or</span></p>
            <label class="btn btn-ghost btn-sm">Choose file<input type="file" id="file" accept=".txt,.csv,.tsv,text/plain,text/csv" class="sr-only"></label>
            <div id="file-name" class="source" style="margin-top:8px"></div>
          </div>
          <label class="f" style="margin-top:16px">Certificate text<textarea class="code" id="coa" spellcheck="false" placeholder="CERTIFICATE OF ANALYSIS&#10;Supplier: …&#10;Lot No: …&#10;&#10;Moisture   13.6   %&#10;…"></textarea></label>
          <div class="row2 form" style="margin-top:16px;align-items:end">
            <label class="f">Specification<select id="spec">${ws.specs.map((s) => `<option value="${s.id}">${esc(s.name)} (${esc(s.version)})</option>`).join("")}</select></label>
            <button class="btn btn-primary" id="run">Run verification</button>
          </div>
          <div id="verify-msg" style="margin-top:12px" aria-live="polite"></div>
        </div>
        <div class="card">
          <h2>Sample certificates</h2><p class="sub">Fictional suppliers covering the main outcomes.</p>
          <div class="samples">${CS.sampleDocs.map((s) => `<button class="sample-btn" data-sample="${s.id}">${esc(s.title)}<small>${esc(s.hint)}</small></button>`).join("")}</div>
          <p class="muted" style="font-size:13px;margin-top:14px">Outlier and copied-value checks use the supplier's earlier lots, so they appear in the sample workspace, which already holds history.</p>
        </div>
      </div>`;
    return shell("verify", "Verify certificate", body);
  }

  function bindVerify(root) {
    const ta = root.querySelector("#coa"), sel = root.querySelector("#spec"), msg = root.querySelector("#verify-msg");
    let source = "paste", fileName = null;
    const pre = sessionStorage.getItem("certisift:prefill");
    if (pre) { sessionStorage.removeItem("certisift:prefill"); const s = CS.sampleDocs.find((x) => x.id === pre); if (s) { ta.value = s.text; sel.value = s.specId; source = "sample"; } }
    const readFile = (f) => {
      if (!f) return;
      if (!/\.(txt|csv|tsv)$/i.test(f.name) && !/^text\//.test(f.type)) { msg.innerHTML = `<div class="form-msg err">${esc(f.name)} isn't a text file. Upload .txt or .csv, or paste the certificate text.</div>`; return; }
      const r = new FileReader();
      r.onload = () => { ta.value = r.result; source = "upload"; fileName = f.name; root.querySelector("#file-name").textContent = f.name; msg.innerHTML = ""; };
      r.readAsText(f);
    };
    root.querySelector("#file").addEventListener("change", (e) => readFile(e.target.files[0]));
    const drop = root.querySelector("#drop");
    ["dragenter", "dragover"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("over"); }));
    ["dragleave", "drop"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove("over"); }));
    drop.addEventListener("drop", (e) => readFile(e.dataTransfer.files[0]));
    ta.addEventListener("input", () => { if (source !== "upload") source = "paste"; });
    root.querySelectorAll("[data-sample]").forEach((b) => b.addEventListener("click", () => {
      const s = CS.sampleDocs.find((x) => x.id === b.dataset.sample);
      ta.value = s.text; sel.value = s.specId; source = "sample"; fileName = null; msg.innerHTML = "";
      ta.scrollIntoView({ behavior: "smooth", block: "center" });
    }));
    root.querySelector("#run").addEventListener("click", () => {
      const text = ta.value.trim();
      if (!text) { msg.innerHTML = `<div class="form-msg err">Paste a certificate or choose a file first.</div>`; return; }
      const ws = CS.store.ws();
      const spec = ws.specs.find((s) => s.id === sel.value);
      if (!spec) { msg.innerHTML = `<div class="form-msg err">Choose a specification.</div>`; return; }
      const r = E.verify(text, spec, ws.verifications);
      if (r.summary.extracted === 0) { msg.innerHTML = `<div class="form-msg err">No results matching “${esc(spec.name)}” were found. Check that the right specification is selected, or add your supplier's parameter names as aliases.</div>`; return; }
      const rec = CS.store.addVerification({ specId: spec.id, specName: spec.name, text, source, fileName, decision: null, ...r });
      location.hash = "#/app/v/" + rec.id;
    });
  }

  /* ---------------- Verification detail ---------------- */
  function detail(id) {
    const ws = CS.store.ws();
    const v = ws.verifications.find((x) => x.id === id);
    if (!v) return shell("verifications", "Not found", `<div class="card empty"><h3>Verification not found</h3><a class="btn btn-ghost" href="#/app/verifications">Back to verifications</a></div>`);
    const params = v.checks.filter((c) => c.kind === "param");
    const docs = v.checks.filter((c) => c.kind === "document");
    const anomalies = v.checks.filter((c) => c.kind === "anomaly");
    const head = { accept: "All checks passed", hold: "Needs a reviewer's decision", reject: "Do not release without investigation" }[v.verdict];
    const sub = `${v.summary.extracted} of ${v.summary.params} specified tests found · ${v.summary.fail} out of spec · ${v.summary.warn} to review · ${v.summary.missing} missing`;
    const docList = docs.map((c) => `<div class="viz-row" style="font-size:14px;padding:7px 0"><span><i class="dot ${c.status}"></i>${esc(c.label)}</span><span class="${c.status === "pass" ? "muted" : ""}" style="text-align:right">${esc(c.detail)}</span></div>`).join("");
    const body = `
      <div class="verdict ${v.verdict}"><div class="big">${verdictLabel[v.verdict].toUpperCase().split(" ")[0]}</div><div><h2>${head}</h2><p>${sub}</p></div></div>
      <div class="grid g4" style="margin-top:18px">
        <div class="card kpi"><div class="l">Supplier</div><div style="font-weight:500;margin-top:8px">${esc(v.supplier || "Not found")}</div>${v.supplier ? `<a class="d" href="#/app/suppliers/${encodeURIComponent(v.supplier)}">Supplier history →</a>` : ""}</div>
        <div class="card kpi"><div class="l">Product · spec</div><div style="font-weight:500;margin-top:8px">${esc(v.product || "N/A")}</div><div class="d">${esc(v.specName)}</div></div>
        <div class="card kpi"><div class="l">Lot</div><div class="mono" style="margin-top:8px">${esc(v.lot || "N/A")}</div><div class="d">Issued ${fmtDate(v.issued)}</div></div>
        <div class="card kpi"><div class="l">Shelf life</div><div style="margin-top:8px">${fmtDate(v.exp)}</div><div class="d">Made ${fmtDate(v.mfg)}</div></div>
      </div>
      <div class="grid g21" style="margin-top:18px">
        <div class="card">
          <h2>Results against specification</h2><p class="sub">Each value as extracted, compared with ${esc(v.specName)}.</p>
          <div class="table-wrap"><table class="t"><thead><tr><th>Status</th><th>Parameter</th><th>Result</th><th>Limit</th><th>Finding</th></tr></thead><tbody>
            ${params.map((c) => `<tr><td><span class="badge ${c.status}">${statusLabel[c.status]}</span></td><td>${esc(c.label)}${c.method ? `<div class="source">${esc(c.method)}</div>` : ""}</td><td class="num">${c.value != null ? esc(c.value) + " " + esc(c.unit || "") : "N/A"}</td><td class="num">${esc(c.limit)}</td><td style="font-size:14px">${esc(c.detail)}${c.source ? `<div class="source" title="Source line">“${esc(c.source.length > 60 ? c.source.slice(0, 60) + "…" : c.source)}”</div>` : ""}</td></tr>`).join("")}
          </tbody></table></div>
          ${v.extras.length ? `<p class="muted" style="font-size:13.5px;margin:14px 0 0">Also on the certificate, not in this specification: ${v.extras.map(esc).join(", ")}.</p>` : ""}
        </div>
        <div class="grid" style="align-content:start">
          <div class="card no-print" id="decision">
            <h2>Release decision</h2>
            ${v.decision ? `<p style="margin:6px 0">${decisionText(v.decision)} <span class="muted" style="font-size:13px">on ${fmtDate(v.decision.at)}</span></p>${v.decision.note ? `<p class="copybox" style="margin:8px 0">${esc(v.decision.note)}</p>` : ""}<button class="btn btn-link" data-act="redecide">Change decision</button>` : `
            <p class="sub">Recommended: <b style="font-weight:500">${verdictLabel[v.verdict]}</b></p>
            <div class="seg" id="dec-seg" role="radiogroup">${["released", "on-hold", "rejected"].map((s) => `<button type="button" data-v="${s}" class="${(v.verdict === "accept" ? "released" : v.verdict === "reject" ? "rejected" : "on-hold") === s ? "on" : ""}">${decisionLabel[s]}</button>`).join("")}</div>
            <label class="f" style="margin-top:12px">Note<textarea id="dec-note" style="min-height:80px" placeholder="e.g. Held pending Salmonella result from supplier lab."></textarea></label>
            <button class="btn btn-primary btn-sm" style="margin-top:10px" data-act="decide">Record decision</button>`}
          </div>
          ${anomalies.length ? `<div class="card" style="border-color:#ead29c"><h2>Anomalies</h2><p class="sub">Compared with this supplier's history</p>${anomalies.map((c) => `<div style="padding:8px 0;border-top:1px dashed var(--rule)"><b style="font-weight:500"><i class="dot warn"></i>${esc(c.label)}</b><div style="font-size:14px" class="muted">${esc(c.detail)}</div></div>`).join("")}</div>` : ""}
          <div class="card"><h2>Document checks</h2>${docList}</div>
        </div>
      </div>
      <details class="card" style="margin-top:18px"><summary style="cursor:pointer;font-weight:500">Source certificate ${v.fileName ? `<span class="source">${esc(v.fileName)}</span>` : ""}</summary><pre class="mono" style="font-size:12.5px;white-space:pre-wrap;margin:14px 0 0">${esc(v.text)}</pre></details>`;
    return shell("verifications", "Verification", body, `<a class="btn btn-ghost btn-sm" href="#/app/report/${v.id}">Report</a><button class="btn btn-ghost btn-sm" data-act="delete-v" data-id="${v.id}">Delete</button>`);
  }

  function bindDetail(root, id) {
    const seg = root.querySelector("#dec-seg");
    if (seg) seg.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => { seg.querySelectorAll("button").forEach((x) => x.classList.remove("on")); b.classList.add("on"); }));
    const dec = root.querySelector('[data-act="decide"]');
    if (dec) dec.addEventListener("click", () => {
      const status = seg.querySelector(".on").dataset.v;
      CS.store.updateVerification(id, { decision: { status, note: root.querySelector("#dec-note").value.trim(), at: new Date().toISOString() } });
      toast("Decision recorded"); CS.render();
    });
    const re = root.querySelector('[data-act="redecide"]');
    if (re) re.addEventListener("click", () => { CS.store.updateVerification(id, { decision: null }); CS.render(); });
    const del = root.querySelector('[data-act="delete-v"]');
    if (del) del.addEventListener("click", () => { if (confirm("Delete this verification from the workspace?")) { CS.store.deleteVerification(id); toast("Verification deleted"); location.hash = "#/app/verifications"; } });
  }

  /* ---------------- Verifications list ---------------- */
  function verifications() {
    const ws = CS.store.ws();
    const suppliers = [...new Set(ws.verifications.map((v) => v.supplier).filter(Boolean))].sort();
    const body = `
      <div class="toolbar">
        <input type="search" id="q" placeholder="Search supplier, lot, product…" aria-label="Search">
        <select id="fv" aria-label="Verdict"><option value="">All verdicts</option><option value="accept">Accept</option><option value="hold">Hold</option><option value="reject">Reject</option></select>
        <select id="fs" aria-label="Supplier"><option value="">All suppliers</option>${suppliers.map((s) => `<option>${esc(s)}</option>`).join("")}</select>
        <select id="fd" aria-label="Decision"><option value="">Any decision</option><option value="none">Awaiting decision</option><option value="released">Released</option><option value="on-hold">On hold</option><option value="rejected">Rejected</option></select>
      </div>
      <div class="card" id="vlist">${vTable(sorted(ws.verifications))}</div>`;
    return shell("verifications", "Verifications", body, `<button class="btn btn-ghost btn-sm" data-act="csv">Export CSV</button><a class="btn btn-primary btn-sm" href="#/app/verify">Verify certificate</a>`);
  }
  function bindVerifications(root) {
    const apply = () => {
      const q = root.querySelector("#q").value.toLowerCase(), fv = root.querySelector("#fv").value, fs = root.querySelector("#fs").value, fd = root.querySelector("#fd").value;
      const list = sorted(CS.store.ws().verifications).filter((v) =>
        (!q || [v.supplier, v.lot, v.product, v.specName].join(" ").toLowerCase().includes(q)) && (!fv || v.verdict === fv) && (!fs || v.supplier === fs) &&
        (!fd || (fd === "none" ? !v.decision : v.decision && v.decision.status === fd)));
      root.querySelector("#vlist").innerHTML = vTable(list);
    };
    root.querySelectorAll(".toolbar input, .toolbar select").forEach((el) => el.addEventListener("input", apply));
  }

  function exportCsv() {
    const ws = CS.store.ws();
    const q = (s) => `"${String(s ?? "").replace(/"/g, '""')}"`;
    const rows = [["checked_at", "supplier", "product", "lot", "specification", "verdict", "decision", "decision_note", "fails", "reviews", "missing", "findings"].join(",")];
    sorted(ws.verifications).forEach((v) => rows.push([v.createdAt, v.supplier, v.product, v.lot, v.specName, v.verdict, v.decision ? v.decision.status : "", v.decision ? v.decision.note : "", v.summary.fail, v.summary.warn, v.summary.missing, v.checks.filter((c) => c.status !== "pass").map((c) => `${c.label}: ${c.detail}`).join(" | ")].map(q).join(",")));
    download(`certisift-verifications-${new Date().toISOString().slice(0, 10)}.csv`, rows.join("\n"), "text/csv");
  }

  /* ---------------- Specifications ---------------- */
  function specs() {
    const ws = CS.store.ws();
    const body = `<div class="grid g3">${ws.specs.map((s) => {
      const used = ws.verifications.filter((v) => v.specId === s.id).length;
      return `<a class="card" href="#/app/specs/${s.id}" style="text-decoration:none;color:inherit"><span class="pill">${esc(s.version)}</span><h2 style="margin-top:12px;font:400 26px/1.1 var(--serif)">${esc(s.name)}</h2><p class="sub" style="margin-top:6px">${esc(s.product)} · ${s.params.length} parameters · used ${used}×</p><div class="source">${s.params.slice(0, 5).map((p) => esc(p.name)).join(" · ")}${s.params.length > 5 ? " …" : ""}</div></a>`;
    }).join("")}</div>`;
    return shell("specs", "Specifications", body, `<button class="btn btn-primary btn-sm" data-act="new-spec">New specification</button>`);
  }

  function specEditor(id) {
    const ws = CS.store.ws();
    const s = ws.specs.find((x) => x.id === id);
    if (!s) return shell("specs", "Not found", `<div class="card empty"><h3>Specification not found</h3><a class="btn btn-ghost" href="#/app/specs">Back</a></div>`);
    const row = (p) => `<tr data-key="${esc(p.key)}">
      <td><input name="name" value="${esc(p.name)}" aria-label="Parameter name"></td>
      <td><input name="aliases" value="${esc(p.aliases.join(", "))}" aria-label="Aliases"></td>
      <td style="width:110px"><input name="unit" value="${esc(p.unit)}" aria-label="Unit"></td>
      <td style="width:130px"><select name="type" aria-label="Limit type">${[["max", "Maximum"], ["min", "Minimum"], ["range", "Range"], ["qual", "Absent"]].map(([v, l]) => `<option value="${v}" ${p.type === v ? "selected" : ""}>${l}</option>`).join("")}</select></td>
      <td style="width:100px"><input name="min" type="number" step="any" value="${p.min ?? ""}" aria-label="Minimum" ${p.type === "max" || p.type === "qual" ? "disabled" : ""}></td>
      <td style="width:130px"><input name="max" type="number" step="any" value="${p.max ?? ""}" aria-label="Maximum" ${p.type === "min" || p.type === "qual" ? "disabled" : ""}></td>
      <td style="width:44px"><button class="btn-link" data-act="rm-row" aria-label="Remove parameter" style="color:var(--fail)">✕</button></td>
    </tr>`;
    const body = `
      <div class="card">
        <div class="form" style="grid-template-columns:2fr 1.4fr .6fr;display:grid;gap:16px">
          <label class="f">Name<input id="s-name" value="${esc(s.name)}"></label>
          <label class="f">Product<input id="s-product" value="${esc(s.product)}"></label>
          <label class="f">Version<input id="s-version" value="${esc(s.version)}"></label>
        </div>
        <h2 style="margin-top:24px">Parameters</h2><p class="sub">Aliases are the names your suppliers use on their certificates, separated by commas.</p>
        <div class="table-wrap"><table class="t" id="ptable"><thead><tr><th>Parameter</th><th>Aliases</th><th>Unit</th><th>Limit type</th><th>Min</th><th>Max</th><th></th></tr></thead><tbody>${s.params.map(row).join("")}</tbody></table></div>
        <div class="toolbar" style="margin-top:14px"><button class="btn btn-ghost btn-sm" data-act="add-row">Add parameter</button></div>
        <div id="spec-msg" aria-live="polite"></div>
      </div>`;
    CS._specRow = row;
    return shell("specs", esc(s.name), body, `<button class="btn btn-ghost btn-sm" data-act="dup-spec">Duplicate</button><button class="btn btn-ghost btn-sm" data-act="del-spec">Delete</button><button class="btn btn-primary btn-sm" data-act="save-spec">Save</button>`);
  }
  function bindSpecEditor(root, id) {
    const tbody = root.querySelector("#ptable tbody");
    const syncType = (tr) => { const t = tr.querySelector('[name="type"]').value; tr.querySelector('[name="min"]').disabled = t === "max" || t === "qual"; tr.querySelector('[name="max"]').disabled = t === "min" || t === "qual"; };
    tbody.addEventListener("change", (e) => { if (e.target.name === "type") syncType(e.target.closest("tr")); });
    tbody.addEventListener("click", (e) => { if (e.target.closest('[data-act="rm-row"]')) { e.preventDefault(); e.target.closest("tr").remove(); } });
    root.querySelector('[data-act="add-row"]').addEventListener("click", () => {
      tbody.insertAdjacentHTML("beforeend", CS._specRow({ key: "p" + CS.store.uid(), name: "", aliases: [], unit: "", type: "max", max: "" }));
      tbody.lastElementChild.querySelector("input").focus();
    });
    const collect = () => {
      const params = [...tbody.querySelectorAll("tr")].map((tr) => {
        const g = (n) => tr.querySelector(`[name="${n}"]`).value.trim();
        const name = g("name"); if (!name) return null;
        const type = g("type");
        const aliases = [...new Set([name.toLowerCase(), ...g("aliases").split(",").map((a) => a.trim().toLowerCase()).filter(Boolean)])];
        const orig = (CS.store.ws().specs.find((x) => x.id === id) || { params: [] }).params.find((x) => x.key === tr.dataset.key) || {};
        const p = { key: tr.dataset.key, name, aliases, unit: g("unit"), type };
        if (orig.exclusive && type === "max") p.exclusive = true;
        if (type === "qual") p.expected = "absent";
        if (type === "min" || type === "range") p.min = parseFloat(g("min"));
        if (type === "max" || type === "range") p.max = parseFloat(g("max"));
        return p;
      }).filter(Boolean);
      const bad = params.find((p) => (p.min !== undefined && isNaN(p.min)) || (p.max !== undefined && isNaN(p.max)) || (p.type === "range" && p.min >= p.max));
      if (bad) throw new Error(`Check the limits for “${bad.name}”.`);
      if (!params.length) throw new Error("Add at least one parameter.");
      const name = root.querySelector("#s-name").value.trim(); if (!name) throw new Error("Give the specification a name.");
      return { id, name, product: root.querySelector("#s-product").value.trim(), version: root.querySelector("#s-version").value.trim() || "v1", params };
    };
    root.querySelector('[data-act="save-spec"]').addEventListener("click", () => {
      try { CS.store.saveSpec(collect()); toast("Specification saved"); CS.render(); }
      catch (err) { root.querySelector("#spec-msg").innerHTML = `<div class="form-msg err">${esc(err.message)}</div>`; }
    });
    root.querySelector('[data-act="dup-spec"]').addEventListener("click", () => {
      const s = JSON.parse(JSON.stringify(CS.store.ws().specs.find((x) => x.id === id)));
      s.id = "spec-" + CS.store.uid(); s.name += " (copy)"; CS.store.saveSpec(s); location.hash = "#/app/specs/" + s.id;
    });
    root.querySelector('[data-act="del-spec"]').addEventListener("click", () => {
      if (confirm("Delete this specification? Past verifications keep their results.")) { CS.store.deleteSpec(id); location.hash = "#/app/specs"; }
    });
  }

  /* ---------------- Suppliers ---------------- */
  function supplierStats() {
    const ws = CS.store.ws();
    const map = {};
    ws.verifications.forEach((v) => { if (!v.supplier) return; (map[v.supplier] = map[v.supplier] || []).push(v); });
    return Object.entries(map).map(([name, list]) => {
      list.sort((a, b) => (a.issued || a.createdAt).localeCompare(b.issued || b.createdAt));
      const rec = {};
      list.forEach((v) => v.checks.filter((c) => c.status === "fail" || c.status === "missing" || c.kind === "anomaly").forEach((c) => (rec[c.label] = (rec[c.label] || 0) + 1)));
      const top = Object.entries(rec).sort((a, b) => b[1] - a[1])[0];
      return { name, list, lots: list.length, accept: list.filter((v) => v.verdict === "accept").length, rejects: list.filter((v) => v.verdict === "reject").length, holds: list.filter((v) => v.verdict === "hold").length, open: list.filter((v) => !v.decision).length, top, last: list[list.length - 1] };
    }).sort((a, b) => a.accept / a.lots - b.accept / b.lots);
  }
  function suppliers() {
    const st = supplierStats();
    const body = st.length ? `<div class="card"><div class="table-wrap"><table class="t"><thead><tr><th>Supplier</th><th>Lots</th><th>First-pass accept</th><th>Rejects</th><th>Holds</th><th>Recurring issue</th><th>Last lot</th></tr></thead><tbody>
      ${st.map((s) => { const pct = Math.round((s.accept / s.lots) * 100); return `<tr class="click" data-href="#/app/suppliers/${encodeURIComponent(s.name)}"><td><b style="font-weight:500">${esc(s.name)}</b><div class="muted" style="font-size:13px">${esc([...new Set(s.list.map((v) => v.specName))].join(", "))}</div></td><td class="num">${s.lots}</td><td style="min-width:160px"><div style="display:flex;gap:10px;align-items:center"><div class="bar" style="flex:1"><i style="width:${pct}%;${pct < 70 ? "background:var(--hold)" : ""}"></i></div><span class="mono" style="font-size:13px">${pct}%</span></div></td><td class="num">${s.rejects}</td><td class="num">${s.holds}</td><td style="font-size:14px">${s.top && s.top[1] > 1 ? `${esc(s.top[0])} <span class="pill">${s.top[1]}×</span>` : '<span class="muted">None</span>'}</td><td class="num">${fmtDate(s.last.issued || s.last.createdAt)}</td></tr>`; }).join("")}
      </tbody></table></div></div>` : `<div class="card empty"><h3>No suppliers yet</h3><p>Suppliers appear automatically as you verify certificates.</p><a class="btn btn-primary" href="#/app/verify">Verify a certificate</a></div>`;
    return shell("suppliers", "Suppliers", body);
  }
  function supplierDetail(name) {
    const s = supplierStats().find((x) => x.name === name);
    if (!s) return shell("suppliers", "Not found", `<div class="card empty"><h3>Supplier not found</h3><a class="btn btn-ghost" href="#/app/suppliers">Back</a></div>`);
    const ws = CS.store.ws();
    const specIds = [...new Set(s.list.map((v) => v.specId))];
    const spec = ws.specs.find((x) => x.id === specIds[0]) || CS.sampleSpecs.find((x) => x.id === specIds[0]);
    const numericKeys = spec ? spec.params.filter((p) => p.type !== "qual").map((p) => p) : [];
    const issues = {};
    s.list.forEach((v) => v.checks.filter((c) => c.status !== "pass").forEach((c) => (issues[c.label] = (issues[c.label] || 0) + 1)));
    const body = `
      <div class="grid g4">
        <div class="card kpi"><div class="l">Lots verified</div><div class="v">${s.lots}</div></div>
        <div class="card kpi"><div class="l">First-pass accept</div><div class="v">${Math.round((s.accept / s.lots) * 100)}%</div></div>
        <div class="card kpi"><div class="l">Rejects</div><div class="v">${s.rejects}</div></div>
        <div class="card kpi"><div class="l">Awaiting decision</div><div class="v">${s.open}</div></div>
      </div>
      <div class="grid g21" style="margin-top:18px">
        <div class="card">
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h2>Result trend</h2><p class="sub" style="margin:0">Per lot, with specification limits dashed</p></div>
          <select id="trend-p" style="width:auto">${numericKeys.map((p) => `<option value="${esc(p.key)}">${esc(p.name)}</option>`).join("")}</select></div>
          <div id="trend" style="margin-top:14px"></div>
        </div>
        <div class="card"><h2>Findings by parameter</h2><p class="sub">Non-passing checks across all lots</p>
          ${Object.keys(issues).length ? Object.entries(issues).sort((a, b) => b[1] - a[1]).map(([k, c]) => `<div class="viz-row" style="font-size:14px;padding:7px 0"><span>${esc(k)}</span><span class="pill">${c}×</span></div>`).join("") : '<p class="muted">No findings. Every lot passed.</p>'}
        </div>
      </div>
      <div class="card" style="margin-top:18px"><h2 style="margin-bottom:10px">Lots</h2>${vTable(sorted(s.list))}</div>`;
    CS._supplier = { s, spec };
    return shell("suppliers", esc(name), body);
  }
  function bindSupplier(root) {
    const sel = root.querySelector("#trend-p"); if (!sel) return;
    const draw = () => {
      const { s, spec } = CS._supplier;
      const p = spec.params.find((x) => x.key === sel.value);
      const pts = s.list.map((v) => ({ lot: v.lot, val: (v.checks.find((c) => c.key === p.key) || {}).numeric })).filter((x) => x.val != null);
      root.querySelector("#trend").innerHTML = pts.length ? `${sparkline(pts.map((x) => x.val), { min: p.min, max: p.max, label: p.name + " trend" })}<div style="display:flex;justify-content:space-between" class="source"><span>${esc(pts[0].lot)}</span><span>${esc(E.limitText(p))}</span><span>${esc(pts[pts.length - 1].lot)}</span></div>` : '<p class="muted">No measured values for this parameter.</p>';
    };
    sel.addEventListener("change", draw); draw();
  }

  /* ---------------- Reports ---------------- */
  function reports() {
    const ws = CS.store.ws();
    const list = sorted(ws.verifications);
    const body = `
      <div class="grid g3">
        <div class="card"><h2>Verification log</h2><p class="sub">Every certificate, verdict, decision and finding as CSV for audits or spreadsheets.</p><button class="btn btn-primary btn-sm" data-act="csv">Download CSV</button></div>
        <div class="card"><h2>Supplier summary</h2><p class="sub">Accept rate, rejects and recurring issues per supplier, ready to print.</p><a class="btn btn-ghost btn-sm" href="#/app/report/suppliers">Open summary</a></div>
        <div class="card"><h2>Lot reports</h2><p class="sub">A printable verification record for any single lot. Open it from the list below.</p><span class="pill">${list.length} available</span></div>
      </div>
      <div class="card" style="margin-top:18px"><h2 style="margin-bottom:10px">Lot reports</h2>${list.length ? `<div class="table-wrap"><table class="t"><thead><tr><th>Lot</th><th>Supplier</th><th>Verdict</th><th>Decision</th><th></th></tr></thead><tbody>${list.map((v) => `<tr><td class="num">${esc(v.lot || "N/A")}</td><td>${esc(v.supplier || "N/A")}</td><td>${verdictBadge(v.verdict)}</td><td>${decisionText(v.decision)}</td><td style="text-align:right"><a class="btn btn-ghost btn-sm" href="#/app/report/${v.id}">Open report</a></td></tr>`).join("")}</tbody></table></div>` : '<p class="muted">No verifications yet.</p>'}</div>`;
    return shell("reports", "Reports", body);
  }

  function report(id) {
    const ws = CS.store.ws(); const u = CS.store.user();
    if (id === "suppliers") {
      const st = supplierStats();
      const body = `<div class="card"><div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1.5px solid var(--ink);padding-bottom:14px;margin-bottom:14px">${logo("#/")}<div style="text-align:right" class="source">Supplier quality summary<br>${esc(ws.name)} · generated ${fmtDate(new Date().toISOString())}</div></div>
        <table class="t"><thead><tr><th>Supplier</th><th>Lots</th><th>Accept</th><th>Holds</th><th>Rejects</th><th>Top recurring finding</th></tr></thead><tbody>${st.map((s) => `<tr><td>${esc(s.name)}</td><td class="num">${s.lots}</td><td class="num">${Math.round((s.accept / s.lots) * 100)}%</td><td class="num">${s.holds}</td><td class="num">${s.rejects}</td><td>${s.top ? `${esc(s.top[0])} (${s.top[1]}×)` : "N/A"}</td></tr>`).join("")}</tbody></table>
        ${ws.sample ? '<p class="source" style="margin-top:14px">Sample workspace with fictional suppliers and results.</p>' : ""}</div>`;
      return shell("reports", "Supplier summary", body, `<button class="btn btn-primary btn-sm" data-act="print">Print / save PDF</button>`);
    }
    const v = ws.verifications.find((x) => x.id === id);
    if (!v) return shell("reports", "Not found", `<div class="card empty"><h3>Report not found</h3></div>`);
    const body = `<div class="card" style="max-width:900px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1.5px solid var(--ink);padding-bottom:14px;margin-bottom:16px">${logo("#/")}<div style="text-align:right" class="source">Incoming material verification record<br>Ref ${esc(v.id.toUpperCase())}</div></div>
      <div class="grid g2" style="font-size:14.5px;gap:4px 24px">
        <div><span class="muted">Supplier:</span> ${esc(v.supplier || "N/A")}</div><div><span class="muted">Specification:</span> ${esc(v.specName)}</div>
        <div><span class="muted">Product:</span> ${esc(v.product || "N/A")}</div><div><span class="muted">Lot:</span> <span class="mono">${esc(v.lot || "N/A")}</span></div>
        <div><span class="muted">Certificate issued:</span> ${fmtDate(v.issued)}</div><div><span class="muted">Best before:</span> ${fmtDate(v.exp)}</div>
        <div><span class="muted">Signed by:</span> ${esc(v.signedBy || "Not stated")}</div><div><span class="muted">Checked:</span> ${fmtDate(v.createdAt)}</div>
      </div>
      <div class="verdict ${v.verdict}" style="margin:18px 0"><div class="big">${verdictLabel[v.verdict].toUpperCase().split(" ")[0]}</div><div><h2 style="font-size:20px">System recommendation: ${verdictLabel[v.verdict]}</h2><p>Decision: ${v.decision ? `${decisionLabel[v.decision.status]} on ${fmtDate(v.decision.at)}${v.decision.note ? `: “${esc(v.decision.note)}”` : ""}` : "Not yet recorded"}</p></div></div>
      <table class="t"><thead><tr><th>Check</th><th>Result</th><th>Requirement</th><th>Status</th><th>Comment</th></tr></thead><tbody>
        ${v.checks.map((c) => `<tr><td>${esc(c.label)}</td><td class="num">${c.kind === "param" ? (c.value != null ? esc(c.value + " " + (c.unit || "")) : "N/A") : ""}</td><td class="num">${esc(c.limit || "")}</td><td><span class="badge ${c.status}">${statusLabel[c.status]}</span></td><td style="font-size:13.5px">${esc(c.detail)}</td></tr>`).join("")}
      </tbody></table>
      <p class="source" style="margin-top:16px">Prepared by ${esc(u.name)} in ${esc(ws.name)} using CertiSift. Automated checks support, and do not replace, the reviewer's decision.${ws.sample ? " Sample data with a fictional supplier." : ""}</p>
    </div>`;
    return shell("reports", "Lot report", body, `<a class="btn btn-ghost btn-sm" href="#/app/v/${v.id}">Back to verification</a><button class="btn btn-primary btn-sm" data-act="print">Print / save PDF</button>`);
  }

  /* ---------------- Profile ---------------- */
  function profile() {
    const u = CS.store.user(); const ws = CS.store.ws(); const sample = CS.store.isSample();
    const body = `<div class="grid g2">
      <div class="card"><h2>Profile</h2><p class="sub">${sample ? "The sample workspace uses a shared demo profile." : "Stored in this browser."}</p>
        <form class="form" id="profile-form">
          <label class="f">Name<input name="name" value="${esc(u.name)}" ${sample ? "disabled" : ""}></label>
          <label class="f">Workspace name<input name="ws" value="${esc(ws.name)}" ${sample ? "disabled" : ""}></label>
          <label class="f">Email<input value="${esc(u.email)}" disabled></label>
          ${sample ? "" : '<button class="btn btn-primary btn-sm" type="submit" style="justify-self:start">Save changes</button>'}
        </form>
      </div>
      <div class="card"><h2>Workspace data</h2><p class="sub">${ws.verifications.length} verifications · ${ws.specs.length} specifications</p>
        <div style="display:grid;gap:10px;justify-items:start">
          <button class="btn btn-ghost btn-sm" data-act="export-json">Export workspace (JSON)</button>
          ${sample ? '<button class="btn btn-ghost btn-sm" data-act="reset-sample">Reset sample workspace</button>' : '<button class="btn btn-ghost btn-sm" data-act="delete-account" style="color:var(--fail)">Delete account and workspace</button>'}
          <button class="btn btn-primary btn-sm" data-act="signout">${icon("out").replace("<svg", '<svg width="16" height="16"')} Sign out</button>
        </div>
      </div></div>`;
    return shell("profile", "Profile", body);
  }
  function bindProfile(root) {
    const f = root.querySelector("#profile-form");
    f.addEventListener("submit", (e) => { e.preventDefault(); const d = Object.fromEntries(new FormData(f)); CS.store.updateUser({ name: d.name }); const ws = CS.store.ws(); ws.name = d.ws || ws.name; CS.store.saveWs(ws); toast("Profile saved"); CS.render(); });
    const on = (a, fn) => { const b = root.querySelector(`[data-act="${a}"]`); if (b) b.addEventListener("click", fn); };
    on("export-json", () => download("certisift-workspace.json", JSON.stringify(CS.store.ws(), null, 2), "application/json"));
    on("reset-sample", () => { if (confirm("Reset the sample workspace to its original data?")) { CS.store.resetSample(); toast("Sample workspace reset"); CS.render(); } });
    on("delete-account", () => { if (confirm("Delete your account and all workspace data from this browser? This cannot be undone.")) { CS.store.deleteAccount(); location.hash = "#/"; } });
  }

  CS.app = { overview, verify, bindVerify, detail, bindDetail, verifications, bindVerifications, exportCsv, specs, specEditor, bindSpecEditor, suppliers, supplierDetail, bindSupplier, reports, report, profile, bindProfile, shell };
})();
