<!-- stardust:provenance
writtenBy: stardust:extract
writtenAt: 2026-10-19T16:40:43Z
stardustVersion: 0.33.0
sources: stardust/current/pages/*.json, stardust/current/_brand-extraction.json
-->
# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Private customers (particulieren) of KBC Bank & Verzekering in Flanders and Brussels, Dutch-speaking: people who bank, borrow, insure, save and invest with KBC, and prospects comparing current accounts. The site also routes entrepreneurs, private-banking and commercial-banking clients to their own sections via the top site switch.

## Product Purpose

The public Dutch-language website for KBC's retail offer: it presents products (current accounts, cards, loans, insurance, savings, pensions), explains them, and moves visitors into KBC Mobile, KBC Touch or an online application flow ("Open nu je KBC-Basisrekening").

## Positioning

_provenance: inferred — from the captured hero and section copy._
A large Belgian bank-insurer presenting itself as digital-first ("Start met KBC Mobile, ook als je geen KBC-rekening hebt") and close by ("Contacteer ons waar en wanneer je maar wilt").

## Capabilities and Constraints

- Mega-menu navigation over five product domains (Betalen, Sparen, Beleggen, Lenen, Verzekeren) plus MyHome and MyMobility.
- Site search with autocomplete, language switch (NL/FR/DE/EN), consent management (TrustArc).
- Legally required loan warning ("Let op, geld lenen kost ook geld.") in every footer.
- Product comparison tables, FAQ accordions, application flow entry pages.

## Brand Commitments

- Register: `brand` (marketing/product site of a bank).
- Personality observed: calm, trustworthy, friendly — navy (#003665) text on white, teal (#009985) action buttons, cyan (#00aeef) accents, soft card shadows, rounded 8px cards and pill buttons, photography of people in everyday situations.
- Anti-references observed: no dark mode, no heavy gradients, no decorative display type.

## Evidence on Hand

- `stardust/current/pages/` — 5 page records + rendered DOM
- `stardust/current/assets/screenshots/` — full-page captures
- `stardust/current/assets/css/` — the 41 source stylesheets
- `stardust/current/assets/fonts/` — MuseoSans 300/500/700 (reference copies; not rehosted)
- `stardust/current/_computed-styles.json`, `_brand-extraction.json`

## Product Principles

_provenance: inferred — from page structure._
1. Every product page leads to one clear next step (open, apply, contact).
2. Pricing and conditions are stated plainly, with legal footnotes kept on the page.
3. Help is always one click away (contact block, FAQ).

## Accessibility & Inclusion

Screen-reader labels on logo and controls (`sr-only`), keyboard-operable language and site switches; body text 16px MuseoSans 300/500 in navy on white.
