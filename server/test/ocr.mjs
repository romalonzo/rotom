// Standalone OCR check (kept out of the fast e2e suite because tesseract.js
// downloads a language model on first run and is slow).
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { pathToFileURL, fileURLToPath } from "node:url";
import path from "node:path";
import assert from "node:assert/strict";

const here = path.dirname(fileURLToPath(import.meta.url));
const fixture = pathToFileURL(path.join(here, "fixture.html")).href;
const serverEntry = path.join(here, "..", "dist", "index.js");
const transport = new StdioClientTransport({ command: process.execPath, args: [serverEntry] });
const client = new Client({ name: "rotom-ocr", version: "0" });
const textOf = (r) => (r.content || []).filter((c) => c.type === "text").map((c) => c.text).join("\n");

try {
  await client.connect(transport);
  await client.callTool({ name: "rotom_open", arguments: { url: fixture, headless: true } });
  const r = await client.callTool({ name: "rotom_ocr", arguments: { role: "heading", name: "Rotom Test Fixture" } });
  const text = textOf(r);
  console.log("OCR read:", JSON.stringify(text));
  assert.match(text, /rotom/i);
  await client.callTool({ name: "rotom_close", arguments: {} });
  console.log("PASS — OCR recognized the heading");
} catch (e) {
  console.error("FAIL:", e && e.message ? e.message : e);
  process.exitCode = 1;
} finally {
  try { await client.close(); } catch {}
}
