# Local Surge SEO blog upload and editorial guide

Prepared 24 October 2026. Delivery contains 14 separate Word drafts: 6 updates and 8 new articles. This guide covers all 35 issue types in the supplied CSV.

## 1 What was reviewed

The working public archive is [localsurgeseo.com/blog](https://localsurgeseo.com/blog). The supplied `/blogs` path returned a 404 during review. The archive listed 39 articles. Its titles and category labels were captured, and all 39 public article responses were retrieved. Relevant articles were compared with the CSV issues and with primary technical documentation. The site XML sitemap was also reviewed.

The CSV contains Issue Name, Description, and How To Fix. It does not identify the audited website, affected URLs, occurrence counts, severity, or traffic. It is the topic source for these drafts; it is not evidence that Local Surge SEO has all 35 issues. Obtain a URL-level export before using it as a remediation plan for any particular website.

The 35 issue types are grouped by reader intent. Closely related character and pixel warnings share an article. Six existing posts need a substantive refresh, so their URLs are retained. Eight gaps receive new articles. The other 33 existing archive entries receive no replacement draft in this package; their individual publication decisions are listed at the end. That decision is scoped to this report, rather than an endorsement of every claim in those posts.

## 2 The upload list

| ID | Action | Word file | Category | New category |
| --- | --- | --- | --- | --- |
| 01 | UPDATE | [01_UPDATE_On_Page_SEO.docx](01_UPDATE_On_Page_SEO.docx) | Technical SEO | No |
| 02 | UPDATE | [02_UPDATE_Title_Tags.docx](02_UPDATE_Title_Tags.docx) | Technical SEO | No |
| 03 | UPDATE | [03_UPDATE_Canonical_Tags.docx](03_UPDATE_Canonical_Tags.docx) | Local SEO | No |
| 04 | UPDATE | [04_UPDATE_Image_Alt_Text.docx](04_UPDATE_Image_Alt_Text.docx) | Local SEO | No |
| 05 | UPDATE | [05_UPDATE_Layout_Shifts.docx](05_UPDATE_Layout_Shifts.docx) | Core Web Vitals | No |
| 06 | UPDATE | [06_UPDATE_PageSpeed_Insights.docx](06_UPDATE_PageSpeed_Insights.docx) | Core Web Vitals | No |
| 07 | NEW | [07_NEW_Meta_Descriptions.docx](07_NEW_Meta_Descriptions.docx) | Technical SEO | No |
| 08 | NEW | [08_NEW_URL_Structure.docx](08_NEW_URL_Structure.docx) | Technical SEO | No |
| 09 | NEW | [09_NEW_Robots_and_Noindex.docx](09_NEW_Robots_and_Noindex.docx) | Technical SEO | No |
| 10 | NEW | [10_NEW_4xx_Errors.docx](10_NEW_4xx_Errors.docx) | Technical SEO | No |
| 11 | NEW | [11_NEW_HTML_Document_Size.docx](11_NEW_HTML_Document_Size.docx) | Technical SEO | No |
| 12 | NEW | [12_NEW_Security_Headers.docx](12_NEW_Security_Headers.docx) | Website Security | Yes |
| 13 | NEW | [13_NEW_Thin_Content_Readability.docx](13_NEW_Thin_Content_Readability.docx) | Local Content Strategy | No |
| 14 | NEW | [14_NEW_External_Outlinks.docx](14_NEW_External_Outlinks.docx) | Technical SEO | No |

The ZIP contains these 14 individual `.docx` files and this one Markdown guide. Relative document links work after extracting the package into one folder.

### Category decisions

| Category | Status | Draft IDs |
| --- | --- | --- |
| Technical SEO | Existing public category; reuse its exact name | 01, 02, 07, 08, 09, 10, 11, 14 |
| Local SEO | Existing public category; reuse its exact name | 03, 04 |
| Core Web Vitals | Existing public category; reuse its exact name | 05, 06 |
| Local Content Strategy | Existing public category; reuse its exact name | 13 |
| Website Security | Create after checking the CMS taxonomy | 12 |

Create **Website Security** only if the admin taxonomy does not already contain an equivalent unpublished category. Proposed category slug: `website-security`. Proposed description: “Practical guidance on browser security policies, HTTPS, and safe implementation for local business websites.” Draft 12 explicitly says `Category: Website Security (new category required)` and `New category required: Yes`.

Keep category assignment distinct from tags. Each draft suggests three tags; reuse equivalent existing tags rather than creating variations in spelling. Retain the current Local SEO category for the canonical and alt-text updates. A broader taxonomy reorganization is outside this upload.

## 3 Why each article is being updated or created

### 01 Top 5 On-Page SEO Mistakes Local Businesses Constantly Make

The current Top 5 article contains only three mistakes. Expand it to five, add the missing heading audit workflow, and replace claims that geographic wording or schema guarantees rankings.

Update this exact URL in place: `https://localsurgeseo.com/blog/top-on-page-seo-mistakes-local-businesses-make`

Retain its slug and original publication date. Use the proposed title from the draft if approved; changing the title does not require a URL change.

### 02 How to Fix Duplicate and Overlong Title Tags for Local SEO

Replace the current title-tag article at its existing URL. Add duplicate-title diagnosis and explain that 60 characters and 561 pixels are audit settings. Remove unsupported instant ranking and CTR guarantees. The public server-rendered article also truncates around an unescaped HTML example.

Update this exact URL in place: `https://localsurgeseo.com/blog/10-second-website-hack-why-meta-titles-matter`

Retain its slug and original publication date. Use the proposed title from the draft if approved; changing the title does not require a URL change.

### 03 Why a Canonical Link Tag Checker Matters for Local SEO

Keep the existing canonical article URL and category. Correct the claim that canonical tags are mandatory or prevent an automatic duplicate-content or Maps penalty. Add expected versus accidental canonicalisation and a verification workflow.

Update this exact URL in place: `https://localsurgeseo.com/blog/why-canonical-link-tag-checker-is-essential-for-local-seo`

Retain its slug and original publication date. Use the proposed title from the draft if approved; changing the title does not require a URL change.

Tool handling: Retain the existing canonical checker component. Position it after the audit workflow. Describe it as a markup check; do not claim it proves Google selection or a ranking outcome.

### 04 How to Audit Image Alt Text for Local SEO and Accessibility

Replace the existing alt-text article at its current URL and category. Remove the universal 125-character truncation claim, mandatory location formula, unsupported ranking statistics, and claims that a scanner establishes legal compliance.

Update this exact URL in place: `https://localsurgeseo.com/blog/why-image-alt-tag-accessibility-scanner-is-essential-for-local-seo`

Retain its slug and original publication date. Use the proposed title from the draft if approved; changing the title does not require a URL change.

Tool handling: Retain the existing alt-text scanner only with accurate labels. Remove claims that it tests Google Vision entity detection, certifies WCAG or ADA compliance, or verifies local ranking impact. A developer must review those component labels separately from article copy.

### 05 Why Your Website Jumps and How to Fix Cumulative Layout Shift

Keep the current CLS URL and category. Retain the useful image-dimension advice, add code and verification, and correct the bounded 0-to-1 scale, automatic-penalty wording, and outdated testing advice.

Update this exact URL in place: `https://localsurgeseo.com/blog/why-your-website-jumps-cls-guide`

Retain its slug and original publication date. Use the proposed title from the draft if approved; changing the title does not require a URL change.

Tool handling: Retain the existing CLS sandbox as a demonstration. Label simulated values as examples, not a measurement of a visitor website. Replace automatic ranking-penalty claims in component text if present.

### 06 How to Use Google PageSpeed Insights for a Local Business Website

Keep the existing PageSpeed URL and category. Replace blanket image-size targets and unsupported Maps or bounce-rate ranking claims. Clarify lab versus field data and explain how to prioritize image compression.

Update this exact URL in place: `https://localsurgeseo.com/blog/why-google-pagespeed-insights-matters-for-local-seo`

Retain its slug and original publication date. Use the proposed title from the draft if approved; changing the title does not require a URL change.

Tool handling: Retain the current PSI scanner. Verify current API behavior, error handling, URL versus origin field-data labels, and lab versus field score labels. Do not present absent field data as a pass or claim the tool measures Maps ranking impact.

### 07 How to Fix Duplicate and Overlong Meta Descriptions

The Open Graph article mentions SEO descriptions but does not provide a focused workflow for duplicate descriptions or snippet-length warnings. Publish this as a distinct search-snippet guide.

Proposed new URL, to create in the CMS: `https://localsurgeseo.com/blog/fix-duplicate-overlong-meta-descriptions`

### 08 How to Review Spaces Uppercase Letters and Parameters in URLs

Canonical and franchise articles discuss duplicate routing, but the archive has no dedicated URL-hygiene and migration guide covering all three report flags. Keep this separate from the canonical explainer.

Proposed new URL, to create in the CMS: `https://localsurgeseo.com/blog/seo-url-spaces-uppercase-parameters`

### 09 Crawl Rules and Noindex for Local Business Search Pages

Existing AI sitemap posts introduce robots.txt but do not explain noindex, internal search indexing, or diagnosis of blocked service URLs. Publish this crawl-control guide without duplicating the llms.txt topic.

Proposed new URL, to create in the CMS: `https://localsurgeseo.com/blog/robots-txt-noindex-internal-search-pages`

### 10 How to Fix Internal and External 4xx Errors Without Bad Redirects

The archive has recovery and link-building articles but no dedicated internal-versus-external 4xx remediation guide. Publish a focused troubleshooting article.

Proposed new URL, to create in the CMS: `https://localsurgeseo.com/blog/fix-internal-external-4xx-errors`

### 11 HTML Documents Over 2 MB and What to Fix First

The speed articles cover transferred assets but do not explain the current Googlebot HTML fetch limit or uncompressed document size. Publish this focused technical guide.

Proposed new URL, to create in the CMS: `https://localsurgeseo.com/blog/html-document-over-2mb-googlebot`

### 12 Five Security Headers to Review on a Local Business Website

No security-header guide or Website Security category appears in the 39-article archive. Create the category and publish a browser-security guide that avoids portraying these headers as direct ranking factors.

Proposed new URL, to create in the CMS: `https://localsurgeseo.com/blog/website-security-headers-local-business`

### 13 How to Improve Thin Content and Difficult Service Page Copy

The BOFU and wireframe articles discuss conversion content, but neither diagnoses crawler word-count or readability flags. Publish a practical editorial audit guide with a distinct intent.

Proposed new URL, to create in the CMS: `https://localsurgeseo.com/blog/improve-thin-content-readability-service-pages`

### 14 How to Review Pages With High External Outlinks

The local backlink playbook addresses earning inbound links. It does not address a high-external-outlinks crawl warning. Publish this separate outbound editorial and link-hygiene guide.

Proposed new URL, to create in the CMS: `https://localsurgeseo.com/blog/high-external-outlinks-seo-audit`

## 4 How to transfer a Word draft into the CMS

Use the site’s existing article editor. The public site exposes an admin link, but its authenticated content model and button labels were not inspected. The steps below specify the fields and results to achieve without assuming WordPress or another platform.

1. For an UPDATE, find the existing record by the exact URL in the draft. Save a revision or backup through the normal CMS workflow. Do not create a second post for the same topic. For a NEW article, create a draft record.
2. Set the article title to the document title. Keep the existing slug for updates. For new posts, use the proposed path under `/blog/`, checking that it is not already occupied. Proposed new URLs in this package are not existing live pages.
3. Set the primary category and tags from the publishing-details section. Create Website Security once, before Draft 12, if the taxonomy check confirms it is needed.
4. Set the SEO title and meta description in their dedicated fields. Do not paste HTML tags into fields that expect plain text. Check whether the template appends a brand name, and avoid duplicating that suffix.
5. Use the first paragraph under Executive Summary and Key Takeaways as the excerpt or summary field if the template provides one. Keep the takeaway bullets as article content or the existing summary component. If the template automatically displays that same summary in the article, avoid displaying the paragraph twice.
6. Copy the article from Executive Summary and Key Takeaways through Primary Verification Sources. Keep Publishing details and its instructions out of the public article. Preserve natural paragraphs, useful lists, code examples, and working hyperlinks.
7. Let the article title field generate the page H1. Map the main Word section headings to H2 and the FAQ questions to H3. Word Heading 1 identifies main article sections within these delivery files; it should not create multiple web H1s on import.
8. Generate an anchored table of contents from the article H2s. The drafts include a plain heading list as a reference. If the CMS generates a TOC, replace the plain list with that component rather than showing both.
9. Put examples in a code component using literal text. Preserve quotes, indentation, and angle brackets. Do not execute the snippets or let the editor treat them as live page elements.
10. For updates with an embedded tool, retain the existing component and apply the specific wording or behavior checks in Section 3. A Word copy-and-paste operation must not delete a working module. New articles use static explanations and checklists; no new interactive tool has been built for them.
11. Choose an approved author. Preserve the existing byline for updates unless the editorial owner changes it. Retain the original datePublished; set dateModified when the substantive revision goes live. Give new posts their actual publication date.
12. Save a draft and preview it before publication. Use the checks below, then publish through the team's normal editorial workflow.

### Metadata and template field mapping

| Word content | CMS destination |
| --- | --- |
| Document title | Article title and template-generated H1 |
| Category | One primary category |
| Suggested tags | Existing or deliberately created tags |
| SEO title | HTML title / SEO title field |
| Meta description | Search-description field |
| Primary search topic | Editorial planning field, if supported; not a meta-keywords tag |
| Executive-summary first paragraph | Excerpt / summary field, with duplicate display avoided |
| Article text and source links | Article body / section components |
| Table of Contents | Existing anchored TOC component, if available |
| Reading time | Recalculate from final article copy or use the approximate draft value |
| Publishing details, report issues, editorial decision | Internal editor notes only |

## 5 Template issue to resolve while uploading

The public server-rendered title-tag article stopped around its first literal `<title>` example during review. Its returned HTML contains that example as markup inside a paragraph rather than as escaped example text. This can interfere with document parsing. Confirm the final rendered behavior after replacing the article.

For literal examples, the stored or rendered HTML must escape characters appropriately, such as `&lt;title&gt;`, or use a code renderer that escapes its input. The same applies to canonical tags, image tags, scripts, and metadata examples. Test both the initial server response and the hydrated page. This is a rendering task for the existing template, separate from the writing.

Do not restore unsupported claims through inherited tool labels or template callouts after correcting the body. In particular, a scanner must not claim to certify legal compliance, prove Google-selected canonicals, or measure a guaranteed local ranking outcome unless that capability is actually established.

## 6 Links and topic clusters

Every inline internal link in the article text targets a page already present in the reviewed archive or the existing Local SEO / SEO tool pages. New proposed slugs are deliberately not inserted as live cross-links before publication. Check all links again in the CMS preview.

| Draft IDs | Recommended placement |
| --- | --- |
| 01 to 11 and 14 | Existing Technical Local SEO & Structured Schema cluster; Draft 01 remains the pillar. Add an outgoing contextual link from the pillar to each new technical guide once live. |
| 12 | Website Security category. Cross-link from the technical pillar where browser security is discussed. Do not create a thin security pillar solely for one article. |
| 13 | Existing High-Speed Web Architecture & Conversion cluster, alongside the BOFU and service-area wireframe guides. |

Keep the existing site-generated related-reading and attribution components. Do not paste a second copy into the article body. If the attribution component uses a citation title or URL, refresh it from the final title and the unchanged or newly published URL. Select related articles from the links supplied in each draft, then add relevant new siblings after they are live.

### Suggested related articles

| Draft | Existing related articles |
| --- | --- |
| 01 | [The 10-Second Website Hack That Google Loves: Why Your Meta Title is Your Storefront Sign](https://localsurgeseo.com/blog/10-second-website-hack-why-meta-titles-matter); [Complete Guide to LocalBusiness Schema: Nested Service, GeoCoordinates, and Reviews JSON-LD](https://localsurgeseo.com/blog/localbusiness-schema-nested-service-geocoordinates-reviews-guide) |
| 02 | [Top 5 On-Page SEO Mistakes Local Businesses Constantly Make](https://localsurgeseo.com/blog/top-on-page-seo-mistakes-local-businesses-make); [Why a Canonical Link Tag Checker is Essential for Local SEO (and Duplicate Content Protection)](https://localsurgeseo.com/blog/why-canonical-link-tag-checker-is-essential-for-local-seo) |
| 03 | [Fixing Cannibalization: Managing Multi-Location vs. Service-Area Business (SAB) Pages](https://localsurgeseo.com/blog/fixing-keyword-cannibalization-multi-location-vs-sab-pages); [Top 5 On-Page SEO Mistakes Local Businesses Constantly Make](https://localsurgeseo.com/blog/top-on-page-seo-mistakes-local-businesses-make) |
| 04 | [Why Does Your Website Jump When You Try to Click? The Silent Conversion Killer Known as CLS (And How to Test Yours)](https://localsurgeseo.com/blog/why-your-website-jumps-cls-guide); [Why Google PageSpeed Insights Matters for Local SEO (And How to Fix Sluggish Load Times)](https://localsurgeseo.com/blog/why-google-pagespeed-insights-matters-for-local-seo) |
| 05 | [Why Google PageSpeed Insights Matters for Local SEO (And How to Fix Sluggish Load Times)](https://localsurgeseo.com/blog/why-google-pagespeed-insights-matters-for-local-seo); [Core Web Vitals Checklist for Lead Generation & Local Service Landing Pages](https://localsurgeseo.com/blog/core-web-vitals-checklist-local-service-landing-pages) |
| 06 | [Why Does Your Website Jump When You Try to Click? The Silent Conversion Killer Known as CLS (And How to Test Yours)](https://localsurgeseo.com/blog/why-your-website-jumps-cls-guide); [Why an Image Alt Tag Accessibility Scanner is Essential for Local SEO (and ADA Compliance)](https://localsurgeseo.com/blog/why-image-alt-tag-accessibility-scanner-is-essential-for-local-seo) |
| 07 | [The 10-Second Website Hack That Google Loves: Why Your Meta Title is Your Storefront Sign](https://localsurgeseo.com/blog/10-second-website-hack-why-meta-titles-matter); [Why Open Graph (OG) Meta Tags Are Essential for Local SEO and Referral Conversions](https://localsurgeseo.com/blog/why-open-graph-meta-tags-are-essential-for-local-seo) |
| 08 | [Why a Canonical Link Tag Checker is Essential for Local SEO (and Duplicate Content Protection)](https://localsurgeseo.com/blog/why-canonical-link-tag-checker-is-essential-for-local-seo); [Top 5 On-Page SEO Mistakes Local Businesses Constantly Make](https://localsurgeseo.com/blog/top-on-page-seo-mistakes-local-businesses-make) |
| 09 | [Local Search Ranking Drop? Step-by-Step Recovery Audit After Google Algorithm Updates](https://localsurgeseo.com/blog/local-search-ranking-drops-algorithm-update-audit-guide); [The llms.txt Blueprint: Why Every Local Business Needs an AI Sitemap](https://localsurgeseo.com/blog/llmstxt-blueprint-ai-sitemap-local-business) |
| 10 | [Local Search Ranking Drop? Step-by-Step Recovery Audit After Google Algorithm Updates](https://localsurgeseo.com/blog/local-search-ranking-drops-algorithm-update-audit-guide); [Why a Canonical Link Tag Checker is Essential for Local SEO (and Duplicate Content Protection)](https://localsurgeseo.com/blog/why-canonical-link-tag-checker-is-essential-for-local-seo) |
| 11 | [Why Google PageSpeed Insights Matters for Local SEO (And How to Fix Sluggish Load Times)](https://localsurgeseo.com/blog/why-google-pagespeed-insights-matters-for-local-seo); [Core Web Vitals Checklist for Lead Generation & Local Service Landing Pages](https://localsurgeseo.com/blog/core-web-vitals-checklist-local-service-landing-pages) |
| 12 | [Top 5 On-Page SEO Mistakes Local Businesses Constantly Make](https://localsurgeseo.com/blog/top-on-page-seo-mistakes-local-businesses-make); [Why Google PageSpeed Insights Matters for Local SEO (And How to Fix Sluggish Load Times)](https://localsurgeseo.com/blog/why-google-pagespeed-insights-matters-for-local-seo) |
| 13 | [Bottom-of-Funnel (BOFU) Local SEO: How Cost Guides, Comparisons, and Case Studies Turn Clicks into Signed Contracts](https://localsurgeseo.com/blog/bofu-local-seo-cost-guides-comparisons-case-studies); [Service-Area Landing Pages That Actually Convert: The High-Intent Local Wireframe Blueprint](https://localsurgeseo.com/blog/service-area-pages-conversion-wireframes-blueprint) |
| 14 | [How to Earn Real Local Backlinks: Sponsorships, Chambers of Commerce, and Digital PR Playbook](https://localsurgeseo.com/blog/how-to-earn-real-local-backlinks-sponsorships-pr-playbook); [Top 5 On-Page SEO Mistakes Local Businesses Constantly Make](https://localsurgeseo.com/blog/top-on-page-seo-mistakes-local-businesses-make) |

## 7 Featured images and social previews

Image assets are not included. Use an existing licensed image or commission an appropriate illustration. Do not imply a fictional screenshot is a real client result, and do not invent case-study statistics. For updates, retain a relevant existing image where appropriate.

| Draft | Suggested visual |
| --- | --- |
| 01 | A service-page outline with grouped heading levels |
| 02 | A fictional browser-tab and title-link comparison |
| 03 | Duplicate URL variations and one preferred representative |
| 04 | Informative and decorative image alternatives in context |
| 05 | An image placeholder keeping a booking button stable |
| 06 | A clearly labeled field-versus-lab report illustration |
| 07 | A fictional title and search-description preview |
| 08 | Readable paths and meaningful parameters on example.com |
| 09 | Crawl permission compared with an indexing instruction |
| 10 | A small decision chart for 404, 403, and 429 responses |
| 11 | Decoded HTML size compared with separate resource downloads |
| 12 | Five response-header roles in plain language |
| 13 | A fictional service paragraph improved for clarity |
| 14 | Editorial, sponsored, and internal link roles |

Write alt text after the actual image has been selected. Describe its useful meaning, not the proposed brief as if an asset already exists. Reserve the right aspect ratio, serve suitable dimensions, and compare compression quality. Avoid applying the report's 100 kB threshold as a universal pass/fail rule. Populate Open Graph and social-image fields from the final approved article and image.

## 8 Checks before and after publication

- Preview on mobile and desktop. Check paragraphs, headings, code, source links, table of contents, and spacing. Confirm the article continues past every HTML example.
- Confirm one intended page H1 and a meaningful H2/H3 structure. Several H2s are expected.
- Confirm a single intended title and description in the final document head. Review previews without treating character counts as mandatory Google limits.
- Check the correct canonical URL and a successful response for an intended indexable post. Do not point all new articles at the homepage.
- Make intended public articles crawlable and remove unintended noindex instructions. Keep separate policies for internal search and other utility pages.
- For existing articles, verify that the original URL, approved byline, and publication date are retained. Update modification dates honestly.
- Preserve and test retained tools. Verify that errors and unavailable data are described accurately. An editor should not invent tool results.
- Check article or BlogPosting structured data for the actual headline, canonical URL, author, image, and dates. Maintain breadcrumb markup consistent with navigation. Schema validity does not guarantee a special search display.
- Publish FAQ questions as useful visible content. Do not add FAQ schema solely to promise rich results; eligibility depends on Google's current requirements.
- Update category listings, the blog archive, related-reading blocks, and the existing topic-cluster navigation. Ensure new posts are not orphaned.
- Add only intended canonical indexable article URLs to the XML sitemap. Use truthful modification dates. Recheck the final URLs in Search Console as appropriate.
- Check that `/blog` shows the new posts. If the archive is unchanged otherwise, its count becomes 47 after eight additions; six updates do not add six records.
- Keep a publication record with final URL, author, publication/modification date, category, and review owner. Monitor indexing, search queries, and qualified enquiries over time without promising a fixed ranking timetable.

### Suggested release order

1. Verify the code-rendering issue and refresh Draft 01, the existing technical pillar.
2. Update Drafts 02 to 06 at their existing URLs and review retained tool wording.
3. Publish the crawl and routing guides 09, 10, and 11 with links from the pillar.
4. Publish 07, 08, 13, and 14 and connect them to relevant existing articles.
5. Create the approved Website Security category and publish 12 after the technical review.

This is an editorial dependency sequence, not a severity ranking for the unidentified audited website.

## 9 Complete issue to article map

CSV row numbers below count data rows after the header. Each of the 35 issue types has exactly one primary destination; overlapping mentions in companion articles are supporting context.

| CSV row | Exact issue name | Decision | Draft | Interpretation |
| --- | --- | --- | --- | --- |
| 1 | Images: Missing Size Attributes | UPDATE | 05 | Reserve image space; CSS can already satisfy the practical requirement. |
| 2 | Content: Low Content Pages | NEW | 13 | Assess purpose and extraction before expanding copy; no universal word minimum. |
| 3 | Images: Over 100 kB | UPDATE | 06 | Review image role and delivered size; 100 kB is an audit threshold. |
| 4 | H2: Duplicate | UPDATE | 01 | Repeated section labels can be appropriate; review context. |
| 5 | Meta Description: Duplicate | NEW | 07 | Different page purposes need accurate summaries; diagnose duplicate URLs separately. |
| 6 | Security: Missing X-Content-Type-Options Header | NEW | 12 | Review nosniff with correct resource content types. |
| 7 | Page Titles: Over 60 Characters | UPDATE | 02 | 60 characters is an editorial alert, not a Google cutoff. |
| 8 | Page Titles: Duplicate | UPDATE | 02 | Separate shared-template titles from duplicate URL variations. |
| 9 | URL: Contains Space | NEW | 08 | Encoded spaces can work; migrate only for a justified benefit. |
| 10 | URL: Internal Search | NEW | 09 | Set an intentional indexing and crawl policy for utility results. |
| 11 | H1: Over 70 Characters | UPDATE | 01 | Review clarity; 70 characters is not an H1 ranking rule. |
| 12 | Canonicals: Canonicalised | UPDATE | 03 | Canonicalisation may be intentional; inspect the preferred target. |
| 13 | URL: Uppercase | NEW | 08 | Check actual routing and case-sensitive paths before renaming. |
| 14 | H1: Missing | UPDATE | 01 | Add a descriptive main heading where the intended page needs one. |
| 15 | Page Titles: Over 561 Pixels | UPDATE | 02 | 561 pixels is a crawler preview approximation. |
| 16 | Meta Description: Over 155 Characters | NEW | 07 | 155 characters is a review threshold, not a mandatory limit. |
| 17 | Validation: HTML Document Over 2MB | NEW | 11 | Measure decoded HTML separately from total resource weight. |
| 18 | Security: Missing Content-Security-Policy Header | NEW | 12 | Design and test CSP; a header-presence check does not judge policy quality. |
| 19 | Images: Alt Text Over 100 Characters | UPDATE | 04 | Review purpose and concision; no universal 100- or 125-character rule. |
| 20 | H2: Non-Sequential | UPDATE | 01 | Review main-content hierarchy and page regions; do not blindly reorder everything. |
| 21 | H2: Missing | UPDATE | 01 | Add useful section structure on longer pages; a short page may not need H2s. |
| 22 | Meta Description: Over 985 Pixels | NEW | 07 | 985 pixels is a preview setting; snippets vary. |
| 23 | URL: Parameters | NEW | 08 | Classify tracking and meaningful content parameters before stripping anything. |
| 24 | H1: Duplicate | UPDATE | 01 | Distinct pages need clear main headings; investigate true duplicate pages separately. |
| 25 | Response Codes: External Client Error (4xx) | NEW | 10 | Check the external destination and source link; distinguish 404, 403, and 429. |
| 26 | Response Codes: Internal Blocked by Robots.txt | NEW | 09 | Check whether the URL should be crawlable and whether noindex must be read. |
| 27 | Security: Missing Secure Referrer-Policy Header | NEW | 12 | Review effective browser policy and privacy requirements, including browser defaults. |
| 28 | H1: Non-Sequential | UPDATE | 01 | Inspect the page outline and landmarks rather than treating order as an absolute rule. |
| 29 | H2: Over 70 Characters | UPDATE | 01 | Shorten when helpful; 70 characters is not an H2 limit. |
| 30 | Response Codes: Internal Client Error (4xx) | NEW | 10 | Repair internal journeys; use relevant redirects or genuine missing-resource status. |
| 31 | Content: Readability Difficult | NEW | 13 | Use readability scoring as a review prompt and preserve necessary terminology. |
| 32 | H2: Multiple | UPDATE | 01 | Multiple H2s are normal when sections are organized sensibly. |
| 33 | Security: Missing X-Frame-Options Header | NEW | 12 | Check enforced CSP frame-ancestors before assuming framing is unrestricted. |
| 34 | Links: Pages With High External Outlinks | NEW | 14 | Review relevance and relationship attributes; no universal safe maximum. |
| 35 | Security: Missing HSTS Header | NEW | 12 | Validate HTTPS coverage and rollout scope before HSTS changes. |

No separate article is needed for each pixel or character variant. No additional article is needed for the image-size and dimension flags beyond the existing PageSpeed and CLS refreshes. The H1/H2 flags share the updated on-page pillar instead of generating nine repetitive posts.

## 10 Existing archive inventory and publication decisions

These are the titles and categories observed in the public archive on 24 October 2026. “Leave for this report” means no replacement file is supplied; the article is either outside the report topics or a supporting resource with a distinct intent. The reasons for the six replacements and eight new topics appear in Section 3.

| Existing article | Observed category | Decision |
| --- | --- | --- |
| [Why Google PageSpeed Insights Matters for Local SEO (And How to Fix Sluggish Load Times)](https://localsurgeseo.com/blog/why-google-pagespeed-insights-matters-for-local-seo) | Core Web Vitals | UPDATE 06 |
| [Why Open Graph (OG) Meta Tags Are Essential for Local SEO and Referral Conversions](https://localsurgeseo.com/blog/why-open-graph-meta-tags-are-essential-for-local-seo) | Local SEO | Leave for this report |
| [Why a Canonical Link Tag Checker is Essential for Local SEO (and Duplicate Content Protection)](https://localsurgeseo.com/blog/why-canonical-link-tag-checker-is-essential-for-local-seo) | Local SEO | UPDATE 03 |
| [Why an Image Alt Tag Accessibility Scanner is Essential for Local SEO (and ADA Compliance)](https://localsurgeseo.com/blog/why-image-alt-tag-accessibility-scanner-is-essential-for-local-seo) | Local SEO | UPDATE 04 |
| [Why Does Your Website Jump When You Try to Click? The Silent Conversion Killer Known as CLS (And How to Test Yours)](https://localsurgeseo.com/blog/why-your-website-jumps-cls-guide) | Core Web Vitals | UPDATE 05 |
| [The 10-Second Website Hack That Google Loves: Why Your Meta Title is Your Storefront Sign](https://localsurgeseo.com/blog/10-second-website-hack-why-meta-titles-matter) | Technical SEO | UPDATE 02 |
| [Why "Near Me" Is Dead: How Conversational AI and Entity Proximity Replaced It](https://localsurgeseo.com/blog/local-seo-2026-near-me-is-dead) | Local SEO | Leave for this report |
| [The Local Contractor Playbook: Dominating the Google Map Pack and Local 3-Pack](https://localsurgeseo.com/blog/google-business-profile-critical-local-contractors) | Local SEO | Leave for this report |
| [The Single-Page Blast Blueprint: Rank Local Service Businesses Fast Without Multi-Page Bloat](https://localsurgeseo.com/blog/single-page-blueprint-dominate-local-search) | Web Design & Speed | Leave for this report |
| [Top 5 On-Page SEO Mistakes Local Businesses Constantly Make](https://localsurgeseo.com/blog/top-on-page-seo-mistakes-local-businesses-make) | Technical SEO | UPDATE 01 |
| [Unlocking the Power of Local SEO: The Small Business Roadmap to Neighborhood Dominance](https://localsurgeseo.com/blog/unlocking-the-power-of-local-seo-for-small-businesses) | Local SEO | Leave for this report |
| [Scaling Your Local SEO Strategy: From Neighborhood Centroid to Multi-City Market Leader](https://localsurgeseo.com/blog/from-zero-to-hero-scaling-your-local-seo-strategy) | Growth & Strategy | Leave for this report |
| [Mastering Google Business Profile: The Field-Tested Optimization Checklist](https://localsurgeseo.com/blog/mastering-google-business-profile-optimization) | Google Maps & Local Pack | Leave for this report |
| [Why Your Business Needs Local SEO to Survive the AI and Conversational Search Era](https://localsurgeseo.com/blog/why-your-business-needs-local-seo-now) | AI Search & Strategy | Leave for this report |
| [Map Pack vs. Organic SEO: Which Drives More Customer Revenue for Local Businesses?](https://localsurgeseo.com/blog/map-pack-vs-organic-seo-revenue) | Revenue & Analytics | Leave for this report |
| [Google Map Pack Optimization: The Complete Local Proximity and Ranking Guide](https://localsurgeseo.com/blog/google-map-pack-optimization-guide) | Google Maps & Local Pack | Leave for this report |
| [What is NAP Consistency? The Definitive Local Citation Guide for Trade Businesses](https://localsurgeseo.com/blog/what-is-nap-consistency-citation-guide) | Citations & Architecture | Leave for this report |
| [Will Local SEO Be Replaced by AI? How Search Engines and AI Agents Are Actually Evolving](https://localsurgeseo.com/blog/local-seo-vs-ai-2026-survival-guide) | AI Search & Strategy | Leave for this report |
| [Does Local SEO Still Work? The 80/20 Rule of High-ROI Search Marketing](https://localsurgeseo.com/blog/does-local-seo-still-work-80-20-rule) | Growth & Strategy | Leave for this report |
| [Google Local Service Ads (LSA): How to Generate Leads and Maximize Pay-Per-Lead ROI](https://localsurgeseo.com/blog/what-are-google-local-service-ads-optimization) | Paid Search & LSAs | Leave for this report |
| [Website Builders for Local Businesses: Free Options vs. Franchise Web Design Costs](https://localsurgeseo.com/blog/best-local-business-website-builder-franchise-cost) | Web Design & Speed | Leave for this report |
| [WebMCP Explained: How AI Agents Auto-Submit Forms and Calculate Quotes (With User Consent)](https://localsurgeseo.com/blog/webmcp-ai-agent-ready-websites-guide) | AI Search & Automation | Leave for this report |
| [The llms.txt Blueprint: Why Every Local Business Needs an AI Sitemap](https://localsurgeseo.com/blog/llmstxt-blueprint-ai-sitemap-local-business) | AI Search & Automation | Leave for this report |
| [Why BreadcrumbList JSON-LD Schema is Essential for Local SEO](https://localsurgeseo.com/blog/why-breadcrumblist-json-ld-schema-is-essential-for-local-seo) | Structured Data & Schema | Leave for this report |
| [How to Optimize Your Local Business for Google AI Overviews and ChatGPT Search](https://localsurgeseo.com/blog/optimize-local-business-google-ai-overviews-chatgpt-search) | Generative Engine Optimization | Leave for this report |
| [Entity SEO: How Knowledge Graphs Help Search Engines Trust Your Business](https://localsurgeseo.com/blog/entity-seo-knowledge-graphs-local-business-trust) | Entity SEO | Leave for this report |
| [Why Traditional Keywords Aren’t Enough: Conversational Search for Local Service Providers](https://localsurgeseo.com/blog/conversational-search-local-service-providers-seo) | Conversational Search | Leave for this report |
| [Complete Guide to LocalBusiness Schema: Nested Service, GeoCoordinates, and Reviews JSON-LD](https://localsurgeseo.com/blog/localbusiness-schema-nested-service-geocoordinates-reviews-guide) | Schema Markup | Leave for this report |
| [Fixing Cannibalization: Managing Multi-Location vs. Service-Area Business (SAB) Pages](https://localsurgeseo.com/blog/fixing-keyword-cannibalization-multi-location-vs-sab-pages) | Technical Local SEO | Leave for this report |
| [Core Web Vitals Checklist for Lead Generation & Local Service Landing Pages](https://localsurgeseo.com/blog/core-web-vitals-checklist-local-service-landing-pages) | Core Web Vitals | Leave for this report |
| [Franchise SEO Architecture: How to Structure 25+ Location Pages Without Duplicate Penalties](https://localsurgeseo.com/blog/franchise-seo-architecture-multi-location-pages) | Franchise SEO | Leave for this report |
| [The Multi-Fleet SAB Playbook: How Regional Service Businesses Dominate Google Maps Across Multiple Counties](https://localsurgeseo.com/blog/multi-fleet-sab-local-seo-counties-guide) | Service Area Businesses (SAB) | Leave for this report |
| [Managing 10+ Google Business Profiles: Bulk Verification, Review Ops, and Geo-Pages](https://localsurgeseo.com/blog/managing-multiple-google-business-profiles-bulk-verification) | Multi-Location GBP | Leave for this report |
| [Service-Area Landing Pages That Actually Convert: The High-Intent Local Wireframe Blueprint](https://localsurgeseo.com/blog/service-area-pages-conversion-wireframes-blueprint) | Web Architecture & CRO | Leave for this report |
| [Bottom-of-Funnel (BOFU) Local SEO: How Cost Guides, Comparisons, and Case Studies Turn Clicks into Signed Contracts](https://localsurgeseo.com/blog/bofu-local-seo-cost-guides-comparisons-case-studies) | Local Content Strategy | Leave for this report |
| [How to Earn Real Local Backlinks: Sponsorships, Chambers of Commerce, and Digital PR Playbook](https://localsurgeseo.com/blog/how-to-earn-real-local-backlinks-sponsorships-pr-playbook) | Local Link Building | Leave for this report |
| [Google Business Profile Suspended? The Emergency Reinstatement and Appeal Playbook (2026)](https://localsurgeseo.com/blog/google-business-profile-suspended-reinstatement-appeal-guide) | Google Business Profile | Leave for this report |
| [How to Remove Fake Negative Google Reviews: The Legal and Algorithmic Defense Guide](https://localsurgeseo.com/blog/how-to-remove-fake-negative-google-reviews-guide) | Reputation Management | Leave for this report |
| [Local Search Ranking Drop? Step-by-Step Recovery Audit After Google Algorithm Updates](https://localsurgeseo.com/blog/local-search-ranking-drops-algorithm-update-audit-guide) | Technical Local SEO | Leave for this report |

## 11 Sources and editorial standards

The drafts follow the site’s recurring structure: category and reading time, executive summary, clear sections, a table of contents, practical examples, People Also Ask questions, a relevant call to action, and primary verification sources. The existing author, related-reading, attribution, and tool components stay under the site template.

Assign an accountable author and have the relevant practitioner review the final text before release. Keep examples clearly identified and add genuine business evidence only when it is supplied and approved.

Use the primary verification links at the end of each Word file as publishable source references. Google documentation, W3C WAI guidance, web.dev, and MDN were checked during preparation. Preserve their links and verify time-sensitive technical guidance when publishing later. In particular, the HTML-size article uses the Googlebot limit documented during this review rather than older online references to a different limit.

Public site reference points: [Blog archive](https://localsurgeseo.com/blog), [XML sitemap](https://localsurgeseo.com/sitemap.xml), [Local SEO services](https://localsurgeseo.com/local-seo), and [website analysis tool](https://localsurgeseo.com/seo-tool). No CMS content was published or changed during this delivery.
