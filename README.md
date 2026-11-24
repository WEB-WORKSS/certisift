# CertiSift

Supplier Certificate of Analysis (CoA) verification for food and beverage manufacturers.
This project contains the public website and a live demo of the product. Every part reads from one business record.

## Run

```bash
node scripts/build-pages.mjs   # regenerate the static HTML pages from src/data/business.js
node serve.js                  # http://localhost:4317
```

No dependencies. Requires Node 18+.

## Structure

| Path | Purpose |
| --- | --- |
| `index.html`, `product.html`, `how-it-works.html`, `solutions.html`, `technology.html`, `security.html`, `pricing.html`, `about.html`, `contact.html`, `privacy.html`, `terms.html`, `404.html` | **Generated** static pages (crawlable without JavaScript). Don't edit by hand: edit `scripts/build-pages.mjs` or the business record and rebuild |
| `demo.html` | Live demo: overview, verify, verifications, specifications, suppliers, reports, settings. Runs in the browser on the sample workspace; no accounts |
| `scripts/build-pages.mjs` | Page generator, including all marketing copy, sourced industry figures, AWS section, pricing, FAQ and legal pages |
| `src/data/business.js` | **Canonical business record.** Every fact, its verification status, feature classification and AWS service status |
| `src/data/samples.js` | Fictional sample specifications, certificates and supplier history |
| `src/engine.js` | Verification engine: extraction, specification matching, anomaly detection (pure functions, portable to AWS Lambda) |
| `src/store.js` | Demo workspace persistence (browser localStorage) |
| `src/site.js` | Build-time templates for the hero certificate, feature cards and architecture diagram |
| `src/app.js`, `src/main.js` | Demo app views and hash router |
| `src/page.js`, `src/contact.js` | Mobile menu; early-access form (validation, then POST to `formEndpoint` or a pre-filled email) |

Vercel serves clean URLs (`/product` → `product.html`), see `vercel.json`.

## Product truth (stage: Ideating/building initial product)

| Capability | Status | Scope today |
| --- | --- | --- |
| Document extraction | Implemented | Text-based CoAs (paste, .txt, .csv). Scanned PDF via Textract is planned |
| Specification matching | Implemented | Range / min / max / absent limits, aliases, unit equivalence, near-limit warnings |
| Anomaly detection | Implemented (rule-based) | Missing tests, unsigned/expired certificates, lot reuse, copied values, outliers vs supplier history |
| Compliance reports | Implemented | Printable lot report, supplier summary, CSV export |
| Supplier monitoring | Implemented | Accept rate, recurring findings, parameter trends |
| Release decision workflow | Prototype | Demo only, stored locally |
| All AWS services | Proposed | Nothing deployed. The site says "planned architecture", never "built on AWS" |

## Before publishing / applying

See `docs/activate-readiness.md`. The blockers are:

1. Confirm the proposed pricing ($149 / $449 per site per month, Multi-site custom).
2. Add the founder's LinkedIn profile URL to `founders` if they want it shown.
3. Run a trademark check (a similarly named "CertiSwift" exists).

## Deploy

Live at https://www.certisift.site (Vercel, static, no build step). Other static hosts need clean-URL rewrites from `/page` to `/page.html`.
