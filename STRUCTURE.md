# Website Structure & URL Hierarchy Documentation
**Domain:** `localsurgeseo.com`  
**Updated:** August 30, 2026  
**Total Canonical URLs:** 91  
**Architecture Model:** Hybrid Content-Led Local Authority (Hub-and-Spoke + Programmatic Directory)

---

## 1. Information Architecture Overview

The site is engineered around 5 distinct content layers, balancing high-intent commercial service queries, deep empirical research, editorial thought leadership, and interactive conversion assets:

```
localsurgeseo.com/
  ├── [Core & Commercial Foundations] (12 pages)
  │     ├── /                      -> Homepage & Core Value Proposition
  │     ├── /local-seo             -> Master Commercial Pillar
  │     ├── /pricing               -> Transparent Pricing & Service Tiers
  │     ├── /case-studies          -> Verified Client Revenue Results
  │     ├── /seo-tool              -> Free Instant Diagnostic Audit Tool
  │     └── ...
  │
  ├── [Editorial Topic Clusters] (23 articles)
  │     ├── /blog/google-map-pack-optimization-guide  (Pillar 1: Map Pack & GBP)
  │     ├── /blog/local-seo-vs-ai-2026-survival-guide (Pillar 2: GEO & AI Search)
  │     ├── /blog/top-on-page-seo-mistakes-...        (Pillar 3: Technical & Schema)
  │     ├── /blog/unlocking-the-power-of-local-seo-... (Pillar 4: Citations & Scale)
  │     └── /blog/single-page-blueprint-...           (Pillar 5: Lean Web Architecture)
  │
  ├── [Empirical Research Studies] (16 studies)
  │     ├── /locations                                -> National Research Hub
  │     ├── /locations/:state/                        -> 6 State Regional Portals
  │     └── /locations/:state/:district               -> 9 Deep District Studies (Census, SBA, FAQs)
  │
  ├── [Regional Commercial Directories] (37 landing pages)
  │     ├── /:stateSlug                               -> 7 State/Province Directory Hubs
  │     └── /:stateSlug/:citySlug                     -> 29 Neighborhood Commercial Blueprints
  │
  └── [Interactive Industry Demos] (3 demos)
        ├── /demo/contractor-surge                    -> Trade & Contractor Experience
        ├── /demo/dental-surge                        -> Medical & Dental Experience
        └── /demo/legal-surge                         -> Legal & Attorney Experience
```

---

## 2. Sitemap Allocation Table

| Sitemap File | Scope | URL Count | Key XML Tags | Google Search Console Bucket |
| :--- | :--- | :---: | :--- | :--- |
| **`sitemap-core.xml`** | Static & Marketing Pages | 12 | `<loc>`, `<lastmod>`, `<xhtml:link>` | Primary Brand & Services |
| **`sitemap-blog.xml`** | Editorial & Guides | 23 | `<loc>`, `<lastmod>`, `<xhtml:link>`, `<image:image>` | Organic Top-of-Funnel & Image SERPs |
| **`sitemap-locations.xml`** | Empirical Search Studies | 16 | `<loc>`, `<lastmod>`, `<xhtml:link>` | Informational GEO & LLM Grounding |
| **`sitemap-directory.xml`** | Regional City Directories | 37 | `<loc>`, `<lastmod>`, `<xhtml:link>` | Bottom-of-Funnel Local Commercial Keywords |
| **`sitemap-demos.xml`** | Interactive Industry Demos | 3 | `<loc>`, `<lastmod>`, `<xhtml:link>` | Conversion & Sales Proof |
| **`sitemap.xml`** | Consolidated All-in-One | 91 | Full Unified Set | Universal Fallback Crawlers |
| **`sitemap_index.xml`** | Master Index | 5 sitemaps | `<sitemap>`, `<loc>`, `<lastmod>` | Primary Google Search Console Submission |

---

## 3. Disambiguation & Cannibalization Prevention

To prevent keyword conflict between the research studies and commercial city pages:
- **Research Studies (`/locations/:state/:district`):** Optimized for informational search queries (*"Austin local customer search behavior"*, *"Map pack click distributions"*). Includes Census Bureau citations, consumer behavior studies, and FAQPage schema.
- **Commercial Directories (`/:state/:city-seo`):** Optimized for high-intent transactional queries (*"Austin SEO company"*, *"Austin Google maps ranking service"*). Includes local neighborhood authority nodes, business counts, and LocalBusiness schema.
- **Bidirectional Linking:** Every commercial city landing page embeds a prominent cross-link to its empirical research counterpart and vice-versa, allowing PageRank to circulate seamlessly.
