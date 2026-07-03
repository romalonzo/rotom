---
name: resilient-locator
description: Use when clicking, filling, or reading an element during browser automation and you want it to survive DOM and layout changes. Describe the element with semantic hints and let Rotom resolve it through a resilience cascade (role+name, test id, label, placeholder, text, role, css, xpath) via the rotom_locate / rotom_click / rotom_fill tools, instead of hand-picking one brittle CSS or XPath selector.
---

# resilient-locator

Hand-picking a single CSS or XPath selector is the number one cause of flaky browser automation. Instead, describe the element with as many robust hints as you can and let Rotom resolve it through a resilience cascade, which reports the strategy that actually matched.

## How to use
1. `rotom_open` with the URL.
2. To act on an element, call `rotom_locate`, `rotom_click`, or `rotom_fill` with hints, richest first:
   - `role` + `name` — best: semantic role plus accessible name (e.g. role `button`, name `Sign in`)
   - `testId` — a `data-testid`, very stable
   - `label` — a form-field label
   - `placeholder`
   - `text` — visible text
   - `css` / `xpath` — last resort only
3. Read the returned strategy. If it matched on `css` or `xpath`, add a `role`+`name` or `testId` hint next time so it stays robust.

## Rules
- Always provide a `role`+`name` or a `testId` when you can; reserve `css`/`xpath` for elements nothing else can identify.
- Prefer `rotom_click` / `rotom_fill` over locating and acting separately — they locate and act atomically with Playwright's auto-wait.
- If nothing matches, re-read the page and refine the hints rather than dropping straight to `xpath`.
- Call `rotom_close` when finished.

## Why this beats a raw selector
A single CSS/XPath breaks the moment the DOM shifts. Role/name and test-id survive restyling and re-layout. The cascade tries the robust strategies first, falls back to brittle ones only if it must, and tells you which it used, so you can keep the automation healthy over time.
