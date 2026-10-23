# EDS conversion log — KBC Particulieren

## Decisions

- 2026-10-19 — Publish decision: **publish** (made by the run owner up front). Every delivered page, the redirects
  sheet and the chrome documents (nav, footer and locale variants) go live on the aem.live origin
  (deploy-batch.mjs without --no-publish, or POST admin.hlx.page/live/…).
- 2026-10-19 — Martech: keep the source analytics, tags and consent, carried over with every contract part disabled
  (stardust/martech-contract.json, stardust/martech-handoff.md, scripts/martech.js). Turning a part on stays with the owner.
- 2026-10-19 — Fonts: MuseoSans (commercial) is loaded from the owner's CDN wcmassets.kbc.be (CORS *), never rehosted.

## C0 foundation (2026-10-19)

- Chrome variants by page metadata (Template, header-variant, footer, footer-hide, loan-warning, alternate-<lang>[-title]) — stardust/runtime-contract.json.
- Harness doc /drafts/foundation-shell is preview-only (never published); delete at C-final.
- Header gate: band crops 0.17%/0.35% (header), 1.70%/0.72% (footer). chrome-compare vs the live interior contract: panel geometry 7/7 equal; 26 panel-visual reds are TrustArc-covered live crops (instrument limitation), 2 close-path reds untestable on the short shell — re-checked on a deployed full page.
- Deliberate canon fix: mobile drawer `.brand-row { height: 100% }` (prototype drawer opened at 0 height — never covered by the prototype gate).

## archetype-listing — /particulieren/nl/betalen/zichtrekeningen (template listing)
- breadcrumb: template-slotted (one list cell → nav trail; <576 parent-only clone). Full-bleed, sits above main's 48px top margin.
- column-control: reconstructive per cell (picture+heading → image tile, EW6 link on tile body; rich column → title / checkmark list / CTA group); reabsorbs the heading-only default content above it.
- comparison: reconstructive by row content (header / price / feature / cta / links / note); ≤991 cards + filter are presentational clones (stripInstrumentation); variant `phone` = hidden phone-UA panels.
- list: reconstructive per row (picture cell → image, heading cell → title + description; stretched link keeps the image outside the anchor); WOW fade-in on reveal.

## archetype-article — /particulieren/nl/pensioensparen/sleutelmoment (template article)
- home-intro (reused, landing-owned): new additive variant `lead` (CSS only — 20/28 bold intro at 60% width, 18/24 ≤767); home page rendering untouched (no `lead` class there).
- key-steps: reconstructive by row content (heading-only row → centred head; image row → step in a 2/4-col grid, image hidden <768; text-only row → link item in a 2-col grid; 24px spacer between grids). D3 yellow (head row 1 cell vs item rows 2 cells) accepted: the head is part of the composition.
- split: template-slotted per cell (image-only cell → image column, inset centre when first / left when later; other cell → chaptertitle + rich text (dot bullets, counted ol) + CTA group, flush when in the last column). Variants `bg-light`, `image-center`, `image-hide-mobile`.
- highlight: template-slotted (heading → sea-blue centred chaptertitle, each other element → its own centred text slot); decorative badge icon by variant `clock` (default) / `binoculars` — inline SVG in block JS (decorative, CSS-stroked white). D1 yellow accepted: bordered call-out with badge is a bespoke widget.
- page-links: reconstructive (heading-only row → centred page title above the band, authored as h2 to keep one h1; each other row → card-as-link: image slot, link paragraph → title (EW6 inner anchor unwrapped), rest → description); full-bleed light band. D3 yellow accepted (title row).
- media: 13 images under media/sleutelmoment/ (hero = 2000 rendition; the 4 step SVG illustrations rasterised to 320px PNG — DA/media bus does not serve SVG reliably).
- links kept absolute to www.kbc.be like the delivered landing/listing pages (target pages are not migrated; localize-links over the whole tree would rewrite other units' files).

## archetype-form — /particulieren/nl/proces/betalen/zichtrekeningen/basisrekening-openen (template form)
- process-page: template-slotted (image-only cell → media column, hidden ≤767; heading → title, the paragraph right after it → social-proof intro, list → checkmark list, rest → text). The section class `.process-page-container` carries the 5/7 float layout (≥992) so the default content, cta-btngroup and quick-response that follow in the same section continue the content column (process title h3, legal text). D1 yellow accepted: the block is the page composition (media column + head), not prose.
- cta-btngroup: template-slotted (each authored element → its own item, CTAs move as their <p>); formatting picks the look (**primary**, _secondary_, **_accent_**, plain link = tertiary underlined). Generic — reused by the product page. D1 yellow accepted: a button row is the widget.
- quick-response: template-slotted (image-only cell → QR code slot, rest → description); variant `right`. The QR is the captured awesome-qr bitmap uploaded as media/basisrekening-openen/basisrekening-openen-qr.png.
- breadcrumb (reused, listing-owned): new additive variant `current` (last crumb is the current page even when linked: desktop text, mobile back-link clone); listing rendering untouched (no `current` class there). D1 yellow accepted as on the listing.
- dynamic-features #14 (device-conditional): static snapshot as dispositioned — the PC group is delivered (QR as captured image); the hidden non-PC group (duplicate h3 + buttons) and the phone-only image are not authored. #15 (JS-navigated "Ik ben al klant"): static `#` link as captured; the owner names the target app URL.
- main image reuses media/zichtrekeningen/zichtrekening-nieuwelook17.jpg (same 960 rendition, uploaded by archetype-listing).

## archetype-program — /particulieren/nl/product/betalen/zichtrekeningen/basisrekening-openen (template program)
- introduction-block: template-slotted by content role (image cell → picture + legal ribbon; content cell → heading title, first paragraph tagline, next paragraph price, first list checkmark list (foundation .aem-rich-text--bullet-checkmark-green), CTA paragraph, everything after the CTA → warning notes). D1 yellow accepted: fixed bespoke composition (rounded image + ribbon + offset content panel).
- introduction-block.css also carries the program template page grid (canon responsive grid col-8 offset-2 / tablet-10 offset-1; section style `wide` = col-10 offset-2 = the single-module 1000px cap at 1440; section style `band` = the trailing 96px full-bleed bg-light container). Logged in foundation-requests.md (move to styles.css at C-final).
- faq: reconstructive, one row per Q/A (question cell + answer cell; answer 2 holds a plain HTML table). EW7: title row div takes the click, chevron-only <button aria-expanded aria-controls>; native-details look (no animation on live).
- table: one row per table row, cells MOVED into <td>; ja/neen cells show the canon iconskbc check / cancel glyph, the authored word kept as sr-only text (display:none on live).
- download-list: reconstructive, one row (or list item) per document, decorative document SVG + divider after each item (as on live; the trailing empty live <li> has no rendered height).
- text-image (reused, landing-owned): new additive variant `spacious` (margin-bottom 48, canon aem__mb--48); no live page uses the class. Paragraph spacing inside text-image on program pages comes from the program grid CSS (body.program scope).
- cta-btngroup, breadcrumb reused unchanged. Media: hero = 960 rendition uploaded as media/kbc-basisrekening/. Links to the delivered form page root-relative; other targets kept absolute www.kbc.be like the other units.
- block-roundtrip whole-page run: the 3 🔴 MISSING CTA rows are instance-index artefacts (prototype counts the FAQ answers' inner .text-image as text-image instances); the faq per-block run closes with those CTAs present.

## C-deliver gate-all (2026-10-19)

- Roster published-origin gate: 1440 5/5 PASS; 360 3/5 PASS + 2 documented overrides (stardust/replica/gates/all-360/overrides.json) —
  the repeated-unit probe's live side rendered the listing and product pages off their 360 layout; pixel, height, clip and content pass on both.
- Listing comparison block at 360 shows the desktop table's ticks (inconsistency register IR-1).

## D-site (2026-10-19)
- Redirects sheet /redirects.json (7 rows, published live): source root 308s to /particulieren/nl.html, so `/` and `/index.html` → /particulieren/nl; each captured `.html` source path → its extensionless delivered page. `/` ends 200 on aem.page and aem.live.
- Chrome docs nav, footer, footer-short already carry robots noindex; served sitemap 5 = assembled 5.
- Harness doc /drafts/foundation-shell unpreviewed and deleted from DA (never published).
