# Agent instructions (Cursor / automation)

When you finish work that **ships** or **materially changes** this project (features, fixes, tooling, docs that describe new behaviour), you **must** update versioning and notes—do not only suggest it to the user.

## Release checklist (do before ending the task)

1. **`package.json`** — Bump `version` with [semver](https://semver.org/): patch (fixes/docs-only/minor tweaks), minor (new capability), major (breaking).
2. **`RELEASE_NOTES.md`** — Add a **new section at the top** for that version: date (`YYYY-MM-DD`), short summary, `### Added` / `### Changed` / `### Fixed` as appropriate, and build commands if they changed.
3. **`docs/DEVELOPMENT.md`** — Update **only if** setup, paths, commands, or architecture changed (so a redo from scratch stays accurate).

If the change is trivial (e.g. typo in a post only), a version bump may be optional—use judgment; when in doubt, patch the version and note it in release notes.

## Files to read first on unfamiliar tasks

- [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) — layout, export script, Eleventy, troubleshooting.
- [`RELEASE_NOTES.md`](RELEASE_NOTES.md) — what each version included.
