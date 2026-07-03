---
name: vision-fallback
description: Use when rotom_locate cannot find an element from the DOM — a canvas or image-based UI, a custom widget with no ARIA roles, or content you cannot reach through selectors. Take a screenshot with rotom_screenshot, visually find the target, then act with rotom_click_at using the coordinates you see.
---

# vision-fallback

When the DOM cannot identify a target (canvas apps, image maps, unlabeled custom widgets), fall back to sight.

## How to use
1. Call `rotom_screenshot` to get the current view as an image.
2. Look at the image, find the target, and read its position.
3. Call `rotom_click_at` with the x,y (viewport CSS pixels) of the target's center.
4. Verify with `rotom_wait_for` or `rotom_get_text` that the action worked.

## Rules
- Try `rotom_locate` first. Vision is the fallback, not the default — it is slower and less precise.
- Coordinates are viewport-relative CSS pixels. If the target is below the fold, scroll first, then re-screenshot.
- A coordinate click has no auto-wait or actionability check, so always verify the effect afterward (see the retry-and-verify form).
