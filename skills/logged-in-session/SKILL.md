---
name: logged-in-session
description: Use when the target site sits behind a login (a CRM, dashboard, or any account-gated app such as GoHighLevel). Open with a named persistent profile so the session is saved and reused across runs; the first time, open headful with channel chrome and let the human log in by hand (including 2FA), then automate the now-authenticated session.
---

# logged-in-session

Rotom can operate sites behind a login without ever handling credentials, by reusing a saved browser profile. The human logs in once; Rotom reuses it forever after.

## First-time login (the human does this once)
1. `rotom_open` the site's login URL with `profile: "<name>"`, `headless: false`, `channel: "chrome"` (for example profile `ghl` for GoHighLevel).
2. A real Chrome window opens. Ask the human to log in there by hand, including any 2FA, and to tell you when they are done.
3. `rotom_page` to confirm you landed on an authenticated page before you start acting.

## Every run after that
- `rotom_open` with the same `profile` reuses the saved login, so you are already authenticated. No re-login needed.

## Rules
- Never ask for or handle passwords or 2FA codes. The human logs in in the headful window.
- One profile per site (`ghl`, etc.). Do not run two automations on the same profile at once, the profile directory locks.
- For unattended reuse, keep the profile on the machine that runs Rotom (for example an always-on server).
