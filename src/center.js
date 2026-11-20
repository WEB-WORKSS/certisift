/* Application Center: readiness, business record, AWS Activate answers, architecture, LinkedIn kit, brand kit, inbox.
   Everything is generated from CS.business so all channels tell the same story. */
window.CS = window.CS || {};

(function () {
  const { esc, logoMark, fmtDate } = CS.ui;
  const B = CS.business;
  const TABS = [["readiness", "Readiness"], ["record", "Business record"], ["activate", "AWS Activate"], ["architecture", "AWS architecture"], ["linkedin", "LinkedIn kit"], ["brand", "Brand kit"], ["inbox", "Contact requests"]];

  const awsList = (status) => B.aws.filter((a) => a.status === status).map((a) => a.service);
  const proposed = awsList("proposed");
  const implemented = B.features.filter((f) => f.classification === "implemented").map((f) => f.name.toLowerCase());

  /* ---------- Generated copy ---------- */
  const copy = {
    activateDescription:
      `${B.name} is an early-stage B2B SaaS company building supplier quality verification software for food and beverage manufacturers. QA teams today review every supplier Certificate of Analysis by hand against internal specifications — a slow, inconsistent process in which out-of-spec, missing or copied results can slip through and lead to production holds, scrapped batches or recalls. ${B.name} extracts the supplier, lot and test results from each certificate, checks every value against the customer's own specification, flags anomalies against the supplier's history and records the release decision in an audit-ready report. A working MVP of the verification engine (${implemented.slice(0, 3).join(", ")} and ${implemented.slice(3).join(", ")}) runs today on text-based certificates. We are now building the hosted platform on AWS.`,
    awsUsage:
      `We plan to build the production platform on AWS. Amazon Textract will extract text and tables from scanned and PDF certificates, and Amazon Bedrock will interpret unfamiliar certificate layouts, normalise parameter names and support anomaly review. AWS Step Functions will orchestrate the workflow, with AWS Lambda running extraction, specification matching, anomaly checks and report generation. Certificates and reports will be stored in Amazon S3 with AWS KMS encryption, specifications, supplier records and results in Amazon DynamoDB, and the web app will access the platform through Amazon API Gateway with Amazon Cognito for sign-in and tenant isolation. Amazon CloudWatch will provide monitoring. Credits would fund development and testing of this architecture, Textract and Bedrock usage during pilots with early food manufacturers, and the first production environment.`,
    customers:
      `Initial focus: ${B.targetCustomers.beachhead.toLowerCase()} — buyers are ${B.targetCustomers.buyers.join(", ")}; daily users are ${B.targetCustomers.users.join(", ").toLowerCase()}. Planned expansion: ${B.targetCustomers.expansion.join("; ").toLowerCase()}.`,
    linkedinTagline: "Supplier CoA verification for food manufacturers — check every certificate against your spec before release.",
    linkedinAbout:
      `${B.name} helps food and beverage manufacturers verify supplier Certificates of Analysis before materials reach production.

Every incoming lot arrives with a certificate that QA must compare, line by line, against an internal specification. Formats vary by supplier and lab, reviews happen under time pressure, and near-limit results, missing tests or copied values can slip through — leading to production holds, scrapped batches and recalls.

${B.name} reads each certificate, extracts the supplier, lot and every test result, checks each value against your own specification and flags what needs attention: out-of-spec results, missing tests, unsigned or expired certificates, and results that are unusual for that supplier. Reviewers record the release decision, and supplier performance builds up automatically for audits and supplier reviews.

We are currently building our initial product and working with QA teams on early pilots. The hosted platform is being designed on AWS, with document AI for scanned certificates.

Interested in trying it on your own certificates? Get in touch.`,
    specialties: ["Supplier quality", "Certificate of Analysis verification", "Food safety", "Quality assurance software", "Incoming goods inspection", "Specification management", "Supplier performance monitoring", "AI document processing"],
    posts: [
      { title: "Introduction", text: `Introducing ${B.name}.\n\nEvery ingredient lot that arrives at a food factory comes with a Certificate of Analysis. Someone in QA has to read it and compare every result with the internal specification — often under time pressure, often across dozens of supplier formats.\n\nWe're building ${B.name} to do that comparison automatically: extract the results, check them against your spec, and flag what needs a closer look before the lot is released.\n\nWe're early, building our first product, and we'd like to hear from QA teams about how you handle CoAs today.` },
      { title: "Problem insight", text: `Three things that slip through manual CoA review:\n\n1. Results that pass, but sit right on the limit.\n2. Tests that are simply missing from the certificate.\n3. Values identical to last month's certificate — a sign the numbers may have been copied.\n\nThe ${B.name} engine checks for all three on every certificate. What would you add to the list?` },
      { title: "Build update", text: `Build update: the ${B.name} verification engine now handles the messy parts of real certificates — scientific notation (3.8 × 10⁴), "<10" reporting limits, decimal commas, "Not detected" pathogen results and supplier-specific parameter names.\n\nNext up: support for scanned PDFs. If you'd be willing to share a few anonymised certificates for testing, please get in touch.` },
    ],
  };
  CS.centerCopy = copy;

  const field = (label, text, limit, note) => `
    <div class="field-label"><span>${label}</span>${limit ? `<small>${text.length} / ${limit} chars${text.length > limit ? " — over limit" : ""}</small>` : `<small>${text.length} chars</small>`}</div>
    <div class="copybox">${esc(text)}<button class="btn btn-ghost btn-sm copy" data-copy="${esc(text)}">Copy</button></div>
    ${note ? `<p class="muted" style="font-size:13px;margin:6px 0 0">${note}</p>` : ""}`;

  function readiness() {
    const items = CS.verificationItems();
    const done = items.filter((i) => i.ok).length;
    const blockers = items.filter((i) => !i.ok && i.blocker);
    return `
      <div class="grid g3">
        <div class="card kpi"><div class="l">Product stage</div><div style="font:400 26px/1.15 var(--serif);margin:8px 0">${esc(B.stage.value)}</div><div class="d">${esc(B.stage.rationale)}</div></div>
        <div class="card kpi"><div class="l">Verified facts</div><div class="v">${done} / ${items.length}</div><div class="bar" style="margin-top:8px"><i style="width:${(done / items.length) * 100}%"></i></div></div>
        <div class="card kpi"><div class="l">Blockers before applying</div><div class="v" style="color:${blockers.length ? "var(--fail)" : "var(--pass)"}">${blockers.length}</div><div class="d">Must be resolved before publishing the site or submitting to AWS</div></div>
      </div>
      <div class="card" style="margin-top:18px"><h2>Facts to verify</h2><p class="sub">Unknown facts are hidden from the public website and listed here. Update them in <span class="mono">src/data/business.js</span>.</p>
        <table class="t"><thead><tr><th>Status</th><th>Item</th><th>Current state</th></tr></thead><tbody>
        ${items.map((i) => `<tr><td><span class="badge ${i.ok ? "pass" : i.blocker ? "fail" : "warn"}">${i.ok ? "Verified" : i.blocker ? "Blocker" : "To confirm"}</span></td><td>${esc(i.label)}</td><td style="font-size:14px">${esc(i.detail)}</td></tr>`).join("")}
        </tbody></table>
      </div>
      <div class="callout" style="margin-top:18px"><b>Contact form:</b> requests are currently saved in this browser only (see “Contact requests”). Connect the form to the official business email or a form service before the website is published.</div>`;
  }

  function record() {
    return `
      <div class="grid g2">
        <div class="card"><h2>Positioning statement</h2><p style="margin:8px 0 0">${esc(B.positioning)}</p></div>
        <div class="card"><h2>Target customers</h2><p style="margin:8px 0 0">${esc(copy.customers)}</p></div>
      </div>
      <div class="card" style="margin-top:18px"><h2>Feature classification</h2><p class="sub">Public copy describes only what each capability does at its current classification.</p>
        <table class="t"><thead><tr><th>Feature</th><th>Classification</th><th>What exists today</th><th>Planned</th></tr></thead><tbody>
        ${B.features.map((f) => `<tr><td><b style="font-weight:500">${esc(f.name)}</b></td><td><span class="badge ${f.classification}">${f.classification}</span></td><td style="font-size:14px">${esc(f.scope)}</td><td style="font-size:14px">${esc(f.planned || "—")}</td></tr>`).join("")}
        ${B.roadmap.map((r) => `<tr><td>${esc(r)}</td><td><span class="badge planned">planned</span></td><td class="muted">—</td><td class="muted">Roadmap</td></tr>`).join("")}
        </tbody></table>
      </div>
      <div class="card" style="margin-top:18px"><h2>Company defaults</h2><table class="t"><tbody>
        ${[["Business model", B.businessModel, "verified"], ["Industry (LinkedIn)", B.linkedinIndustry, "assumption"], ["Founding year", B.foundingYear.value, B.foundingYear.status], ["Company type", B.companyType.value, B.companyType.status], ["Company size", B.companySize.value, B.companySize.status], ["Pricing", B.pricing.note, B.pricing.status]].map(([k, v, s]) => `<tr><td>${k}</td><td>${esc(v)}</td><td><span class="badge ${s === "verified" ? "pass" : "warn"}">${s}</span></td></tr>`).join("")}
      </tbody></table></div>`;
  }

  function activate() {
    const site = B.domain.value ? `https://www.${B.domain.value}` : null;
    return `
      <div class="callout info"><b>Which package?</b> AWS Activate <b>Portfolio</b> requires an Organizational ID from an Activate Provider (accelerator, incubator, VC). Without one, apply to Activate <b>Founders</b>, which needs a company website, a LinkedIn company page and no previous Activate credits. Confirm current eligibility on the AWS Activate site before submitting.</div>
      <div class="grid g21" style="margin-top:18px">
        <div class="card">
          <h2>Draft answers</h2><p class="sub">Generated from the business record. Character counts help you fit the form.</p>
          ${field("Company name", B.name)}
          ${site ? field("Company website", site) : `<div class="field-label"><span>Company website</span></div><div class="callout">Blocked: domain not confirmed. Suggested <span class="mono">www.${esc(B.domain.suggestion)}</span> — register it, publish this site, then update <span class="mono">business.js</span>.</div>`}
          ${field("Product stage (select)", B.stage.activateSelection, null, esc(B.stage.rationale))}
          ${field("Industry", B.industry)}
          ${field("Company / product description", copy.activateDescription)}
          ${field("How will you use AWS?", copy.awsUsage)}
          ${field("Target customers", copy.customers)}
          ${field("Planned AWS services", proposed.join(", "))}
        </div>
        <div class="grid" style="align-content:start">
          <div class="card"><h2>Consistency rules</h2><ul class="check-list">
            <li>Stage is “${esc(B.stage.activateSelection)}” everywhere</li>
            <li>All AWS services described as planned — none deployed</li>
            <li>No customers, revenue or users claimed</li>
            <li>Same positioning on website, LinkedIn and application</li>
          </ul></div>
          <div class="card"><h2>Evidence to gather</h2><ul class="check-list">
            <li>Published website on the company domain</li>
            <li>LinkedIn page with the About text from the LinkedIn kit</li>
            <li>Screenshots of the working verification engine</li>
            <li>Notes from conversations with QA teams (if any)</li>
          </ul></div>
        </div>
      </div>`;
  }

  function architecture() {
    return `
      <div class="grid g12">
        <div class="card"><h2>Service classification</h2><p class="sub">Only “deployed” services may be described as “Built on AWS”.</p>
          ${["deployed", "implementing", "proposed"].map((s) => `<div style="margin-top:14px"><span class="badge ${s}">${s === "implementing" ? "being implemented" : s}</span> <span class="muted" style="font-size:13px">${awsList(s).length} services</span></div>`).join("")}
          <table class="t" style="margin-top:14px"><tbody>${B.aws.map((a) => `<tr><td><b style="font-weight:500">${esc(a.service)}</b><div class="muted" style="font-size:13px">${esc(a.purpose)}</div></td><td><span class="badge ${a.status}">${a.status}</span></td></tr>`).join("")}</tbody></table>
        </div>
        <div class="card"><h2>Proposed architecture</h2><p class="sub">Upload → Textract → Bedrock → matching → anomaly checks → report.</p>${CS.archSvg()}
          <h2 style="margin-top:20px">Current implementation</h2><p style="font-size:14.5px;margin:6px 0 0">The verification engine (<span class="mono">src/engine.js</span>) runs client-side in the browser. Workspace data is stored in localStorage. The engine is written as pure functions so it can move into AWS Lambda unchanged.</p>
        </div>
      </div>`;
  }

  function linkedin() {
    const slug = B.linkedin.value || `linkedin.com/company/${B.linkedin.proposedSlug}`;
    return `
      <div class="grid g21">
        <div class="card">
          <h2>Company page fields</h2><p class="sub">Paste into LinkedIn's “Create a Company Page” form.</p>
          ${field("Page name", B.name)}
          ${field("Public URL", slug, null, B.linkedin.value ? "" : `Proposed, not verified. ${esc(B.linkedin.note)} Alternative: linkedin.com/company/${esc(B.linkedin.alternativeSlug)}.`)}
          ${field("Website", B.domain.value ? `https://www.${B.domain.value}` : `(add once ${B.domain.suggestion} is confirmed)`)}
          ${field("Industry", B.linkedinIndustry)}
          ${field("Company size", B.companySize.value, null, "Suggested bracket — confirm actual team size.")}
          ${field("Company type", B.companyType.value)}
          ${field("Tagline", copy.linkedinTagline, 120)}
          ${field("About (overview)", copy.linkedinAbout, 2000)}
          ${field("Specialties", copy.specialties.join(", "))}
          ${field("Founded", String(B.foundingYear.value), null, "Default assumption — confirm.")}
        </div>
        <div class="grid" style="align-content:start">
          <div class="card"><h2>Logo for LinkedIn</h2><p class="sub">300 × 300 px recommended.</p><div style="width:120px;height:120px">${logoMark(false)}</div><button class="btn btn-ghost btn-sm" style="margin-top:12px" data-act="dl-logo">Download SVG</button></div>
          <div class="card"><h2>First posts</h2><p class="sub">Truthful to the current stage.</p>
            ${copy.posts.map((p) => `<details style="border-top:1px dashed var(--rule);padding:10px 0"><summary style="cursor:pointer;font-weight:500">${esc(p.title)}</summary><div class="copybox" style="margin-top:8px;font-size:13.5px">${esc(p.text)}<button class="btn btn-ghost btn-sm copy" data-copy="${esc(p.text)}">Copy</button></div></details>`).join("")}
          </div>
        </div>
      </div>`;
  }

  function brand() {
    const colors = [["Ink", "#12211f", "Text, dark surfaces"], ["Paper", "#f5f2ea", "Background"], ["Assay teal", "#0d6e5c", "Primary action"], ["Highlighter", "#e6ef6b", "Extraction highlight"], ["Pass", "#2c7a4b", "Within spec"], ["Hold", "#b9770e", "Review"], ["Reject", "#b5391f", "Out of spec"]];
    return `
      <div class="grid g2">
        <div class="card"><h2>Colour</h2><div class="grid g2" style="margin-top:12px;gap:10px">${colors.map(([n, h, u]) => `<button class="sample-btn" data-copy="${h}" style="display:flex;gap:12px;align-items:center"><span style="width:38px;height:38px;border-radius:8px;background:${h};border:1px solid var(--rule)"></span><span><b style="font-weight:500">${n}</b><small class="mono">${h} · ${u}</small></span></button>`).join("")}</div></div>
        <div class="card"><h2>Typography</h2>
          <p style="font:400 40px/1.05 var(--serif);margin:12px 0 4px">Instrument Serif</p><p class="muted" style="margin:0 0 14px;font-size:14px">Headlines, KPIs — editorial, document-like</p>
          <p style="font:500 20px var(--sans);margin:0 0 4px">IBM Plex Sans</p><p class="muted" style="margin:0 0 14px;font-size:14px">Interface and body copy</p>
          <p style="font:500 16px var(--mono);margin:0 0 4px">IBM Plex Mono</p><p class="muted" style="margin:0;font-size:14px">Values, lot numbers, labels</p>
        </div>
        <div class="card"><h2>Logo concept</h2><p style="font-size:14.5px">A 3 × 3 sieve grid with a single highlighted cell: many results go in, the one that matters is caught.</p><div style="display:flex;gap:18px;align-items:center"><div style="width:72px">${logoMark(false)}</div><div style="width:72px">${logoMark(true)}</div></div></div>
        <div class="card"><h2>Visual language</h2><ul class="check-list"><li>The annotated certificate: paper, ruled lines, highlighter marks and margin notes</li><li>Verdict stamps for Accept / Hold / Reject</li><li>Monospace for every measured value</li><li>No robots, no stock photography, restrained motion</li></ul></div>
      </div>`;
  }

  function inbox() {
    const list = CS.store.inbox();
    return `<div class="card"><div style="display:flex;justify-content:space-between;align-items:center"><div><h2>Contact requests</h2><p class="sub" style="margin:0">Submitted from the website contact form in this browser.</p></div>${list.length ? '<button class="btn btn-ghost btn-sm" data-act="clear-inbox">Clear</button>' : ""}</div>
      ${list.length ? `<table class="t" style="margin-top:12px"><thead><tr><th>Received</th><th>From</th><th>Interest</th><th>Message</th></tr></thead><tbody>${list.map((m) => `<tr><td class="num">${fmtDate(m.at)}</td><td>${esc(m.name)}<div class="muted" style="font-size:13px">${esc(m.company)} · ${esc(m.email)}</div></td><td>${esc(m.interest)}</td><td style="font-size:14px">${esc(m.message)}</td></tr>`).join("")}</tbody></table>` : '<div class="empty"><p>No requests yet.</p></div>'}</div>`;
  }

  function center(tab) {
    tab = TABS.some((t) => t[0] === tab) ? tab : "readiness";
    const views = { readiness, record, activate, architecture, linkedin, brand, inbox };
    const body = `<div class="tabs" role="tablist">${TABS.map(([id, l]) => `<button role="tab" aria-selected="${id === tab}" class="${id === tab ? "on" : ""}" data-href="#/app/center/${id}">${l}</button>`).join("")}</div>${views[tab]()}`;
    return CS.app.shell("center", "Activate Center", body, `<span class="muted" style="font-size:13px">Internal · not linked from the public site</span>`);
  }

  function bindCenter(root) {
    root.querySelectorAll("[data-copy]").forEach((b) => b.addEventListener("click", () => CS.ui.copy(b.dataset.copy)));
    const dl = root.querySelector('[data-act="dl-logo"]');
    if (dl) dl.addEventListener("click", () => CS.ui.download("certisift-logo.svg", logoMark(false).replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"'), "image/svg+xml"));
    const ci = root.querySelector('[data-act="clear-inbox"]');
    if (ci) ci.addEventListener("click", () => { if (confirm("Clear all contact requests?")) { CS.store.clearInbox(); CS.render(); } });
  }

  CS.center = { center, bindCenter };
})();
