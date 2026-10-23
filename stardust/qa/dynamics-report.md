# Dynamics parity check — https://main--ede281e9--aemcoder.aem.live — 2026-10-19T21:21:05.618Z

Replayed 11 checks over 17 features · pass 11 · fail 0. Flows, not presence.

| feature | class | status | check | result | detail | third-party requests |
|---|---|---|---|---|---|---|
| header mega menus | M | done | dom-count | PASS | 265 × header nav a (min 200) | wcmassets.kbc.be:200×4 |
| header mega menus | M | done | dom-count | PASS | 265 × header nav a (min 200) | wcmassets.kbc.be:200×4 |
| mobile drawer | M | done | dom-count | PASS | 31 × header button (min 20) | wcmassets.kbc.be:200×4 |
| header search | S | interim | dom-count | PASS | 2 × header form (min 1) | wcmassets.kbc.be:200×4 |
| proces page deep links | D | done | dom-count | PASS | 3 × main a (min 3) | wcmassets.kbc.be:200×4 |
| Cookie Voorkeursinstellingen footer trigger | M | done | dom-count | PASS | 37 × footer a (min 30) | wcmassets.kbc.be:200×4 |
| Aanmelden / Word klant / KBC Touch | X | done | dom-count | PASS | 1 × header a[href*='aanmelden'] (min 1) | wcmassets.kbc.be:200×4 |
| FAQ accordions | M | done | dom-count | PASS | 8 × .faq [aria-expanded] (min 8) | wcmassets.kbc.be:200×4 |
| proces page PC group + QR | CR | interim | dom-count | PASS | 1 × .quick-response img (min 1) | wcmassets.kbc.be:200×4 |
| no uncaught exceptions | - | done | no-page-errors | PASS | none on 5 page(s) |  |
| martech: consent + tag routing | T | scaffolded-off | martech | PASS | no tag host requested (1 gated · 1 cross-site host(s) blocked) |  |

## Features without checks

- NL/FR/DE/EN + site switch (I18N) — interim · owner: FR/DE/EN trees in scope or not
- TrustArc consent notice (T) — scaffolded-awaiting-owner · owner: switch on TrustArc (martech-handoff.md)
- Adobe Launch + digitalData (T) — scaffolded-awaiting-owner · owner: enable the Launch route and rewrite the listed rules
- Elastic RUM agent config (A) — interim · owner: RUM monitoring on the new host
- personalisation profiles (D) — interim · owner: segment source for personalised variants
- e-mail this page dialog (F/CR) — interim · owner: send endpoint for the share-by-mail dialog
- Ik ben al klant link (X) — interim · owner: target app URL
