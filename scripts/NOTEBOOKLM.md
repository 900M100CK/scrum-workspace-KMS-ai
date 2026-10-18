# NotebookLM document sync troubleshooting

This is an owner-requested local documentation utility, not an application
service or adoption of a runtime AI provider. It uploads Markdown/Mermaid
source text only when invoked with `--upload`.

The installed `notebooklm-mcp` 2.0.0 authentication code recognises only
`https://notebooklm.google.com/`. On 12 October 2026 the owner reported a
post-login redirect to `https://notebook.google.com/`, leaving setup waiting
without a saved `browser_state/state.json`.

`notebooklm-domain-compat.mjs` runs as a Node preload for the sync subprocess.
It extends exactly four URL checks in the installed authentication module to
accept both exact HTTPS hosts. It does not change the npm cache, copy secrets,
or mark arbitrary URLs authenticated. An unexpected upstream implementation
fails explicitly. Node 24+ is the project requirement; the preload API is also
available in the observed local Node 22.23.0 installation.

Run from the repository root:

```powershell
node scripts/notebooklm_sync.mjs --auth
node scripts/notebooklm_sync.mjs --check
node scripts/notebooklm_sync.mjs --upload "https://notebook.google.com/notebook/<uuid>" docs
```

Keep the login window open until setup finishes. Upstream setup resets its own
Chrome profile, so do not repeatedly run `--auth` while another setup is active.
The profile is separate from everyday Chrome. Sessions are not permanent:
upstream health checks only for an existing state file younger than 24 hours,
not live notebook access. URL recognition alone is not proof of upload access.

The preload applies to this script, not other MCP client configurations.
The utility still prefers the existing machine-specific npm cache path and
otherwise runs the pinned `notebooklm-mcp@2.0.0` package through npx on Windows.
Uploads are additive, with no deduplication; do not rerun a batch blindly.
The utility stops at the first failed or unconfirmed source and reports the
nested ingestion error. A single `.md` or `.mmd` file may replace `docs` in
the upload command to retry only a reviewed failure.

The preload also fixes the source-dialog selectors: an earlier hidden emoji
palette has `role="dialog"` and used to intercept the upstream `.first()`
locator. Source dialogs and input fields now must be visible, and the emoji
palette is explicitly excluded. Other NotebookLM UI changes may still need
separate compatibility updates.

Checks:

```powershell
node --test tests/notebooklm-domain-compat.test.mjs
node --check scripts/notebooklm_sync.mjs
# Optional regression check using the installed MCP package and Chrome:
$env:NOTEBOOKLM_MCP_ENTRY = '<absolute path to notebooklm-mcp/dist/index.js>'
node --test tests/notebooklm-dialog.test.mjs
```

These checks cover URL compatibility and syntax, not a real Google login or
successful document ingestion. End-to-end verification requires interactive
login followed by saved-state and notebook-access checks.

## Verification on 12 October 2026

- Three URL compatibility tests passed.
- The opt-in Chrome regression passed with the installed package: hidden
  dialogs and both hidden/visible emoji palettes did not intercept source input.
- One live upload of `docs/adr/0005-ai-provider-pilot.md` to the owner's selected
  notebook succeeded; upstream reported the source count increasing from 1 to 2.
- The remaining documentation batch was not uploaded or verified in this test.
