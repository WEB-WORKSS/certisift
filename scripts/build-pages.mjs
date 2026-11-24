// Generates every public HTML page from src/data/business.js and the templates in src/site.js.
// Run `node scripts/build-pages.mjs` after changing copy or business facts, then commit the generated files.
// Pages are static HTML (crawlable without JavaScript). src/page.js adds the mobile menu;
// src/contact.js adds the early-access form behaviour. The live demo is demo.html.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = fileURLToPath(new URL("..", import.meta.url));
const ctx = { window: {}, console };
ctx.window = ctx; ctx.CS = {};
vm.createContext(ctx);
for (const f of ["src/data/business.js", "src/ui.js", "src/site.js"]) vm.runInContext(readFileSync(root + f, "utf8"), ctx, { filename: f });
const { business: B, ui, site } = ctx.CS;
const { esc, logo, icon } = ui;
const archSvg = ctx.CS.archSvg;

const SITE = `https://www.${B.domain.value}`;
const EMAIL = B.email.value;
const YEAR = B.foundingYear.value;

// ---------------------------------------------------------------- chrome
const NAV = [["product", "Product"], ["how-it-works", "How it works"], ["solutions", "Solutions"], ["technology", "Technology"], ["security", "Security"], ["pricing", "Pricing"], ["about", "Team"]];

function header(current) {
  const links = NAV.map(([h, l]) => `<a href="${h}"${current === h ? ' aria-current="page"' : ""}>${l}</a>`).join("");
  const ctas = `<a class="btn btn-ghost btn-sm" href="demo">Live demo</a><a class="btn btn-primary btn-sm" href="contact">Request early access</a>`;
  return `
  <header class="site-header" id="top">
    <div class="wrap nav">
      ${logo("./")}
      <nav class="nav-links" aria-label="Main">${links}</nav>
      <div class="nav-cta">${ctas}</div>
      <button class="nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu" data-menu>${icon("menu")}</button>
    </div>
    <div class="mobile-menu" id="mobile-menu">${links}<div class="btns">${ctas}</div></div>
  </header>`;
}

function footer() {
  return `
  <footer class="site-footer">
    <div class="wrap">
      <div class="foot-grid foot-grid-5">
        <div>${logo("./")}<p class="muted" style="max-width:34ch;margin-top:14px;font-size:15px">${esc(B.shortPitch)}</p>${EMAIL ? `<a href="mailto:${esc(EMAIL)}">${esc(EMAIL)}</a>` : ""}${B.headquarters.value ? `<p class="muted">${esc(B.headquarters.value)}</p>` : ""}</div>
        <div><h4>Product</h4><a href="product">Platform overview</a><a href="how-it-works">How it works</a><a href="demo">Live demo</a><a href="pricing">Pricing</a><a href="about#roadmap">Roadmap</a></div>
        <div><h4>Solutions</h4><a href="solutions#qa-managers">QA managers</a><a href="solutions#incoming-goods">Incoming-goods QA</a><a href="solutions#supplier-quality">Supplier quality</a><a href="solutions#procurement">Procurement</a></div>
        <div><h4>Company</h4><a href="about">About &amp; team</a><a href="technology">Technology (AWS)</a><a href="security">Security &amp; safeguards</a><a href="contact#faq">FAQ</a><a href="contact">Contact</a>${B.linkedin.value ? `<a href="${esc(B.linkedin.value)}" rel="noopener">LinkedIn</a>` : ""}</div>
        <div><h4>Legal</h4><a href="privacy">Privacy Policy</a><a href="terms">Terms of Service</a></div>
      </div>
      <div class="foot-base"><span>© ${B.copyrightYear} ${esc(B.name)} · ${esc(B.domain.value)}</span><span>Early access open · The live demo uses sample data.</span></div>
    </div>
  </footer>`;
}

function page({ path, title, description, body, current = "", scripts = ["src/page.js"] }) {
  const url = `${SITE}/${path}`;
  const org = {
    "@context": "https://schema.org", "@type": "Organization", name: B.name, url: SITE, logo: `${SITE}/assets/favicon.svg`,
    description: B.positioning, slogan: B.tagline, foundingDate: String(YEAR),
    founder: B.founders.map((f) => ({ "@type": "Person", name: f.name, jobTitle: f.title })),
    ...(EMAIL ? { email: EMAIL } : {}), ...(B.linkedin.value ? { sameAs: [B.linkedin.value] } : {}),
  };
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  ${path === "404" ? '<meta name="robots" content="noindex">\n  <base href="/">' : `<link rel="canonical" href="${url}">`}
  <meta name="theme-color" content="#12211f">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${B.name}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${url}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="src/styles.css">
  <script type="application/ld+json">${JSON.stringify(org)}</script>
</head>
<body>
  <a href="#main" class="sr-only">Skip to content</a>
${header(current)}
  <main id="main">
${body}
  </main>
${footer()}
${scripts.map((s) => `  <script src="${s}" defer></script>`).join("\n")}
</body>
</html>
`;
}

const intro = (eyebrow, title, lede, extra = "") => `
    <section class="page-intro"><div class="wrap">
      <span class="eyebrow">${eyebrow}</span>
      <h1>${title}</h1>
      ${lede ? `<p class="lede">${lede}</p>` : ""}
      ${extra}
    </div></section>`;
const head = (eyebrow, title, lede = "", dark = false) => `
        <div class="sec-head">
          <div><span class="eyebrow">${eyebrow}</span><h2 class="title"${dark ? ' style="color:#fff"' : ""}>${title}</h2></div>
          ${lede ? `<p class="lede">${lede}</p>` : "<span></span>"}
        </div>`;
const ctas = `<div class="hero-ctas"><a class="btn btn-primary" href="contact">Request early access</a><a class="btn btn-ghost" href="demo#/try">Try it on a sample certificate</a></div>`;

// ---------------------------------------------------------------- sections
const hero = () => `
    <section class="hero">
      <div class="wrap hero-grid">
        <div>
          <span class="status-chip"><i></i>Early access open · pilots on one production site</span>
          <h1>Every supplier certificate, <span class="hl">checked against <em>your</em> spec</span> before the lot is released.</h1>
          <p class="lede">CertiSift reads Certificates of Analysis, compares every result with your own specification and flags out-of-spec, missing and suspicious values, so food manufacturers release incoming materials on evidence, not a skim-read PDF.</p>
          ${ctas}
          <p class="hero-note">Supplier quality verification software for food and beverage manufacturers. The live demo runs in your browser on fictional sample data, with no sign-up.</p>
        </div>
        ${site.heroCert()}
      </div>
    </section>
    <div class="strip"><div class="wrap strip-grid">
      <div class="strip-item"><div class="k">4 limit types</div><p>Ranges, minimums, maximums and pathogen absence for every parameter.</p></div>
      <div class="strip-item"><div class="k">History-aware</div><p>Outliers and copied values flagged against each supplier's previous lots.</p></div>
      <div class="strip-item"><div class="k">One record per lot</div><p>Every check, verdict and reviewer note in a printable report.</p></div>
      <div class="strip-item"><div class="k">Your specs</div><p>Checks run on your specifications and your suppliers' naming.</p></div>
    </div></div>`;

const STATS = [
  { v: "$10–15B", t: "estimated yearly cost of food fraud to the global food industry, which the FDA says affects about 1% of it.", s: "US FDA, Economically Motivated Adulteration", href: "https://www.fda.gov/food/compliance-enforcement-food/economically-motivated-adulteration-food-fraud" },
  { v: "2–15%", t: "of annual revenue lost after a single economically motivated adulteration incident, by company size, in a GMA estimate.", s: "GMA / A.T. Kearney, via Manufacturing.net", href: "https://www.manufacturing.net/article/2012/09/economically-motivated-adulteration-your-brand-risk" },
  { v: "21 CFR 117.410", t: "lists sampling and testing and review of supplier food safety records as supplier verification activities under the FDA preventive controls rule.", s: "US Code of Federal Regulations", href: "https://www.law.cornell.edu/cfr/text/21/117.410" },
];

const problem = () => `
    <section class="block" id="problem">
      <div class="wrap">
        ${head("The problem", esc(B.problem.headline), "Every incoming lot depends on a document someone has to read carefully. Under time pressure, that review is the first thing to slip.")}
        <div class="ledger">
          <div><h3>Today · manual review</h3><ol>${B.problem.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ol></div>
          <div><h3>With CertiSift</h3><ol>
            <li>The certificate is parsed the moment it arrives: supplier, lot, dates and every result with its unit.</li>
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
        <div class="stats">${STATS.map((x) => `<figure class="stat"><p class="stat-v">${x.v}</p><figcaption>${x.t}</figcaption><a href="${x.href}" target="_blank" rel="noopener noreferrer">Source: ${x.s} ↗</a></figure>`).join("")}</div>
        <p class="stat-note">Published third-party figures and regulations describing the wider food industry. They are not CertiSift results.</p>
      </div>
    </section>`;

const product = () => {
  const f = B.features;
  return `
    <section class="block alt" id="product">
      <div class="wrap">
        ${head("Product", "From PDF pile to <em>release decision</em>.", "Six capabilities that work together on every incoming lot, from reading the certificate to tracking the supplier over time. All six can be tried in the live demo today.")}
        <div class="features">
          ${site.featureCard(f[0], true)}${site.featureCard(f[1], true)}
          ${site.featureCard(f[2])}${site.featureCard(f[3])}${site.featureCard(f[4])}
        </div>
        <div style="margin-top:18px" class="features">${site.featureCard(f[5], true)}
          <article class="feature wide" style="background:var(--ink);color:#e9ece6;border-color:var(--ink)">
            <span class="eyebrow" style="color:var(--mark)">On the roadmap</span>
            <ul class="check-list" style="margin-top:4px">${B.roadmap.map((r) => `<li style="border-color:rgba(255,255,255,.15)">${esc(r)}</li>`).join("")}</ul>
          </article>
        </div>
      </div>
    </section>`;
};

const how = () => `
    <section class="block dark" id="how">
      <div class="wrap">
        ${head("How it works", "Four steps, one record.", "The same workflow for every certificate, whichever supplier or lab produced it.", true)}
        <div class="flow">
          <div class="step"><h3>Receive</h3><p>Paste or upload the supplier's certificate and choose the material specification.</p><div class="io">.txt · .csv · pasted text</div></div>
          <div class="step"><h3>Extract</h3><p>Supplier, product, lot, dates, signatory and every result with its unit are pulled out and normalised.</p><div class="io">3.8 × 10⁴ → 38,000 cfu/g</div></div>
          <div class="step"><h3>Check</h3><p>Each result is compared with your limits and with the supplier's previous lots.</p><div class="io">limits · completeness · history</div></div>
          <div class="step"><h3>Decide</h3><p>Release, hold or reject with a note. The report and supplier record update automatically.</p><div class="io">accept · hold · reject</div></div>
        </div>
      </div>
    </section>`;

const ROLES = [
  ["qa-managers", "QA managers", "Set the specifications once and get consistent release decisions from every reviewer, with a record for audits.", "Define each material's limits and the names suppliers use, then review held lots and sign off reports."],
  ["incoming-goods", "Incoming-goods QA", "Check a certificate in the time it takes to open it, and see exactly which line needs attention.", "Paste or upload each certificate at goods-in and release, hold or reject with a note."],
  ["supplier-quality", "Supplier quality", "See which suppliers drift, which parameters fail repeatedly, and back corrective-action requests with data.", "Use each supplier's pass rate, recurring failures and trends in supplier reviews."],
  ["procurement", "Procurement", "Bring quality history into supplier reviews and sourcing decisions, not just price and lead time.", "Compare suppliers of the same material on their certificate record before renewing contracts."],
];
const solutions = (full = false) => `
    <section class="block" id="solutions">
      <div class="wrap">
        ${head("Solutions", "Built for the people who <em>sign off</em> materials.", "CertiSift fits between goods-in and production, where quality, procurement and the lab meet.")}
        <div class="roles">${ROLES.map(([id, t, d, u]) => `<div class="role" id="${id}"><h3>${t}</h3><p>${d}</p>${full ? `<p class="role-use"><b>How they use it:</b> ${u}</p>` : ""}</div>`).join("")}</div>
        <div class="industries">
          <div class="ind primary"><span class="eyebrow" style="color:var(--mark)">Starting with</span><h3>${esc(B.targetCustomers.beachhead)}</h3><p class="muted">Flour, dairy powders, cocoa, sugar, oils and other ingredients that arrive with a CoA on every lot and are tested for moisture, composition, contaminants and pathogens.</p></div>
          <div class="ind"><span class="eyebrow">Next</span><h3>Wider manufacturing</h3><ul>${B.targetCustomers.expansion.map((e) => `<li>${esc(e)}</li>`).join("")}</ul></div>
        </div>
        ${full ? "" : `<p class="more"><a href="solutions">How each team uses CertiSift →</a></p>`}
      </div>
    </section>`;

const COLS = ["Manual PDF review", "Excel checklists", "LIMS / ERP", B.name];
const ROWS = [
  ["Reads every result on the certificate", "If there's time", "Retyped by hand", "Only results entered", "Extracted automatically"],
  ["Handles supplier naming and units", "Reviewer's memory", "No", "Fixed codes", "Aliases and unit equivalence"],
  ["Near-limit and missing-test warnings", "Rarely", "Only if built in", "Partial", "Every check"],
  ["Spots copied values and reused lot numbers", "No", "No", "No", "Against supplier history"],
  ["Supplier performance over time", "No", "Separate spreadsheet", "Partial", "Updated with every lot"],
  ["Audit record of the decision", "Initials on a PDF", "A cell in a sheet", "Release status", "Every check, verdict and note"],
];
const compare = () => `
    <section class="block alt" id="compare">
      <div class="wrap">
        ${head(`Why ${B.name}`, "How it compares with the way certificates are checked today.", `${B.name} works alongside your specifications, your lab and your ERP. It gives reviewers one consistent check of every certificate.`)}
        <div class="cmp"><table>
          <caption class="sr-only">Comparison of certificate review methods</caption>
          <thead><tr><th scope="col">Capability</th>${COLS.map((c, i) => `<th scope="col"${i === 3 ? ' class="us"' : ""}>${c}</th>`).join("")}</tr></thead>
          <tbody>${ROWS.map(([k, ...v]) => `<tr><th scope="row">${k}</th>${v.map((x, i) => `<td${i === 3 ? ' class="us"' : ""}>${x}</td>`).join("")}</tr>`).join("")}</tbody>
        </table></div>
      </div>
    </section>`;

const ai = () => `
    <section class="block" id="ai">
      <div class="wrap ai-grid">
        <div>
          <span class="eyebrow">AI, used carefully</span>
          <h2 class="title">The rules decide. The AI reads and explains.</h2>
          <p class="lede">Pass, warn and fail come from your specification and deterministic checks you can trace. AI is used to read difficult documents and explain findings, and your reviewer makes every release decision.</p>
          <div class="ai-lists">
            <div><p class="ai-k good">What the AI does</p><ul>${["Reads scanned PDFs and images (planned, with Amazon Textract)", "Interprets unfamiliar certificate layouts and maps parameter names (planned, with Amazon Bedrock)", "Explains why a lot was flagged and lists the checks behind it", "Suggests a note for the reviewer to edit"].map((x) => `<li>${x}</li>`).join("")}</ul></div>
            <div><p class="ai-k bad">What it never does</p><ul>${["Release, hold or reject a lot", "Change your specification limits", "Fill in a missing test result", "Use one customer's certificates to answer another's questions"].map((x) => `<li>${x}</li>`).join("")}</ul></div>
          </div>
        </div>
        <div class="ai-chat card">
          <div class="ai-head"><b>Ask about this lot</b><span class="badge sample">Sample data</span></div>
          <p class="ai-q">Why was lot AGP-7781-B flagged?</p>
          <div class="ai-a"><p>Two findings. <b>Aflatoxin B1</b> is 3.4 µg/kg against your maximum of 2.0 µg/kg, so it fails the Wheat Flour Type 550 specification. <b>Moisture</b> is 14.4% against a 14.5% maximum, which passes but is within the near-limit band.</p><p class="ai-src">From: certificate AGP-7781-B · spec Wheat Flour Type 550 v3</p></div>
          <p class="ai-q">Can we release it if the supplier sends a new certificate?</p>
          <div class="ai-a"><p>That's your reviewer's decision. I can check the new certificate against the same specification and show what changed.</p></div>
          <a class="btn btn-ghost btn-sm" href="demo#/try">Check a sample certificate in the demo</a>
        </div>
      </div>
    </section>`;

const SAFE = [
  ["Every verdict is traceable", "Each result shows the extracted value, the specification limit and the check that produced pass, warn or fail."],
  ["People make the call", "The release decision and the note behind it always belong to a named reviewer."],
  ["Missing is never a pass", "A test that the specification requires but the certificate lacks is flagged as missing."],
  ["Supplier data kept separate", "The architecture isolates each customer's certificates and encrypts them with customer-managed keys."],
  ["Roles, enforced", "Reviewers, QA managers and auditors each get only the actions they need. Production enforces roles on the server."],
  ["Everything recorded", "Verifications, decisions and specification changes are kept in the workspace record and exportable for audits."],
];
const safeguards = (link = true) => `
    <section class="block alt" id="safeguards">
      <div class="wrap">
        ${head("Safeguards", "Built for QA teams that have to sign the release.")}
        <div class="safe-grid">${SAFE.map(([t, d]) => `<div class="safe-item"><h3>${t}</h3><p>${d}</p></div>`).join("")}</div>
        ${link ? `<p class="more"><a href="security">Security and safeguards in detail →</a></p>` : ""}
      </div>
    </section>`;

const STAGES = [
  ["01", "Data collection", ["Amazon API Gateway", "Amazon S3"], "QA users upload certificates and specifications through an authenticated API."],
  ["02", "Secure storage", ["Amazon S3", "AWS KMS", "Amazon DynamoDB"], "Certificates encrypted with customer-managed keys; specifications, suppliers and results stored per tenant."],
  ["03", "Processing", ["AWS Step Functions", "AWS Lambda"], "Orchestrates extract → interpret → match → report, and runs specification matching and anomaly checks."],
  ["04", "AI intelligence", ["Amazon Textract", "Amazon Bedrock"], "Reads scanned and PDF certificates, interprets unfamiliar layouts and explains findings."],
  ["05", "Application experience", ["Amazon Cognito", "Amazon CloudWatch"], "Sign-in with tenant isolation and roles; logs, metrics and alerts behind the web app."],
];
const awsSection = (link = true) => `
    <section class="block" id="technology">
      <div class="wrap">
        ${head("Technology", "How We Use Amazon Web Services", "CertiSift's production platform is designed as a serverless workflow on AWS: certificates go into encrypted storage, Amazon Textract and Amazon Bedrock turn scanned and unfamiliar layouts into structured results, and AWS Lambda checks them against your specification. Today the verification engine runs in the browser in the live demo.")}
        <ol class="pipeline">${STAGES.map(([n, t, s, d]) => `<li class="pipe"><span class="pipe-n">${n}</span><h3>${t}</h3><p>${d}</p><div class="pipe-svcs">${s.map((x) => `<span>${x}</span>`).join("")}</div></li>`).join("")}</ol>
        <p class="pipe-note">These services are proposed, not yet deployed. The live demo runs in your browser on sample data.${link ? ` <a href="technology">The full architecture →</a>` : ""}</p>
        <ul class="svc-list">${B.aws.map((a) => `<li><b>${esc(a.service)}:</b> ${esc(a.purpose)}</li>`).join("")}</ul>
      </div>
    </section>`;

const techDetail = () => `
    <section class="block alt">
      <div class="wrap">
        <div class="tech-grid">
          <div class="tech-card">
            <span class="badge implemented">Running now</span>
            <h3 style="margin-top:12px">Verification engine</h3>
            <p class="muted" style="margin:0">Runs in the browser in the live demo.</p>
            <ul class="check-list">
              <li>Header extraction: supplier, product, lot, dates, signatory</li>
              <li>Result parsing incl. scientific notation, “&lt;10”, decimal commas, “Not detected”</li>
              <li>Parameter aliases and unit equivalence (ppb ↔ µg/kg, ppm ↔ mg/kg)</li>
              <li>Range, min, max and qualitative limits with near-limit warnings</li>
              <li>Outlier, lot-reuse and copied-value detection against supplier history</li>
            </ul>
          </div>
          <div class="tech-card">
            <span class="badge proposed">Proposed architecture</span>
            <h3 style="margin:12px 0 14px">Production platform on AWS</h3>
            ${archSvg()}
          </div>
        </div>
        <div class="tech-detail">
          <div>
            <h2 class="sub-h">How a certificate becomes a release decision</h2>
            <ol class="dflow">${[
              ["1. Upload", "A QA user uploads a certificate through Amazon API Gateway. The file goes to Amazon S3, encrypted with the customer's AWS KMS key."],
              ["2. Extract", "AWS Step Functions starts the workflow. Amazon Textract reads text and tables, including scanned PDFs."],
              ["3. Interpret", "Amazon Bedrock maps unfamiliar layouts and parameter names to the specification. Low-confidence mappings are shown for review."],
              ["4. Check", "AWS Lambda runs specification matching and anomaly checks and stores results in Amazon DynamoDB."],
              ["5. Decide and report", "Reviewers sign in with Amazon Cognito, record release decisions and export reports. Amazon CloudWatch records logs and alerts."],
            ].map(([t, d]) => `<li><b>${t}</b><p>${d}</p></li>`).join("")}</ol>
          </div>
          <div class="side-cards">
            <div class="card"><h2>Access and encryption (as designed)</h2><ul class="check-list">${["Encryption in transit (TLS) and at rest with customer-managed AWS KMS keys", "Each customer's certificates and records partitioned by tenant", "Least-privilege IAM roles for every Lambda function", "API requests authorised with Cognito tokens and checked on the server", "Bedrock is called only with the customer's own documents; they are not used to train models"].map((x) => `<li>${x}</li>`).join("")}</ul></div>
            <div class="card"><h2>Proposed, not yet deployed</h2><p class="sub">${B.aws.map((a) => esc(a.service)).join(" · ")}</p><p class="sub" style="margin:0">Using AWS services does not by itself make ${B.name} compliant with any regulation, including 21 CFR Part 11.</p></div>
          </div>
        </div>
      </div>
    </section>`;

const securityDetail = () => `
    <section class="block">
      <div class="wrap sec-grid">${[
        ["What the demo does with data", ["The live demo runs entirely in your browser on fictional suppliers and certificates.", "Certificates and specifications you add are stored in your browser's local storage only and never sent to a server.", "You can reset the demo data at any time from Settings."]],
        ["How production will handle certificates", ["Certificates, specifications and results are stored on AWS, partitioned by customer.", "Data is encrypted in transit and at rest with customer-managed keys.", "Hosting regions are agreed with each pilot customer."]],
        ["Access and roles", ["Users sign in with Amazon Cognito; there are no shared logins.", "Reviewers, QA managers and auditors each get only the actions their role needs.", "Roles are enforced on the server, not only in the interface."]],
        ["How the AI is constrained", ["Pass, warn and fail come from deterministic checks against your specification.", "AI only reads documents, maps unfamiliar layouts and explains findings.", "Release decisions are always recorded by a named reviewer."]],
        ["Audit trail", ["Every verification keeps the original certificate text, each check, the verdict and the reviewer's note.", "Reports and CSV exports are available for audits."]],
        ["What isn't built yet", ["The AWS document pipeline, sign-in, server-side roles and multi-user approvals are proposed, not deployed.", "No certifications are claimed, and the product is not validated for 21 CFR Part 11."]],
      ].map(([t, items]) => `<div class="card"><h2>${t}</h2><ul class="check-list">${items.map((x) => `<li>${x}</li>`).join("")}</ul></div>`).join("")}</div>
    </section>`;

const ROADMAP = [
  ["Now", "Live demo & early access", ["Verification engine: extraction, matching and anomaly checks", "Interactive live demo with sample suppliers", "Proposed AWS architecture defined", "Early-access requests open"], true],
  ["Next", "Pilot on one site", ["Your own specifications and suppliers", "Scanned PDF and image extraction with Amazon Textract", "Bedrock-assisted interpretation of unfamiliar layouts"]],
  ["Then", "General availability", ["Team workspaces with roles and approval steps", "Email-in: forward supplier CoAs to a workspace inbox", "Pricing confirmed with pilot customers"]],
  ["Later", "Exploring with pilot customers", ["ERP / LIMS integration for automatic hold and release", "Chemical and pharmaceutical manufacturers (needs GxP work)", "Supplier portal for corrected certificates"]],
];
const roadmap = () => `
    <section class="block" id="roadmap">
      <div class="wrap">
        ${head("Roadmap", `Where ${B.name} is going`, "Built with early-access QA teams. The order is our plan and may change based on what pilots teach us.")}
        <ol class="road">${ROADMAP.map(([k, t, items, on]) => `<li class="road-col${on ? " on" : ""}"><span class="road-k">${k}</span><h3>${t}</h3><ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul></li>`).join("")}</ol>
      </div>
    </section>`;

const pricing = () => `
    <section class="block" id="pricing">
      <div class="wrap">
        ${head("Pricing", "Simple plans, priced by <em>certificate volume</em>.", "Proposed launch pricing. Final pricing is set with pilot customers, and no payment is taken today.")}
        <div class="plans">${B.pricing.plans.map((p, i) => `
          <div class="plan ${i === 1 ? "featured" : ""}">
            <h3>${esc(p.name)}</h3><div class="for">${esc(p.for)}</div>
            <div class="price">${p.price.startsWith("$") ? `<b class="price-v">${p.price}</b> /month per site` : `<b class="price-v">${p.price}</b>`}</div>
            <ul>${p.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
            <a class="btn ${i === 1 ? "btn-primary" : "btn-ghost"}" href="contact?plan=${encodeURIComponent(p.name)}">${p.price === "Custom" ? "Contact us" : "Request access"}</a>
          </div>`).join("")}
        </div>
        <p class="plan-note">Proposed prices in USD, excluding taxes. Early-access customers are onboarded directly by the founder.</p>
      </div>
    </section>`;

const initials = (n) => n.split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join("");
const team = () => `
    <section class="block" id="team">
      <div class="wrap">
        ${head("Team", `The Team Behind ${B.name}`, `${B.name} is a quality-assurance software company founded in ${YEAR}. It is building supplier certificate verification software for food and beverage manufacturers.`)}
        ${B.founders.map((p, i) => `
        <figure class="founder${p.quote ? "" : " compact"}">
          <span class="eyebrow">${esc(p.role || (i ? "Co-founder" : "Founder"))}</span>
          ${p.quote ? `<blockquote>“${esc(p.quote)}”</blockquote>` : ""}
          <figcaption>
            <div class="mono-badge" aria-hidden="true">${esc(initials(p.name))}</div>
            <div><b>${esc(p.name)}</b><span>${esc(p.title)}, ${esc(B.name)} · Founded ${esc(YEAR)}</span>${p.email ? `<a href="mailto:${esc(p.email)}">${esc(p.email)}</a>` : ""}${p.linkedin ? ` <a href="${esc(p.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>` : ""}</div>
          </figcaption>
          ${p.aim ? `<div class="aim"><span>Our aim</span><p>${esc(p.aim)}</p></div>` : ""}
        </figure>`).join("")}
        ${B.linkedin.value ? `<p class="company-link"><a class="btn btn-ghost btn-sm" href="${esc(B.linkedin.value)}" target="_blank" rel="noopener">Follow ${esc(B.name)} on LinkedIn ↗</a></p>` : ""}
        <dl class="facts">${[["Founded", YEAR], ["Category", "Supplier quality software"], ["Stage", "Building initial product"], ["Company type", B.companyType.value]].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
        <div class="hear card"><span class="eyebrow">We'd like to hear from</span><ul>${["Food and beverage sites willing to pilot", "QA and supplier quality managers", "Advisors who know food safety and supplier assurance"].map((x) => `<li>${x}</li>`).join("")}</ul></div>
      </div>
    </section>`;

const FAQS = [
  ["Is CertiSift available today?", "CertiSift is building its initial product. The live demo runs the verification engine in your browser on text-based certificates and fictional suppliers. Early-access requests are open for pilots with food and beverage QA teams."],
  ["Which documents can it read?", "Today: certificates as plain text or CSV, pasted or uploaded. Scanned PDFs and images will be handled through Amazon Textract in the production platform."],
  ["What does the AI do?", "In the planned platform, Amazon Textract reads scanned certificates and Amazon Bedrock interprets unfamiliar layouts and explains findings. Pass, warn and fail come from deterministic checks against your specification, not from the AI."],
  ["Does it replace our QA team's judgement?", "No. CertiSift does the line-by-line comparison and highlights what needs attention. The release decision, and the note explaining it, stay with your reviewer."],
  ["Who can change what?", "QA managers own specifications, reviewers record release decisions, and auditors get read-only access. In the demo roles are not enforced; in production they are enforced on the server."],
  ["Can we use our own specifications?", "Yes. Specifications are set up per material with ranges, minimums, maximums, pathogen requirements and the parameter names your suppliers use."],
  ["How much does it cost?", "Proposed launch pricing starts at $149 a month for one site. Final pricing is set with pilot customers, and no payment is taken today. See the Pricing page."],
  ["Where is our data stored?", "In the demo, everything stays in your own browser's local storage. The production platform is designed for encrypted storage on AWS, with customer data separated by tenant."],
];
const faq = () => `
    <section class="block alt" id="faq">
      <div class="wrap"><span class="eyebrow">Questions</span><h2 class="title">Questions QA teams ask.</h2>${EMAIL ? `<a class="btn btn-ghost btn-sm" href="mailto:${esc(EMAIL)}">Email the founder</a>` : ""}
        <div class="faq">${FAQS.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("")}</div>
      </div>
    </section>`;

const ctaBand = () => `
    <div class="wrap"><div class="cta-band">
      <h2>See your next certificate checked in seconds.</h2>
      <div class="btns"><a class="btn btn-primary" href="contact">Request early access</a><a class="btn btn-ghost" href="demo#/try">Explore the live demo</a></div>
    </div></div>`;

const contact = () => `
    <section class="block" id="contact">
      <div class="wrap contact-grid">
        <div>
          <span class="eyebrow">Early access</span>
          <h1 class="title">Request early access</h1>
          <p class="lede">Early-access teams get a pilot on one production site, a direct line to the founder and a say in what we build next. Tell us which materials you receive and how you review certificates today.</p>
          ${EMAIL ? `<p><a class="btn btn-ghost" href="mailto:${esc(EMAIL)}">${esc(EMAIL)}</a></p>` : ""}
          <div class="card" style="margin-top:18px"><h2>What happens next</h2><ol class="next">
            <li>The founder replies to arrange a short call.</li>
            <li>Bring two or three real certificates and the matching specifications; we run them together.</li>
            <li>If the results are useful, we scope a pilot on one site.</li>
          </ol></div>
          <p class="muted" style="font-size:14px;margin-top:14px">No commitment: a request is not a subscription. Please don't attach confidential certificates to this form.</p>
        </div>
        <form class="form card" novalidate data-lead-form>
          <div class="hp" aria-hidden="true"><label>Leave this field empty<input name="website" tabindex="-1" autocomplete="off"></label></div>
          <div class="row2">
            <label class="f">Full name *<input name="name" required autocomplete="name"><span class="err" data-err="name"></span></label>
            <label class="f">Work email *<input name="email" type="email" required autocomplete="email"><span class="err" data-err="email"></span></label>
          </div>
          <div class="row2">
            <label class="f">Company *<input name="company" required autocomplete="organization"><span class="err" data-err="company"></span></label>
            <label class="f">Role<input name="role" autocomplete="organization-title" placeholder="e.g. QA manager"></label>
          </div>
          <div class="row2">
            <label class="f">Company size *<select name="size" required><option value="">Select…</option><option>1–50 employees</option><option>51–200 employees</option><option>201–1,000 employees</option><option>1,000+ employees</option></select><span class="err" data-err="size"></span></label>
            <label class="f">Plan of interest<select name="plan"><option value="">Not sure yet</option>${B.pricing.plans.map((p) => `<option>${esc(p.name)}</option>`).join("")}</select></label>
          </div>
          <label class="f">Primary use case *<select name="use" required><option value="">Select…</option><option>Checking incoming CoAs against specifications</option><option>Supplier quality monitoring</option><option>Audit-ready release records</option><option>Detecting copied or suspicious certificates</option><option>Not sure yet</option></select><span class="err" data-err="use"></span></label>
          <label class="f">What do you need to verify? *<textarea name="message" maxlength="2000" required placeholder="e.g. Flour and dairy powders, about 40 certificates a week, reviewed manually against Excel specs."></textarea><span class="hint"><span data-count>0</span>/2000</span><span class="err" data-err="message"></span></label>
          <label class="check"><input type="checkbox" name="consent" required> I agree that ${esc(B.name)} may contact me about this request. *</label><span class="err" data-err="consent"></span>
          <button class="btn btn-primary" type="submit" data-submit>Request early access</button>
          <div class="form-status" role="status" aria-live="polite" data-status></div>
        </form>
      </div>
    </section>`;

// ---------------------------------------------------------------- legal
const contactLine = EMAIL ? `email <a href="mailto:${esc(EMAIL)}">${esc(EMAIL)}</a>` : `use the form at <a href="contact">${B.domain.value}/contact</a>`;
const legal = (title, introText, sections) => `
    <section class="wrap legal">
      <span class="eyebrow">Legal</span>
      <h1>${title}</h1>
      <p class="muted">Last updated 24 November 2026</p>
      <p>${introText}</p>
      ${sections.map(([h, items]) => `<h2>${h}</h2>${items.map((x) => Array.isArray(x) ? `<ul>${x.map((i) => `<li>${i}</li>`).join("")}</ul>` : `<p>${x}</p>`).join("")}`).join("")}
    </section>`;
const privacy = () => legal("Privacy Policy", `This policy explains what personal information ${B.name} collects through ${B.domain.value} and the ${B.name} live demo, why, and the choices you have. ${B.name} is building its initial product, so this policy describes how the website and demo work today and will be updated before customer accounts open.`, [
  ["Information we collect", [[
    "<b>Information you send us:</b> when you use the early-access form or email us, we receive your name, work email, company, role (if given), company size, plan of interest, primary use case, your message and your consent to be contacted.",
    "<b>Live demo data:</b> the demo has no accounts. Certificates, specifications and decisions you add are stored only in your own browser (local storage) and are not sent to us.",
    "<b>Technical information:</b> our hosting provider may log standard request data such as IP address, browser type and pages requested, for security and reliability.",
  ]]],
  ["How we use information", [["To reply to inquiries and early-access requests", "To operate, maintain and improve the website and product", "To meet legal obligations"], "We do not sell personal information, and we do not use form details for advertising."]],
  ["Third-party services", [["Our website host, to serve this site", "Google Fonts, for web fonts loaded from Google's servers", "Your email provider, when you choose to contact us by email", "Amazon Web Services, for the planned product infrastructure (not used to process personal information today)"]]],
  ["Retention", ["We keep inquiry emails for as long as needed to respond and follow up, and delete them on request. Retention periods for account data will be added before customer accounts open."]],
  ["Your rights", [`You can ask us to access, correct, export or delete your personal information, or object to how we use it: ${contactLine}. You can clear live-demo data at any time from the demo's Settings or by clearing your browser's site data. Depending on where you live, you may also have the right to complain to a data protection authority.`]],
  ["Changes", ["We will update this page when our practices change, and change the date above."]],
]);
const terms = () => legal("Terms of Service", `These terms apply when you use ${B.domain.value} and the ${B.name} live demo. By using them you agree to these terms. ${B.name} is building its initial product; separate commercial terms will be agreed with pilot customers.`, [
  ["Using the site and demo", ["You may use the website and live demo to evaluate CertiSift. The demo has no accounts and stores data only in your browser."]],
  ["Decision support", ["CertiSift highlights results that may not meet a specification. It does not replace the judgement of qualified quality personnel, and release decisions remain the responsibility of the user."]],
  ["Sample data", ["Suppliers, lots and results in the live demo are fictional and provided for demonstration only. Results from the demo, including for certificates you enter, must not be relied on to release real materials."]],
  ["Your responsibilities", [["Provide accurate contact information", "Don't enter confidential supplier or customer data into the demo", "Don't misuse the site: no attempts to disrupt it, gain unauthorised access or scrape it at scale"]]],
  ["Intellectual property", [`The site, the demo, the ${B.name} name and logo belong to ${B.name}. You keep ownership of anything you enter.`]],
  ["Disclaimers and liability", ["The website and live demo are provided \"as is\" without warranties of any kind. Features described as planned or proposed may change or may not be released. To the extent permitted by law, CertiSift is not liable for indirect or consequential losses arising from their use."]],
  ["Contact", [`Questions about these terms: ${contactLine}.`]],
]);

// ---------------------------------------------------------------- pages
const n = B.name;
const PAGES = {
  "index.html": { path: "", title: `${n} | Supplier CoA verification for food manufacturers`, description: B.shortPitch,
    body: [hero(), problem(), product(), how(), solutions(), compare(), ai(), safeguards(), awsSection(), roadmap(), pricing(), team(), faq(), ctaBand()].join("") },
  "product.html": { path: "product", current: "product", title: `Platform overview | ${n}`, description: "Document extraction, specification matching, anomaly detection, compliance reports, supplier monitoring and release decisions for supplier Certificates of Analysis.",
    body: intro("Platform overview", "From PDF pile to release decision.", "Six capabilities that work together on every incoming lot. All six can be tried in the live demo today.", ctas) + product() + compare() + ctaBand() },
  "how-it-works.html": { path: "how-it-works", current: "how-it-works", title: `How it works | ${n}`, description: "How CertiSift turns a supplier Certificate of Analysis into a checked, recorded release decision in four steps.",
    body: intro("How it works", "Four steps, one record.", "Receive, extract, check and decide: the same workflow for every certificate, whichever supplier or lab produced it.") + how() + ai() + ctaBand() },
  "solutions.html": { path: "solutions", current: "solutions", title: `Solutions for QA, supplier quality and procurement | ${n}`, description: "How QA managers, incoming-goods QA, supplier quality and procurement teams at food and beverage manufacturers use CertiSift.",
    body: intro("Solutions", "Built for the people who sign off materials.", "CertiSift fits between goods-in and production, where quality, procurement and the lab meet.") + solutions(true) + ctaBand() },
  "technology.html": { path: "technology", current: "technology", title: `How we use Amazon Web Services | ${n}`, description: "CertiSift's proposed AWS architecture: Amazon Textract, Amazon Bedrock, AWS Lambda, AWS Step Functions, Amazon S3, Amazon DynamoDB, API Gateway, Cognito, AWS KMS and CloudWatch.",
    body: intro("Technology", "How We Use Amazon Web Services", "What runs today, and how CertiSift's production platform is designed on AWS.") + awsSection(false) + techDetail() + ctaBand() },
  "security.html": { path: "security", current: "security", title: `Security and safeguards | ${n}`, description: "How CertiSift is designed to protect supplier certificates, keep reviewers in control and keep every verdict traceable.",
    body: intro("Security", "Security and safeguards", `How ${n} is designed to protect supplier certificates, keep reviewers in control and keep every verdict traceable, and what is and isn't built yet.`) + securityDetail() + safeguards(false) + ctaBand() },
  "pricing.html": { path: "pricing", current: "pricing", title: `Pricing | ${n}`, description: "Proposed CertiSift launch pricing by certificate volume. Plans start with an early-access conversation.",
    body: intro("Pricing", "Simple plans, priced by certificate volume.", "Proposed launch pricing in USD, excluding taxes. No payment is taken today. Every plan starts with an early-access conversation.") + pricing() + ctaBand() },
  "about.html": { path: "about", current: "about", title: `About and team | ${n}`, description: `${n} was founded in ${YEAR} to make supplier certificate checks fast, consistent and audit-ready. Meet the founder and see the roadmap.`,
    body: intro("About", `About ${n}`, `${n} was founded in ${YEAR} so food and beverage quality teams can check every supplier certificate against their own specification, quickly and consistently, with a record they can stand behind.`) + team() + roadmap() + ctaBand() },
  "contact.html": { path: "contact", current: "contact", title: `Request early access | ${n}`, description: "Request early access to CertiSift, ask about pricing or tell us which incoming materials you verify.",
    body: contact() + faq(), scripts: ["src/page.js", "src/data/business.js", "src/contact.js"] },
  "404.html": { path: "404", title: `Page not found | ${n}`, description: "This page doesn't exist.", body: `
    <section class="page-intro"><div class="wrap"><span class="eyebrow">404</span><h1>This page isn't on the certificate.</h1><p class="lede">The link may be out of date. Try the homepage or the live demo.</p><div class="hero-ctas"><a class="btn btn-primary" href="/">Homepage</a><a class="btn btn-ghost" href="/demo">Live demo</a></div></div></section>` },
  "privacy.html": { path: "privacy", title: `Privacy Policy | ${n}`, description: `How ${n} collects, uses and protects personal information on ${B.domain.value}.`, body: privacy() },
  "terms.html": { path: "terms", title: `Terms of Service | ${n}`, description: `The terms that apply when you use ${B.domain.value} and the ${n} live demo.`, body: terms() },
};

for (const [file, p] of Object.entries(PAGES)) { writeFileSync(root + file, page(p)); console.log("wrote", file); }
const routes = ["", ...Object.values(PAGES).map((p) => p.path).filter((r) => r && r !== "404"), "demo"];
writeFileSync(root + "sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((r) => `  <url><loc>${SITE}/${r}</loc><lastmod>2026-11-24</lastmod></url>`).join("\n")}
</urlset>
`);
writeFileSync(root + "robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log("wrote sitemap.xml, robots.txt");
