import fs from 'fs';
import path from 'path';
import { getGscCredentials, getGscAccessToken, printGscSetupInstructions } from './gsc_auth';

interface SearchRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface QuickWin {
  query: string;
  page?: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  potentialGain: number;
  recommendation: string;
}

interface CtrOpportunity {
  query: string;
  page?: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  recommendation: string;
}

async function fetchGscSearchAnalytics(accessToken: string, propertyUrl: string, days = 28): Promise<SearchRow[]> {
  const endDate = new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString().split('T')[0]; // GSC has 2-3 day lag
  const startDate = new Date(Date.now() - (days + 2) * 24 * 3600 * 1000).toISOString().split('T')[0];

  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(propertyUrl)}/searchAnalytics/query`;

  const body = {
    startDate,
    endDate,
    dimensions: ['query', 'page'],
    rowLimit: 5000,
    dataState: 'final'
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`GSC API Error (${response.status}): ${err}`);
  }

  const data = await response.json();
  return (data.rows || []) as SearchRow[];
}

function getSampleData(): SearchRow[] {
  return [
    { keys: ["local seo checklist for small business", "https://localsurgeseo.com/blog/local-seo-checklist-contractors"], clicks: 214, impressions: 3850, ctr: 0.0556, position: 4.2 },
    { keys: ["contractor local seo packages pricing", "https://localsurgeseo.com/pricing"], clicks: 189, impressions: 2100, ctr: 0.0900, position: 2.1 },
    { keys: ["how to rank in google maps pack 2026", "https://localsurgeseo.com/blog/google-maps-ranking-signals-2026"], clicks: 145, impressions: 4200, ctr: 0.0345, position: 5.8 },
    { keys: ["local seo tools near me", "https://localsurgeseo.com/seo-tool"], clicks: 120, impressions: 1950, ctr: 0.0615, position: 3.4 },
    { keys: ["los angeles local seo services", "https://localsurgeseo.com/locations/california/los-angeles"], clicks: 98, impressions: 3100, ctr: 0.0316, position: 6.4 },
    { keys: ["plumber local seo case study", "https://localsurgeseo.com/case-studies"], clicks: 82, impressions: 1400, ctr: 0.0585, position: 3.9 },
    { keys: ["local nap citation audit tool", "https://localsurgeseo.com/directory-tool"], clicks: 76, impressions: 2800, ctr: 0.0271, position: 7.8 },
    { keys: ["california contractor directory seo", "https://localsurgeseo.com/locations/california"], clicks: 65, impressions: 2400, ctr: 0.0270, position: 8.2 },
    { keys: ["indexnow instant google indexer", "https://localsurgeseo.com/blog/indexnow-protocol-guide"], clicks: 58, impressions: 1850, ctr: 0.0313, position: 5.1 },
    { keys: ["schema markup generator local business", "https://localsurgeseo.com/seo-tool"], clicks: 42, impressions: 3500, ctr: 0.0120, position: 4.8 },
    { keys: ["denver hvac seo optimization", "https://localsurgeseo.com/locations/colorado/denver"], clicks: 39, impressions: 1120, ctr: 0.0348, position: 6.9 },
    { keys: ["ai answer engine optimization local seo", "https://localsurgeseo.com/blog/ai-search-optimization-guide"], clicks: 35, impressions: 4600, ctr: 0.0076, position: 5.5 }
  ];
}

async function run() {
  console.log(`\x1b[1;36m========================================================================\x1b[0m`);
  console.log(`\x1b[1;36m       🚀 LOCAL SURGE SEO — Google Search Console Intelligence Report   \x1b[0m`);
  console.log(`\x1b[1;36m========================================================================\x1b[0m\n`);

  const creds = getGscCredentials();
  let rows: SearchRow[] = [];
  let isMock = false;

  if (creds) {
    console.log(`\x1b[32m✔ Found GSC Credentials for Property:\x1b[0m \x1b[1m${creds.property_url}\x1b[0m`);
    console.log(`\x1b[90m  Authenticated via:\x1b[0m ${creds.client_email}`);
    try {
      console.log(`\x1b[34m⏳ Authenticating and pulling Search Analytics data (Last 28 Days)...\x1b[0m`);
      const token = await getGscAccessToken(creds);
      rows = await fetchGscSearchAnalytics(token, creds.property_url, 28);
      console.log(`\x1b[32m✔ Successfully fetched ${rows.length} query/page records from Search Console API.\x1b[0m\n`);
    } catch (err: any) {
      console.error(`\x1b[31m✖ Error querying GSC API:\x1b[0m`, err.message);
      console.log(`\x1b[33mFalling back to sample analytical inspection dataset for diagnostic overview.\x1b[0m\n`);
      rows = getSampleData();
      isMock = true;
    }
  } else {
    printGscSetupInstructions();
    console.log(`\x1b[33m⚡ No live credentials found in environment. Running with representative dataset for demonstration...\x1b[0m\n`);
    rows = getSampleData();
    isMock = true;
  }

  // 1. Overall Metrics
  let totalClicks = 0;
  let totalImpressions = 0;
  let weightedPositionSum = 0;

  for (const r of rows) {
    totalClicks += r.clicks;
    totalImpressions += r.impressions;
    weightedPositionSum += r.position * r.impressions;
  }

  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const avgPosition = totalImpressions > 0 ? weightedPositionSum / totalImpressions : 0;

  console.log(`\x1b[1m📊 PERFORMANCE SUMMARY (Last 28 Days):\x1b[0m`);
  console.log(`┌─────────────────────┬─────────────────────┬─────────────────────┬─────────────────────┐`);
  console.log(`│ Total Clicks        │ Total Impressions   │ Average CTR         │ Average Position    │`);
  console.log(`├─────────────────────┼─────────────────────┼─────────────────────┼─────────────────────┤`);
  console.log(
    `│ \x1b[1;32m${totalClicks.toLocaleString().padEnd(19)}\x1b[0m │ \x1b[1;34m${totalImpressions.toLocaleString().padEnd(19)}\x1b[0m │ \x1b[1;33m${(avgCtr.toFixed(2) + '%').padEnd(19)}\x1b[0m │ \x1b[1;35m${avgPosition.toFixed(1).padEnd(19)}\x1b[0m │`
  );
  console.log(`└─────────────────────┴─────────────────────┴─────────────────────┴─────────────────────┘\n`);

  // 2. Identify Quick Wins (Positions 4.0 - 10.9)
  const quickWins: QuickWin[] = rows
    .filter(r => r.position >= 4.0 && r.position <= 10.9 && r.impressions >= 100)
    .map(r => {
      const estimatedGain = Math.round(r.impressions * 0.15 - r.clicks); // Assuming ~15% CTR in top 3
      return {
        query: r.keys[0] || 'unknown',
        page: r.keys[1] || '',
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: Number((r.ctr * 100).toFixed(2)),
        position: Number(r.position.toFixed(1)),
        potentialGain: Math.max(estimatedGain, 10),
        recommendation: `Add keyword to H2 heading, bold key phrase in intro paragraph, and build 2 internal links from related location/blog pages.`
      };
    })
    .sort((a, b) => b.impressions - a.impressions);

  console.log(`\x1b[1;33m🚀 TOP QUICK-WIN KEYWORDS (Positions 4–10 with High Impressions):\x1b[0m`);
  console.log(`\x1b[90mThese keywords already rank on Page 1/Top 10. A few on-page tweaks can push them into Top 3.\x1b[0m`);
  console.log(`┌──────────────────────────────────────────────┬────────┬────────┬───────┬────────┬─────────────────────────┐`);
  console.log(`│ Search Query                                 │ Pos    │ Impr   │ Clicks│ CTR    │ Potential Extra Clicks  │`);
  console.log(`├──────────────────────────────────────────────┼────────┼────────┼───────┼────────┼─────────────────────────┤`);
  quickWins.slice(0, 10).forEach(qw => {
    const q = qw.query.length > 44 ? qw.query.slice(0, 41) + '...' : qw.query.padEnd(44);
    const pos = qw.position.toFixed(1).padEnd(6);
    const imp = qw.impressions.toLocaleString().padEnd(6);
    const clk = qw.clicks.toLocaleString().padEnd(5);
    const ctr = (qw.ctr.toFixed(1) + '%').padEnd(6);
    const pot = `+${qw.potentialGain} clicks/mo`.padEnd(23);
    console.log(`│ \x1b[1m${q}\x1b[0m │ \x1b[33m${pos}\x1b[0m │ ${imp} │ ${clk} │ ${ctr} │ \x1b[32m${pot}\x1b[0m │`);
  });
  console.log(`└──────────────────────────────────────────────┴────────┴────────┴───────┴────────┴─────────────────────────┘\n`);

  // 3. Low CTR / Headline Optimization Opportunities (Pos < 6, CTR < 2%)
  const ctrOpportunities: CtrOpportunity[] = rows
    .filter(r => r.position < 6.0 && r.ctr < 0.025 && r.impressions >= 500)
    .map(r => ({
      query: r.keys[0] || 'unknown',
      page: r.keys[1] || '',
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: Number((r.ctr * 100).toFixed(2)),
      position: Number(r.position.toFixed(1)),
      recommendation: `Rewrite <title> tag with numbers or actionable benefit, and craft an active CTA in the meta description.`
    }));

  if (ctrOpportunities.length > 0) {
    console.log(`\x1b[1;35m⚠️  HEADLINE / CTR UNDERPERFORMERS (High Rank, Low Click-Through Rate):\x1b[0m`);
    ctrOpportunities.forEach(co => {
      console.log(` • \x1b[1m"${co.query}"\x1b[0m (Pos: \x1b[33m${co.position}\x1b[0m, Impr: \x1b[34m${co.impressions}\x1b[0m, CTR: \x1b[31m${co.ctr}%\x1b[0m)`);
      console.log(`   \x1b[90mPage:\x1b[0m ${co.page}`);
      console.log(`   \x1b[36mFix:\x1b[0m ${co.recommendation}\n`);
    });
  }

  // 4. Save JSON and Markdown Audit Reports
  const reportPayload = {
    generatedAt: new Date().toISOString(),
    isMock,
    propertyUrl: creds?.property_url || 'sc-domain:localsurgeseo.com',
    summary: {
      totalClicks,
      totalImpressions,
      avgCtr: Number(avgCtr.toFixed(2)),
      avgPosition: Number(avgPosition.toFixed(1)),
      totalKeywordsTracked: rows.length
    },
    quickWins,
    ctrOpportunities,
    topQueries: rows.slice(0, 50)
  };

  const jsonPath = path.join(process.cwd(), 'gsc_report.json');
  fs.writeFileSync(jsonPath, JSON.stringify(reportPayload, null, 2));

  // Generate detailed Markdown Report with Code Fix Recipes
  let md = `# Google Search Console Diagnostic & Actionable SEO Fix Report
**Generated:** ${new Date().toLocaleString()}  
**Target Property:** \`${reportPayload.propertyUrl}\`  
**Dataset:** ${isMock ? 'Demo Diagnostic Baseline' : 'Live Google Search Console Production API'}

---

## 1. Executive Performance Summary (Last 28 Days)

| Total Organic Clicks | Total Organic Impressions | Average Click-Through Rate (CTR) | Average Position | Total Monitored Queries |
|:---:|:---:|:---:|:---:|:---:|
| **${totalClicks.toLocaleString()}** | **${totalImpressions.toLocaleString()}** | **${avgCtr.toFixed(2)}%** | **${avgPosition.toFixed(1)}** | **${rows.length}** |

---

## 2. 🚀 Prioritized Quick-Win Keyword Opportunities (Positions 4–10)
Pushing these queries from mid-page 1 to the top 3 spots yields the highest ROI:

| Search Query | Target Page URL | Position | Impressions | Clicks | CTR | Action Plan |
|---|---|:---:|:---:|:---:|:---:|---|
${quickWins.map(qw => `| **${qw.query}** | \`${qw.page.replace('https://localsurgeseo.com', '') || '/'}\` | \`${qw.position}\` | ${qw.impressions.toLocaleString()} | ${qw.clicks} | ${qw.ctr}% | ${qw.recommendation} |`).join('\n')}

---

## 3. 🎯 High-Impact Code & Content Fixes to Implement

### A. On-Page Heading & Exact-Match Integration
For pages targeting Quick-Win queries:
1. Ensure the exact phrase or close variant is present in the \`<h1>\` or top \`<h2>\` subheading.
2. Add a clear definition or bullet point directly answering the query in the first 150 words.

### B. Internal Link Matrix Insertion
Link from high-authority hub pages (e.g. \`/blog\`, \`/locations/california\`, \`/seo-tool\`) using descriptive anchor text matching the target query.

### C. Rich Schema Validation
Verify that \`LocalBusiness\`, \`FAQPage\`, and \`BreadcrumbList\` JSON-LD schemas are valid and error-free on the target landing pages.
`;

  const mdPath = path.join(process.cwd(), 'GSC-AUDIT-REPORT.md');
  fs.writeFileSync(mdPath, md);

  console.log(`\x1b[32m✔ Detailed JSON report saved to:\x1b[0m \x1b[1mgsc_report.json\x1b[0m`);
  console.log(`\x1b[32m✔ Actionable Markdown report saved to:\x1b[0m \x1b[1mGSC-AUDIT-REPORT.md\x1b[0m`);
  console.log(`\n\x1b[1;32mDone! Review GSC-AUDIT-REPORT.md for recommended fixes.\x1b[0m\n`);
}

run().catch(err => {
  console.error('\x1b[31mFatal error during GSC report generation:\x1b[0m', err);
  process.exit(1);
});
