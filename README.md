# Rotom

**UiPath-grade RPA for Playwright, as a Claude Code plugin.**

Superpowers gives your coding agent a methodology. Rotom gives it reliable hands. Rotom wraps Playwright with the resilience that makes enterprise RPA robust, self-healing locators, a vision-and-OCR fallback, and structured extraction, and ships it as Claude Code skills, subagents, and an MCP server you install in one command.

Named after the Pokemon that inhabits electronic devices and operates them. Each capability ships as a Rotom "form."

## Why

Vanilla Playwright is powerful but brittle. One selector change and the script breaks; there is no vision fallback, no OCR, no self-healing. Rotom closes that gap with AI-driven resilience and packages it so an agent can drive it directly, in the same one-command, skills-first way that made superpowers spread.

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

Early, and building in the open. The plugin skeleton and bootstrap are in place; the MCP server and the individual forms are in active development. Star and watch to follow along.

## License

MIT
