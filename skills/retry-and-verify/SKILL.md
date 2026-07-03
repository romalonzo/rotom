---
name: retry-and-verify
description: Use after any action that changes the page (click, fill, submit) to confirm it actually worked before moving on, and to recover from transient failures. This is the RPA discipline that keeps long automations from silently drifting off course.
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
