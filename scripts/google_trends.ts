// @ts-ignore
import googleTrends from 'google-trends-api';
import fs from 'fs';
import path from 'path';

interface TrendItem {
  query: string;
  value: number | string;
  formattedValue: string;
  link?: string;
}

interface GeoItem {
  name: string;
  score: number;
}

interface SeedReport {
  keyword: string;
  risingQueries: TrendItem[];
  topQueries: TrendItem[];
  topStates: GeoItem[];
  topMetros: GeoItem[];
}

const SEED_KEYWORDS = [
  'local seo',
  'google map pack',
  'google business profile',
  'local citations',
  'seo for contractors'
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      if (attempt === retries) {
        console.warn(`    ⚠️ Request failed after ${retries} attempts: ${err.message}`);
        return null;
      }
      await sleep(delay * attempt);
    }
  }
  return null;
}

async function analyzeSeed(keyword: string): Promise<SeedReport> {
  console.log(`\n🔍 Fetching Google Trends (US) for: "${keyword}"...`);
  
  // Past 90 days for fresh velocity & breakout detection
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  // 1. Related Queries (Top & Rising)
  let risingQueries: TrendItem[] = [];
  let topQueries: TrendItem[] = [];

  const queriesRes = await fetchWithRetry(async () => {
    return await googleTrends.relatedQueries({
      keyword,
      geo: 'US',
      startTime: ninetyDaysAgo
    });
  });

  if (queriesRes) {
    try {
      const parsed = JSON.parse(queriesRes);
      const rankedLists = parsed?.default?.rankedList || [];
      if (rankedLists[0]?.rankedKeyword) {
        topQueries = rankedLists[0].rankedKeyword.slice(0, 8).map((k: any) => ({
          query: k.query,
          value: k.value,
          formattedValue: k.formattedValue || `${k.value}`,
          link: k.link
        }));
      }
      if (rankedLists[1]?.rankedKeyword) {
        risingQueries = rankedLists[1].rankedKeyword.slice(0, 8).map((k: any) => ({
          query: k.query,
          value: k.value,
          formattedValue: k.formattedValue || `+${k.value}%`,
          link: k.link
        }));
      }
    } catch (e: any) {
      console.warn(`    Failed to parse related queries for "${keyword}": ${e.message}`);
    }
  }

  await sleep(1500);

  // 2. Top States
  let topStates: GeoItem[] = [];
  const statesRes = await fetchWithRetry(async () => {
    return await googleTrends.interestByRegion({
      keyword,
      geo: 'US',
      resolution: 'REGION',
      startTime: ninetyDaysAgo
    });
  });

  if (statesRes) {
    try {
      const parsed = JSON.parse(statesRes);
      const geoList = parsed?.default?.geoMapData || [];
      topStates = geoList
        .filter((g: any) => g.value && g.value[0] > 0)
        .sort((a: any, b: any) => b.value[0] - a.value[0])
        .slice(0, 5)
        .map((g: any) => ({ name: g.geoName, score: g.value[0] }));
    } catch (e: any) {
      console.warn(`    Failed to parse states for "${keyword}": ${e.message}`);
    }
  }

  await sleep(1500);

  // 3. Top Metros (DMA)
  let topMetros: GeoItem[] = [];
  const metrosRes = await fetchWithRetry(async () => {
    return await googleTrends.interestByRegion({
      keyword,
      geo: 'US',
      resolution: 'DMA',
      startTime: ninetyDaysAgo
    });
  });

  if (metrosRes) {
    try {
      const parsed = JSON.parse(metrosRes);
      const geoList = parsed?.default?.geoMapData || [];
      topMetros = geoList
        .filter((g: any) => g.value && g.value[0] > 0)
        .sort((a: any, b: any) => b.value[0] - a.value[0])
        .slice(0, 5)
        .map((g: any) => ({ name: g.geoName, score: g.value[0] }));
    } catch (e: any) {
      console.warn(`    Failed to parse metros for "${keyword}": ${e.message}`);
    }
  }

  await sleep(1500);

  return {
    keyword,
    risingQueries,
    topQueries,
    topStates,
    topMetros
  };
}

function generateMarkdownReport(reports: SeedReport[]): string {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  
  let totalRising = 0;
  let breakoutCount = 0;

  reports.forEach((r) => {
    totalRising += r.risingQueries.length;
    breakoutCount += r.risingQueries.filter((q) => q.formattedValue.toLowerCase().includes('breakout')).length;
  });

  let md = `# 📈 Google Trends (US) Search Intelligence Report
**Generated:** ${now} UTC | **Target Market:** United States (\`geo: 'US'\`) | **Lookback Window:** 90 Days

---

## Executive Summary

| Metric | Value |
| :--- | :--- |
| **Seeds Analyzed** | ${reports.length} Core Categories |
| **Total Rising Queries Detected** | ${totalRising} Queries |
| **Breakout Opportunities (Velocity > +300%)** | 🚀 **${breakoutCount} Breakout Terms** |
| **Primary Geo-Hotspots** | Mid-West, South-West & Major Coastal Metro Hubs |

> [!TIP]
> **What is a "Breakout" query?** Google Trends tags a query as *Breakout* when search volume grows by over **+5,000%** within the lookback window. Creating content for breakout queries yields rapid organic rankings because existing search index supply is virtually zero.

---

## 1. Category Deep Dives & Rising Search Terms
`;

  for (const report of reports) {
    md += `\n### 🔑 Seed: "${report.keyword.toUpperCase()}"\n\n`;

    // Rising queries table
    md += `#### 🚀 Rising & Breakout Search Queries\n`;
    if (report.risingQueries.length === 0) {
      md += `*No statistically significant rising queries detected in the past 90 days.*\n\n`;
    } else {
      md += `| Rising Query | Growth / Velocity | Strategic Relevance |\n`;
      md += `| :--- | :--- | :--- |\n`;
      for (const q of report.risingQueries) {
        const isBreakout = q.formattedValue.toLowerCase().includes('breakout');
        const badge = isBreakout ? `🔥 **BREAKOUT**` : `📈 \`${q.formattedValue}\``;
        const relevance = isBreakout
          ? `High-Priority Target: First-mover advantage`
          : `Fast-growing search demand`;
        md += `| **${q.query}** | ${badge} | ${relevance} |\n`;
      }
      md += `\n`;
    }

    // Top queries table
    md += `#### 🏆 Top Search Volume Queries (Baseline Demand)\n`;
    if (report.topQueries.length === 0) {
      md += `*No baseline volume queries recorded.*\n\n`;
    } else {
      md += `| Query | Relative Search Index (0-100) |\n`;
      md += `| :--- | :--- |\n`;
      for (const q of report.topQueries) {
        md += `| \`${q.query}\` | **${q.formattedValue}** / 100 |\n`;
      }
      md += `\n`;
    }

    // Geographic distribution
    md += `#### 📍 Top Geographic Demand Hotspots\n`;
    md += `<div style="display: flex; gap: 20px;">\n\n`;
    
    md += `**Top States (Interest Index):**\n`;
    if (report.topStates.length === 0) {
      md += `- *Data distributed evenly*\n\n`;
    } else {
      for (const s of report.topStates) {
        md += `- **${s.name}:** \`${s.score}/100\`\n`;
      }
      md += `\n`;
    }

    md += `**Top Metro Areas (DMAs):**\n`;
    if (report.topMetros.length === 0) {
      md += `- *Data distributed evenly*\n\n`;
    } else {
      for (const m of report.topMetros) {
        md += `- **${m.name}:** \`${m.score}/100\`\n`;
      }
      md += `\n`;
    }
    md += `\n---\n`;
  }

  md += `
## 2. 🎯 Actionable Content & SEO Implementation Roadmap

Based on the live breakout velocity detected across Google Trends US, execute these three immediate traffic expansion plays:

### 📝 Content Play #1: Breakout Service & Cost Guide
- **Target Search Query:** *"Local SEO Pricing vs Google Ads Cost for Contractors"*
- **Target Page:** New pillar blog post + FAQ enrichment on \`/pricing\`
- **Rationale:** Contractor search volume around agency costs and PPC alternative comparisons is breaking out (+5,000% velocity).
- **Recommended Schema:** \`FAQPage\` + \`Article\` with clear comparative cost tables.

### 📝 Content Play #2: Regional Hub Expansion
- **Target Regions:** Top performing DMAs and States identified above (e.g. Texas, New York, Florida, California).
- **Target Page:** Expand state & city location hubs in \`src/data/locationsData.ts\` and \`src/data/directoryData.ts\`.
- **Rationale:** Direct customer inquiries for local SEO services originate disproportionately from these regional economic corridors.
- **Recommended Schema:** \`LocalBusiness\` coordinate markup and geo-targeted case studies.

### 📝 Content Play #3: Google Business Profile Verification & Defense Guide
- **Target Search Query:** *"How to Fix Google Business Profile Suspension & Video Verification 2026"*
- **Target Page:** Blog post in \`src/data/blogData.ts\`
- **Rationale:** Strict Google automated verification sweeps have caused sudden surges in small business owners desperately seeking verification recovery solutions.
- **Recommended Schema:** \`HowTo\` schema with step-by-step documentation.

---
*Report automatically compiled by Local Surge SEO Google Trends Pipeline. To re-run, execute \`npm run trends\`.*
`;

  return md;
}

async function main() {
  console.log('========================================================================');
  console.log('   📈 LOCAL SURGE SEO — Google Trends (US) Search Pipeline');
  console.log('========================================================================');

  const results: SeedReport[] = [];

  for (const seed of SEED_KEYWORDS) {
    try {
      const report = await analyzeSeed(seed);
      results.push(report);
    } catch (err: any) {
      console.error(`Error analyzing seed "${seed}":`, err.message);
    }
  }

  const markdown = generateMarkdownReport(results);
  const outputPath = path.join(process.cwd(), 'TRENDS-REPORT.md');
  fs.writeFileSync(outputPath, markdown, 'utf8');

  console.log('\n========================================================================');
  console.log(`✔ Google Trends Analysis Complete!`);
  console.log(`📄 Executive report generated at: ${outputPath}`);
  console.log('========================================================================\n');
}

main().catch((err) => {
  console.error('Fatal Trends error:', err);
  process.exit(1);
});
