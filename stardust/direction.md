---
_provenance:
  writtenBy: stardust:replica
  writtenAt: 2026-10-19T16:43:47Z
  againstInput: https://www.kbc.be/particulieren/nl.html
  readArtifacts:
    - stardust/current/PRODUCT.md
    - stardust/current/DESIGN.md
    - stardust/current/DESIGN.json
---

# Direction — preserve mode (same-design migration)

Mode: PRESERVE. The target spec is the captured current state of https://www.kbc.be/particulieren/nl.html (5 planned pages),
promoted verbatim (no direct invocation, no creative decisions).

Promoted: current/PRODUCT.md → PRODUCT.md · current/DESIGN.md → DESIGN.md ·
current/DESIGN.json → DESIGN.json (at 2026-10-19T16:43:47Z). Provenance: verbatim --prep promotion (extract --prep --pages).

Permitted deltas: ONLY the entries of stardust/replica/inconsistency-register.md
(empty — pure replica).

Fidelity: ia verbatim · design verbatim · content verbatim.

## Link audit decision (E2, 2026-10-19)
- Scope is fixed at 5 pages (site-plan). The ~169 internal kbc.be targets outside those 5 pages are SCOPE EXTENSION, not capture gaps: they stay absolute links to the source site (www.kbc.be). The owner can widen scope later. Every captured page is delivered and linked root-relative (7 links localized on the home and current-accounts pages).
- Result: 6/6 root-relative targets 200 on aem.live; 215/216 absolute targets 200 (facebook.com answers 400 to automated clients, same link as the source).
