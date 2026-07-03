#!/usr/bin/env node
/**
 * Rotom MCP server — resilient Playwright automation for Claude Code.
 *
 * The point of Rotom is the resilient-locator cascade: instead of the model
 * hand-picking one brittle CSS/XPath selector (what a bare Playwright MCP does),
 * the caller passes semantic hints and the server tries them in resilience order
 * (role+name, testId, label, placeholder, text, role, css, xpath) and reports
 * which one actually matched.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { chromium, type Browser, type Page, type Locator } from "playwright";

let browser: Browser | null = null;
let page: Page | null = null;

async function ensurePage(): Promise<Page> {
  if (!page) throw new Error("No page is open. Call rotom_open with a URL first.");
  return page;
}

interface Hints {
  role?: string;
  name?: string;
  text?: string;
  label?: string;
  placeholder?: string;
  testId?: string;
  css?: string;
  xpath?: string;
  exact?: boolean;
}

interface Resolved {
  locator: Locator;
  strategy: string;
  matches: number;
}

/** Try locator strategies most-robust-first; return the first that matches. */
async function resolve(p: Page, h: Hints): Promise<Resolved | null> {
  const exact = h.exact ?? false;
  const attempts: Array<{ strategy: string; make: () => Locator }> = [];

  if (h.role && h.name)
    attempts.push({ strategy: `role="${h.role}" name="${h.name}"`, make: () => p.getByRole(h.role as never, { name: h.name, exact }) });
  if (h.testId)
    attempts.push({ strategy: `testId="${h.testId}"`, make: () => p.getByTestId(h.testId as string) });
  if (h.label)
    attempts.push({ strategy: `label="${h.label}"`, make: () => p.getByLabel(h.label as string, { exact }) });
  if (h.placeholder)
    attempts.push({ strategy: `placeholder="${h.placeholder}"`, make: () => p.getByPlaceholder(h.placeholder as string, { exact }) });
  if (h.text)
    attempts.push({ strategy: `text="${h.text}"`, make: () => p.getByText(h.text as string, { exact }) });
  if (h.role && !h.name)
    attempts.push({ strategy: `role="${h.role}"`, make: () => p.getByRole(h.role as never) });
  if (h.css)
    attempts.push({ strategy: `css="${h.css}"`, make: () => p.locator(h.css as string) });
  if (h.xpath)
    attempts.push({ strategy: `xpath`, make: () => p.locator(`xpath=${h.xpath}`) });

  for (const a of attempts) {
    try {
      const loc = a.make();
      const count = await loc.count();
      if (count >= 1) {
        return { locator: count === 1 ? loc : loc.first(), strategy: a.strategy, matches: count };
      }
    } catch {
      // this strategy failed to build/evaluate — fall through to the next
    }
  }
  return null;
}

async function describe(loc: Locator): Promise<string> {
  try {
    return await loc.evaluate((el) => {
      const e = el as HTMLElement;
      const text = (e.innerText || e.textContent || "").trim().slice(0, 80);
      const r = e.getBoundingClientRect();
      return `<${e.tagName.toLowerCase()}> "${text}" at (${Math.round(r.x)},${Math.round(r.y)}) ${Math.round(r.width)}x${Math.round(r.height)}`;
    });
  } catch {
    return "(element found; details unavailable)";
  }
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

const server = new McpServer({ name: "rotom", version: "0.1.0" });

server.tool(
  "rotom_open",
  "Launch a Chromium browser and navigate to a URL. Call this before locating or acting on elements.",
  {
    url: z.string().describe("The URL to open"),
    headless: z.boolean().optional().describe("Run headless (default true)"),
  },
  async ({ url, headless }) => {
    if (!browser) browser = await chromium.launch({ headless: headless ?? true });
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
      return { content: [{ type: "text", text: "No element matched the hints (tried in resilience order). Add a role+name or a testId — those are the most robust." }], isError: true };
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
    if (!r) return { content: [{ type: "text", text: "Cannot click: no element matched the hints." }], isError: true };
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
    const r = await resolve(p, hints);
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
