import fs from "node:fs";
import path from "node:path";

function fullSiteUrl(siteRoot, pathname) {
  if (!siteRoot) return pathname || "";
  const root = siteRoot.replace(/\/$/, "");
  if (!pathname || pathname === "/") return `${root}/`;
  const p = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return root + p;
}

function isEnglishStem(stem) {
  return stem.endsWith("index.en") || stem.endsWith(".en");
}

function slugFromStem(stem) {
  const parts = stem.split("/").filter(Boolean);
  const i = parts.indexOf("posts");
  if (i >= 0 && parts[i + 1]) return parts[i + 1];
  return null;
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

function alternatePostPath(stem) {
  const slug = slugFromStem(stem);
  if (!slug) return null;
  const dir = path.join(process.cwd(), "content", "posts", slug);
  const isEn = isEnglishStem(stem);
  if (isEn) {
    if (fs.existsSync(path.join(dir, "index.md"))) return `/posts/${slug}/`;
    return null;
  }
  if (fs.existsSync(path.join(dir, "index.en.md"))) return `/en/posts/${slug}/`;
  return null;
}

export default {
  layout: "layouts/post.njk",
  tags: "posts",
  eleventyComputed: {
    locale: (data) => (isEnglishStem(data.page.filePathStem) ? "en" : "no"),
    permalink: (data) => {
      const stem = data.page.filePathStem;
      const slug = slugFromStem(stem);
      if (!slug) return undefined;
      if (isEnglishStem(stem)) return `/en/posts/${slug}/index.html`;
      return `/posts/${slug}/index.html`;
    },
    alternateUrl: (data) => alternatePostPath(data.page.filePathStem),
    hreflangNo: (data) => {
      const base = (data.metadata?.siteUrl || "").replace(/\/$/, "");
      const slug = slugFromStem(data.page.filePathStem);
      if (!slug) return null;
      const stem = data.page.filePathStem;
      const path = isEnglishStem(stem) ? `/posts/${slug}/` : data.page.url;
      return fullSiteUrl(base, path);
    },
    hreflangEn: (data) => {
      const base = (data.metadata?.siteUrl || "").replace(/\/$/, "");
      const slug = slugFromStem(data.page.filePathStem);
      if (!slug) return null;
      const stem = data.page.filePathStem;
      const path = isEnglishStem(stem) ? data.page.url : `/en/posts/${slug}/`;
      return fullSiteUrl(base, path);
    },
    firstOgImagePath: (data) => firstImagePublicPath(data.page.filePathStem),
    metaDescription: (data) => {
      if (data.description) return data.description;
      const site = data.metadata?.title || "";
      const loc = isEnglishStem(data.page.filePathStem) ? "en" : "no";
      const fb =
        loc === "en"
          ? `${data.title} — Recipes and food notes from ${site}.`
          : `${data.title} — Oppskrifter og matnotater fra ${site}.`;
      return fb;
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
      const loc = isEnglishStem(data.page.filePathStem) ? "en" : "no";
      const desc =
        data.description ||
        (loc === "en"
          ? `${data.title} — Recipes and food notes from ${data.metadata?.title || ""}.`
          : `${data.title} — Oppskrifter og matnotater fra ${data.metadata?.title || ""}.`);

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
        inLanguage: loc === "en" ? "en" : "nb",
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
