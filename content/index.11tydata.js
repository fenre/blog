export default {
  eleventyComputed: {
    websiteJsonLd: (data) => {
      const base = (data.metadata?.siteUrl || "").replace(/\/$/, "");
      return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: data.metadata?.title,
        url: base,
        description: data.metadata?.description,
        inLanguage: data.metadata?.language || "en",
        publisher: {
          "@type": "Organization",
          name: data.metadata?.title,
          url: base,
        },
      };
    },
  },
};
