#!/usr/bin/env node
/**
 * Rotom MCP server — the RPA reliability layer for Claude Code.
 *
 * Core idea: instead of the model hand-picking one brittle CSS/XPath selector
 * (what a bare Playwright MCP does), the caller passes semantic hints and the
 * server resolves them through a resilience cascade, reports which strategy
 * matched, and falls back to the agent's own vision (screenshot + click-at) or
 * OCR when the DOM cannot identify the target.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { chromium, type Browser, type Page } from "playwright";
import { resolve, describe, type Hints } from "./locator.js";

let browser: Browser | null = null;
let page: Page | null = null;

async function ensurePage(): Promise<Page> {
  if (!page) throw new Error("No page is open. Call rotom_open with a URL first.");
  return page;
}

const hintsShape = {
  role: z.string().optional().describe("ARIA role, e.g. button, link, textbox, checkbox"),
  name: z.string().optional().describe("Accessible name / visible label of the element"),
  text: z.string().optional().describe("Visible text on the element"),
  label: z.string().optional().describe("Associated form-field label"),
  placeholder: z.string().optional().describe("Input placeholder text"),
  testId: z.string().optional().describe("data-testid value"),
  css: z.string().optional().describe("CSS selector — last-resort fallback"),
  xpath: z.string().optional().describe("XPath — last-resort fallback"),
  exact: z.boolean().optional().describe("Match text/name exactly (default false)"),
};

const server = new McpServer({ name: "rotom", version: "0.2.0" });

server.tool(
  "rotom_open",
  "Launch a Chromium browser and navigate to a URL. Call this before locating or acting on elements.",
  {
    url: z.string().describe("The URL to open"),
    headless: z.boolean().optional().describe("Run headless (default true)"),
  },
  async ({ url, headless }) => {
    const h = headless ?? true;
    if (!browser) {
      try {
        browser = await chromium.launch({ headless: h });
      } catch {
        try {
          browser = await chromium.launch({ headless: h, channel: "chrome" });
        } catch {
          throw new Error("Could not launch a browser. Install one with: npx playwright install chromium");
        }
      }
    }
    if (!page) page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });
    return { content: [{ type: "text", text: `Opened ${page.url()} — "${await page.title()}"` }] };
  }
);

server.tool(
  "rotom_locate",
  "Resolve an element using the resilient cascade (role+name, testId, label, placeholder, text, role, css, xpath) and report which strategy matched. Use this to confirm an element is findable before acting.",
  hintsShape,
  async (h) => {
    const p = await ensurePage();
    const r = await resolve(p, h);
    if (!r)
      return { content: [{ type: "text", text: "No element matched the hints (tried in resilience order). Add a role+name or a testId — those are the most robust. If the DOM cannot identify it, use rotom_screenshot then rotom_click_at." }], isError: true };
    return { content: [{ type: "text", text: `Matched via ${r.strategy}${r.matches > 1 ? ` (first of ${r.matches})` : ""}: ${await describe(r.locator)}` }] };
  }
);

server.tool(
  "rotom_click",
  "Locate an element with the resilient cascade and click it (auto-waits for actionability). Returns which strategy matched.",
  hintsShape,
  async (h) => {
    const p = await ensurePage();
    const r = await resolve(p, h);
    if (!r) return { content: [{ type: "text", text: "Cannot click: no element matched the hints. Try rotom_screenshot + rotom_click_at." }], isError: true };
    await r.locator.scrollIntoViewIfNeeded();
    await r.locator.click();
    return { content: [{ type: "text", text: `Clicked via ${r.strategy}.` }] };
  }
);

server.tool(
  "rotom_fill",
  "Locate an input with the resilient cascade and fill it with a value.",
  { ...hintsShape, value: z.string().describe("The text to type into the field") },
  async (h) => {
    const p = await ensurePage();
    const { value, ...hints } = h;
    const r = await resolve(p, hints as Hints);
    if (!r) return { content: [{ type: "text", text: "Cannot fill: no element matched the hints." }], isError: true };
    await r.locator.fill(value);
    return { content: [{ type: "text", text: `Filled via ${r.strategy}.` }] };
  }
);

server.tool(
  "rotom_get_text",
  "Locate an element with the resilient cascade and return its visible text.",
  hintsShape,
  async (h) => {
    const p = await ensurePage();
    const r = await resolve(p, h);
    if (!r) return { content: [{ type: "text", text: "No element matched the hints." }], isError: true };
    return { content: [{ type: "text", text: (await r.locator.innerText()).trim() || "(empty)" }] };
  }
);

server.tool(
  "rotom_extract",
  "Extract structured data from the page. Give a list of fields, each with a key plus resilient-locator hints; returns a JSON object mapping each key to the matched element's text (or null if not found).",
  {
    fields: z
      .array(z.object({ key: z.string().describe("Output key for this field"), ...hintsShape }))
      .describe("Fields to extract; each uses the resilient cascade"),
  },
  async ({ fields }) => {
    const p = await ensurePage();
    const out: Record<string, string | null> = {};
    for (const f of fields) {
      const { key, ...hints } = f;
      const r = await resolve(p, hints as Hints);
      out[key] = r ? (await r.locator.innerText()).trim() : null;
    }
    return { content: [{ type: "text", text: JSON.stringify(out, null, 2) }] };
  }
);

server.tool(
  "rotom_wait_for",
  "Wait until an element matching the hints appears (polls up to timeoutMs). Use to verify an action's effect or wait for dynamic content before proceeding.",
  { ...hintsShape, timeoutMs: z.number().optional().describe("Max wait in ms (default 5000)") },
  async (h) => {
    const p = await ensurePage();
    const { timeoutMs, ...hints } = h;
    const deadline = timeoutMs ?? 5000;
    const start = await p.evaluate(() => performance.now());
    let elapsed = 0;
    while (elapsed < deadline) {
      const r = await resolve(p, hints as Hints);
      if (r) return { content: [{ type: "text", text: `Appeared via ${r.strategy} after ~${Math.round(elapsed)}ms.` }] };
      await p.waitForTimeout(250);
      elapsed = (await p.evaluate(() => performance.now())) - start;
    }
    return { content: [{ type: "text", text: `Timed out after ${deadline}ms waiting for the element.` }], isError: true };
  }
);

server.tool(
  "rotom_screenshot",
  "Take a screenshot of the current page and return it as an image. Use this as the vision fallback: when rotom_locate cannot find an element, look at the screenshot, then act with rotom_click_at.",
  { fullPage: z.boolean().optional().describe("Capture the full scrollable page (default false = viewport)") },
  async ({ fullPage }) => {
    const p = await ensurePage();
    const buf = await p.screenshot({ fullPage: fullPage ?? false });
    return { content: [{ type: "image", data: buf.toString("base64"), mimeType: "image/png" }] };
  }
);

server.tool(
  "rotom_click_at",
  "Click at absolute viewport coordinates (x, y). The vision fallback: use after rotom_screenshot when the DOM cannot identify the target but you can see it.",
  { x: z.number().describe("X coordinate in CSS pixels"), y: z.number().describe("Y coordinate in CSS pixels") },
  async ({ x, y }) => {
    const p = await ensurePage();
    await p.mouse.click(x, y);
    return { content: [{ type: "text", text: `Clicked at (${x}, ${y}).` }] };
  }
);

server.tool(
  "rotom_ocr",
  "Read text from the page (or a located element) using OCR. Use when text is baked into an image/canvas the DOM cannot expose. Requires the optional tesseract.js dependency.",
  { ...hintsShape, fullPage: z.boolean().optional().describe("OCR the full page if no element hints are given") },
  async (h) => {
    const p = await ensurePage();
    const { fullPage, ...hints } = h;
    let image: Buffer;
    const hasHints = Object.values(hints).some((v) => v !== undefined);
    if (hasHints) {
      const r = await resolve(p, hints as Hints);
      if (!r) return { content: [{ type: "text", text: "No element matched the hints to OCR." }], isError: true };
      image = await r.locator.screenshot();
    } else {
      image = await p.screenshot({ fullPage: fullPage ?? false });
    }
    let createWorker: (lang: string) => Promise<{ recognize: (img: Buffer) => Promise<{ data: { text: string } }>; terminate: () => Promise<void> }>;
    try {
      // @ts-ignore optional dependency, resolved at runtime
      ({ createWorker } = await import("tesseract.js"));
    } catch {
      return { content: [{ type: "text", text: "OCR needs the optional tesseract.js dependency. Install it in the server: npm install tesseract.js" }], isError: true };
    }
    const worker = await createWorker("eng");
    try {
      const { data } = await worker.recognize(image);
      return { content: [{ type: "text", text: (data.text || "").trim() || "(no text recognized)" }] };
    } finally {
      await worker.terminate();
    }
  }
);

server.tool(
  "rotom_close",
  "Close the browser and free resources.",
  {},
  async () => {
    if (browser) {
      await browser.close();
      browser = null;
      page = null;
    }
    return { content: [{ type: "text", text: "Browser closed." }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
