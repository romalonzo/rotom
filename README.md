# Rotom

**UiPath-grade RPA for Playwright, as a Claude Code plugin.**

Superpowers gives your coding agent a methodology. Rotom gives it reliable hands. Rotom wraps Playwright with the resilience that makes enterprise RPA robust, self-healing locators, a vision-and-OCR fallback, and structured extraction, and ships it as Claude Code skills, subagents, and an MCP server you install in one command.

Named after the Pokemon that inhabits electronic devices and operates them. Each capability ships as a Rotom "form."

## Why

Vanilla Playwright is powerful but brittle. One selector change and the script breaks; there is no vision fallback, no OCR, no self-healing. Rotom closes that gap and packages it so an agent can drive it directly, in the same one-command, skills-first way that made superpowers spread. Rotom is not another browser SDK to code against; it is a Claude Code plugin that works alongside your existing browser tooling and adds the resilience and RPA discipline that bare automation lacks.

## Install

```
/plugin marketplace add romalonzo/rotom
/plugin install rotom@rotom
```

Restart Claude Code after installing. Requires Claude Code 2.0.13 or newer.

Once installed, Rotom auto-loads its `using-rotom` guide at the start of each session (a SessionStart hook), so the agent knows when to reach for the forms.

## Forms

- **resilient-locator** — resolve an element through a cascade of strategies so it survives DOM changes.
- **vision-fallback** — when the DOM cannot find it, screenshot and act by coordinates.
- **structured-extract** — pull page data into clean JSON.
- **ocr** — read text baked into images or canvas (optional tesseract.js).
- **retry-and-verify** — confirm each action worked and recover from transient failures.
- **writing-rotom-forms** — the meta-form for authoring and pressure-testing new forms.

Roadmap: self-healing locator cache, table extraction, orchestration/queues.

## Status

Early, and building in the open. Live now: the MCP server (11 tools) and six forms — resilient-locator, vision-fallback, structured-extract, ocr, retry-and-verify, writing-rotom-forms — with an end-to-end test suite passing against a local fixture. Star and watch to follow along.

## Development

The MCP server lives in `server/` (TypeScript):

```
cd server
npm install
npx playwright install chromium
npm run build
npm test        # end-to-end against test/fixture.html
```

Tools: `rotom_open`, `rotom_locate`, `rotom_click`, `rotom_fill`, `rotom_get_text`, `rotom_extract`, `rotom_wait_for`, `rotom_screenshot`, `rotom_click_at`, `rotom_ocr`, `rotom_close`.

Run it locally before publishing:

```
claude mcp add rotom -- node /absolute/path/to/rotom/server/dist/index.js
```

## Distribution

`.mcp.json` launches the server with `npx -y rotom-mcp`, so once the server package is published to npm the plugin installs and runs with no build step (first run still needs a browser: `npx playwright install chromium`). To publish (maintainers): `cd server && npm publish`.

## License

MIT
