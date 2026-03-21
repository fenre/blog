function fullSiteUrl(siteRoot, pathname) {
  if (!siteRoot) return pathname || "";
  const root = siteRoot.replace(/\/$/, "");
  if (!pathname || pathname === "/") return `${root}/`;
  const p = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return root + p;
}

export default {
  locale: "en",
  alternateUrl: "/",
  eleventyComputed: {
    hreflangNo: (data) => {
      const base = (data.metadata?.siteUrl || "").replace(/\/$/, "");
      return fullSiteUrl(base, "/");
    },
    hreflangEn: (data) => {
      const base = (data.metadata?.siteUrl || "").replace(/\/$/, "");
      return fullSiteUrl(base, "/en/");
    },
    websiteJsonLd: (data) => {
      const base = (data.metadata?.siteUrl || "").replace(/\/$/, "");
      return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: data.metadata?.title,
        url: fullSiteUrl(base, "/en/"),
        description: data.metadata?.descriptionEn || data.metadata?.description,
        inLanguage: "en",
        publisher: {
          "@type": "Organization",
          name: data.metadata?.title,
          url: base,
        },
      };
    },
  },
};
