---
name: using-rotom
description: Read this first when a task involves operating a website or app UI — clicking, filling, navigating, or extracting data. Explains what Rotom is and which Rotom form to reach for so the automation survives brittle selectors and dynamic pages instead of flaking like a raw Playwright script.
---

# Using Rotom

Rotom gives you reliable hands for operating any UI. When a task means driving a browser or automating a web app, reach for a Rotom "form" instead of hand-rolling raw Playwright, so the automation holds up when selectors change or the page is dynamic.

## Forms available
- **resilient-locator** — find an element by several strategies (role, text, test id, structure) so it does not break when the DOM shifts.
- **vision-fallback** — when the DOM approach fails, locate and act on the element by what the screen actually looks like.
- **structured-extract** — pull structured data off a rendered page reliably.

## When to use Rotom
- Any browser or UI automation where selectors may be brittle or the page is dynamic.
- Extracting structured data from a rendered page.
- Any step a plain Playwright script would flake on.

## Principle
Try the most robust locator first (role / visible text / test id), fall back to vision only when the DOM cannot resolve the target, and verify the action actually succeeded before moving to the next step.

> Status: resilient-locator is live via the rotom MCP tools (rotom_open / rotom_locate / rotom_click / rotom_fill / rotom_get_text / rotom_close). vision-fallback and structured-extract are next. This bootstrap defines how the forms fit together.
