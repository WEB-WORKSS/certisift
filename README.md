# CertiSift

Supplier Certificate of Analysis (CoA) verification for food and beverage manufacturers.
This project contains the public website, a working product, and an internal Activate Center (LinkedIn kit + AWS Activate answers). Every part reads from one business record.

## Run

```bash
node serve.js
```

Open http://localhost:4317. No build step and no dependencies. Opening `index.html` directly also works.

## Structure

| Path | Purpose |
| --- | --- |
| `src/data/business.js` | **Canonical business record.** Every fact, its verification status, feature classification and AWS service status. Edit facts here only. |
| `src/data/samples.js` | Fictional sample specifications, certificates and supplier history |
| `src/engine.js` | Verification engine: extraction, specification matching, anomaly detection (pure functions, portable to AWS Lambda) |
| `src/store.js` | Local accounts and workspaces (browser localStorage) |
| `src/site.js` | Public website, sign-in/up, legal pages |
| `src/app.js` | Product: overview, verify, verifications, specifications, suppliers, reports, profile |
| `src/main.js` | Hash router, global actions, SEO metadata, JSON-LD |

## Product truth (stage: Ideating/building initial product)

| Capability | Status | Scope today |
| --- | --- | --- |
| Document extraction | Implemented | Text-based CoAs (paste, .txt, .csv). Scanned PDF via Textract is planned |
| Specification matching | Implemented | Range / min / max / absent limits, aliases, unit equivalence, near-limit warnings |
| Anomaly detection | Implemented (rule-based) | Missing tests, unsigned/expired certificates, lot reuse, copied values, outliers vs supplier history |
| Compliance reports | Implemented | Printable lot report, supplier summary, CSV export |
| Supplier monitoring | Implemented | Accept rate, recurring findings, parameter trends |
| Release decision workflow | Prototype | Single user, stored locally |
| All AWS services | Proposed | Nothing deployed. The site says "planned architecture", never "built on AWS" |

## Before publishing / applying

The Activate Center's **Readiness** tab lists open items. The current blockers are:

1. Register and confirm the domain (suggested `certisift.com`), then set `domain.value`.
2. Set up the official business email and connect the contact form to it. The form currently saves only to the browser.
3. Add the founder's LinkedIn profile URL to `founders` (name and title are already set; it appears in the Team section).
4. Create the LinkedIn company page and set `linkedin.value`.
5. Get an Activate Provider Organizational ID for the Portfolio package, or apply to Activate Founders instead.
6. Run a trademark check (a similarly named "CertiSwift" exists).

## Deploy

Any static host works (S3 + CloudFront, Amplify Hosting, Netlify, GitHub Pages). Upload the folder as it is. Once the domain is confirmed, add a `sitemap.xml` and canonical URL.
