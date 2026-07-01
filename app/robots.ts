import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Account/admin flows are private or user-specific — no SEO value,
        // and indexing them can dilute crawl budget and leak internal UI.
        disallow: ["/admin", "/onboarding", "/api/"],
      },
      // Explicit allow rules for AI answer-engine crawlers (GEO/AEO visibility
      // — ChatGPT, Perplexity, Google AI Overviews). The wildcard rule above
      // already permits these, but naming them here signals clear intent so
      // a future blanket AI-bot block doesn't accidentally catch them too.
      { userAgent: "OAI-SearchBot", allow: "/", disallow: ["/admin", "/onboarding", "/api/"] },
      { userAgent: "ChatGPT-User", allow: "/", disallow: ["/admin", "/onboarding", "/api/"] },
      { userAgent: "PerplexityBot", allow: "/", disallow: ["/admin", "/onboarding", "/api/"] },
      { userAgent: "Claude-SearchBot", allow: "/", disallow: ["/admin", "/onboarding", "/api/"] },
      { userAgent: "ClaudeBot", allow: "/", disallow: ["/admin", "/onboarding", "/api/"] },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
