# AWS Activate readiness — CertiSift

Checked against the website prompt, Part I, for https://www.certisift.site once this build is deployed.

## Website signals

| Check | Status |
|---|---|
| Corporate website: names the company, what it does, who runs it, how to reach it | Pass |
| Contact email on the same domain, shown on the site and in Organization JSON-LD | Pass (`tijani@certisift.site`) |
| HTTPS, `www` host, no placeholders, no broken links, working mobile layout | Pass (verify on Vercel after deploy) |
| Separate pages: product, how it works, solutions, technology, security, pricing, about/team, contact, privacy, terms | Pass |
| Live demo reachable from the main nav, labelled sample data, no login | Pass (`/demo`) |
| Named founder with title and statement | Pass (Abiola Tijani Babatunde, CEO; quote and aim shown) |
| Stage stated honestly ("Early access open", "These services are proposed, not yet deployed") | Pass |
| AWS section and `/technology` page naming each service and its job | Pass |
| Sourced industry figures, comparison table, roadmap, FAQ, proposed pricing | Pass |
| Static HTML on every page, `robots.txt`, `sitemap.xml`, canonical, Open Graph, Organization JSON-LD | Pass |
| Working contact form | Pass: opens a pre-filled email to `tijani@certisift.site`. Set `formEndpoint` to send directly instead |

## Needs founder action

- [ ] Use `tijani@certisift.site` for the AWS account root user, the AWS Builder ID and the Activate application (no Gmail/Outlook).
- [ ] Upgrade the AWS account to a paid plan before applying.
- [ ] One AWS account per startup; one application at a time; applications cannot be edited after submission.
- [ ] Enter `https://www.certisift.site` as the company website, and keep the company name, founder, founding year (2026) and description identical to the site.
- [ ] Portfolio tier: an Org ID or email invite from your Activate Provider, within 12 months of your latest funding. Otherwise apply to Activate Founders.
- [ ] Confirm the proposed pricing, founding year and founder quote and aim (drafted for approval).
