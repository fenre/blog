# Release notes

All notable changes to this project are documented here. Versions follow the site version in `package.json`.

## 1.3.0 — 2026-03-21

### Summary

Maximum hands-off operation: one CI/Pages workflow, Dependabot for npm and Actions, docs for auto-merge.

### Added

- **`.github/dependabot.yml`** — weekly update PRs for **npm** and **GitHub Actions**.
- **`workflow_dispatch`** on the Site workflow — manual “Run workflow” from the Actions tab.

### Changed

- **`.github/workflows/site.yml`** — replaces separate CI + deploy files: every **push** and **pull request** runs `npm ci` and two builds (default + Pages env); **deploy to GitHub Pages** only on **push to `main`**, using a generic artifact between jobs so fork PRs only need `contents: read`. Deploy job keeps `concurrency: pages` with `cancel-in-progress: false`.
- **`README.md`**, **`docs/DEVELOPMENT.md`**, **`docs/GITHUB_PAGES.md`** — document automation, Dependabot, and optional auto-merge.

## 1.2.2 — 2026-03-21

### Summary

GitHub Pages deployment via Actions: correct subpath URLs for project sites, plus documentation.

### Added

- **`.github/workflows/deploy-github-pages.yml`** — on push to `main`, runs `npm ci` / `npm run build` and deploys `_site/` with `SITE_URL` and `PATH_PREFIX` set for `https://<user>.github.io/<repo>/`.
- **`docs/GITHUB_PAGES.md`** — step-by-step Pages setup, env vars, and troubleshooting.

### Changed

- **`content/_data/metadata.json`** → **`metadata.base.json`** + **`metadata.js`** — `siteUrl` can be overridden with env `SITE_URL` (CI); defaults unchanged for local builds.
- **`eleventy.config.js`** — `pathPrefix` from env `PATH_PREFIX`; **`fullSiteUrl`** filter for canonical/RSS/sitemap when the site lives under a subpath.
- **Layouts and templates** — `url` filter on internal links and `/assets/…`; feeds and sitemap use `fullSiteUrl`.
- **`content/posts/posts.11tydata.js`** — JSON-LD and OG image URLs use the same root joining rules as templates.
- **`README.md`**, **`docs/DEVELOPMENT.md`**, **`content/llms.txt.njk`** — point to metadata files and GitHub Pages doc.

## 1.2.1 — 2026-03-21

### Summary

Repository hygiene for GitHub: ignore build output and dependencies so pushes stay small and reproducible.

### Added

- **`.gitignore`** — excludes `node_modules/`, `_site/`, Python venv/cache (export script), and common local/OS files.

### Changed

- **`docs/DEVELOPMENT.md`** — repository layout table documents `.gitignore`.

## 1.2.0 — 2026-03-21

### Summary

Improved machine-readable and AI-facing discovery: structured data, feeds, sitemap, and `llms.txt`.

### Added

- **`content/_data/metadata.json`** — canonical `siteUrl`, site title, description, author, locale (edit when deploying to a new host).
- **`/feed.xml`** — RSS 2.0 with full post HTML in `content:encoded`.
- **`/sitemap.xml`** — URLs for home, feed, `llms.txt`, and all posts with `lastmod`.
- **`/robots.txt`** — allows crawling and points to the sitemap (generated from `metadata.siteUrl`).
- **`/llms.txt`** — short site summary and links to RSS, sitemap, and index (generated).
- **Head metadata** on all pages: canonical URL, `meta description`, Open Graph, Twitter cards, `article:published_time` on posts.
- **JSON-LD**: `WebSite` on the home page; `BlogPosting` on posts (headline, dates, author, publisher, image, keywords from categories).
- **Microformats** (h-feed / h-entry) on the home list and posts for parsers that use them.
- **Eleventy filters**: `stripTrailingSlash`, `hasTag`, `isoDate`, `jsonLdSafe`, `xmlEscape`, `rssDate`.

### Changed

- **Layouts** (`base.njk`, `post.njk`, `home.njk`) — richer `<head>`, semantic/main landmark, nav links to RSS and `llms.txt`.
- **`content/posts/posts.11tydata.js`** — computed `metaDescription`, OG image path, `blogPostingJsonLd`.
- **`content/index.md`** — home `description` for meta tags.

## 1.1.0 — 2026-03-21

### Summary

Enforced automated release hygiene: agents must bump version and update notes; added project rules and agent checklist.

### Added

- **[AGENTS.md](AGENTS.md)** — release checklist (semver, `RELEASE_NOTES.md`, `docs/DEVELOPMENT.md` when setup changes).
- **[.cursor/rules/release-and-documentation.mdc](.cursor/rules/release-and-documentation.mdc)** — always-on Cursor rule for the same behaviour.

### Changed

- **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)** — “Release process” section points to `AGENTS.md`.
- **[README.md](README.md)** — links `AGENTS.md`.

## 1.0.0 — 2026-03-21

### Summary

Initial documented release: static site generated with **Eleventy 3**, content sourced from a **Blogger** export (`www.fsudmann.com`) via a Python feed-based importer.

### Added

- **Eleventy** (`eleventy.config.js`): build to `_site/`, Nunjucks layouts under `content/_includes/layouts/`, home page listing posts (`postsSorted`), date filters (`readableDate`, `htmlDateString`), passthrough for post images and `content/assets/`.
- **Content model:** `content/posts/<slug>/index.md` plus `images/` per post; front matter with title, date, source URL, categories.
- **Styling:** `content/assets/css/main.css` (readable defaults, light/dark aware).
- **Blogger export script:** `scripts/export_blogger_fsudmann.py` + `requirements.txt` (requests, beautifulsoup4, html2text).
- **Documentation:** `README.md`, `docs/DEVELOPMENT.md`, `RELEASE_NOTES.md`.
- **Git ignores:** `.venv/`, `node_modules/`, `_site/`.

### Dependencies (high level)

- **Node:** `@11ty/eleventy` ^3.1.x (see `package.json` / lockfile for exact resolution).
- **Python (export only):** see `requirements.txt`.

### How to build this release

```bash
npm ci
npm run build
```

Optional: refresh posts from Blogger (see `docs/DEVELOPMENT.md`).
