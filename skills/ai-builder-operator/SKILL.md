---
name: ai-builder-operator
description: Use when the target app has its OWN built-in AI builder or generator (a "Build with AI", "Generate with AI", "Ask AI", or similar) and you need to produce content inside it (a funnel, landing page, email, workflow, design). Drive the app's native AI to generate a first draft, then verify and correct it, instead of hand-building element by element.
---

# ai-builder-operator

Many SaaS tools now ship their own AI builder ("Build with AI", "Generate with AI", "Ask AI"). When one exists, use it: it produces a whole draft in one shot, far faster and more reliably than placing elements by hand through automation. Rotom's job is to drive that AI and then verify what it made.

## How to use
1. Get into the app with a saved login (see the `logged-in-session` form).
2. Find the AI builder entry point, often a "Build with AI" / "Generate with AI" / "Ask AI" button on a list page or in an editor panel. Use `rotom_locate`; if it is a custom tab or control the DOM cannot resolve, `rotom_screenshot` then `rotom_click_at` (the vision fallback).
3. Give it a clear, structured prompt: the goal, the audience, the single call to action, the exact copy for the key elements, and the sections you want. Type it into the AI's prompt box with `rotom_fill` and submit.
4. Wait for generation with `rotom_wait_for`, then `rotom_screenshot` the result.

## Verify before you accept or publish (the important part)
In-app AI builders get the STRUCTURE right but the SPECIFICS wrong: wrong merge fields, wrong recipients, placeholder copy, missing steps. Never accept or publish the raw output.
- Read the generated result and check it against the brief.
- Fix specifics with targeted edits (`resilient-locator` and the app's own edit controls).
- Leave it as a DRAFT for a human to QA and publish, unless you are explicitly cleared to publish.

## Rules
- Prefer the app's own AI builder over hand-building; it is the fast path.
- Custom builder controls (tabs, dropdowns, canvases) usually need the vision fallback (screenshot + `rotom_click_at`) because the DOM cannot resolve them.
- Always verify. Treat AI output as a first draft, not a finished asset.

## Driving an iframe-based AI builder (the ProseMirror / iframe case)
Builder canvases and their prompt editors often run inside an iframe, so `rotom_fill` (page-level DOM locators) can't reach them. The way through:
1. `rotom_click_at` the prompt box to focus it (coordinate clicks land inside iframes).
2. `rotom_type` your prompt, keystrokes go to the focused element regardless of iframe boundaries.
3. `rotom_click_at` the send button (or `rotom_press "Enter"` where that submits).
This was proven on GoHighLevel's "Build with AI". `rotom_type` + `rotom_press` (added v0.4.0) close the keyboard gap. A remaining nice-to-have is frame-aware *locating* (so you can target in-frame controls by role/text instead of coordinates), but click_at + type already covers the common case.
