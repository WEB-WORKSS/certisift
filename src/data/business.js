/*
 * CertiSift: Canonical Business Record (single source of truth)
 * ----------------------------------------------------------------
 * Every page, the live demo, SEO metadata and documentation read from this file.
 * scripts/build-pages.mjs generates the static pages from it. Edit facts HERE, nowhere else.
 *
 * Conventions:
 *   status: "verified"   -> supplied by the founder / confirmed
 *   status: "assumption" -> default or derived; must be confirmed before publishing as fact
 *   value: null          -> unknown; public pages hide it
 */
window.CS = window.CS || {};

CS.business = {
  name: "CertiSift",
  tagline: "Intelligent Quality Verification. Smarter Manufacturing.",
  shortPitch:
    "CertiSift checks supplier Certificates of Analysis against your specifications and flags non-conforming materials before they reach production.",

  // ---- Facts that still need verification (null = unknown) -------------
  domain: { value: "certisift.site", status: "verified", note: "Live at https://www.certisift.site." },
  email: { value: "tijani@certisift.site", status: "verified", note: "Official business email, supplied by the founder." },
  formEndpoint: null, // optional HTTPS endpoint that accepts POSTed JSON from the early-access form
  headquarters: { value: null, status: "assumption", note: "Headquarters not supplied." },
  foundingYear: { value: 2026, status: "assumption", note: "Default assumption from master prompt." },
  companyType: { value: "Privately Held", status: "assumption" },
  companySize: { value: "2–10 employees", status: "assumption", note: "Suggested LinkedIn bracket; confirm actual team size." },
  linkedin: { value: null, status: "assumption", note: "Only linked once a verified company page exists." },

  // ---- Leadership ---------------------------------------------------------
  founders: [
    {
      name: "Abiola Tijani Babatunde",
      title: "CEO",
      linkedin: null,
      status: "verified",
      // Drafted for the founder's approval. Edit to their own words before publishing.
      quote:
        "Every lot that reaches production should be released on evidence, not on a quick look at a PDF. I founded CertiSift so quality teams can check every supplier certificate against their own specification quickly, consistently and with a record they can stand behind.",
      aim: "To make supplier certificate checks fast, consistent and audit-ready for every food manufacturer, so non-conforming materials are stopped before production begins.",
    },
  ],

  // ---- Positioning ------------------------------------------------------
  industry: "Manufacturing Technology / AI-powered Quality Assurance SaaS",
  businessModel: "B2B SaaS",
  category: "Supplier quality verification software",
  stage: {
    value: "Ideating/building initial product",
    activateSelection: "Ideating/building initial product",
    status: "verified-by-evidence",
    rationale:
      "A working in-browser MVP exists (text-based CoA extraction, specification matching, anomaly checks, supplier tracking, reports). No production AWS deployment, no customers, no revenue.",
  },

  positioning:
    "CertiSift is supplier quality verification software for food and beverage manufacturers. QA and incoming-goods teams use it to check every supplier Certificate of Analysis against their own specifications, catch out-of-spec, missing or suspicious results, and keep an auditable record before a material lot is released to production.",

  problem: {
    headline: "Certificates arrive faster than QA can read them.",
    points: [
      "Every incoming lot ships with a Certificate of Analysis (CoA) that QA must compare, line by line, against an internal specification.",
      "Formats differ by supplier and lab: parameter names, units, methods and layouts all vary.",
      "Reviews are manual and inconsistent under time pressure, so near-limit results, missing tests and copied values slip through.",
      "A missed deviation can mean a production hold, scrapped batches, a customer complaint or a recall.",
      "Supplier performance lives in spreadsheets, so recurring problems are noticed late.",
    ],
  },

  // ---- Features with truthful classification ---------------------------
  // classification: implemented | prototype | planned
  features: [
    {
      id: "extract",
      name: "Document extraction",
      classification: "implemented",
      scope: "Text-based CoAs (pasted text, .txt, .csv) parsed in the browser.",
      planned: "Scanned PDFs and images via Amazon Textract, with Amazon Bedrock for layout interpretation.",
      body: "Pulls supplier, product, lot, dates, signatory and every test result with its unit out of the certificate.",
      benefit: "No retyping values into spreadsheets.",
    },
    {
      id: "match",
      name: "Specification matching",
      classification: "implemented",
      scope: "Range, minimum, maximum and qualitative (Absent/Negative) limits with parameter aliases and unit checks.",
      body: "Compares each extracted result against your own specification, including aliases like 'TPC' vs 'Total plate count'.",
      benefit: "Consistent pass/fail decisions regardless of who reviews the lot.",
    },
    {
      id: "anomaly",
      name: "Anomaly detection",
      classification: "implemented",
      scope: "Rule-based: near-limit results, missing tests, missing signatures/dates, expired material, reused lot numbers, values identical to a previous lot, statistical outliers versus supplier history.",
      planned: "Model-assisted anomaly scoring with Amazon Bedrock.",
      body: "Flags the results that technically pass but deserve a second look.",
      benefit: "Catches copied certificates and drifting suppliers early.",
    },
    {
      id: "reports",
      name: "Compliance reports",
      classification: "implemented",
      scope: "Printable verification report per lot, CSV export of all verifications.",
      body: "Generates a structured verification record with every check, verdict and reviewer note.",
      benefit: "Audit-ready evidence without assembling it by hand.",
    },
    {
      id: "suppliers",
      name: "Supplier quality monitoring",
      classification: "implemented",
      scope: "Per-supplier pass rate, open issues, recurring failing parameters and result trends from verifications in the workspace.",
      body: "Tracks each supplier's history so recurring issues surface on their own.",
      benefit: "Evidence for supplier reviews and corrective-action requests.",
    },
    {
      id: "workflow",
      name: "Release decision workflow",
      classification: "prototype",
      scope: "Reviewer can accept, hold or reject a lot with a note; single-user only.",
      planned: "Multi-user roles, approvals and ERP hold/release integration.",
      body: "Records the final disposition and the reason behind it.",
      benefit: "A clear decision trail for every incoming lot.",
    },
  ],

  roadmap: [
    "Scanned PDF and image extraction with Amazon Textract",
    "Bedrock-assisted interpretation of unfamiliar certificate layouts",
    "Team workspaces with roles and approval steps",
    "Email-in: forward supplier CoAs to a workspace inbox",
    "ERP / LIMS integration for automatic hold and release",
  ],

  targetCustomers: {
    beachhead: "Food and beverage manufacturers",
    buyers: ["QA Manager", "Head of Quality / Food Safety", "Supplier Quality Manager", "Procurement Lead"],
    users: ["Incoming-goods QA technicians", "Laboratory operators", "Supplier quality engineers"],
    expansion: ["Chemical processing companies", "Pharmaceutical manufacturers (requires GxP / 21 CFR Part 11 work)", "Industrial QA departments"],
  },

  pricing: {
    status: "assumption",
    note: "Proposed launch pricing, shown on the site as proposed. Confirm before taking payment.",
    plans: [
      { name: "Pilot", for: "One site, one QA team", price: "$149", points: ["Up to 100 certificates a month", "Guided setup of your specifications", "Specification matching and anomaly checks", "Lot reports and CSV export", "Weekly review with the founder"] },
      { name: "Site", for: "A single production site", price: "$449", points: ["Up to 1,000 certificates a month", "Unlimited specifications", "Supplier quality monitoring", "Exportable audit reports", "Up to 15 users"] },
      { name: "Multi-site", for: "Groups with several plants", price: "Custom", points: ["Shared supplier records", "Roles and approval steps", "ERP / LIMS integration", "Single sign-on", "Dedicated onboarding"] },
    ],
  },

  // ---- AWS architecture (all PROPOSED, nothing deployed yet) -----------
  // status: deployed | implementing | proposed
  aws: [
    { service: "Amazon Textract", purpose: "Extract text and tables from scanned and PDF certificates.", status: "proposed" },
    { service: "Amazon Bedrock", purpose: "Interpret unfamiliar layouts, normalise parameter names, assist anomaly review.", status: "proposed" },
    { service: "AWS Lambda", purpose: "Run extraction, matching and report generation steps.", status: "proposed" },
    { service: "AWS Step Functions", purpose: "Orchestrate the upload → extract → interpret → match → report workflow.", status: "proposed" },
    { service: "Amazon S3", purpose: "Encrypted storage of uploaded certificates and generated reports.", status: "proposed" },
    { service: "Amazon DynamoDB", purpose: "Supplier records, specifications and verification results.", status: "proposed" },
    { service: "Amazon API Gateway", purpose: "Secure API for the web app and future integrations.", status: "proposed" },
    { service: "Amazon Cognito", purpose: "User sign-in and per-customer tenant isolation.", status: "proposed" },
    { service: "AWS KMS", purpose: "Customer-managed encryption keys for documents and records.", status: "proposed" },
    { service: "Amazon CloudWatch", purpose: "Logs, metrics and alerting.", status: "proposed" },
  ],

  copyrightYear: 2026,
};
