#!/usr/bin/env node
// SessionStart hook for the Rotom plugin.
// Injects the using-rotom bootstrap so the agent knows the RPA forms exist and
// when to reach for them. Node (not bash) so it runs identically on every OS —
// Node is already required by the MCP server. JSON.stringify handles escaping.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const skillPath = join(here, "..", "skills", "using-rotom", "SKILL.md");

let skill;
try {
  skill = readFileSync(skillPath, "utf8");
} catch {
  skill = "Error reading using-rotom skill.";
}

const context = `<EXTREMELY_IMPORTANT>
You have Rotom in this session — the RPA reliability layer for operating any UI.

When a task involves driving a website or app (clicking, filling, navigating, extracting), use the Rotom forms and their rotom_* MCP tools instead of hand-rolling brittle selectors. Below is the full 'rotom:using-rotom' skill, your guide to the forms. For each individual form, use the Skill tool.

${skill}
</EXTREMELY_IMPORTANT>`;

// Emit the field the current host consumes. Claude Code reads the nested shape;
// Cursor reads additional_context; Copilot/SDK-standard hosts read additionalContext.
const payload = process.env.CURSOR_PLUGIN_ROOT
  ? { additional_context: context }
  : process.env.CLAUDE_PLUGIN_ROOT && !process.env.COPILOT_CLI
    ? { hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: context } }
    : { additionalContext: context };

process.stdout.write(JSON.stringify(payload));
