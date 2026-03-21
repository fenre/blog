# Reference: Eleventy + GitHub Pages (blog)

## Environment variables (CI / local)

| Variable | Purpose |
|----------|---------|
| `SITE_URL` | Public site root (e.g. `https://user.github.io/repo`). Overrides `metadata.siteUrl` via `content/_data/metadata.js`. |
| `PATH_PREFIX` | Eleventy `pathPrefix` (e.g. `/repo/` for GitHub project sites). |

## Typical failure modes

| Symptom | Likely cause |
|---------|----------------|
| **404** on Pages | Pages source not GitHub Actions; or wrong URL (use `/<repo>/`, not site root only). |
| **Deploy 404 / “Ensure GitHub Pages enabled”** | Pages not enabled or Actions not selected as source. |
| **Broken CSS / assets** on Pages | Missing `pathPrefix` or `url` filter on asset paths. |
| **Wrong canonical/RSS** | `SITE_URL` must include `/repo` segment for project sites. |

## GitHub Actions (this repo)

- **Permissions**: `contents: read` for build; `pages: write` + `id-token: write` for deploy job.
- **Artifacts**: Build uploads `_site` as generic artifact; deploy job downloads, then `upload-pages-artifact` + `deploy-pages`.

## Eleventy file types

- `*.md` — Markdown (often with front matter).
- `*.njk` — Nunjucks (templates, XML/RSS feeds as templates).
- `*.11tydata.js` — Directory or global data with `eleventyComputed` for dynamic fields.

## Related tools (not in repo but useful)

- **GitHub Desktop** — Push/pull; CLI auth separate from Desktop OAuth.
- **Dependabot** — `.github/dependabot.yml`; review/merge PRs for npm + Actions.
