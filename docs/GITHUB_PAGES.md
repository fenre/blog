# GitHub Pages with Eleventy (this repo)

This guide walks through **hosting the built static site** at:

`https://<username>.github.io/<repository-name>/`

That pattern is a **project site**. The HTML/CSS and `index.html` are produced by **Eleventy** (`npm run build` → `_site/`). GitHub Pages does **not** run Eleventy by itself; this repo uses **GitHub Actions** to build on every push to `main` and publish `_site/`.

---

## What you need to know first

| Concept | Detail |
|--------|--------|
| **Source vs output** | The repo holds **source** (`content/`, `eleventy.config.js`, …). The **website files** live in `_site/` after a build. `_site/` is gitignored. |
| **Project URL** | If the repo is `fenre/blog`, the public site is **`https://fenre.github.io/blog/`** (note the `/blog/` segment). Links and CSS must use that prefix; the workflow sets `PATH_PREFIX` and `SITE_URL` for you. |
| **User/org site (optional)** | A repo named **`<username>.github.io`** (no subdirectory) is served at `https://<username>.github.io/`. This project’s workflow targets a **project site**; for a user site you would change `PATH_PREFIX` to `/` and `SITE_URL` to `https://<username>.github.io`. |

---

## Step 1 — Push this repository to GitHub

1. Create a repository on GitHub (e.g. `blog` under your user).
2. Add the remote if needed:  
   `git remote add origin https://github.com/<username>/<repo>.git`
3. Push the default branch (here **`main`**):  
   `git push -u origin main`

Ensure the workflow file is on `main`: `.github/workflows/site.yml`.

---

## Step 2 — Enable GitHub Pages (Actions as source)

1. On GitHub, open the repo → **Settings**.
2. In the left sidebar, open **Pages** (under “Code and automation”).
3. Under **Build and deployment** → **Source**, choose **GitHub Actions** (not “Deploy from a branch” for this setup).

You do **not** need to pick a branch/folder manually; the workflow registers the deployment.

---

## Step 3 — Allow the workflow to run

1. Open the **Actions** tab. You should see **“Site”** (build + optional deploy).
2. Push any commit to `main` (or run the workflow manually: **Actions** → **Site** → **Run workflow**).

The first successful run may take a minute or two.

---

## Step 4 — Confirm the deployment

1. After the **Site** workflow finishes (deploy job only runs on `main`), open **Settings → Pages** again. You should see a message that the site was published and a URL like **`https://<username>.github.io/<repo>/`**.
2. Open that URL in a browser. You should see the home page (post list) and styles. If CSS is missing, check that you are not mixing “branch” deployment with Actions; this site expects the Actions build.

---

## Step 5 — What the workflow does (for debugging)

File: `.github/workflows/site.yml`

**Every push and every pull request**

1. **Checkout** the repo on `ubuntu-latest`.
2. **Node 20** + `npm ci` (uses `package-lock.json`).
3. **`npm run build`** twice: once with default metadata (sanity check), once with:
   - `SITE_URL` = `https://<owner>.github.io/<repo>`
   - `PATH_PREFIX` = `/<repo>/`  
     (Eleventy `pathPrefix` so `/assets/...` becomes `/<repo>/assets/...`).

**On push to `main` or a manual “Run workflow” on `main`**

4. **`actions/upload-artifact`** saves `_site/` from the Pages build.
5. **`deploy` job:** **`actions/upload-pages-artifact`** then **`actions/deploy-pages`** publishes to GitHub Pages.

Pull requests only run the **build** job (no deploy). Fork PRs stay safe: the build job uses `contents: read` only.

If the build fails, open the failed job log and look for errors from `npm ci` or `npm run build`.

---

## Step 6 — Local check (optional but useful)

Simulate the GitHub build on your machine:

```bash
export SITE_URL=https://<username>.github.io/<repo>
export PATH_PREFIX=/<repo>/
npm run build
```

Open `_site/index.html` in a browser **or** serve the folder:

```bash
npx serve _site
```

Paths should include `/<repo>/` in links (e.g. `/blog/assets/...` when repo is `blog`).

---

## Step 7 — Custom domain (optional)

1. Add a `CNAME` or DNS records as in [GitHub’s custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).
2. In the repo **Settings → Pages**, set the **Custom domain** and enforce HTTPS if offered.
3. Set `SITE_URL` and `PATH_PREFIX` to match the real public URL:
   - For a **custom domain at the root** (e.g. `https://blog.example.com/`), you typically want `PATH_PREFIX=/` and `SITE_URL=https://blog.example.com`.
   - Update the workflow `env` block accordingly, or use repository **Variables** / **Secrets** and reference them in the workflow.

---

## Dependabot (automated dependency PRs)

The repo includes [`.github/dependabot.yml`](../.github/dependabot.yml). Dependabot opens **weekly** pull requests for:

- **npm** (`package.json` / `package-lock.json`)
- **GitHub Actions** (e.g. `actions/checkout`, `actions/setup-node`)

**Low-touch workflow:** enable [**Allow auto-merge**](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/automatically-merging-a-pull-request) in the repository settings and turn on auto-merge for Dependabot PRs after CI passes (requires a [branch protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches) rule that requires the **Site** workflow to succeed, optional but recommended).

---

## Troubleshooting

| Symptom | What to check |
|--------|----------------|
| **404** on Pages | Pages **Source** must be **GitHub Actions**; wait for a green workflow run. |
| **No CSS / broken links** | Wrong `PATH_PREFIX` vs repo name. For project sites, `PATH_PREFIX` must be `/<repo>/`. |
| **Wrong canonical or RSS URLs** | `SITE_URL` must be the real public origin including `/repo` for project sites, e.g. `https://user.github.io/repo`. |
| **Workflow permission errors** | Repo **Settings → Actions → General**: ensure workflows can read contents and **Pages** write is allowed; `permissions` in the YAML should include `pages: write` and `id-token: write`. |

---

## Related files

- `eleventy.config.js` — `pathPrefix` from `PATH_PREFIX`.
- `content/_data/metadata.js` — `siteUrl` from `SITE_URL` or defaults from `metadata.base.json`.
- `content/_includes/layouts/base.njk` — uses the `url` filter for root-relative assets and nav.

For general project layout, see [DEVELOPMENT.md](DEVELOPMENT.md).
