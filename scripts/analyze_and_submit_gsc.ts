import fs from 'fs';
import path from 'path';
import { getGscCredentials, getGscAccessToken, printGscSetupInstructions } from './gsc_auth';

interface SitemapUrlEntry {
  loc: string;
  lastmod?: string;
  hreflang?: { lang: string; href: string }[];
  hasImage?: boolean;
  sourceSitemap: string;
}

interface SitemapSummary {
  filename: string;
  urlCount: number;
  hasDeprecatedTags: boolean;
  hasValidDates: boolean;
  urls: SitemapUrlEntry[];
}

interface GscSitemapResponse {
  path: string;
  lastSubmitted?: string;
  isPending?: boolean;
  isSitemapsIndex?: boolean;
  type?: string;
  lastDownloaded?: string;
  warnings?: string;
  errors?: string;
  contents?: { type: string; submitted: string; indexed: string }[];
}

interface UrlInspectionRecord {
  url: string;
  category: string;
  verdict: string;
  coverageState: string;
  robotsTxtState: string;
  indexingState: string;
  googleCanonical: string;
  userCanonical: string;
  issues: string[];
}

function parseSitemapXml(filePath: string): SitemapSummary {
  const filename = path.basename(filePath);
  const content = fs.readFileSync(filePath, 'utf8');

  const hasDeprecatedPriority = /<priority>/i.test(content);
  const hasDeprecatedChangefreq = /<changefreq>/i.test(content);
  const hasDeprecatedTags = hasDeprecatedPriority || hasDeprecatedChangefreq;

  const urlMatches = content.match(/<url>[\s\S]*?<\/url>/gi) || [];
  const urls: SitemapUrlEntry[] = [];
  let validDatesCount = 0;

  for (const block of urlMatches) {
    const locMatch = block.match(/<loc>(.*?)<\/loc>/i);
    const lastmodMatch = block.match(/<lastmod>(.*?)<\/lastmod>/i);
    const imageMatch = /<image:image>/i.test(block);

    const hreflangRegex = /<xhtml:link[^>]+hreflang=["']([^"']+)["'][^>]+href=["']([^"']+)["']/gi;
    const hreflang: { lang: string; href: string }[] = [];
    let hm;
    while ((hm = hreflangRegex.exec(block)) !== null) {
      hreflang.push({ lang: hm[1], href: hm[2] });
    }

    if (locMatch) {
      const loc = locMatch[1].trim();
      const lastmod = lastmodMatch ? lastmodMatch[1].trim() : undefined;
      if (lastmod && /^\d{4}-\d{2}-\d{2}/.test(lastmod)) {
        validDatesCount++;
      }
      urls.push({
        loc,
        lastmod,
        hreflang,
        hasImage: imageMatch,
        sourceSitemap: filename
      });
    }
  }

  return {
    filename,
    urlCount: urls.length,
    hasDeprecatedTags,
    hasValidDates: urls.length > 0 && validDatesCount === urls.length,
    urls
  };
}

async function listGscSitemaps(accessToken: string, propertyUrl: string): Promise<GscSitemapResponse[]> {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(propertyUrl)}/sitemaps`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) {
    throw new Error(`List Sitemaps API Error (${res.status}): ${await res.text()}`);
  }
  const data = await res.json();
  return (data.sitemap || []) as GscSitemapResponse[];
}

async function submitGscSitemap(accessToken: string, propertyUrl: string, sitemapUrl: string): Promise<boolean> {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(propertyUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Submit Sitemap API Error for ${sitemapUrl} (${res.status}): ${errorText}`);
  }
  return true;
}

async function inspectGscUrl(accessToken: string, siteUrl: string, inspectionUrl: string, category: string): Promise<UrlInspectionRecord> {
  const endpoint = 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect';

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inspectionUrl,
      siteUrl,
      languageCode: 'en'
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    return {
      url: inspectionUrl,
      category,
      verdict: 'ERROR',
      coverageState: `API Error ${res.status}: ${errorText.slice(0, 100)}`,
      robotsTxtState: 'UNKNOWN',
      indexingState: 'UNKNOWN',
      googleCanonical: '',
      userCanonical: '',
      issues: [`Inspection API Error: ${res.status}`]
    };
  }

  const data = await res.json();
  const ir = data.inspectionResult || {};
  const is = ir.indexStatusResult || {};

  const issues: string[] = [];
  if (is.verdict === 'FAIL' || is.verdict === 'NEUTRAL') {
    issues.push(`Coverage: ${is.coverageState || 'Not indexed'}`);
  }
  if (is.googleCanonical && is.userCanonical && is.googleCanonical !== is.userCanonical) {
    issues.push(`Canonical mismatch: Google picked '${is.googleCanonical}' vs user '${is.userCanonical}'`);
  }

  return {
    url: inspectionUrl,
    category,
    verdict: is.verdict || 'UNKNOWN',
    coverageState: is.coverageState || 'Unspecified',
    robotsTxtState: is.robotsTxtState || 'ALLOWED',
    indexingState: is.indexingState || 'INDEXING_ALLOWED',
    googleCanonical: is.googleCanonical || inspectionUrl,
    userCanonical: is.userCanonical || inspectionUrl,
    issues
  };
}

async function main() {
  console.log(`\x1b[1;36m========================================================================\x1b[0m`);
  console.log(`\x1b[1;36m     🗺️  GOOGLE SEARCH CONSOLE — Full Sitemap Audit & Submission Engine    \x1b[0m`);
  console.log(`\x1b[1;36m========================================================================\x1b[0m\n`);

  const publicDir = path.join(process.cwd(), 'public');
  const sitemapFiles = [
    'sitemap.xml',
    'sitemap-core.xml',
    'sitemap-blog.xml',
    'sitemap-locations.xml',
    'sitemap-directory.xml',
    'sitemap-demos.xml'
  ];

  const parsedSitemaps: SitemapSummary[] = [];
  const allUrlsMap = new Map<string, SitemapUrlEntry>();

  for (const sf of sitemapFiles) {
    const fullPath = path.join(publicDir, sf);
    if (fs.existsSync(fullPath)) {
      const parsed = parseSitemapXml(fullPath);
      parsedSitemaps.push(parsed);
      for (const u of parsed.urls) {
        if (!allUrlsMap.has(u.loc)) {
          allUrlsMap.set(u.loc, u);
        }
      }
    }
  }

  console.log(`\x1b[1m📂 Sitemaps Analyzed:\x1b[0m`);
  for (const sm of parsedSitemaps) {
    console.log(` • \x1b[36m${sm.filename.padEnd(25)}\x1b[0m: \x1b[32m${sm.urlCount} URLs\x1b[0m | Deprecated tags: ${sm.hasDeprecatedTags ? '❌ YES' : '✅ NONE'} | Dates valid: ${sm.hasValidDates ? '✅ YES' : '❌ NO'}`);
  }
  console.log(`\n\x1b[1mTotal Unique URLs across all sitemaps:\x1b[0m \x1b[1;32m${allUrlsMap.size} URLs\x1b[0m\n`);

  // Authenticate with GSC
  const creds = getGscCredentials();
  if (!creds) {
    printGscSetupInstructions();
    console.error('\x1b[31mCannot proceed with live GSC submission without credentials.\x1b[0m');
    return;
  }

  console.log(`\x1b[32m✔ Authenticating with GSC for property:\x1b[0m \x1b[1m${creds.property_url}\x1b[0m`);
  const accessToken = await getGscAccessToken(creds);

  // 1. Fetch current submitted sitemaps in GSC
  console.log(`\n\x1b[34m🔍 Fetching currently registered sitemaps in Google Search Console...\x1b[0m`);
  const existingSitemaps = await listGscSitemaps(accessToken, creds.property_url);
  console.log(`Found ${existingSitemaps.length} submitted sitemap(s) in GSC:`);
  for (const s of existingSitemaps) {
    console.log(` • \x1b[1m${s.path}\x1b[0m | Submitted: ${s.lastSubmitted || 'N/A'} | Downloaded: ${s.lastDownloaded || 'N/A'} | Errors: ${s.errors || 0}`);
    if (s.contents) {
      s.contents.forEach(c => console.log(`    - Content Type: ${c.type} -> Submitted: ${c.submitted}, Indexed: ${c.indexed}`));
    }
  }

  // 2. Submit all modular sitemaps + master index to GSC
  const sitemapsToSubmit = [
    'https://localsurgeseo.com/sitemap_index.xml',
    'https://localsurgeseo.com/sitemap.xml',
    'https://localsurgeseo.com/sitemap-core.xml',
    'https://localsurgeseo.com/sitemap-blog.xml',
    'https://localsurgeseo.com/sitemap-locations.xml',
    'https://localsurgeseo.com/sitemap-directory.xml',
    'https://localsurgeseo.com/sitemap-demos.xml'
  ];

  console.log(`\n\x1b[34m🚀 Submitting all modular sitemaps directly to Google Search Console API...\x1b[0m`);
  const submissionResults: { sitemap: string; success: boolean; error?: string }[] = [];

  for (const smUrl of sitemapsToSubmit) {
    try {
      console.log(`  Submitting: \x1b[36m${smUrl}\x1b[0m...`);
      await submitGscSitemap(accessToken, creds.property_url, smUrl);
      console.log(`  \x1b[32m✔ SUCCESS\x1b[0m: ${smUrl}`);
      submissionResults.push({ sitemap: smUrl, success: true });
    } catch (e: any) {
      console.error(`  \x1b[31m✖ ERROR\x1b[0m: ${smUrl} -> ${e.message}`);
      submissionResults.push({ sitemap: smUrl, success: false, error: e.message });
    }
  }

  // 3. Perform Live URL Inspection on Key Categories
  console.log(`\n\x1b[34m🔬 Inspecting Indexation & Coverage Across Representative Categories...\x1b[0m`);

  const sampleUrlsToInspect: { url: string; category: string }[] = [
    // Core
    { url: 'https://localsurgeseo.com/', category: 'Core (Homepage)' },
    { url: 'https://localsurgeseo.com/about', category: 'Core (About)' },
    { url: 'https://localsurgeseo.com/pricing', category: 'Core (Pricing)' },
    { url: 'https://localsurgeseo.com/local-seo', category: 'Core (Commercial)' },
    { url: 'https://localsurgeseo.com/seo-tool', category: 'Core (SEO Tool)' },
    { url: 'https://localsurgeseo.com/case-studies', category: 'Core (Case Studies)' },
    { url: 'https://localsurgeseo.com/site-map', category: 'Core (HTML Sitemap)' },

    // Blog Guides
    { url: 'https://localsurgeseo.com/blog', category: 'Blog Hub' },
    { url: 'https://localsurgeseo.com/blog/google-map-pack-optimization-guide', category: 'Blog Article' },
    { url: 'https://localsurgeseo.com/blog/local-seo-checklist-contractors', category: 'Blog Article' },
    { url: 'https://localsurgeseo.com/blog/local-business-schema-markup-guide', category: 'Blog Article' },
    { url: 'https://localsurgeseo.com/blog/google-review-management-strategy', category: 'Blog Article' },

    // Empirical Research Locations
    { url: 'https://localsurgeseo.com/locations', category: 'Locations Hub' },
    { url: 'https://localsurgeseo.com/locations/california', category: 'Location State Hub' },
    { url: 'https://localsurgeseo.com/locations/california/los-angeles', category: 'Location Empirical Study' },
    { url: 'https://localsurgeseo.com/locations/texas/austin', category: 'Location Empirical Study' },
    { url: 'https://localsurgeseo.com/locations/florida/miami', category: 'Location Empirical Study' },
    { url: 'https://localsurgeseo.com/locations/new-york/new-york-city', category: 'Location Empirical Study' },

    // Directory Landing Pages
    { url: 'https://localsurgeseo.com/los-angeles-seo', category: 'City Directory Page' },
    { url: 'https://localsurgeseo.com/texas', category: 'State Directory Hub' },
    { url: 'https://localsurgeseo.com/texas/houston', category: 'City Directory Page' },
    { url: 'https://localsurgeseo.com/florida/orlando', category: 'City Directory Page' },

    // Live Demos
    { url: 'https://localsurgeseo.com/demo/contractor-surge', category: 'Live Demo' },
    { url: 'https://localsurgeseo.com/demo/dental-surge', category: 'Live Demo' }
  ];

  const inspectionRecords: UrlInspectionRecord[] = [];

  for (const item of sampleUrlsToInspect) {
    process.stdout.write(`Inspecting [${item.category}] ${item.url}... `);
    try {
      const record = await inspectGscUrl(accessToken, creds.property_url, item.url, item.category);
      inspectionRecords.push(record);
      const isPass = record.verdict === 'PASS';
      const color = isPass ? '\x1b[32m' : '\x1b[33m';
      console.log(`${color}${record.verdict}\x1b[0m -> Coverage: \x1b[1m${record.coverageState}\x1b[0m`);
    } catch (err: any) {
      console.log(`\x1b[31mFAILED\x1b[0m: ${err.message}`);
    }
  }

  // 4. Summarize Indexation Findings
  const coverageDistribution = new Map<string, number>();
  for (const r of inspectionRecords) {
    const state = r.coverageState || 'Unknown';
    coverageDistribution.set(state, (coverageDistribution.get(state) || 0) + 1);
  }

  console.log(`\n\x1b[1;33m📊 LIVE INDEXATION STATUS BREAKDOWN:\x1b[0m`);
  console.log(`┌─────────────────────────────────────────────────────────────┬───────────┐`);
  console.log(`│ Google Search Console Coverage State                        │ Sample Qty│`);
  console.log(`├─────────────────────────────────────────────────────────────┼───────────┤`);
  for (const [state, count] of coverageDistribution.entries()) {
    console.log(`│ ${state.padEnd(59)} │ ${String(count).padEnd(9)} │`);
  }
  console.log(`└─────────────────────────────────────────────────────────────┴───────────┘\n`);

  // Write output json
  const fullAuditPayload = {
    auditedAt: new Date().toISOString(),
    propertyUrl: creds.property_url,
    totalUniqueUrlsInSitemaps: allUrlsMap.size,
    sitemapsParsed: parsedSitemaps.map(s => ({ filename: s.filename, count: s.urlCount, deprecated: s.hasDeprecatedTags })),
    submissionResults,
    inspectionSummary: {
      totalSampled: inspectionRecords.length,
      distribution: Object.fromEntries(coverageDistribution.entries()),
      records: inspectionRecords
    }
  };

  fs.writeFileSync(path.join(process.cwd(), 'sitemap_gsc_sync_report.json'), JSON.stringify(fullAuditPayload, null, 2));
  console.log(`\x1b[32m✔ Detailed sync results saved to:\x1b[0m \x1b[1msitemap_gsc_sync_report.json\x1b[0m\n`);
}

main().catch(err => {
  console.error('\x1b[31mFatal Error:\x1b[0m', err);
  process.exit(1);
});
