---
name: eleventy-github-pages-blog
description: >-
  Develops and ships static blogs with Eleventy (11ty), GitHub Actions, and GitHub
  Pages—Nunjucks layouts, Markdown, i18n, pathPrefix for project sites, RSS/sitemap,
  and gh/npm workflows. Use when editing this blog repo, Eleventy config, content/posts,
  GitHub Pages deploy, Site workflow, Dependabot, or when the user mentions 11ty,
  Eleventy, GitHub Pages, static site generation, or bilingual Norwegian/English posts.
---

# Eleventy + GitHub Pages (this blog)

## Stack (what matters)

| Piece | Role |
|-------|------|
| **Eleventy 3** | Static site generator; input `content/`, output `_site/` (gitignored). |
| **Nunjucks** | Layouts in `content/_includes/layouts/` (`.njk`); Markdown processed through Nunjucks where configured. |
| **Data** | Global `content/_data/` → `metadata` (from `metadata.js` + `metadata.base.json`), `i18n.json`. |
| **GitHub Actions** | `.github/workflows/site.yml` — `npm ci`, two builds (default + `SITE_URL`/`PATH_PREFIX`), deploy to Pages on `main`. |
| **GitHub Pages** | Project site URL: `https://<owner>.github.io/<repo>/`, not the org root. |

## Eleventy conventions used here

- **`eleventy.config.js`**: `pathPrefix` from env `PATH_PREFIX` (default `/`); filters (`fullSiteUrl`, `localeDate`, …); collections `postsSortedNo` / `postsSortedEn`.
- **URLs in templates**: Use the `url` filter for paths that must respect `pathPrefix` (e.g. `{{ '/assets/css/main.css' | url }}`). GitHub project sites need `/repo-name/...` in links.
- **Permalinks**: Posts — Norwegian `index.md` → `/posts/<slug>/`; English `index.en.md` → `/en/posts/<slug>/` (see `content/posts/posts.11tydata.js`).
- **Do not edit `_site/`** — always `npm run build` (or CI).

## GitHub Pages + CI

- **Settings → Pages → Source: GitHub Actions** (required once). If deploy fails with “Ensure GitHub Pages has been enabled”, fix this first.
- **Workflow**: `Site` — on PR/push runs build only; on `main` push or `workflow_dispatch` on `main`, also uploads `_site/` and runs `deploy-pages`.
- **Build env**: `SITE_URL=https://<owner>.github.io/<repo>`, `PATH_PREFIX=/<repo>/` — matches `metadata.siteUrl` override and Eleventy `pathPrefix`.
- **Local parity check**:  
  `SITE_URL=https://<owner>.github.io/<repo> PATH_PREFIX=/<repo>/ npm run build`

## Content rules (bilingual)

- Each post: `content/posts/<slug>/index.md` — **Norwegian**; `index.en.md` — **English** (same slug folder).
- UI strings: `content/_data/i18n.json` (`no` / `en`).
- Feeds: `/feed.xml` (nb), `/en/feed.xml` (en). Update both when changing feed behaviour.

## npm / CLI

| Command | Use |
|---------|-----|
| `npm ci` | CI and reproducible installs (prefer over `npm install` in automation). |
| `npm run build` | Production Eleventy build → `_site/`. |
| `npm run serve` | Local dev with reload. |
| `gh auth status` | Verify GitHub CLI. |
| `gh workflow run site.yml --ref main` | Trigger deploy (after workflow allows `workflow_dispatch`). |

## Agent checklist for code changes

1. Run `npm run build` and fix errors.
2. For bilingual posts: **both** `index.md` and `index.en.md` exist or intentionally document why not.
3. **Release hygiene** (repo root `AGENTS.md`): bump `package.json` version, add `RELEASE_NOTES.md` section, update `docs/DEVELOPMENT.md` only if setup/paths/commands changed.

## Deeper reference

- Project-specific layout, exporter, troubleshooting: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
- Pages setup, Dependabot, `gh` push: [docs/GITHUB_PAGES.md](docs/GITHUB_PAGES.md)
- Eleventy docs: [11ty.dev](https://www.11ty.dev/docs/) — especially [Configuration](https://www.11ty.dev/docs/config/), [Collections](https://www.11ty.dev/docs/collections/), [Permalinks](https://www.11ty.dev/docs/permalinks/), [Data cascade](https://www.11ty.dev/docs/data-cascade/), and [pathPrefix](https://www.11ty.dev/docs/config/#deploy-to-a-subpath-with-pathprefix).
- GitHub Pages + Actions: [Using custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow)

Optional detail: [reference.md](reference.md) (commands, env vars, failure modes).
