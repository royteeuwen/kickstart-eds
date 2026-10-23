# Journal — KBC Particulieren replica

## Extract — 5 planned pages captured live (2026-10-19)

- Flow: replica — the design is kept. Scope fixed to the 5 pages in site-plan.json.
- crawl.mjs: 5/5 live (headless, medium wait), dynamics reach recorded (search form + hydrated widgets on all 5).
- Page types: landing (home), listing (zichtrekeningen), program (basisrekening product), form (basisrekening proces), article (pensioensparen sleutelmoment) — five archetypes, one page each.
- Consent: TrustArc dialog not matched by the crawler; gate/census dismiss selector `.pdynamicbutton a.required` ("Weiger cookies").
- Style census at 1440+360; MuseoSans 300/500/700 (commercial) loads from the owner CDN wcmassets.kbc.be (ACAO *), never rehosted.
- Header contract recorded (stardust/chrome/header-contract.json): desktop 7 mega menus + search + language; mobile drawer 18 states.
- cap-probe: shell 1200px; content caps per archetype in DESIGN.json extensions.breakpoints.
- Capture gaps: none (no locale root in scope).

## Preserve direction — verbatim promotion, empty register, dynamics triaged (2026-10-19)

- current/PRODUCT.md, DESIGN.md, DESIGN.json promoted verbatim to the root; stardust/direction.md records preserve mode.
- Inconsistency register empty — pure replica.
- Dynamics: 18 draft rows curated into 13 features (stardust/dynamic-features.md); every row has a disposition.
  Self: header menus/drawer, FAQ accordion, deep links, account links. Owner batch: search results page (outside the
  fixed scope), locale trees, TrustArc + Launch switch-on, personalisation, RUM, share-by-mail endpoint.
- Martech: spec-martech (Launch 283 rules / 158 data elements), contract + hand-off written, scripts/martech.js scaffolded off.

## Source-fidelity gate — landing archetype passed (2026-10-19)

- particulieren-nl-html: 1440 pixel 0.56% Δh 0, 0 structural red, clip 0; 360 pixel 0.35% Δh 0; cap-probe PASS (2560).
- Canon authored: stardust/prototypes/canon.css + canon.js (header with mega menus + mobile drawer, footer, shared modules).
- Residuals: 360 phone-only app banner not painted in captures; TrustArc cookie link static; hovers only where measured.

## Source-fidelity gate — listing archetype passed (2026-10-19)

- particulieren-nl-betalen-zichtrekeningen-html: 1440 0.04% / 360 0.46%, Δh 0, clip 0, cap-probe PASS. 10 content-diff reds are the live
  links' inline `digitalData` scripts read as labels (same hrefs and visible labels in the build) — instrument artefact.
- Canon additions (home re-gated unchanged): interior header variant, drawer active colour, WOW.js scroll fade-in.
- Phone-UA comparison variant authored hidden; live 360 shows crosses where desktop shows checks — replicated verbatim.

## Source-fidelity gate — program archetype passed (2026-10-19)

- basisrekening product page: 1440 0.06% / 360 0.12%, Δh 0, 0 red, clip 0, cap-probe PASS (1000px chaptertitle cap replicated), units 12/12.
- FAQ is native <details> on live — rebuilt natively, no canon change. unit-geometry live cache is per page not per width (360 false FAIL; nocache run 12/12).

## Source-fidelity gate — article archetype passed (2026-10-19)

- sleutelmoment life-moment guide: 1440 0.02% (3 iter) / 360 0.06% (1 iter), Δh 0, 0 red, clip 0, cap-probe PASS (12 rows), motion 12/11 behaviours matched.
- Page-specific chrome deltas kept per-page (no loan warning in footer; language links to own translations); img width/height attrs needed so lazy images hold height at capture.

## Source-fidelity gate — form archetype passed (2026-10-19)

- basisrekening-openen process start: 1440 0.17% (2 iter) / 360 0.54% (3 iter), Δh 0, 0 red, clip 0, cap-probe PASS, motion 8/8.
- Live JS sometimes drops a 24px legal-text margin ≥992 (nondeterministic); build follows the cached capture. Device-dependent blocks (PC QR group shown, mobile variants hidden) and a JS-navigated "Ik ben al klant" link noted for dynamics; QR kept as captured image.

## Recreate — all 5 archetypes gated, prototype table 5/5 at both widths (2026-10-19)

- landing 0.56/0.35%, listing 0.04/0.46%, program 0.06/0.12%, form 0.17/0.54%, article 0.02/0.06% (1440/360); Δh 0, clip 0 everywhere.
- gate-all --stage prototype: 1440 5/5 PASS, 360 5/5 PASS. unit-geometry's origin cache (stardust/current/measure/<slug>-units.json) is not width-keyed — clear it before each width run or a 360 inventory is compared at 1440 (false units FAIL).

## Plan — migrate plan: 5 archetypes, no siblings (2026-10-19)

- Every planned page is its own template's archetype (landing, listing, program, form, article): Branch A renders from the approved prototypes, one render unit, no sibling clusters. Page map 5 entries, 0 collisions.

## Render — 5 archetype pages rendered into stardust/migrated (2026-10-19)

- rendered 5, refused 0. modules[] declared per page; content-fidelity declared from the prototype gates; gate-evidence filled pixel-gate/content-count/delivery-lint from the prototype rounds (published-origin rows come in C-deliver). Links to out-of-scope source pages counted "broken" — repointed to the source host at E2.

## State and report — migrate: 5/5 pages migrated (2026-10-19)

- All 5 archetype pages advanced approved → migrated (migratedPath set). No assets unit: images stay on the captured source renditions until C-deliver's media protocol uploads them to DA.

## A-inventory — 5 pages, 5 templates to deliver (2026-10-19)

- inventory.mjs: 5 pending pages, one per template; rollout.json site.da = aemcoder/ede281e9@main, liveHost main--ede281e9--aemcoder.aem.live.

## B-block — 20 distinct blocks, representative-first plan (2026-10-19)

- 24 instances → 20 conversions; reuse: text-image ×3, cta-btngroup ×2, home-intro ×2. Dependency order: home (home-intro, text-image) before article/form; form (cta-btngroup) before program.

## B2-dynamic — fresh detect 14 findings, plan 18 rows, martech contract unchanged (all off) (2026-10-19)

- dynamics-detect on the 5 pages (200 each) → 14 findings, same classes as preserve-direction; dynamics-plan --target-origin preview --migrated --martech --chrome: 18 rows (self 9, owner batch 6, delivered 2, host-bound 3/3 — first-party APIs are dispositioned static-snapshot/interim).
- Curated rows 14 (device-conditional groups on the proces page) and 15 (JS-navigated "Ik ben al klant" link) added from the form archetype's recreate findings. Martech contract regenerated identical; 0 parts enabled.

## C-deliver — foundation, 5 archetype units, gate-all and final done; 5/5 pages live (2026-10-19)
- Units: foundation (chrome docs live, frozen), archetype landing/listing/program/form/article each 1/1 live and gated on the published origin, no sibling clusters (roster = archetypes).
- gate-all: 1440 5/5 PASS (0.12–3.15%); 360 3 PASS + 2 documented overrides; coverage gate rows written via update-coverage --gate.
- C-final: foundation-freeze check unchanged; the single foundation request (program page grid) kept block-scoped per runtime-contract notInFoundation — no frozen file edited, no re-gate.

## D-site — redirects wired, / 200, served sitemap 5 = assembled 5 (2026-10-19)
- stardust/redirects.tsv (7 rows) PUT as /redirects.json, previewed + published; `/` → /particulieren/nl since the source root redirects there.
- Chrome documents noindex verified; assemble.mjs --verify-origin exit 0. Foundation-shell draft removed.

## D2-dynamic — parity.json written, 12/12 checks PASS on the live origin (2026-10-19)
- stardust/dynamics/parity.json: 16 features (8 done with checks, 6 interim / 2 scaffolded-awaiting-owner with named owner decisions); martech feature appended from the contract.
- dynamics-check on aem.live: 12/12 PASS, 0 page errors on 5 pages, martech gate: no tag host requested (all parts disabled). No search index needed (no listing contract, results page out of scope).

## E-full-site — 5/5 verified on aem.live (2026-10-19)
- verify.mjs --base aem.live --all: 5 checked, 5 verified, 0 failed (gate rows all pass).
- restoreAtDelivery (listing WOW reveal): scrolled render check 10/10 reveal elements at opacity 1.

## E2-link-audit — 7 links localized, 0 dead internal targets (2026-10-19)
- localize-links: 7 source-host links → root-relative on 2 pages, redeployed + published (deploy-batch ledger-link-audit, 2/2 live).
- 227 hrefs over 5 pages + nav/footer docs: internal 6/6 200; external 215/216 200 (facebook 400 = bot answer). Out-of-scope targets kept on the source site (decision in direction.md).

## F-optimize — health 100, 0 open P1/P2/P3 (2026-10-19)
- optimize.mjs --all on aem.live: 5 pages, open 0/0/0; 5 source-parity P2 (no JSON-LD, the source has none) informational. Gate: no open P1.

## G-aem — nothing to fix (2026-10-19)
- autofix-aem --dry-run: 0 candidates (optimize left no open findings); no project edits, no redeploy.

## H-report — 5/5 verified, 20/20 blocks, nothing left in scope (2026-10-19)
- stardust/rollout/report.md (summary block) and stardust/learnings.md written.

## I-dashboard — dashboard written (2026-10-19)
- stardust/rollout/dashboard/{index.html,data.json}: 5 identified, 5 prototyped, 5 deployed.

## Handoff — run complete: 5/5 pages live and gated, rollout A–I ended (2026-10-19)
- done-check: complete true, no gaps. All 5 planned pages published on aem.live, gate-all pass at 1440 and 360, redirects + sitemap verified, martech carried over disabled.
