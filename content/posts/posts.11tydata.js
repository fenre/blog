import fs from "node:fs";
import path from "node:path";

function fullSiteUrl(siteRoot, pathname) {
  if (!siteRoot) return pathname || "";
  const root = siteRoot.replace(/\/$/, "");
  if (!pathname || pathname === "/") return `${root}/`;
  const p = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return root + p;
}

function slugFromStem(stem) {
  const parts = stem.split("/").filter(Boolean);
  const i = parts.indexOf("posts");
  return i >= 0 ? parts[i + 1] : parts.at(-2);
}

function firstImagePublicPath(stem) {
  const slug = slugFromStem(stem);
  if (!slug) return null;
  const imgDir = path.join(process.cwd(), "content", "posts", slug, "images");
  if (!fs.existsSync(imgDir)) return null;
  const files = fs.readdirSync(imgDir).filter((f) =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(f),
  );
  if (!files.length) return null;
  return `/posts/${slug}/images/${files[0]}`;
}

export default {
  layout: "layouts/post.njk",
  tags: "posts",
  eleventyComputed: {
    permalink: (data) => {
      const slug = slugFromStem(data.page.filePathStem);
      return `/posts/${slug}/index.html`;
    },
    firstOgImagePath: (data) => firstImagePublicPath(data.page.filePathStem),
    metaDescription: (data) => {
      if (data.description) return data.description;
      const site = data.metadata?.title || "";
      return `${data.title} — Recipes and food notes from ${site}.`;
    },
    ogImageAbsolute: (data) => {
      const base = (data.metadata?.siteUrl || "").replace(/\/$/, "");
      const rel = firstImagePublicPath(data.page.filePathStem);
      return rel ? fullSiteUrl(base, rel) : "";
    },
    blogPostingJsonLd: (data) => {
      const base = (data.metadata?.siteUrl || "").replace(/\/$/, "");
      const pageUrl = data.page.url;
      const url = fullSiteUrl(base, pageUrl);
      const raw = data.date instanceof Date ? data.date : new Date(data.date);
      const iso = Number.isNaN(raw.getTime()) ? undefined : raw.toISOString();
      const desc =
        data.description ||
        `${data.title} — Recipes and food notes from ${data.metadata?.title || ""}.`;

      const imgPath = firstImagePublicPath(data.page.filePathStem);

      const obj = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: data.title,
        url,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        datePublished: iso,
        dateModified: iso,
        author: { "@type": "Person", name: data.metadata?.author },
        publisher: {
          "@type": "Organization",
          name: data.metadata?.title,
          url: base,
        },
        description: desc,
        inLanguage: data.metadata?.language || "en",
      };

      if (imgPath) {
        obj.image = [fullSiteUrl(base, imgPath)];
      }

      if (Array.isArray(data.categories) && data.categories.length) {
        obj.keywords = data.categories.join(", ");
      }

      return obj;
    },
  },
};
