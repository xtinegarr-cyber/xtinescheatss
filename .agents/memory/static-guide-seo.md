---
name: Static guide SEO
description: Why the storefront's search guide pages are generated as static HTML during builds.
---

Search-oriented guide pages must be generated into static HTML during the storefront build rather than relying only on client-side React route metadata.

**Why:** The storefront is a Vite single-page application; raw SPA responses do not contain a guide’s heading, body content, canonical URL, or article schema for crawlers. Static guide directories make each sitemap URL directly crawlable.

**How to apply:** Keep guide content as curated, useful entries rather than keyword variants. When adding or changing a guide, make sure the build generator continues to produce its directory page, sitemap entry, canonical URL, and structured Article/Breadcrumb data.