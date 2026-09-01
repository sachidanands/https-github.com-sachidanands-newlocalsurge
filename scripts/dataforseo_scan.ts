import fs from "fs";
import path from "path";
import { prerenderLocationHtmlWithStatus } from "../api/prerender";

// 1. Gather all URLs from sitemaps
const sitemaps = [
  "public/sitemap-core.xml",
  "public/sitemap-locations.xml",
  "public/sitemap-directory.xml",
  "public/sitemap-blog.xml",
  "public/sitemap-demos.xml"
];

const allUrls: string[] = [];
for (const sm of sitemaps) {
  const content = fs.readFileSync(sm, "utf-8");
  const matches = content.match(/<loc>(.*?)<\/loc>/g) || [];
  for (const m of matches) {
    allUrls.push(m.replace(/<\/?loc>/g, ""));
  }
}

const rawIndexHtml = fs.readFileSync("index.html", "utf-8");

export interface PageScanResult {
  url: string;
  path: string;
  category: "Core" | "Location-State" | "Location-District" | "City-Directory" | "State-Directory" | "Blog-Cluster" | "Demo-App" | "Legal/System";
  status: number;
  is404: boolean;
  title: string;
  titleLength: number;
  description: string;
  descLength: number;
  canonical: string;
  canonicalValid: boolean;
  hreflangEnUs: string | null;
  hreflangXDefault: string | null;
  ogTitle: string | null;
  ogDesc: string | null;
  ogImage: string | null;
  ogUrl: string | null;
  twitterCard: string | null;
  hasSchema: boolean;
  schemaTypes: string[];
  h1List: string[];
  h2Count: number;
  h3Count: number;
  approxWordCount: number;
  internalLinkCount: number;
  externalLinkCount: number;
  imagesWithoutAlt: number;
  totalImages: number;
  issues: string[];
}

const results: PageScanResult[] = [];

for (const fullUrl of allUrls) {
  const urlObj = new URL(fullUrl);
  const reqPath = urlObj.pathname;
  
  const { html, status, is404 } = prerenderLocationHtmlWithStatus(rawIndexHtml, reqPath);
  
  // Categorize
  let category: PageScanResult["category"] = "Core";
  if (reqPath.startsWith("/locations/")) {
    const parts = reqPath.split("/").filter(Boolean);
    if (parts.length === 2) category = "Location-State";
    else if (parts.length >= 3) category = "Location-District";
    else category = "Core";
  } else if (reqPath === "/locations") {
    category = "Core";
  } else if (reqPath.startsWith("/blog/")) {
    category = "Blog-Cluster";
  } else if (reqPath === "/blog") {
    category = "Core";
  } else if (reqPath.startsWith("/demo/")) {
    category = "Demo-App";
  } else if (["/privacy-policy", "/terms-of-service", "/site-map"].includes(reqPath)) {
    category = "Legal/System";
  } else {
    const parts = reqPath.split("/").filter(Boolean);
    if (parts.length === 1 && !["about", "why-us", "local-seo", "pricing", "seo-tool", "contact", "case-studies"].includes(parts[0])) {
      category = "State-Directory";
    } else if (parts.length === 2) {
      category = "City-Directory";
    } else {
      category = "Core";
    }
  }

  // Extract Title
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : "";
  
  // Extract Meta Description
  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']\s*\/?>/i);
  const description = descMatch ? descMatch[1] : "";

  // Extract Canonical
  const canonMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["'](.*?)["']\s*\/?>/i);
  const canonical = canonMatch ? canonMatch[1] : "";
  const canonicalValid = canonical === fullUrl || canonical === fullUrl + "/" || canonical === fullUrl.replace(/\/$/, "");

  // Hreflang
  const hreflangEnMatch = html.match(/<link\s+rel=["']alternate["']\s+hreflang=["']en-US["']\s+href=["'](.*?)["']\s*\/?>/i);
  const hreflangXMatch = html.match(/<link\s+rel=["']alternate["']\s+hreflang=["']x-default["']\s+href=["'](.*?)["']\s*\/?>/i);

  // Open Graph
  const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']\s*\/?>/i);
  const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']\s*\/?>/i);
  const ogImgMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["'](.*?)["']\s*\/?>/i);
  const ogUrlMatch = html.match(/<meta\s+property=["']og:url["']\s+content=["'](.*?)["']\s*\/?>/i);
  const twitterCardMatch = html.match(/<meta\s+name=["']twitter:card["']\s+content=["'](.*?)["']\s*\/?>/i);

  // Schema extraction
  const schemaMatches = Array.from(html.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi));
  const schemaTypes: string[] = [];
  for (const sm of schemaMatches) {
    try {
      const parsed = JSON.parse(sm[1]);
      if (parsed["@graph"] && Array.isArray(parsed["@graph"])) {
        for (const item of parsed["@graph"]) {
          if (item["@type"]) schemaTypes.push(item["@type"]);
        }
      } else if (parsed["@type"]) {
        schemaTypes.push(parsed["@type"]);
      }
    } catch (e) {
      // ignore parse error
    }
  }

  // Headings
  const h1Matches = Array.from(html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)).map(m => m[1].replace(/<[^>]*>/g, "").trim());
  const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
  const h3Count = (html.match(/<h3[^>]*>/gi) || []).length;

  // Text / word count in rendered HTML
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyText = (bodyMatch ? bodyMatch[1] : html)
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = bodyText.split(/\s+/).filter(Boolean);
  const approxWordCount = words.length;

  // Links
  const internalLinks = (html.match(/href=["'](\/[^"'#]*|https:\/\/localsurgeseo\.com[^"'#]*)["']/gi) || []).length;
  const externalLinks = (html.match(/href=["']https?:\/\/(?!localsurgeseo\.com)[^"'#]+["']/gi) || []).length;

  // Images
  const imgTags = Array.from(html.matchAll(/<img\s+([^>]+)>/gi));
  let imagesWithoutAlt = 0;
  for (const img of imgTags) {
    if (!img[1].includes("alt=") || img[1].match(/alt=["']\s*["']/)) {
      imagesWithoutAlt++;
    }
  }

  // Issues check
  const issues: string[] = [];
  if (status !== 200) issues.push(`HTTP status ${status}`);
  if (!title) issues.push("Missing title tag");
  else if (title.length < 25) issues.push(`Title too short (${title.length} chars)`);
  else if (title.length > 75) issues.push(`Title may truncate (${title.length} chars)`);

  if (!description) issues.push("Missing meta description");
  else if (description.length < 50) issues.push(`Description too short (${description.length} chars)`);
  else if (description.length > 175) issues.push(`Description may truncate (${description.length} chars)`);

  if (!canonical) issues.push("Missing canonical link");
  if (h1Matches.length === 0) issues.push("Missing <h1> tag");
  else if (h1Matches.length > 1) issues.push(`Multiple (${h1Matches.length}) <h1> tags`);

  if (schemaTypes.length === 0) issues.push("Missing Schema.org JSON-LD structured data");

  results.push({
    url: fullUrl,
    path: reqPath,
    category,
    status,
    is404,
    title,
    titleLength: title.length,
    description,
    descLength: description.length,
    canonical,
    canonicalValid,
    hreflangEnUs: hreflangEnMatch ? hreflangEnMatch[1] : null,
    hreflangXDefault: hreflangXMatch ? hreflangXMatch[1] : null,
    ogTitle: ogTitleMatch ? ogTitleMatch[1] : null,
    ogDesc: ogDescMatch ? ogDescMatch[1] : null,
    ogImage: ogImgMatch ? ogImgMatch[1] : null,
    ogUrl: ogUrlMatch ? ogUrlMatch[1] : null,
    twitterCard: twitterCardMatch ? twitterCardMatch[1] : null,
    hasSchema: schemaTypes.length > 0,
    schemaTypes: Array.from(new Set(schemaTypes)),
    h1List: h1Matches,
    h2Count,
    h3Count,
    approxWordCount,
    internalLinkCount: internalLinks,
    externalLinkCount: externalLinks,
    totalImages: imgTags.length,
    imagesWithoutAlt,
    issues
  });
}

// Summary stats
console.log("=== COMPREHENSIVE ON-PAGE CRAWL RESULTS ===");
console.log(`Total Pages Crawled: ${results.length}`);
console.log(`HTTP 200 OK: ${results.filter(r => r.status === 200).length} / ${results.length}`);
console.log(`Schema.org Structured Data Deployed: ${results.filter(r => r.hasSchema).length} / ${results.length}`);
console.log(`Canonical Self-Referencing: ${results.filter(r => r.canonicalValid).length} / ${results.length}`);
console.log(`Single H1 Tags: ${results.filter(r => r.h1List.length === 1).length} / ${results.length}`);
console.log(`OpenGraph / Social Metadata Complete: ${results.filter(r => r.ogTitle && r.ogDesc && r.ogImage).length} / ${results.length}`);
console.log(`Hreflang en-US & x-default: ${results.filter(r => r.hreflangEnUs && r.hreflangXDefault).length} / ${results.length}`);

// Category breakdown
const catMap: Record<string, { count: number; words: number; h2s: number; internal: number; external: number; schemas: Set<string> }> = {};
for (const r of results) {
  if (!catMap[r.category]) {
    catMap[r.category] = { count: 0, words: 0, h2s: 0, internal: 0, external: 0, schemas: new Set() };
  }
  catMap[r.category].count++;
  catMap[r.category].words += r.approxWordCount;
  catMap[r.category].h2s += r.h2Count;
  catMap[r.category].internal += r.internalLinkCount;
  catMap[r.category].external += r.externalLinkCount;
  r.schemaTypes.forEach(s => catMap[r.category].schemas.add(s));
}

console.log("\n=== METRICS BY CONTENT CLUSTER / PAGE TYPE ===");
for (const [cat, d] of Object.entries(catMap)) {
  console.log(`- ${cat} (${d.count} pages):`);
  console.log(`    Avg Word Count: ${Math.round(d.words / d.count)} words`);
  console.log(`    Avg H2 Subheadings: ${(d.h2s / d.count).toFixed(1)}`);
  console.log(`    Avg Internal Links: ${(d.internal / d.count).toFixed(1)}`);
  console.log(`    Avg External Links: ${(d.external / d.count).toFixed(1)}`);
  console.log(`    Schema Graph Types: ${Array.from(d.schemas).join(", ")}`);
}

// Write out JSON scan summary
fs.writeFileSync("scripts/scan_results.json", JSON.stringify(results, null, 2));
console.log("\nScan results saved to scripts/scan_results.json");
