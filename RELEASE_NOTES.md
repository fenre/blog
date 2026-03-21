# Release notes

All notable changes to this project are documented here. Versions follow the site version in `package.json`.

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
