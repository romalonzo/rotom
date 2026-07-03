# Publishing rotom-mcp

The plugin's `.mcp.json` launches the server with `npx -y rotom-mcp`, so the server package must be published to npm once. It is already publish-ready (verified with `npm publish --dry-run`: a clean 5-file tarball).

## One-time setup
```
npm login
```
(Interactive — logs you into your npm account. Only needed once per machine.)

## Publish — the one command
```
cd server && npm publish
```
This runs the build automatically (`prepublishOnly`) and publishes `rotom-mcp` to npm. `rotom-mcp` is currently unclaimed, so the first publish takes the name.

For later releases, bump `version` in `server/package.json` first, then run the same command.

## After publishing
Anyone can then install the plugin and it just works:
```
/plugin marketplace add romalonzo/rotom
/plugin install rotom@rotom
```
First run downloads a browser once: `npx playwright install chromium`.
