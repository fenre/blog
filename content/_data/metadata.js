import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const base = JSON.parse(
  readFileSync(join(__dirname, "metadata.base.json"), "utf8"),
);

/** SITE_URL in CI = public site root (e.g. https://user.github.io/repo-name). */
export default {
  ...base,
  siteUrl: process.env.SITE_URL || base.siteUrl,
};
