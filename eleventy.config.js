/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default function (eleventyConfig) {
  eleventyConfig.addFilter("readableDate", (value) => {
    if (!value) return "";
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  });

  eleventyConfig.addFilter("htmlDateString", (value) => {
    if (!value) return "";
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  });

  eleventyConfig.addFilter("isoDate", (value) => {
    if (!value) return "";
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString();
  });

  eleventyConfig.addFilter("stripTrailingSlash", (value) =>
    String(value || "").replace(/\/$/, ""),
  );

  eleventyConfig.addFilter("hasTag", (tags, name) => {
    if (!tags || !name) return false;
    if (Array.isArray(tags)) return tags.includes(name);
    return tags === name;
  });

  eleventyConfig.addFilter("absoluteUrl", (path, baseUrl) => {
    if (!path || !baseUrl) return path || "";
    if (String(path).startsWith("http")) return path;
    const base = String(baseUrl).replace(/\/$/, "");
    const p = path.startsWith("/") ? path : `/${path}`;
    return base + p;
  });

  /**
   * Absolute URL for a site path. Uses string join (not `new URL(path)`) so paths like
   * `/posts/foo/` append after a subpath site root (e.g. `https://user.github.io/repo`).
   */
  eleventyConfig.addFilter("fullSiteUrl", (pathname, siteRoot) => {
    if (!siteRoot) return pathname || "";
    const root = String(siteRoot).replace(/\/$/, "");
    if (!pathname || pathname === "/") return `${root}/`;
    const p = pathname.startsWith("/") ? pathname : `/${pathname}`;
    return root + p;
  });

  eleventyConfig.addFilter("jsonLdSafe", (obj) => {
    if (!obj) return "";
    return JSON.stringify(obj).replace(/</g, "\\u003c");
  });

  eleventyConfig.addFilter("xmlEscape", (str) => {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  });

  eleventyConfig.addFilter("rssDate", (value) => {
    if (!value) return "";
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toUTCString();
  });

  eleventyConfig.addCollection("postsSorted", (collectionApi) =>
    collectionApi.getFilteredByTag("posts").sort((a, b) => b.date - a.date),
  );

  eleventyConfig.addPassthroughCopy({
    "content/assets": "assets",
  });

  for (const ext of ["jpg", "jpeg", "png", "gif", "webp"]) {
    eleventyConfig.addPassthroughCopy(`content/posts/**/*.${ext}`);
  }

  const raw = process.env.PATH_PREFIX ?? "/";
  const pathPrefix =
    raw === "/" || raw === ""
      ? "/"
      : `/${String(raw).replace(/^\/+|\/+$/g, "")}/`;

  return {
    pathPrefix,
    dir: {
      input: "content",
      includes: "_includes",
      output: "_site",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["md", "njk", "html"],
  };
}
