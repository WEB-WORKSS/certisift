/* Public website views — content derived from CS.business */
window.CS = window.CS || {};

(function () {
  const { esc, logo, icon } = CS.ui;
  const B = CS.business;

  const navItems = () => [
    ["product", "Product"],
    ["solutions", "Solutions"],
    ["how", "How It Works"],
    ["technology", "Technology"],
    ["pricing", "Pricing"],
    ...(B.founders.length ? [["team", "Team"]] : []),
    ["contact", "Contact"],
  ];

  function header() {
    const signed = !!CS.store.session();
    const links = signed
      ? [["product", "Product"], ["solutions", "Solutions"], ["pricing", "Pricing"]]
      : navItems();
    const linkHtml = links.map(([id, l]) => `<a href="#/s/${id}">${l}</a>`).join("");
    const ctas = signed
      ? `<a class="btn btn-ghost btn-sm" href="#/app/profile">Profile</a><a class="btn btn-primary btn-sm" href="#/app">Dashboard</a>`
      : `<a class="btn btn-ghost btn-sm" href="#/signin">Sign In</a><a class="btn btn-primary btn-sm" href="#/signup">Get Started</a>`;
    return `
    <header class="site-header" id="top">
      <div class="wrap nav">
        ${logo("#/")}
        <nav class="nav-links" aria-label="Main">${linkHtml}</nav>
        <div class="nav-cta">${ctas}</div>
        <button class="nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu" data-act="toggle-menu">${icon("menu")}</button>
      </div>
      <div class="mobile-menu" id="mobile-menu">${linkHtml}<div class="btns">${ctas}</div></div>
    </header>`;
  }

  function footer() {
    const li = B.linkedin.value ? `<a href="https://${esc(B.linkedin.value)}" rel="noopener" target="_blank">LinkedIn</a>` : "";
    const mail = B.email.value ? `<a href="mailto:${esc(B.email.value)}">${esc(B.email.value)}</a>` : "";
    return `
    <footer class="site-footer">
      <div class="wrap">
        <div class="foot-grid">
          <div>${logo("#/")}<p class="muted" style="max-width:34ch;margin-top:14px;font-size:15px">${esc(B.shortPitch)}</p>${mail}</div>
          <div><h4>Product</h4><a href="#/s/product">Features</a><a href="#/s/how">How it works</a><a href="#/s/technology">Technology</a><a href="#/s/pricing">Pricing</a></div>
          <div><h4>Company</h4><a href="#/s/solutions">Solutions</a><a href="#/s/contact">Contact</a>${li}<a href="#/privacy">Privacy</a><a href="#/terms">Terms</a></div>
          <div><h4>Workspace</h4><a href="#/signin">Sign in</a><a href="#/signup">Create account</a><button data-act="sample">Open sample workspace</button></div>
        </div>
        <div class="foot-base"><span>© ${B.copyrightYear} ${esc(B.name)}. All rights reserved.</span><span>${esc(B.tagline)}</span></div>
      </div>
    </footer>`;
  }

  /* ---------- Hero certificate visual (sample data) ---------- */
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
    reports: `<div class="viz"><div class="viz-row"><b>Verification record</b><span>Lot HDI-SMP-0942</span></div><div class="viz-row"><span>Checks</span><span>12 pass · 1 review · 1 missing</span></div><div class="viz-row"><span>Decision</span><span>On hold — awaiting Salmonella result</span></div><div class="viz-row"><span>Reviewer</span><span>QA, 24 Oct 2026</span></div></div>`,
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

  function home() {
    const f = B.features;
    const roles = [
      ["QA managers", "Set the specifications once and get consistent release decisions from every reviewer, with a record for audits."],
      ["Incoming-goods QA", "Check a certificate in the time it takes to open it, and see exactly which line needs attention."],
      ["Supplier quality", "See which suppliers drift, which parameters fail repeatedly, and back corrective-action requests with data."],
      ["Procurement", "Bring quality history into supplier reviews and sourcing decisions, not just price and lead time."],
    ];
    const faqs = [
      ["Is CertiSift available today?", "CertiSift is building its initial product. The working demo in the sample workspace runs the verification engine in your browser on text-based certificates. We are speaking with food and beverage QA teams about early pilots."],
      ["Which documents can it read?", "Today: certificates as plain text or CSV, pasted or uploaded. Scanned PDFs and images will be handled through Amazon Textract in the production platform."],
      ["Does it replace our QA team's judgement?", "No. CertiSift does the line-by-line comparison and highlights what needs attention. The release decision, and the note explaining it, stay with your reviewer."],
      ["Can we use our own specifications?", "Yes. Specifications are set up per material with ranges, minimums, maximums, pathogen requirements and the parameter names your suppliers use."],
      ["Where is our data stored?", "In the demo, everything stays in your own browser's local storage. The production platform is designed for encrypted storage on AWS, with customer data separated by tenant."],
      ["Who is it for?", "Food and beverage manufacturers first. Chemical and pharmaceutical manufacturers are planned later, as they need additional validation work."],
    ];
    return `
    ${header()}
    <main id="main">
      <section class="hero">
        <div class="wrap hero-grid">
          <div>
            <span class="status-chip"><i></i>${esc(B.stage.value === "Ideating/building initial product" ? "Building the MVP · working demo available" : B.stage.value)}</span>
            <h1>Every supplier certificate, <span class="hl">checked against <em>your</em> spec</span> before the lot is released.</h1>
            <p class="lede">CertiSift reads Certificates of Analysis, compares every result with your own specification and flags out-of-spec, missing and suspicious values — so food manufacturers release incoming materials on evidence, not a skim-read PDF.</p>
            <div class="hero-ctas">
              <button class="btn btn-primary" data-act="sample-verify">Try it on a sample certificate</button>
              <a class="btn btn-ghost" href="#/s/how">See how it works</a>
            </div>
            <p class="hero-note">The demo runs in your browser on fictional sample data. No sign-up needed.</p>
          </div>
          ${heroCert()}
        </div>
      </section>

      <div class="strip"><div class="wrap strip-grid">
        <div class="strip-item"><div class="k">4 limit types</div><p>Ranges, minimums, maximums and pathogen absence — per parameter.</p></div>
        <div class="strip-item"><div class="k">History-aware</div><p>Outliers and copied values flagged against each supplier's previous lots.</p></div>
        <div class="strip-item"><div class="k">One record per lot</div><p>Every check, verdict and reviewer note in a printable report.</p></div>
        <div class="strip-item"><div class="k">Your specs</div><p>Checks run on your specifications and your suppliers' naming.</p></div>
      </div></div>

      <section class="block" id="problem">
        <div class="wrap">
          <div class="sec-head">
            <div><span class="eyebrow">The problem</span><h2 class="title">${esc(B.problem.headline)}</h2></div>
            <p class="lede">Every incoming lot depends on a document someone has to read carefully. Under time pressure, that review is the first thing to slip.</p>
          </div>
          <div class="ledger">
            <div><h3>Today · manual review</h3><ol>${B.problem.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ol></div>
            <div><h3>With CertiSift</h3><ol>
              <li>The certificate is parsed the moment it arrives — supplier, lot, dates and every result with its unit.</li>
              <li>Different parameter names and number formats are normalised to your specification.</li>
              <li>Each result is checked against your limits, including near-limit and missing tests.</li>
              <li>Results are compared with the supplier's history to catch outliers and copied values.</li>
              <li>The reviewer records a decision, and supplier performance updates automatically.</li>
            </ol></div>
          </div>
          <div class="consequence">
            <div><b>Production holds</b>Material released, then stopped when the deviation is found on the line.</div>
            <div><b>Scrapped batches</b>Finished product made with an out-of-spec ingredient.</div>
            <div><b>Complaints</b>Quality issues that reach customers before QA sees them.</div>
            <div><b>Recalls</b>The most expensive outcome of a missed result.</div>
          </div>
        </div>
      </section>

      <section class="block alt" id="product">
        <div class="wrap">
          <div class="sec-head">
            <div><span class="eyebrow">Product</span><h2 class="title">From PDF pile to <em>release decision</em>.</h2></div>
            <p class="lede">Six capabilities that work together on every incoming lot — from reading the certificate to tracking the supplier over time.</p>
          </div>
          <div class="features">
            ${featureCard(f[0], true)}${featureCard(f[1], true)}
            ${featureCard(f[2])}${featureCard(f[3])}${featureCard(f[4])}
          </div>
          <div style="margin-top:18px" class="features">${featureCard(f[5], true)}
            <article class="feature wide" style="background:var(--ink);color:#e9ece6;border-color:var(--ink)">
              <span class="eyebrow" style="color:var(--mark)">On the roadmap</span>
              <ul class="check-list" style="margin-top:4px">${B.roadmap.map((r) => `<li style="border-color:rgba(255,255,255,.15)">${esc(r)}</li>`).join("")}</ul>
            </article>
          </div>
        </div>
      </section>

      <section class="block dark" id="how">
        <div class="wrap">
          <div class="sec-head">
            <div><span class="eyebrow">How it works</span><h2 class="title" style="color:#fff">Four steps, one record.</h2></div>
            <p class="lede">The same workflow for every certificate, whichever supplier or lab produced it.</p>
          </div>
          <div class="flow">
            <div class="step"><h3>Receive</h3><p>Paste or upload the supplier's certificate and choose the material specification.</p><div class="io">.txt · .csv · pasted text</div></div>
            <div class="step"><h3>Extract</h3><p>Supplier, product, lot, dates, signatory and every result with its unit are pulled out and normalised.</p><div class="io">3.8 × 10⁴ → 38,000 cfu/g</div></div>
            <div class="step"><h3>Check</h3><p>Each result is compared with your limits and with the supplier's previous lots.</p><div class="io">limits · completeness · history</div></div>
            <div class="step"><h3>Decide</h3><p>Release, hold or reject with a note. The report and supplier record update automatically.</p><div class="io">accept · hold · reject</div></div>
          </div>
        </div>
      </section>

      <section class="block" id="solutions">
        <div class="wrap">
          <div class="sec-head">
            <div><span class="eyebrow">Solutions</span><h2 class="title">Built for the people who <em>sign off</em> materials.</h2></div>
            <p class="lede">CertiSift fits between goods-in and production, where quality, procurement and the lab meet.</p>
          </div>
          <div class="roles">${roles.map(([t, d]) => `<div class="role"><h3>${t}</h3><p>${d}</p></div>`).join("")}</div>
          <div class="industries">
            <div class="ind primary"><span class="eyebrow" style="color:var(--mark)">Starting with</span><h3>${esc(B.targetCustomers.beachhead)}</h3><p class="muted">Flour, dairy powders, cocoa, sugar, oils and other ingredients that arrive with a CoA on every lot and are tested for moisture, composition, contaminants and pathogens.</p></div>
            <div class="ind"><span class="eyebrow">Next</span><h3>Wider manufacturing</h3><ul>${B.targetCustomers.expansion.map((e) => `<li>${esc(e)}</li>`).join("")}</ul></div>
          </div>
        </div>
      </section>

      <section class="block alt" id="technology">
        <div class="wrap">
          <div class="sec-head">
            <div><span class="eyebrow">Technology</span><h2 class="title">A verification engine today. <em>AWS</em> at scale.</h2></div>
            <p class="lede">The matching and anomaly engine runs now. The production platform is designed for AWS, with document AI for scanned certificates.</p>
          </div>
          <div class="tech-grid">
            <div class="tech-card">
              <span class="badge implemented">Running now</span>
              <h3 style="margin-top:12px">Verification engine</h3>
              <p class="muted" style="margin:0">Runs in the browser in the current product.</p>
              <ul class="check-list">
                <li>Header extraction: supplier, product, lot, dates, signatory</li>
                <li>Result parsing incl. scientific notation, “&lt;10”, decimal commas, “Not detected”</li>
                <li>Parameter aliases and unit equivalence (ppb ↔ µg/kg, ppm ↔ mg/kg)</li>
                <li>Range, min, max and qualitative limits with near-limit warnings</li>
                <li>Outlier, lot-reuse and copied-value detection against supplier history</li>
              </ul>
            </div>
            <div class="tech-card">
              <span class="badge proposed">Planned architecture</span>
              <h3 style="margin:12px 0 14px">Production platform on AWS</h3>
              ${CS.archSvg()}
              <p class="muted" style="font-size:13.5px;margin:12px 0 0">Amazon Textract and Amazon Bedrock will handle scanned and unfamiliar certificate layouts. AWS Step Functions and Lambda will run the workflow, with S3, DynamoDB, Cognito and KMS for storage, identity and encryption.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="block" id="pricing">
        <div class="wrap">
          <div class="sec-head">
            <div><span class="eyebrow">Pricing</span><h2 class="title">Start with a pilot on <em>your</em> materials.</h2></div>
            <p class="lede">Plans are scoped with each early customer around sites, materials and certificate volume.</p>
          </div>
          <div class="plans">${B.pricing.plans.map((p, i) => `
            <div class="plan ${i === 0 ? "featured" : ""}">
              <h3>${esc(p.name)}</h3><div class="for">${esc(p.for)}</div>
              <div class="price">${i === 0 ? "Scoped per pilot" : "Quoted per site"}</div>
              <ul>${p.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
              <a class="btn ${i === 0 ? "btn-primary" : "btn-ghost"}" href="#/s/contact" data-interest="${esc(p.name)}">${i === 0 ? "Discuss a pilot" : "Contact sales"}</a>
            </div>`).join("")}
          </div>
        </div>
      </section>

      ${B.founders.length ? `<section class="block alt" id="team"><div class="wrap"><span class="eyebrow">Team</span><h2 class="title">The people behind ${esc(B.name)}</h2><div class="grid g3">${B.founders.map((p) => `<div class="card"><h2>${esc(p.name)}</h2><p class="sub">${esc(p.title)}</p>${p.linkedin ? `<a href="${esc(p.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>` : ""}</div>`).join("")}</div></div></section>` : ""}

      <section class="block alt" id="faq">
        <div class="wrap"><span class="eyebrow">Questions</span><h2 class="title">Straight answers.</h2>
          <div class="faq">${faqs.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("")}</div>
        </div>
      </section>

      <section class="block" id="contact">
        <div class="wrap contact-grid">
          <div>
            <span class="eyebrow">Contact</span>
            <h2 class="title">Tell us about your incoming materials.</h2>
            <p class="lede">Which materials, how many certificates a week, and how you review them today. We'll come back with whether a pilot makes sense.</p>
            <ul class="check-list" style="max-width:420px">
              <li>Bring two or three real certificates and the matching specifications</li>
              <li>We set them up in a workspace and run them together</li>
              <li>You decide whether the results are useful before anything else</li>
            </ul>
          </div>
          <form class="form card" id="contact-form" novalidate>
            <div class="row2">
              <label class="f">Name<input name="name" required autocomplete="name"></label>
              <label class="f">Company<input name="company" required autocomplete="organization"></label>
            </div>
            <div class="row2">
              <label class="f">Work email<input name="email" type="email" required autocomplete="email"></label>
              <label class="f">Interested in<select name="interest"><option>Pilot</option><option>Site</option><option>Multi-site</option><option>Product demo</option><option>Partnership</option></select></label>
            </div>
            <label class="f">What do you need to verify?<textarea name="message" required placeholder="e.g. Flour and dairy powders, about 40 certificates a week, reviewed manually against Excel specs."></textarea></label>
            <div id="contact-msg" aria-live="polite"></div>
            <button class="btn btn-primary" type="submit">Send request</button>
          </form>
        </div>
      </section>

      <div class="wrap"><div class="cta-band">
        <h2>See your next certificate checked in seconds.</h2>
        <div class="btns"><button class="btn btn-primary" data-act="sample-verify">Open the sample workspace</button><a class="btn btn-ghost" href="#/signup">Create an account</a></div>
      </div></div>
    </main>
    ${footer()}`;
  }

  function bindHome(root) {
    const form = root.querySelector("#contact-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const d = Object.fromEntries(new FormData(form));
        const msg = root.querySelector("#contact-msg");
        const bad = !d.name.trim() || !d.company.trim() || !/^\S+@\S+\.\S+$/.test(d.email) || !d.message.trim();
        if (bad) { msg.innerHTML = `<div class="form-msg err">Please complete every field with a valid work email.</div>`; return; }
        CS.store.addInbox(d);
        form.reset();
        msg.innerHTML = `<div class="form-msg ok">Thanks, ${esc(d.name.split(" ")[0])}. Your request has been recorded.</div>`;
      });
      root.querySelectorAll("[data-interest]").forEach((a) => a.addEventListener("click", () => { setTimeout(() => { const s = form.querySelector("select"); s.value = a.dataset.interest; }, 50); }));
    }
  }

  function authShell(inner) {
    return `<div class="auth">
      <aside class="auth-side">${logo("#/", true)}<blockquote>Release decisions backed by evidence, not a skim-read PDF.</blockquote><p class="muted" style="color:#b9c3be;font-size:14px;margin:0">Accounts and workspaces are stored in this browser.</p></aside>
      <main class="auth-main"><div class="auth-box">${inner}</div></main>
    </div>`;
  }

  function signin() {
    return authShell(`
      <a href="#/" class="btn-link" style="font-size:14px">← Back to site</a>
      <h1 style="margin-top:22px">Sign in</h1><p class="muted">Welcome back to your verification workspace.</p>
      <form class="form" id="auth-form" style="margin-top:22px" novalidate>
        <label class="f">Email<input name="email" type="email" required autocomplete="email"></label>
        <label class="f">Password<input name="password" type="password" required autocomplete="current-password"></label>
        <div id="auth-msg" aria-live="polite"></div>
        <button class="btn btn-primary" type="submit">Sign in</button>
      </form>
      <div class="divider">or</div>
      <button class="btn btn-ghost" style="width:100%" data-act="sample">Explore the sample workspace</button>
      <p class="muted" style="font-size:14px;margin-top:22px">New to CertiSift? <a href="#/signup">Create an account</a></p>`);
  }

  function signup() {
    return authShell(`
      <a href="#/" class="btn-link" style="font-size:14px">← Back to site</a>
      <h1 style="margin-top:22px">Get started</h1><p class="muted">Create a workspace with ready-made flour, milk powder and cocoa specifications.</p>
      <form class="form" id="auth-form" data-mode="signup" style="margin-top:22px" novalidate>
        <div class="row2"><label class="f">Name<input name="name" required autocomplete="name"></label><label class="f">Company<input name="company" autocomplete="organization"></label></div>
        <label class="f">Work email<input name="email" type="email" required autocomplete="email"></label>
        <label class="f">Password<input name="password" type="password" required minlength="8" autocomplete="new-password"><small class="muted" style="font-weight:400">At least 8 characters</small></label>
        <div id="auth-msg" aria-live="polite"></div>
        <button class="btn btn-primary" type="submit">Create workspace</button>
      </form>
      <div class="divider">or</div>
      <button class="btn btn-ghost" style="width:100%" data-act="sample">Explore the sample workspace</button>
      <p class="muted" style="font-size:14px;margin-top:22px">Already have an account? <a href="#/signin">Sign in</a></p>`);
  }

  function bindAuth(root) {
    const form = root.querySelector("#auth-form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(form));
      const msg = root.querySelector("#auth-msg");
      try {
        if (form.dataset.mode === "signup") {
          if (!d.name.trim() || !/^\S+@\S+\.\S+$/.test(d.email)) throw new Error("Enter your name and a valid email.");
          if ((d.password || "").length < 8) throw new Error("Password must be at least 8 characters.");
          await CS.store.signUp(d);
        } else {
          if (!d.email || !d.password) throw new Error("Enter your email and password.");
          await CS.store.signIn(d.email, d.password);
        }
        location.hash = "#/app";
      } catch (err) { msg.innerHTML = `<div class="form-msg err">${esc(err.message)}</div>`; }
    });
  }

  function legal(kind) {
    const body = kind === "privacy"
      ? `<h1>Privacy</h1><p class="muted">How this website and the current CertiSift product handle data.</p>
         <h2>Website and workspace</h2><p>Accounts, specifications, certificates and verification results you create are stored in your own browser's local storage. They are not sent to CertiSift servers. Clearing your browser data, or using “Delete account” in your profile, removes them.</p>
         <h2>Contact requests</h2><p>Information submitted through the contact form is used only to respond to your enquiry.</p>
         <h2>Fonts</h2><p>Typefaces are loaded from Google Fonts, which receives standard request information such as your IP address.</p>
         <h2>Future platform</h2><p>When the hosted platform launches, this notice will be updated to describe hosting location, processors, retention and your rights before any customer data is processed.</p>`
      : `<h1>Terms of use</h1><p class="muted">Terms for using the CertiSift website and demo workspace.</p>
         <h2>Decision support</h2><p>CertiSift highlights results that may not meet a specification. It does not replace the judgement of qualified quality personnel, and release decisions remain the responsibility of the user.</p>
         <h2>Sample data</h2><p>Suppliers, lots and results in the sample workspace are fictional and provided for demonstration only.</p>
         <h2>Availability</h2><p>The product is under active development. Features may change, and no service-level commitment applies to the demo.</p>`;
    return `${header()}<main class="wrap legal">${body}</main>${footer()}`;
  }

  CS.site = { home, bindHome, signin, signup, bindAuth, legal, header, footer };
})();
