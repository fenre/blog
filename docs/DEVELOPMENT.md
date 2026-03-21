# Development notes

This file records how the site is assembled so you can **reproduce or redo** the setup on another machine or after a clean clone.

## Prerequisites

- **Node.js** (current LTS is fine) and **npm** — for Eleventy.
- **Python 3** — for the optional Blogger re-export script only.

## Automation (CI, Pages, dependencies)

| What | Where |
|------|--------|
| **Build every push / PR** | [`.github/workflows/site.yml`](../.github/workflows/site.yml) — `npm ci`, two Eleventy builds (default + GitHub Pages env). |
| **Deploy** | Same workflow: only on **push to `main`**, uploads `_site/` and runs GitHub Pages deploy. PRs and forks never get `pages: write`. |
| **Manual run** | Actions → **Site** → **Run workflow** (`workflow_dispatch`). |
| **Dependency updates** | [`.github/dependabot.yml`](../.github/dependabot.yml) — weekly PRs for npm and Actions; optional auto-merge after CI. |

See [GITHUB_PAGES.md](GITHUB_PAGES.md) for Pages settings and troubleshooting.

## Repository layout

| Path | Purpose |
|------|---------|
| `content/index.md` | Home page (uses `layouts/home.njk`). |
| `content/posts/<slug>/index.md` | One Markdown file per post; YAML front matter (`title`, `date`, `source`, `categories`). |
| `content/posts/<slug>/images/` | Images for that post; Markdown uses relative paths like `images/foo.jpg`. |
| `content/posts/posts.11tydata.js` | Directory data: post layout, `tags: posts`, computed `permalink` `/posts/<slug>/`. |
| `content/_includes/layouts/` | Nunjucks layouts: `base.njk`, `home.njk`, `post.njk`. |
| `content/assets/` | Static assets copied to `_site/assets/` (e.g. CSS). |
| `eleventy.config.js` | Eleventy input/output, passthrough copies, date filters, `postsSorted` collection. |
| `.gitignore` | Ignore rules: `node_modules/`, `_site/`, Python venv/cache (`.venv/`, `__pycache__/`), and common local files. |
| `scripts/export_blogger_fsudmann.py` | Fetches Blogger Atom feed for `www.fsudmann.com`, writes/updates posts and images. |
| `requirements.txt` | Python dependencies for the export script. |
| `_site/` | **Generated** — do not edit; created by `npm run build`. Gitignored. |
| `content/_data/metadata.base.json` | Default site-wide values (`siteUrl`, `title`, `description`, `author`, `locale`). Loaded by `metadata.js`. |
| `content/_data/metadata.js` | Exposes `metadata` to templates; **`siteUrl` can be overridden with env `SITE_URL`** (used by GitHub Actions for Pages). |
| `content/feed.xml.njk`, `sitemap.xml.njk`, `robots.txt.njk`, `llms.txt.njk` | Generated machine-readable endpoints (RSS, sitemap, robots, llms.txt). |

## AI and machine-readable discovery

After `npm run build`, the published site exposes:

- **`/feed.xml`** — RSS 2.0; full post content in `content:encoded` for readers and tools.
- **`/sitemap.xml`** — URL list with `lastmod` for crawlers.
- **`/robots.txt`** — `Sitemap:` line (uses `metadata.siteUrl`).
- **`/llms.txt`** — Short summary and links for LLM-oriented discovery (see [llms.txt initiative](https://llmstxt.org/)).
- **JSON-LD** (`application/ld+json`) — `WebSite` on `/`, `BlogPosting` on each post.
- **Open Graph / Twitter** — titles, descriptions, and images where a post has images under `images/`.

## Regenerating the site (normal workflow)

1. Install JS dependencies: `npm install`
2. Build: `npm run build` → output in `_site/`
3. Local preview: `npm run serve`

## Re-exporting posts from Blogger

Use this when the live blog has new or changed posts and you want to refresh `content/posts/`.

1. Create/activate a venv and install Python deps:

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate   # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. Run the exporter (from repo root):

   ```bash
   python scripts/export_blogger_fsudmann.py
   ```

**What the script does**

- Downloads the Atom feed `https://www.fsudmann.com/feeds/posts/default` (with `max-results=500` on the first request).
- Follows `rel="next"` links until all pages are consumed (pagination-safe for larger blogs).
- For each entry, uses the **full HTML** in `<content type="html">` (no per-page scrape required for these posts).
- Parses HTML with BeautifulSoup, collects `img` / relevant `a` URLs, downloads images under each post’s `images/` folder, rewrites URLs to relative paths.
- Converts body HTML to Markdown (`html2text`), writes `index.md` with front matter.
- Uses a short delay between HTTP requests and a fixed `User-Agent` string.

**After re-export**

- Run `npm run build` again and check `_site/`.
- If you add new posts, Eleventy picks them up automatically as long as they stay under `content/posts/<slug>/index.md`.

## Eleventy behaviour (quick reference)

- **Input directory:** `content/` (see `eleventy.config.js` → `dir.input`).
- **Permalinks:** Posts are served as `/posts/<slug>/` (see `content/posts/posts.11tydata.js`).
- **Passthrough:** Image extensions under `content/posts/**` are copied into `_site/posts/...` so relative `images/` links resolve.
- **Home post list:** `collections.postsSorted` — posts tagged `posts`, sorted by date descending.

## Release process

- **Version** lives in `package.json` (`version`) and must stay in sync with **new entries** in `RELEASE_NOTES.md`.
- **Who updates it:** anyone (or any agent) who ships a change should bump semver, add a `RELEASE_NOTES.md` section at the **top** for that version, and refresh this file **if** redo steps or layout changed.
- **Checklist:** see [`AGENTS.md`](../AGENTS.md) in the repo root.

## Troubleshooting

- **`pip install` fails (externally managed environment):** use a venv as above; do not rely on system `pip` without a venv.
- **Missing images after build:** ensure `eleventy.config.js` still includes passthrough for the image extensions you use; ensure Markdown paths stay relative to the post folder.
- **Wrong post URL:** permalink logic lives in `content/posts/posts.11tydata.js` (`eleventyComputed.permalink`).
