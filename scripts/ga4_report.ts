import fs from 'fs';
import path from 'path';
import { getGa4Credentials, getGa4AccessToken, discoverGa4Properties, printGa4SetupInstructions } from './ga4_auth';

interface Ga4ReportData {
  propertyId: string;
  propertyName?: string;
  generatedAt: string;
  dateRange: string;
  overview: {
    activeUsers: number;
    newUsers: number;
    sessions: number;
    screenPageViews: number;
    averageSessionDuration: number;
    bounceRate: number;
  };
  channels: Array<{
    channel: string;
    sessions: number;
    activeUsers: number;
    engagementRate: number;
  }>;
  topPages: Array<{
    path: string;
    pageViews: number;
    activeUsers: number;
    avgDuration: number;
  }>;
  devices: Array<{
    category: string;
    sessions: number;
    users: number;
  }>;
  geo: Array<{
    country: string;
    region: string;
    city: string;
    users: number;
  }>;
  realtimeUsers: number;
}

async function runGa4Report() {
  console.log(`\n========================================================================`);
  console.log(`       📊 GOOGLE ANALYTICS 4 (GA4) — Traffic & Engagement Report       `);
  console.log(`========================================================================\n`);

  const creds = getGa4Credentials();
  if (!creds) {
    console.error(`\x1b[31m✖ Error:\x1b[0m Google credentials not found.`);
    printGa4SetupInstructions();
    process.exit(1);
  }

  let accessToken: string;
  try {
    console.log(`✔ Authenticating with Service Account (${creds.client_email})...`);
    accessToken = await getGa4AccessToken(creds);
  } catch (err: any) {
    console.error(`\x1b[31m✖ Authentication Error:\x1b[0m`, err.message);
    process.exit(1);
  }

  // Determine Property ID
  let propertyId = creds.property_id;
  let propertyName = 'Local Surge SEO';

  if (!propertyId) {
    console.log(`🔍 Auto-discovering GA4 properties accessible to this Service Account...`);
    const properties = await discoverGa4Properties(accessToken);
    if (properties.length > 0) {
      propertyId = properties[0].propertyId;
      propertyName = properties[0].displayName;
      console.log(`✔ Auto-detected GA4 Property: \x1b[32m${propertyName}\x1b[0m (ID: \x1b[36m${propertyId}\x1b[0m)`);
    } else {
      console.warn(`\x1b[33m⚠ Notice:\x1b[0m No GA4 properties found for this service account.`);
      console.log(`To link your GA4 property, grant Viewer access to your service account email:`);
      console.log(`\x1b[32m${creds.client_email}\x1b[0m`);
      printGa4SetupInstructions(creds.client_email);
      process.exit(0);
    }
  }

  console.log(`Fetching 28-day analytics report for GA4 Property: \x1b[36m${propertyId}\x1b[0m...\n`);

  // 1. Overview Report
  const overviewRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      dateRanges: [{ startDate: '28daysAgo', endDate: 'yesterday' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'newUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' }
      ]
    })
  });

  if (!overviewRes.ok) {
    const errorBody = await overviewRes.text();
    console.error(`\x1b[31m✖ GA4 API Error (${overviewRes.status}):\x1b[0m`, errorBody);
    if (overviewRes.status === 403 || overviewRes.status === 404) {
      console.log(`\n\x1b[33mTip:\x1b[0m Make sure \x1b[32m${creds.client_email}\x1b[0m has Viewer permission in GA4 > Admin > Property Access Management.`);
    }
    process.exit(1);
  }

  const overviewData = await overviewRes.json();
  const overviewRow = overviewData.rows?.[0]?.metricValues || [];
  const overview = {
    activeUsers: parseInt(overviewRow[0]?.value || '0', 10),
    newUsers: parseInt(overviewRow[1]?.value || '0', 10),
    sessions: parseInt(overviewRow[2]?.value || '0', 10),
    screenPageViews: parseInt(overviewRow[3]?.value || '0', 10),
    averageSessionDuration: parseFloat(overviewRow[4]?.value || '0'),
    bounceRate: parseFloat(overviewRow[5]?.value || '0') * 100
  };

  // 2. Channel Traffic Acquisition
  const channelRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      dateRanges: [{ startDate: '28daysAgo', endDate: 'yesterday' }],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [
        { name: 'sessions' },
        { name: 'activeUsers' },
        { name: 'engagementRate' }
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10
    })
  });
  const channelData = await channelRes.json();
  const channels = (channelData.rows || []).map((row: any) => ({
    channel: row.dimensionValues[0].value,
    sessions: parseInt(row.metricValues[0].value, 10),
    activeUsers: parseInt(row.metricValues[1].value, 10),
    engagementRate: parseFloat(row.metricValues[2].value) * 100
  }));

  // 3. Top Landing / Visited Pages
  const pagesRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      dateRanges: [{ startDate: '28daysAgo', endDate: 'yesterday' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'activeUsers' },
        { name: 'averageSessionDuration' }
      ],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 15
    })
  });
  const pagesData = await pagesRes.json();
  const topPages = (pagesData.rows || []).map((row: any) => ({
    path: row.dimensionValues[0].value,
    pageViews: parseInt(row.metricValues[0].value, 10),
    activeUsers: parseInt(row.metricValues[1].value, 10),
    avgDuration: parseFloat(row.metricValues[2].value)
  }));

  // 4. Device Categories
  const deviceRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      dateRanges: [{ startDate: '28daysAgo', endDate: 'yesterday' }],
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [
        { name: 'sessions' },
        { name: 'activeUsers' }
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
    })
  });
  const deviceData = await deviceRes.json();
  const devices = (deviceData.rows || []).map((row: any) => ({
    category: row.dimensionValues[0].value,
    sessions: parseInt(row.metricValues[0].value, 10),
    users: parseInt(row.metricValues[1].value, 10)
  }));

  // 5. Geographic Locations
  const geoRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      dateRanges: [{ startDate: '28daysAgo', endDate: 'yesterday' }],
      dimensions: [
        { name: 'country' },
        { name: 'region' },
        { name: 'city' }
      ],
      metrics: [{ name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: 10
    })
  });
  const geoData = await geoRes.json();
  const geo = (geoData.rows || []).map((row: any) => ({
    country: row.dimensionValues[0].value,
    region: row.dimensionValues[1].value,
    city: row.dimensionValues[2].value,
    users: parseInt(row.metricValues[0].value, 10)
  }));

  // 6. Realtime Active Users (last 30 minutes)
  let realtimeUsers = 0;
  try {
    const rtRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        metrics: [{ name: 'activeUsers' }]
      })
    });
    if (rtRes.ok) {
      const rtData = await rtRes.json();
      realtimeUsers = parseInt(rtData.rows?.[0]?.metricValues?.[0]?.value || '0', 10);
    }
  } catch {}

  // Console Presentation
  console.log(`┌────────────────────────────────────────────────────────────────────────┐`);
  console.log(`│ 📈 GA4 28-DAY PERFORMANCE OVERVIEW                                    │`);
  console.log(`├────────────────────────────────────────────────────────────────────────┤`);
  console.log(`│ Total Active Users:     ${String(overview.activeUsers).padEnd(46)}│`);
  console.log(`│ New Users:              ${String(overview.newUsers).padEnd(46)}│`);
  console.log(`│ Sessions:               ${String(overview.sessions).padEnd(46)}│`);
  console.log(`│ Page Views:             ${String(overview.screenPageViews).padEnd(46)}│`);
  console.log(`│ Avg Session Duration:   ${(Math.round(overview.averageSessionDuration) + ' sec').padEnd(46)}│`);
  console.log(`│ Bounce Rate:            ${(overview.bounceRate.toFixed(1) + '%').padEnd(46)}│`);
  console.log(`│ Realtime Users (Now):   \x1b[32m${String(realtimeUsers).padEnd(46)}\x1b[0m│`);
  console.log(`└────────────────────────────────────────────────────────────────────────┘\n`);

  console.log(`📌 Top Traffic Acquisition Channels:`);
  if (channels.length === 0) {
    console.log(`   (No channel data recorded yet for the selected period)`);
  } else {
    console.log(`   ${'Channel'.padEnd(25)} ${'Sessions'.padEnd(12)} ${'Users'.padEnd(10)} ${'Engagement Rate'}`);
    console.log(`   ${'─'.repeat(25)} ${'─'.repeat(12)} ${'─'.repeat(10)} ${'─'.repeat(15)}`);
    for (const ch of channels) {
      console.log(`   ${ch.channel.padEnd(25)} ${String(ch.sessions).padEnd(12)} ${String(ch.activeUsers).padEnd(10)} ${ch.engagementRate.toFixed(1)}%`);
    }
  }

  console.log(`\n📌 Top Pages by Views:`);
  if (topPages.length === 0) {
    console.log(`   (No page view data recorded yet)`);
  } else {
    for (const p of topPages) {
      console.log(`   • \x1b[36m${p.path}\x1b[0m — ${p.pageViews} views (${p.activeUsers} users, avg ${Math.round(p.avgDuration)}s)`);
    }
  }

  // Build Output Files
  const reportPayload: Ga4ReportData = {
    propertyId,
    propertyName,
    generatedAt: new Date().toISOString(),
    dateRange: 'Last 28 days',
    overview,
    channels,
    topPages,
    devices,
    geo,
    realtimeUsers
  };

  fs.writeFileSync(path.join(process.cwd(), 'ga4_report.json'), JSON.stringify(reportPayload, null, 2), 'utf8');

  // Build Markdown Document
  const mdContent = `# Google Analytics 4 (GA4) — Traffic & Engagement Audit

**Property:** ${propertyName} (\`${propertyId}\`)  
**Measurement ID:** \`${creds.measurement_id}\`  
**Generated At:** ${new Date().toUTCString()}  
**Time Range:** Last 28 Days (Rolling)

---

## 1. Executive Performance Summary

| Metric | Last 28 Days | Note |
| :--- | :--- | :--- |
| **Active Users** | **${overview.activeUsers.toLocaleString()}** | Total unique visitors |
| **New Users** | **${overview.newUsers.toLocaleString()}** | First-time acquisitions |
| **Sessions** | **${overview.sessions.toLocaleString()}** | Individual visit sessions |
| **Page Views** | **${overview.screenPageViews.toLocaleString()}** | Total page views rendered |
| **Avg Session Duration** | **${Math.round(overview.averageSessionDuration)} sec** | Visitor engagement depth |
| **Bounce Rate** | **${overview.bounceRate.toFixed(1)}%** | Single-page non-engaged exits |
| **Real-Time Active (Now)** | **${realtimeUsers}** | Active visitors in last 30 mins |

---

## 2. Traffic Acquisition Channels

| Default Channel Group | Sessions | Active Users | Engagement Rate |
| :--- | :--- | :--- | :--- |
${channels.map(c => `| **${c.channel}** | ${c.sessions.toLocaleString()} | ${c.activeUsers.toLocaleString()} | ${c.engagementRate.toFixed(1)}% |`).join('\n')}

---

## 3. Top Visited Pages & Content Engagement

| Page Path | Page Views | Unique Users | Avg Duration |
| :--- | :--- | :--- | :--- |
${topPages.map(p => `| [\`${p.path}\`](https://localsurgeseo.com${p.path}) | ${p.pageViews.toLocaleString()} | ${p.activeUsers.toLocaleString()} | ${Math.round(p.avgDuration)}s |`).join('\n')}

---

## 4. Device Breakdown

| Device Category | Sessions | Users | Share |
| :--- | :--- | :--- | :--- |
${devices.map(d => {
  const pct = overview.sessions > 0 ? ((d.sessions / overview.sessions) * 100).toFixed(1) : '0';
  return `| **${d.category}** | ${d.sessions.toLocaleString()} | ${d.users.toLocaleString()} | ${pct}% |`;
}).join('\n')}

---

## 5. Top Geographic Locations

| Country | Region / State | City | Users |
| :--- | :--- | :--- | :--- |
${geo.map(g => `| ${g.country} | ${g.region} | ${g.city} | ${g.users.toLocaleString()} |`).join('\n')}

---

*Report automatically generated via Local Surge SEO GA4 Analytics Engine.*
`;

  fs.writeFileSync(path.join(process.cwd(), 'GA4-ANALYTICS-REPORT.md'), mdContent, 'utf8');

  console.log(`\n✔ Full GA4 reports generated successfully:`);
  console.log(`  • \x1b[32mga4_report.json\x1b[0m`);
  console.log(`  • \x1b[32mGA4-ANALYTICS-REPORT.md\x1b[0m\n`);
}

runGa4Report().catch((err) => {
  console.error('Unhandled GA4 error:', err);
  process.exit(1);
});
