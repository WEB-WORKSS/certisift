/* Public website templates, used at build time by scripts/build-pages.mjs to generate the static
   HTML pages. Content derives from CS.business. Not loaded in the browser. */
window.CS = window.CS || {};

(function () {
  const { esc, logo, icon } = CS.ui;
  const B = CS.business;

  function heroCert() {
    const rows = [
      ["Moisture content", "14.4", "%", "near", "Near limit"],
      ["Protein", "11.6", "%"],
      ["Ash", "0.61", "%"],
      ["Falling number", "276", "s"],
      ["Aflatoxin B1", "3.4", "µg/kg", "bad"],
      ["TPC", "6.1E4", "cfu/g"],
      ["Yeast & Mold", "780", "cfu/g"],
      ["E. coli", "<10", "cfu/g"],
      ["Salmonella", "Absent", "/25 g"],
    ];
    return `
    <div class="cert-stage" aria-label="Illustration: a sample Certificate of Analysis being checked against a specification">
      <div class="cert">
        <div class="scanline"></div>
        <div class="cert-head"><div><strong>CERTIFICATE OF ANALYSIS</strong><div style="margin-top:4px;font-size:11px" class="muted">Sample document · fictional supplier</div></div><span class="badge sample">Sample</span></div>
        <div class="cert-meta">
          <span>Supplier</span><span>Arden Grain Partners</span>
          <span>Product</span><span>Wheat Flour T550</span>
          <span>Lot No.</span><span><mark style="background:var(--mark-soft)">AGP-7781-B</mark></span>
          <span>Best before</span><span>2027-04-30</span>
        </div>
        <div class="cert-row th"><span>Parameter</span><span>Result</span><span>Unit</span></div>
        ${rows.map((r, i) => `<div class="cert-row ${r[3] || ""}"><span>${r[0]}</span><span class="val"><mark style="--d:${0.35 + i * 0.18}s">${r[1]}</mark></span><span>${r[2]}</span></div>`).join("")}
        <div class="cert-sign"><span>Approved by: R. Osei</span><span>Issued 2026-11-05</span></div>
      </div>
      <div class="notes">
        <div class="note pass" style="--d:1.2s"><b>7 of 9 pass</b>Within your flour spec v3</div>
        <div class="note hold" style="--d:1.7s"><b>Near limit</b>Moisture 14.4 % · limit ≤ 14.5 %</div>
        <div class="note fail" style="--d:2.2s"><b>Out of spec</b>Aflatoxin B1 3.4 µg/kg · limit ≤ 2.0</div>
      </div>
      <div class="stamp">REJECT<small>1 deviation · 1 to review</small></div>
    </div>`;
  }

  /* ---------- Feature mini-visuals ---------- */
  const featureViz = {
    extract: `<div class="viz"><div class="viz-row"><span class="muted">supplier</span><span>Northfield Milling Co.</span></div><div class="viz-row"><span class="muted">lot</span><span>NFM-26311</span></div><div class="viz-row"><span class="muted">tpc</span><span>3.8 × 10⁴ → 38,000 cfu/g</span></div><div class="viz-row"><span class="muted">salmonella</span><span>Not detected /25 g</span></div></div>`,
    match: `<div class="viz"><div class="viz-row"><span><i class="dot pass"></i>Protein</span><span>12.1 · 11.0–13.0 %</span></div><div class="viz-row"><span><i class="dot warn"></i>Moisture</span><span>14.4 · ≤ 14.5 %</span></div><div class="viz-row"><span><i class="dot fail"></i>Aflatoxin B1</span><span>3.4 · ≤ 2.0 µg/kg</span></div><div class="viz-row"><span><i class="dot missing"></i>Salmonella</span><span>not reported</span></div></div>`,
    anomaly: `<div class="viz"><svg viewBox="0 0 260 70" style="width:100%;height:70px"><line x1="0" x2="260" y1="12" y2="12" stroke="#b5391f" stroke-dasharray="4 4"/><polyline points="10,52 45,49 80,53 115,50 150,51 185,48 220,22" fill="none" stroke="#0d6e5c" stroke-width="2"/>${[[10, 52], [45, 49], [80, 53], [115, 50], [150, 51], [185, 48]].map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="#0d6e5c"/>`).join("")}<circle cx="220" cy="22" r="5" fill="#b9770e"/></svg><div class="viz-row"><span><i class="dot warn"></i>Protein +7σ vs. last 7 lots</span><span>still in spec</span></div></div>`,
    reports: `<div class="viz"><div class="viz-row"><b>Verification record</b><span>Lot HDI-SMP-0942</span></div><div class="viz-row"><span>Checks</span><span>12 pass · 1 review · 1 missing</span></div><div class="viz-row"><span>Decision</span><span>On hold, awaiting Salmonella result</span></div><div class="viz-row"><span>Reviewer</span><span>QA, 24 Oct 2026</span></div></div>`,
    suppliers: `<div class="viz">${[["Northfield Milling", 100], ["Halvorsen Dairy", 86], ["Arden Grain", 63]].map(([n, p]) => `<div class="viz-row" style="align-items:center"><span style="flex:0 0 46%">${n}</span><span class="bar" style="flex:1"><i style="width:${p}%;${p < 70 ? "background:var(--hold)" : ""}"></i></span><span style="width:40px;text-align:right">${p}%</span></div>`).join("")}<div class="viz-row"><span class="muted">Recurring</span><span>Arden · moisture (2×)</span></div></div>`,
    workflow: `<div class="viz" style="display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap"><span class="badge pass">Release</span><span class="badge hold">Hold</span><span class="badge reject">Reject</span><div style="flex-basis:100%;margin-top:8px" class="muted">“Held pending Salmonella result from supplier lab.”</div></div>`,
  };

  function featureCard(f, wide) {
    const roadmap = f.planned ? `<p class="muted" style="font-size:13px">Today: ${esc(f.scope.split(";")[0])} Next: ${esc(f.planned)}</p>` : "";
    return `<article class="feature ${wide ? "wide" : ""}">
      ${featureViz[f.id] || ""}
      <h3>${esc(f.name)}</h3>
      <p>${esc(f.body)}</p>
      ${roadmap}
      <div class="benefit">${esc(f.benefit)}</div>
    </article>`;
  }

  CS.archSvg = function () {
    const box = (x, y, w, h, t, s, fill = "#fffdf8", stroke = "#c9c0ad") =>
      `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${fill}" stroke="${stroke}"/><text x="${x + w / 2}" y="${y + h / 2 - (s ? 3 : -4)}" text-anchor="middle" font-size="12" font-weight="600" fill="#12211f">${t}</text>${s ? `<text x="${x + w / 2}" y="${y + h / 2 + 13}" text-anchor="middle" font-size="10" fill="#5d6a66">${s}</text>` : ""}</g>`;
    const arrow = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#0d6e5c" stroke-width="1.4" marker-end="url(#ah)"/>`;
    return `<svg class="arch" viewBox="0 0 640 380" role="img" aria-label="Proposed AWS architecture for CertiSift">
      <defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#0d6e5c"/></marker></defs>
      <rect x="1" y="1" width="638" height="378" rx="14" fill="none" stroke="#c9c0ad" stroke-dasharray="5 5"/>
      <text x="16" y="24" font-size="10.5" fill="#5d6a66" letter-spacing="1.5">PROPOSED · NOT YET DEPLOYED</text>
      ${box(20, 60, 110, 52, "QA user", "web app")}
      ${box(170, 60, 120, 52, "API Gateway", "REST API")}
      ${box(170, 140, 120, 46, "Cognito", "auth · tenants", "#ece7db")}
      ${arrow(130, 86, 168, 86)}
      ${arrow(230, 112, 230, 138)}
      <rect x="320" y="44" width="300" height="200" rx="10" fill="#dcebe5" stroke="#0d6e5c" stroke-opacity=".4"/>
      <text x="334" y="64" font-size="10.5" fill="#0a5648" letter-spacing="1.2">STEP FUNCTIONS WORKFLOW · LAMBDA</text>
      ${box(334, 78, 128, 46, "Textract", "text + tables")}
      ${box(478, 78, 128, 46, "Bedrock", "interpret layout")}
      ${box(334, 140, 128, 46, "Spec matching", "Lambda")}
      ${box(478, 140, 128, 46, "Anomaly checks", "Lambda")}
      ${box(406, 196, 128, 38, "Report", "Lambda")}
      ${arrow(462, 101, 476, 101)}${arrow(542, 124, 420, 138)}${arrow(462, 163, 476, 163)}${arrow(542, 186, 500, 196)}
      ${arrow(290, 86, 318, 86)}
      ${box(334, 290, 128, 52, "Amazon S3", "certificates · reports", "#ece7db")}
      ${box(478, 290, 128, 52, "DynamoDB", "specs · suppliers · results", "#ece7db")}
      ${arrow(398, 244, 398, 288)}${arrow(542, 244, 542, 288)}
      ${box(20, 290, 130, 52, "AWS KMS", "encryption keys", "#ece7db")}
      ${box(170, 290, 130, 52, "CloudWatch", "logs · alerts", "#ece7db")}
      <line x1="150" y1="316" x2="332" y2="316" stroke="#c9c0ad" stroke-dasharray="3 3"/>
    </svg>`;
  };


  CS.site = { heroCert, featureCard };
})();
