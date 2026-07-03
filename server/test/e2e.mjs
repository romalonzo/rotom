// End-to-end test: drive the built Rotom MCP server exactly as Claude Code would,
// against a local HTML fixture, and assert the resilient cascade + actions work.
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";
import path from "node:path";
import assert from "node:assert/strict";

const here = path.dirname(fileURLToPath(import.meta.url));
const fixture = pathToFileURL(path.join(here, "fixture.html")).href;
const serverEntry = path.join(here, "..", "dist", "index.js");

const transport = new StdioClientTransport({ command: process.execPath, args: [serverEntry] });
const client = new Client({ name: "rotom-e2e", version: "0" });

function textOf(res) {
  return (res.content || []).filter((c) => c.type === "text").map((c) => c.text).join("\n");
}
async function call(name, args = {}) {
  const res = await client.callTool({ name, arguments: args });
  return { res, text: textOf(res) };
}

let passed = 0;
function ok(label) { passed++; console.log(`  ok  ${label}`); }

try {
  await client.connect(transport);

  // tools registered
  const tools = (await client.listTools()).tools.map((t) => t.name).sort();
  for (const t of ["rotom_open", "rotom_locate", "rotom_click", "rotom_fill", "rotom_get_text", "rotom_extract", "rotom_wait_for", "rotom_screenshot", "rotom_click_at", "rotom_ocr", "rotom_page", "rotom_type", "rotom_press", "rotom_close"]) {
    assert.ok(tools.includes(t), `tool ${t} registered`);
  }
  ok("all 14 tools registered");

  // open
  let r = await call("rotom_open", { url: fixture, headless: true });
  assert.match(r.text, /Rotom Test Fixture/i);
  ok("rotom_open loaded the fixture");

  // locate via each strategy
  r = await call("rotom_locate", { role: "button", name: "Sign in" });
  assert.match(r.text, /role="button"/);
  ok("locate: role+name");

  r = await call("rotom_locate", { testId: "email" });
  assert.match(r.text, /testId="email"/);
  ok("locate: testId");

  r = await call("rotom_locate", { label: "Password" });
  assert.match(r.text, /label="Password"/);
  ok("locate: label");

  r = await call("rotom_locate", { placeholder: "Search..." });
  assert.match(r.text, /placeholder=/);
  ok("locate: placeholder");

  r = await call("rotom_locate", { text: "Docs" });
  assert.match(r.text, /text="Docs"/);
  ok("locate: text");

  r = await call("rotom_locate", { css: ".only-css" });
  assert.match(r.text, /css="\.only-css"/);
  ok("locate: css fallback");

  // click and verify the effect
  await call("rotom_click", { role: "button", name: "Sign in" });
  r = await call("rotom_get_text", { css: "#status" });
  assert.equal(r.text, "clicked");
  ok("click changed the status text");

  // fill and verify via the echo div
  await call("rotom_fill", { label: "Password", value: "hunter2" });
  r = await call("rotom_get_text", { css: "#pwecho" });
  assert.equal(r.text, "hunter2");
  ok("fill set the input value");

  // keyboard type + press: focus the field, select-all, type via real keystrokes
  await call("rotom_click", { label: "Password" });
  await call("rotom_press", { key: "Control+A" });
  await call("rotom_type", { text: "kbdtyped" });
  r = await call("rotom_get_text", { css: "#pwecho" });
  assert.equal(r.text, "kbdtyped");
  ok("keyboard type + press worked on the focused field");

  // structured extract
  r = await call("rotom_extract", { fields: [
    { key: "title", role: "heading", name: "Rotom Test Fixture" },
    { key: "cssonly", css: ".only-css" },
  ] });
  const data = JSON.parse(r.text);
  assert.equal(data.title, "Rotom Test Fixture");
  assert.equal(data.cssonly, "CSS Only");
  ok("extract returned structured JSON");

  // wait_for the delayed button
  r = await call("rotom_wait_for", { role: "button", name: "Later", timeoutMs: 3000 });
  assert.match(r.text, /Appeared/);
  ok("wait_for caught the delayed element");

  // screenshot returns an image
  r = await call("rotom_screenshot", {});
  const hasImage = (r.res.content || []).some((c) => c.type === "image" && typeof c.data === "string" && c.data.length > 100);
  assert.ok(hasImage, "screenshot returned an image");
  ok("screenshot returned a PNG image");

  // click_at (no throw)
  r = await call("rotom_click_at", { x: 5, y: 5 });
  assert.match(r.text, /Clicked at/);
  ok("click_at executed");

  await call("rotom_close", {});
  ok("closed the browser");

  console.log(`\nPASS — ${passed} checks`);
} catch (err) {
  console.error("\nFAIL:", err && err.message ? err.message : err);
  process.exitCode = 1;
} finally {
  try { await client.close(); } catch {}
}
