# rotom-mcp

The MCP server behind [Rotom](https://github.com/romalonzo/rotom) — the RPA reliability layer for Claude Code. Resilient Playwright automation: a cascade locator, a vision fallback (screenshot + click-at), structured extraction, OCR, and wait/verify.

## Use in Claude Code

```
claude mcp add rotom -- npx -y rotom-mcp
```

First run needs a browser: `npx playwright install chromium`.

## Tools

`rotom_open`, `rotom_locate`, `rotom_click`, `rotom_fill`, `rotom_get_text`, `rotom_extract`, `rotom_wait_for`, `rotom_screenshot`, `rotom_click_at`, `rotom_ocr`, `rotom_close`.

`rotom_ocr` needs the optional `tesseract.js` dependency.

MIT.
