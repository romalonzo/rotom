# Contributing to Rotom

Rotom grows one **form** at a time. A form is a single RPA capability shipped as three things that travel together:
1. a skill (`skills/<form>/SKILL.md`),
2. the MCP tool(s) it drives (`server/src/`),
3. a test that proves it (`server/test/`).

The `writing-rotom-forms` skill is the canonical guide, read it first.

## Add a form
1. Build the tool in `server/src/` (reuse the resilient cascade in `locator.ts`).
2. Write `skills/<form>/SKILL.md`. The `description` must open with a concrete "Use when ..." trigger, that is what makes an agent actually invoke it.
3. Add a check to `server/test/e2e.mjs` (or a new test) against `server/test/fixture.html`.
4. Run the full loop below until green.
5. Pressure-test it: hand the form's description plus a tempting shortcut to a fresh agent and confirm it still reaches for the form. If it does not, sharpen the description.

## Principles
- One capability per form. No bundling.
- Most robust mechanism first; fall back to vision or OCR only when the DOM cannot do it.
- Every action should be verifiable (see the retry-and-verify form).
- Keep it dependency-light; heavy dependencies (like OCR) stay optional.

## Dev setup
```
cd server
npm install
npx playwright install chromium
npm run build
npm test
```

## Conventions
- TypeScript for the server; Node for hooks (cross-platform, no bash dependency).
- Comments only where the reason is non-obvious.
- MIT licensed. By contributing you agree your work ships under MIT.
