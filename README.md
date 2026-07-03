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

## Forms

- **resilient-locator** — find an element by several strategies so it survives DOM changes.
- **vision-fallback** — when the DOM fails, locate and act by what the screen looks like.
- **structured-extract** — pull structured data off a rendered page reliably.

More forms (OCR, self-healing, orchestration) are on the roadmap.

## Status

Early, and building in the open. Live now: the MCP server and the first form, **resilient-locator**. Next up: vision-fallback, structured-extract, then OCR and retry/verification. Star and watch to follow along.

## Development

The MCP server lives in `server/` (TypeScript):

```
cd server
npm install
npx playwright install chromium
npm run build
```

The plugin's `.mcp.json` launches the built server via `${CLAUDE_PLUGIN_ROOT}/server/dist/index.js`. Tools: `rotom_open`, `rotom_locate`, `rotom_click`, `rotom_fill`, `rotom_get_text`, `rotom_close`.

## License

MIT
