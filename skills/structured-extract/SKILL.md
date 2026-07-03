---
name: structured-extract
description: Use to pull structured data off a rendered page — form values, a details panel, key fields — into clean JSON. Define the fields you want with resilient-locator hints and call rotom_extract; each field resolves through the same cascade so extraction does not break on layout changes.
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
