import fs from 'fs';
import path from 'path';

interface CwvResult {
  url: string;
  strategy: 'mobile' | 'desktop';
  performanceScore: number;
  metrics: {
    lcp: { displayValue: string; numericValue: number; score: number };
    cls: { displayValue: string; numericValue: number; score: number };
    tbt: { displayValue: string; numericValue: number; score: number };
    fcp: { displayValue: string; numericValue: number; score: number };
    si: { displayValue: string; numericValue: number; score: number };
    ttfb: { displayValue: string; numericValue: number; score: number };
  };
  fieldData?: {
    lcp?: { category: string; percentile: number };
    cls?: { category: string; percentile: number };
    inp?: { category: string; percentile: number };
    fcp?: { category: string; percentile: number };
  };
  opportunities: Array<{
    title: string;
    description: string;
    displayValue?: string;
    savings?: number;
  }>;
  diagnostics: Array<{
    title: string;
    displayValue?: string;
  }>;
}

async function auditPage(url: string, strategy: 'mobile' | 'desktop'): Promise<CwvResult | null> {
  console.log(`⏳ Scanning ${strategy.toUpperCase()} Core Web Vitals for ${url}...`);
  try {
    const apiUrl = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
    apiUrl.searchParams.set('url', url);
    apiUrl.searchParams.set('strategy', strategy);
    apiUrl.searchParams.set('category', 'performance');

    const res = await fetch(apiUrl.toString());
    if (!res.ok) {
      const errText = await res.text();
      console.warn(`  ✖ PageSpeed API error (${res.status}):`, errText.slice(0, 200));
      return null;
    }

    const data = await res.json();
    const lighthouse = data.lighthouseResult;
    const audits = lighthouse?.audits || {};
    const perfScore = Math.round((lighthouse?.categories?.performance?.score || 0) * 100);

    const getAudit = (id: string) => audits[id] || { displayValue: 'N/A', numericValue: 0, score: 0 };

    const metrics = {
      lcp: {
        displayValue: getAudit('largest-contentful-paint').displayValue || 'N/A',
        numericValue: Math.round(getAudit('largest-contentful-paint').numericValue || 0),
        score: Math.round((getAudit('largest-contentful-paint').score || 0) * 100)
      },
      cls: {
        displayValue: getAudit('cumulative-layout-shift').displayValue || '0',
        numericValue: Number((getAudit('cumulative-layout-shift').numericValue || 0).toFixed(3)),
        score: Math.round((getAudit('cumulative-layout-shift').score || 0) * 100)
      },
      tbt: {
        displayValue: getAudit('total-blocking-time').displayValue || '0 ms',
        numericValue: Math.round(getAudit('total-blocking-time').numericValue || 0),
        score: Math.round((getAudit('total-blocking-time').score || 0) * 100)
      },
      fcp: {
        displayValue: getAudit('first-contentful-paint').displayValue || 'N/A',
        numericValue: Math.round(getAudit('first-contentful-paint').numericValue || 0),
        score: Math.round((getAudit('first-contentful-paint').score || 0) * 100)
      },
      si: {
        displayValue: getAudit('speed-index').displayValue || 'N/A',
        numericValue: Math.round(getAudit('speed-index').numericValue || 0),
        score: Math.round((getAudit('speed-index').score || 0) * 100)
      },
      ttfb: {
        displayValue: getAudit('server-response-time').displayValue || 'N/A',
        numericValue: Math.round(getAudit('server-response-time').numericValue || 0),
        score: Math.round((getAudit('server-response-time').score || 0) * 100)
      }
    };

    // Opportunities
    const oppIds = [
      'render-blocking-resources',
      'unused-javascript',
      'unused-css-rules',
      'modern-image-formats',
      'offscreen-images',
      'unminified-javascript',
      'unminified-css',
      'uses-responsive-images',
      'efficient-animated-content',
      'prioritize-lcp-image'
    ];

    const opportunities: Array<{ title: string; description: string; displayValue?: string; savings?: number }> = [];
    for (const id of oppIds) {
      const a = audits[id];
      if (a && a.score !== null && a.score < 0.9 && a.numericValue > 50) {
        opportunities.push({
          title: a.title,
          description: a.description?.split('[Learn more]')[0]?.trim() || '',
          displayValue: a.displayValue,
          savings: Math.round(a.numericValue || 0)
        });
      }
    }

    // Diagnostics
    const diagIds = [
      'dom-size',
      'mainthread-work-breakdown',
      'bootup-time',
      'font-display',
      'uses-long-cache-ttl',
      'layout-shift-elements',
      'lcp-breakdown'
    ];
    const diagnostics: Array<{ title: string; displayValue?: string }> = [];
    for (const id of diagIds) {
      const a = audits[id];
      if (a && a.displayValue) {
        diagnostics.push({
          title: a.title,
          displayValue: a.displayValue
        });
      }
    }

    // CrUX Field Data (if available)
    const fieldExperience = data.loadingExperience?.metrics;
    let fieldData: CwvResult['fieldData'] = undefined;
    if (fieldExperience) {
      fieldData = {
        lcp: fieldExperience.LARGEST_CONTENTFUL_PAINT_MS ? {
          category: fieldExperience.LARGEST_CONTENTFUL_PAINT_MS.category,
          percentile: fieldExperience.LARGEST_CONTENTFUL_PAINT_MS.percentile
        } : undefined,
        cls: fieldExperience.CUMULATIVE_LAYOUT_SHIFT_SCORE ? {
          category: fieldExperience.CUMULATIVE_LAYOUT_SHIFT_SCORE.category,
          percentile: fieldExperience.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile / 100
        } : undefined,
        inp: fieldExperience.INTERACTION_TO_NEXT_PAINT ? {
          category: fieldExperience.INTERACTION_TO_NEXT_PAINT.category,
          percentile: fieldExperience.INTERACTION_TO_NEXT_PAINT.percentile
        } : undefined,
        fcp: fieldExperience.FIRST_CONTENTFUL_PAINT_MS ? {
          category: fieldExperience.FIRST_CONTENTFUL_PAINT_MS.category,
          percentile: fieldExperience.FIRST_CONTENTFUL_PAINT_MS.percentile
        } : undefined
      };
    }

    return {
      url,
      strategy,
      performanceScore: perfScore,
      metrics,
      fieldData,
      opportunities,
      diagnostics
    };
  } catch (err: any) {
    console.error(`  ✖ Failed to scan ${url} (${strategy}):`, err.message);
    return null;
  }
}

function getRatingBadge(metric: 'lcp' | 'cls' | 'tbt' | 'fcp', value: number): string {
  if (metric === 'lcp') {
    if (value <= 2500) return '🟢 GOOD (<= 2.5s)';
    if (value <= 4000) return '🟡 NEEDS IMPROVEMENT (2.5s - 4.0s)';
    return '🔴 POOR (> 4.0s)';
  }
  if (metric === 'cls') {
    if (value <= 0.1) return '🟢 GOOD (<= 0.1)';
    if (value <= 0.25) return '🟡 NEEDS IMPROVEMENT (0.1 - 0.25)';
    return '🔴 POOR (> 0.25)';
  }
  if (metric === 'tbt') {
    if (value <= 200) return '🟢 GOOD (<= 200ms)';
    if (value <= 600) return '🟡 NEEDS IMPROVEMENT (200ms - 600ms)';
    return '🔴 POOR (> 600ms)';
  }
  if (metric === 'fcp') {
    if (value <= 1800) return '🟢 GOOD (<= 1.8s)';
    if (value <= 3000) return '🟡 NEEDS IMPROVEMENT (1.8s - 3.0s)';
    return '🔴 POOR (> 3.0s)';
  }
  return '';
}

async function main() {
  const targetUrls = process.argv.slice(2);
  const urlsToScan = targetUrls.length > 0 
    ? targetUrls 
    : [
        'https://localsurgeseo.com/',
        'https://localsurgeseo.com/seo-tool',
        'https://localsurgeseo.com/pricing',
        'https://localsurgeseo.com/blog'
      ];

  console.log(`\n========================================================================`);
  console.log(`   ⚡ CORE WEB VITALS AUDIT: Total Blocking Time (TBT), CLS & LCP     `);
  console.log(`========================================================================\n`);

  const results: CwvResult[] = [];

  for (const url of urlsToScan) {
    const mobileRes = await auditPage(url, 'mobile');
    if (mobileRes) results.push(mobileRes);

    const desktopRes = await auditPage(url, 'desktop');
    if (desktopRes) results.push(desktopRes);
  }

  // Display results in console
  console.log(`\n========================================================================`);
  console.log(`                     📊 CORE WEB VITALS SUMMARY                        `);
  console.log(`========================================================================\n`);

  for (const r of results) {
    const icon = r.strategy === 'mobile' ? '📱 Mobile' : '💻 Desktop';
    console.log(`────────────────────────────────────────────────────────────────────────`);
    console.log(`URL: \x1b[1m${r.url}\x1b[0m [${icon}] — Overall Score: \x1b[32m${r.performanceScore}/100\x1b[0m`);
    console.log(`────────────────────────────────────────────────────────────────────────`);
    console.log(`  🎯 LCP (Largest Contentful Paint): \x1b[1m${r.metrics.lcp.displayValue}\x1b[0m (${r.metrics.lcp.numericValue}ms) -> ${getRatingBadge('lcp', r.metrics.lcp.numericValue)}`);
    console.log(`  🎯 CLS (Cumulative Layout Shift):  \x1b[1m${r.metrics.cls.displayValue}\x1b[0m (${r.metrics.cls.numericValue})   -> ${getRatingBadge('cls', r.metrics.cls.numericValue)}`);
    console.log(`  🎯 TBT (Total Blocking Time):       \x1b[1m${r.metrics.tbt.displayValue}\x1b[0m (${r.metrics.tbt.numericValue}ms)  -> ${getRatingBadge('tbt', r.metrics.tbt.numericValue)}`);
    console.log(`  ⚡ FCP (First Contentful Paint):   ${r.metrics.fcp.displayValue}`);
    console.log(`  ⚡ Speed Index:                    ${r.metrics.si.displayValue}`);
    console.log(`  ⚡ TTFB (Server Response Time):    ${r.metrics.ttfb.displayValue}`);

    if (r.opportunities.length > 0) {
      console.log(`\n  💡 Top Optimization Opportunities:`);
      for (const opp of r.opportunities.slice(0, 3)) {
        console.log(`     • ${opp.title}: ${opp.displayValue || ''} (~${opp.savings}ms)`);
      }
    }
    console.log();
  }

  // Write JSON artifact
  fs.writeFileSync(path.join(process.cwd(), 'cwv_audit_results.json'), JSON.stringify(results, null, 2), 'utf8');

  // Generate Markdown report
  let md = `# Core Web Vitals & Speed Audit Report (LCP, CLS, TBT)

**Audit Target:** \`https://localsurgeseo.com/\`  
**Generated At:** ${new Date().toUTCString()}  
**Standard Benchmarks:**
- **LCP (Largest Contentful Paint):** Good &le; 2.5s | Needs Improvement 2.5s&ndash;4.0s | Poor &gt; 4.0s
- **CLS (Cumulative Layout Shift):** Good &le; 0.10 | Needs Improvement 0.10&ndash;0.25 | Poor &gt; 0.25
- **TBT (Total Blocking Time):** Good &le; 200ms | Needs Improvement 200ms&ndash;600ms | Poor &gt; 600ms

---

## 1. Executive Performance Matrix

| Page URL | Device | Perf Score | LCP (Target &le; 2.5s) | CLS (Target &le; 0.1) | TBT (Target &le; 200ms) | FCP | TTFB |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
`;

  for (const r of results) {
    const dev = r.strategy === 'mobile' ? '📱 Mobile' : '💻 Desktop';
    const lcpBadge = r.metrics.lcp.numericValue <= 2500 ? `🟢 ${r.metrics.lcp.displayValue}` : r.metrics.lcp.numericValue <= 4000 ? `🟡 ${r.metrics.lcp.displayValue}` : `🔴 ${r.metrics.lcp.displayValue}`;
    const clsBadge = r.metrics.cls.numericValue <= 0.1 ? `🟢 ${r.metrics.cls.displayValue}` : r.metrics.cls.numericValue <= 0.25 ? `🟡 ${r.metrics.cls.displayValue}` : `🔴 ${r.metrics.cls.displayValue}`;
    const tbtBadge = r.metrics.tbt.numericValue <= 200 ? `🟢 ${r.metrics.tbt.displayValue}` : r.metrics.tbt.numericValue <= 600 ? `🟡 ${r.metrics.tbt.displayValue}` : `🔴 ${r.metrics.tbt.displayValue}`;

    md += `| [\`${r.url.replace('https://localsurgeseo.com', '') || '/'}\`](${r.url}) | ${dev} | **${r.performanceScore}/100** | ${lcpBadge} | ${clsBadge} | ${tbtBadge} | ${r.metrics.fcp.displayValue} | ${r.metrics.ttfb.displayValue} |\n`;
  }

  md += `\n---\n\n## 2. Detailed Breakdown by Page\n\n`;

  for (const r of results) {
    const dev = r.strategy === 'mobile' ? 'Mobile 📱' : 'Desktop 💻';
    md += `### ${r.url} (${dev})\n\n`;
    md += `- **Overall Performance Score:** **${r.performanceScore}/100**\n`;
    md += `- **Largest Contentful Paint (LCP):** \`${r.metrics.lcp.displayValue}\` (${r.metrics.lcp.numericValue}ms) — ${getRatingBadge('lcp', r.metrics.lcp.numericValue)}\n`;
    md += `- **Cumulative Layout Shift (CLS):** \`${r.metrics.cls.displayValue}\` (${r.metrics.cls.numericValue}) — ${getRatingBadge('cls', r.metrics.cls.numericValue)}\n`;
    md += `- **Total Blocking Time (TBT):** \`${r.metrics.tbt.displayValue}\` (${r.metrics.tbt.numericValue}ms) — ${getRatingBadge('tbt', r.metrics.tbt.numericValue)}\n`;
    md += `- **First Contentful Paint (FCP):** \`${r.metrics.fcp.displayValue}\`\n`;
    md += `- **Speed Index (SI):** \`${r.metrics.si.displayValue}\`\n`;
    md += `- **Server Response Time (TTFB):** \`${r.metrics.ttfb.displayValue}\`\n\n`;

    if (r.opportunities.length > 0) {
      md += `#### Top Optimization Opportunities:\n`;
      for (const opp of r.opportunities) {
        md += `- **${opp.title}:** ${opp.description} (Potential savings: \`${opp.displayValue || opp.savings + 'ms'}\`)\n`;
      }
      md += `\n`;
    }

    if (r.diagnostics.length > 0) {
      md += `#### Diagnostic Observations:\n`;
      for (const diag of r.diagnostics) {
        md += `- **${diag.title}:** \`${diag.displayValue}\`\n`;
      }
      md += `\n`;
    }

    md += `---\n\n`;
  }

  fs.writeFileSync(path.join(process.cwd(), 'CORE-WEB-VITALS-REPORT.md'), md, 'utf8');

  console.log(`✔ Core Web Vitals audit files saved:`);
  console.log(`  • \x1b[32mcwv_audit_results.json\x1b[0m`);
  console.log(`  • \x1b[32mCORE-WEB-VITALS-REPORT.md\x1b[0m\n`);
}

main().catch((err) => {
  console.error('Fatal CWV audit error:', err);
  process.exit(1);
});
