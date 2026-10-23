# Dynamic features — KBC Particulieren (5 planned pages)

Curated from `stardust/dynamics/dynamic-features.generated-plan.md` (18 draft rows → 13 features). Hands-off run:
every non-`self` row ships its interim tier with a named assumption; nothing is `decided-out` by assumption.

## Listings contract

none — the 7-card "Meer info over onze KBC-rekeningen" row on the zichtrekeningen page is editorially curated and
ships as authored cards (document-first); no listing block reads an index.

## Features
| # | id | feature | class | reach | disposition | reproducibility | status | pattern | decision / owner | evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | chrome-menu | header mega menus (Betalen, Sparen, Beleggen, Lenen, Verzekeren, MyHome, MyMobility) | M | 5/5 | rebuild-native | self | pending | chrome-interaction | none — header contract is the spec | stardust/chrome/header-contract.json |
| 2 | chrome-drawer | mobile drawer (MENU, drill-down) | M | 5/5 | rebuild-native | self | pending | chrome-interaction | none | header-contract 390 |
| 3 | site-search | header search → /particulieren/nl/zoek.html (+ typeahead) | S | 5/5 | index-backed | needs-business-decision | interim | search-index-backed | ASSUMPTION: the results page is outside the fixed 5-page scope; the header form keeps the source results URL until the owner widens scope | s-site-search-form…, chrome-search |
| 4 | locale-switch | NL/FR/DE/EN switch + site switch | I18N | 5/5 | rebuild-native | needs-business-decision | interim | locale-tree | ASSUMPTION: only NL is in scope; FR/DE/EN and other KBC sites link to the source pages | i18n-locale-variants…, chrome-locale |
| 5 | consent-trustarc | TrustArc consent notice (+ consent.truste.com assets) | T | 5/5 | embed-passthrough | needs-business-decision | scaffolded-awaiting-owner | consent-gated-tags | owner turns it on (martech-handoff.md § TrustArc) | t-consent-trustarc…, a-unknown…truste |
| 6 | tags-launch | Adobe Launch (283 rules, 158 data elements) + digitalData layer | T | 5/5 | embed-passthrough | needs-business-decision | scaffolded-awaiting-owner | consent-gated-tags | owner enables the route; rewrites path/selector rules (martech-handoff.md) | t-tag-manager…, a-cms-app-settings…digitaldata |
| 7 | rum-agents | Elastic RUM agent config GET /config/v1/rum/agents | A | 5/5 | static-snapshot | needs-business-decision | interim | off-origin-data | ASSUMPTION: monitoring only, no consumer on migrated pages — not wired; revisit at rollout | host-bound 404 |
| 8 | profile-conditions | personalisation profiles /bin/kbc/profilecondition/profiles.json | D | 4/5 | static-snapshot | needs-business-decision | interim | settled-dom-snapshot | ASSUMPTION: the default (anonymous) variant as captured ships; personalised variants need the owner's segment source | host-bound 404 |
| 9 | secure-deeplinks | proces page deep links (…securedeeplinks.nocache.json) | D | 1/5 | static-snapshot | self | pending | settled-dom-snapshot | none — the settled links ship as authored links | host-bound 404 |
| 10 | share-by-mail | hidden "e-mail this page" dialog (to + subject) | F/CR | 5/5 | static-snapshot | needs-backend | interim | settled-dom-snapshot | ASSUMPTION: no visible surface at rest; not rebuilt until the owner names a send endpoint | f-form-email…, cr-client-rendered… |
| 11 | cookie-prefs-link | "Cookie Voorkeursinstellingen" footer trigger | M | 5/5 | rebuild-native | self | pending | chrome-interaction | opens the TrustArc preferences once #5 is enabled; link otherwise | m-modal-trigger… |
| 12 | account-links | Aanmelden / Word klant / KBC Touch links | X | 3/5 | embed-passthrough | self | pending | link | links migrate as links to the source apps | x-sign-in-account-links |
| 13 | faq-accordion | FAQ / disclosure accordions (product page) | M | 1/5 | client-only | self | pending | client-compute | none | captured DOM |
| 14 | device-conditional | proces page: device-dependent groups (PC group with JS-generated QR code; non-PC process group and phone-only image hidden on desktop) | CR | 1/5 | static-snapshot | needs-business-decision | interim | settled-dom-snapshot | ASSUMPTION: deliver the PC group as captured (QR as captured image) — choosing per device on EDS is an owner decision | recreate form agent, archetype gate |
| 15 | js-nav-link | proces page "Ik ben al klant" (href #, JS navigates on click) | X | 1/5 | static-snapshot | needs-business-decision | interim | link | ASSUMPTION: static link as captured; the owner names the target app URL | recreate form agent |

## Decision batch

One message to the owner (recorded, hands-off): (a) search results page — widen scope to migrate
/particulieren/nl/zoek.html, or keep the source results page; (b) locale scope — FR/DE/EN trees; (c) switch on TrustArc
and the Launch route and rewrite the listed rules; (d) personalisation segment source for profile conditions;
(e) RUM monitoring on the new host; (f) send endpoint for the share-by-mail dialog.

## Register (decided-out)
| feature | reason | production statement |
|---|---|---|
