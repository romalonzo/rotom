---
name: retry-and-verify
description: Use immediately after EVERY page-changing action (click, fill, submit, navigate), before doing anything else, to confirm the page actually reached the expected new state (an element appeared or disappeared, the URL changed, a value saved) and to retry transient failures. Do this even when the action looks like it worked: the most common way long automations fail is acting on a page that silently did not change, so every later step then runs against stale state. Assume nothing succeeded until you have verified it here.
---

# retry-and-verify

Never assume an action succeeded. Verify the effect, and retry deliberately on failure.

## Pattern
1. Act (`rotom_click` / `rotom_fill` / `rotom_click_at`).
2. Verify the expected effect with `rotom_wait_for` (an element or text that only appears on success) or `rotom_get_text` (a value that should have changed).
3. If verification fails: re-read the page (`rotom_locate` or `rotom_screenshot`), adjust the hints, and retry — at most 2 to 3 times, then stop and report what you saw instead of looping.

## Rules
- Define the success signal BEFORE acting (what should appear or change).
- Bound retries; escalate instead of looping forever.
- Prefer `rotom_wait_for` over fixed sleeps — it polls and returns the moment the signal appears.
