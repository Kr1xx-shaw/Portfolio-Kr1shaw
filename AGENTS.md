# Repository guidance

## Keep reads and tool output small

- Start with `git status --short` and targeted `rg` searches. Read only relevant source files or line ranges. Avoid whole-repository dumps and unrestricted diffs.
- Do not open, search, summarize or analyze `dist/server/`, `.wrangler/`, `.cache/`, `coverage/`, `tmp/`, dependency directories, source maps or generated archives. Never print their contents, including base64 payloads. These are generated output, not source. Use file metadata only if needed to diagnose a build problem.
- Do not read image, video, model or font bytes as text or base64. For a visual task, inspect only the relevant image with an image viewer. Static media are required deployment assets and must remain tracked.
- Do not read bundled vendor libraries (`dist/assets/three.core.js`, `three.module.js`, `GLTFLoader.js`) unless the task specifically requires investigating that library. Inspect the authored integration first.
- `.rgignore` excludes generated output, media and vendor bundles from default searches; it is not a security boundary. For a specific asset lookup, use a narrowly scoped explicit path or metadata query, not a broad `--no-ignore` search.

## Source and deployment

- Cloudflare deploys `worker.mjs` using `wrangler.toml`, with static assets from `dist/` bound as `ASSETS` and R2 as `BUCKET`.
- **Most of `dist/` is authored source in this repository.** Keep its HTML, CSS, JavaScript, content, fonts and images. Do not ignore or delete the entire directory or `dist/assets/`.
- `dist/server/index.js` is an optional legacy Sites bundle containing inlined assets. It is ignored by Git and excluded from Workers Assets by `dist/.assetsignore`. Cloudflare does not need it.
- Default build: `node build.mjs` (or `npm run build`). This verifies the Cloudflare entry and static dependencies without producing the legacy bundle. Checks: `node check.mjs` and `node check-pointer.mjs`.
- Only run `node build-legacy.mjs` / `npm run build:legacy` when explicitly asked to prepare a legacy Sites package. Never open or commit the resulting server bundle.
- Keep website appearance, interaction, R2 bindings and administrator authorization unchanged unless the user requests changes to them.
