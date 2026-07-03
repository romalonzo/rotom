---
name: writing-rotom-forms
description: Use when adding a new Rotom form (capability). Explains the anatomy of a form — a SKILL.md plus the MCP tool(s) it drives plus a test — and how to pressure-test it so an agent actually invokes it under real pressure instead of defaulting to raw automation.
---

# writing-rotom-forms

A Rotom form is one RPA capability, shipped as three things that travel together:
1. A **SKILL.md** — when to reach for it and exactly how to use its tools (imperative, example-first).
2. The **MCP tool(s)** it drives, in `server/src` (reuse the resilient cascade in `locator.ts`).
3. A **test** in `server/test` that proves it against the fixture.

## Writing the SKILL.md
- The `description` must name the trigger situation ("Use when ...") — that is what gets matched to decide whether to load the skill, so make it concrete.
- Body: how-to steps first, then rules. Keep it short; link to sibling forms.

## Pressure-test it
A form only helps if the agent actually calls it. Before shipping, run adversarial checks: give a subagent a realistic task under pressure (time limits, an easy raw-selector shortcut, an authority telling it to "just use css") and confirm it still reaches for the form. If it does not, sharpen the trigger wording in the `description`.

## Rules
- One capability per form. Do not bundle.
- Every form ships with a passing test against `server/test/fixture.html`.
- Prefer the most robust mechanism first; fall back to vision or OCR only when the DOM cannot do it.
