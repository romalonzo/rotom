---
name: structured-extract
description: Use whenever you need to pull two or more fields off a rendered page (form values, a details panel, table cells, key/value pairs) instead of writing a querySelector loop, a page.evaluate scrape, or a manual DOM walk, which all break on any layout change. Define the fields you want, each with a plain-language locator hint (its label or nearby text), and call rotom_extract; every field resolves through the same resilient cascade and comes back as clean JSON. Reach for this the moment you are tempted to hand-roll extraction logic.
---

# structured-extract

## How to use
1. `rotom_open` the page.
2. Call `rotom_extract` with a `fields` array; each field is a `key` plus resilient hints (role+name, testId, label, css, ...).
3. You get back JSON mapping each key to the matched element's text (or `null` if not found).

## Rules
- Give each field the most robust hint you can (role+name or testId) so extraction survives redesigns.
- A `null` value means that field's hints did not match — refine them rather than assuming the data is absent.
- For repeating rows, scope each field with a `css` selector for that row; a dedicated table extractor is on the roadmap.
