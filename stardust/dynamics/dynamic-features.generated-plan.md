<!-- stardust provenance: skill=stardust:dynamics · phase=plan draft · 2026-10-19T18:38:18.255Z · input stardust/current/_dynamics.json (5 pages, 18 findings) · target probe https://main--ede281e9--aemcoder.aem.page · reconciled against stardust/migrated -->
# Dynamic features — draft inventory (curate into `stardust/dynamic-features.md`)

One row per detected finding. Merge duplicates, drop noise, keep every axis honest. Columns: disposition = what we do · reproducibility = what it needs · status = where it stands (reference/triage.md).

| # | id | class | feature | pages | disposition | reproducibility | status | pattern | decision needed | notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | a-unknown-third-party-host-consent-truste-com | A | unknown third-party host consent.truste.com | 5/5 | static-snapshot | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 2 | a-cms-app-settings-object-digitaldata | A | CMS / app settings object digitalData | 5/5 | static-snapshot | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 3 | a-first-party-api-get-config-v1-rum-agents | A | first-party API GET /config/v1/rum/agents | 3/5 (reach 5/5) | data-fed | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? | **dead on target (404)** |
| 4 | cr-client-rendered-slot-js-height-grid-bp4-grid-6 | CR | client-rendered slot js-height grid bp4-grid-6 | 5/5 | static-snapshot | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 5 | d-first-party-data-file-get-bin-kbc-profilecondition-profile | D | first-party data file GET /bin/kbc/profilecondition/profiles.json | 4/5 (reach 4/5) | data-fed | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 6 | d-first-party-data-file-get-content-particulieren-nl-proces- | D | first-party data file GET /content/particulieren/nl/proces/betalen/zichtrekeningen/basisrekening-openen.kbc.securedeeplinks.nocache.json | 1/5 (reach 1/5) | data-fed | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 7 | f-form-email-to-text-subject-no-action-js-wired-2-fields | F | form "email:to+text:subject" → no action (JS-wired) (2 fields) | 5/5 | client-only | self | pending | client-compute | none |  |
| 8 | i18n-locale-variants-de-be-fr-be-en-be-nl-be | I18N | locale variants de-be,fr-be,en-be,nl-be | 5/5 | rebuild-native | needs-business-decision | delivered-by-capture | locale-tree | scope of the locale trees | output already carries "https://www.kbc.com/nl/newsroom/persberi" |
| 9 | l-listing-candidate-row-7-cards | L | listing candidate row (7 cards) | 1/5 | index-backed | needs-business-decision | pending | listing-index-backed | index-driven or editorially curated? |  |
| 10 | m-modal-trigger-aria-haspopup-chrome-only-link-content | M | modal trigger aria-haspopup (chrome only) → link:content | 5/5 | rebuild-native | self | delivered-by-capture | chrome-interaction | none (the header contract is the spec) | output already carries "Cookie Voorkeursinstellingen" |
| 11 | s-site-search-form-particulieren-nl-zoek-html | S | site search form → /particulieren/nl/zoek.html | 5/5 (reach 5/5) | index-backed | self | pending | search-index-backed | none (corpus = the migrated pages; second corpora stay out) |  |
| 12 | t-tag-manager-adobe-launch | T | tag manager: Adobe Launch | 5/5 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 13 | t-consent-trustarc-iab-cmp | T | consent: TrustArc / IAB CMP | 5/5 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | CMP domain script reuse on the new host |  |
| 14 | x-sign-in-account-links | X | sign-in / account links | 3/5 | decided-out | needs-backend | pending | decided-out | auth / commerce on the new host? |  |
| 15 | chrome-menu | M | header menu: Particulieren, Betalen, Sparen, Beleggen, Lenen, Verzekeren, MyHome, MyMobility (chrome only) | 1/1 | rebuild-native | self | pending | chrome-interaction | none (the header contract is the spec) |  |
| 16 | chrome-drawer | M | header drawer: MENU (chrome only) | 1/1 | rebuild-native | self | pending | chrome-interaction | none (the header contract is the spec) |  |
| 17 | chrome-search | S | header search: Zoeken... (chrome only) | 1/1 | index-backed | self | pending | search-index-backed | none (results from the query index; overlay and typeahead per the contract) |  |
| 18 | chrome-locale | I18N | header locale: NL (chrome only) | 1/1 | rebuild-native | needs-business-decision | pending | locale-tree | which locales the switcher lists |  |

## Triage

- **Ships autonomously (reproducibility `self`):** 9 row(s) — read-settings, settled-dom-snapshot, sheet-sync, client-compute, search-index-backed, chrome-interaction.
- **One owner decision batch:** 6 row(s) — inspect the XHR, add a vendor row · which tier for the target host; consumer on the migrated pages? · index-driven or editorially curated? · which tags run on the new host; property ids · CMP domain script reuse on the new host · which locales the switcher lists.
- **Already delivered by the capture pipeline:** 2 row(s) — no work.
- **Host-bound on the target:** 3 of 3 probed API paths — the off-origin data work.
- **Martech:** no CMP · 0/1 route(s) enabled by the owner — `stardust/martech-handoff.md`.

## Phases

- **interactive** — 5
- **detect** — 2
- **data** — 2
- **tags** — 2
- **off-origin data** — 1
- **capture** — 1
- **client tools** — 1
- **locale wave** — 1
- **listings** — 1
- **search** — 1
- **register** — 1
