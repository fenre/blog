# blog

Static export of posts from [fsudmann.com](https://www.fsudmann.com) (Blogger, custom domain), built with [Eleventy](https://www.11ty.dev/). **Norwegian** is the default language (**`/`, `/posts/...`**); **English** lives under **`/en/`** and **`/en/posts/...`**, with a language control in the header.

## Layout

- `content/posts/<slug>/index.md` — front matter (title, date, source URL, categories) plus Markdown body.
- `content/posts/<slug>/images/` — images referenced from that post with relative paths.
- `content/_includes/layouts/` — Nunjucks layouts (base, home, post).
- `_site/` — generated site (run `npm run build`).

## Build and preview

```bash
npm install
npm run build    # output in _site/
npm run serve    # local server with reload
```

## Re-export from the live site

```bash
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python scripts/export_blogger_fsudmann.py
```

The script uses the Atom feed (`/feeds/posts/default`), follows `rel="next"` when the feed is paginated, downloads embedded images (typically from `blogger.googleusercontent.com`), and rewrites links to local files.

## Automation

Push to **`main`** builds with Eleventy and deploys to **GitHub Pages** (`.github/workflows/site.yml`). Every **pull request** runs the same build checks without deploying. **Dependabot** opens weekly PRs for npm and GitHub Actions (`.github/dependabot.yml`). Details: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) and [docs/GITHUB_PAGES.md](docs/GITHUB_PAGES.md).

## Documentation

- **[docs/GITHUB_PAGES.md](docs/GITHUB_PAGES.md)** — enable GitHub Pages, Actions deploy, env vars (`SITE_URL`, `PATH_PREFIX`), troubleshooting.
- **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)** — how everything fits together, redo steps, troubleshooting.
- **[RELEASE_NOTES.md](RELEASE_NOTES.md)** — version history and what each release includes.
- **[AGENTS.md](AGENTS.md)** — release checklist for humans and Cursor (version bump + notes on each ship).

Project version is in `package.json` (`version`); new releases get a matching entry at the top of `RELEASE_NOTES.md`.

**Discovery:** built site includes RSS (`/feed.xml`), sitemap, `robots.txt`, `llms.txt`, and JSON-LD — see `docs/DEVELOPMENT.md`. Default site URL is in `content/_data/metadata.base.json`; for GitHub Pages, CI sets `SITE_URL` automatically (see `docs/GITHUB_PAGES.md`).
