---
name: KBC Particulieren (current state)
description: Descriptive design system of www.kbc.be/particulieren/nl, captured 2026-10-19T16:40:43Z
colors:
  navy: "#003665"
  navy-70: "#003665b3"
  white: "#ffffff"
  cyan: "#00aeef"
  cyan-hover: "#008bbf"
  teal: "#009985"
  teal-hover: "#007a6a"
  cyan-tint: "#00aeef0a"
  navy-10: "#0036651a"
typography:
  h1:
    fontFamily: "MuseoSans, Arial, sans-serif"
    fontSize: "40px"
    fontWeight: 700
  h2:
    fontFamily: "MuseoSans, Arial, sans-serif"
    fontSize: "30px"
    fontWeight: 700
  h3:
    fontFamily: "MuseoSans, Arial, sans-serif"
    fontSize: "24px"
    fontWeight: 700
  h4:
    fontFamily: "MuseoSans, Arial, sans-serif"
    fontSize: "20px"
    fontWeight: 700
  body:
    fontFamily: "MuseoSans, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 300
  small:
    fontFamily: "MuseoSans, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 300
rounded:
  card: "8px"
  pill: "100px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "32px"
components:
  button-primary:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
  button-primary-hover:
    backgroundColor: "{colors.teal-hover}"
  button-secondary:
    backgroundColor: "{colors.cyan}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
  link:
    textColor: "{colors.cyan}"
---

## Overview

The KBC private-customer site is a white, airy product site set entirely in MuseoSans, with navy (#003665) for text and headings, teal (#009985) for primary actions and cyan (#00aeef) for links, icons and secondary actions. Cards carry an 8px radius and a soft navy shadow; buttons are pills.

## Colors

Navy #003665 carries all text and headings (borders at 70% alpha). White is the page ground; a 4% cyan tint (#00aeef0a) is the alternate section surface. Teal #009985 (hover #007a6a) is the primary call to action; cyan #00aeef (hover #008bbf) is the link and secondary-action colour. Source: `_computed-styles.json#aggregate.colors`.

## Typography

One family, MuseoSans (300 body, 500 medium, 700 headings), served from the owner CDN. Ad-hoc scale: 40 / 30 / 24 / 20 / 18 / 16 / 14 px. Source: `_computed-styles.json#aggregate.type`.

## Layout

Centered grid container with a two-row header (site switch + utility bar; logo + mega-menu + account buttons), full-width hero bands, card rows, a four-column footer. Container and caps: `DESIGN.json#extensions.breakpoints` (cap-probe).

## Elevation & Depth

Shadows: rgba(0,54,101,.08) 0 4px 16px (cards), rgba(0,54,101,.1) 0 4px 16px, rgba(0,0,0,.1) 0 20px 20px -20px.

## Shapes

8px card radius, 100px pill buttons, circular icon badges.

## Components

Primary pill button (teal), secondary pill (cyan), outline pill, link with chevron, product card with image, USP check list, comparison table, FAQ accordion, contact block, loan warning strip, app banner.

## Do's and Don'ts

- Do keep navy text on white and teal for the main action.
- Don't introduce new colours or display faces — the system is single-family.
