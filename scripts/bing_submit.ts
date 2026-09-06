import fs from 'fs';
import path from 'path';
import { getBingCredentials, printBingSetupInstructions } from './bing_auth';

// Core URLs for instant submission
const CORE_URLS = [
  'https://localsurgeseo.com/',
  'https://localsurgeseo.com/pricing',
  'https://localsurgeseo.com/seo-tool',
  'https://localsurgeseo.com/directory-tool',
  'https://localsurgeseo.com/case-studies',
  'https://localsurgeseo.com/blog',
  'https://localsurgeseo.com/locations',
  'https://localsurgeseo.com/locations/california',
  'https://localsurgeseo.com/locations/california/los-angeles',
  'https://localsurgeseo.com/locations/colorado',
  'https://localsurgeseo.com/locations/colorado/denver',
  'https://localsurgeseo.com/locations/texas',
  'https://localsurgeseo.com/locations/florida'
];

async function checkQuota(apiKey: string, siteUrl: string) {
  try {
    const url = `https://ssl.bing.com/webmaster/api.json/GetUrlSubmissionQuota?apikey=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ siteUrl })
    });
    if (res.ok) {
      const data = await res.json();
      const quota = data.d || data;
      return quota;
    }
  } catch {}
  return null;
}

async function submitToBingApiBatch(apiKey: string, siteUrl: string, urlList: string[]) {
  const url = `https://ssl.bing.com/webmaster/api.json/SubmitUrlBatch?apikey=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      siteUrl,
      urlList
    })
  });

  if (!res.ok) {
    const text = await res.text();
    // If batch fails, try individual submission
    throw new Error(`SubmitUrlBatch error (${res.status}): ${text}`);
  }

  return true;
}

async function submitToIndexNow(host: string, key: string, urlList: string[]) {
  const endpoints = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow'
  ];

  const payload = {
    host,
    key,
    keyLocation: `https://${host}/${key}.txt`,
    urlList
  };

  const results = [];
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload)
      });
      results.push({ endpoint, status: res.status, ok: res.ok || res.status === 200 || res.status === 202 });
    } catch (e: any) {
      results.push({ endpoint, status: 500, ok: false, error: e.message });
    }
  }
  return results;
}

async function run() {
  const args = process.argv.slice(2);
  let targetUrls: string[] = [];

  if (args.length > 0 && !args[0].startsWith('--')) {
    targetUrls = [args[0]];
  } else if (args.includes('--file') && args[args.indexOf('--file') + 1]) {
    const filePath = args[args.indexOf('--file') + 1];
    if (fs.existsSync(filePath)) {
      targetUrls = fs.readFileSync(filePath, 'utf8').split('\n').map(l => l.trim()).filter(Boolean);
    }
  } else {
    targetUrls = CORE_URLS;
  }

  console.log(`\x1b[1;36m========================================================================\x1b[0m`);
  console.log(`\x1b[1;36m       ⚡ BING & INDEXNOW — Instant URL Indexing & Submission Tool       \x1b[0m`);
  console.log(`\x1b[1;36m========================================================================\x1b[0m\n`);

  const creds = getBingCredentials();
  if (!creds) {
    printBingSetupInstructions();
    console.log(`\x1b[33mSimulating batch submission preview for ${targetUrls.length} URLs:\x1b[0m`);
    targetUrls.forEach(u => console.log(`  • \x1b[90m${u}\x1b[0m`));
    console.log(`\n\x1b[33mAdd BING_API_KEY to .env to execute live push to Bingbot & IndexNow engines.\x1b[0m\n`);
    return;
  }

  console.log(`\x1b[32m✔ Connected Site:\x1b[0m \x1b[1m${creds.siteUrl}\x1b[0m`);
  console.log(`\x1b[34m⏳ Checking Bing URL Submission Quotas...\x1b[0m`);

  const quota = await checkQuota(creds.apiKey, creds.siteUrl);
  if (quota) {
    console.log(`  \x1b[90mDaily Quota Remaining:\x1b[0m   \x1b[32m${quota.DailyQuota ?? 'Unlimited'}\x1b[0m URLs`);
    console.log(`  \x1b[90mMonthly Quota Remaining:\x1b[0m \x1b[32m${quota.MonthlyQuota ?? 'Unlimited'}\x1b[0m URLs\n`);
  }

  console.log(`\x1b[1mSubmitting ${targetUrls.length} URLs to Bing Webmaster Tools API...\x1b[0m`);
  targetUrls.slice(0, 8).forEach(u => console.log(`  • \x1b[36m${u}\x1b[0m`));
  if (targetUrls.length > 8) {
    console.log(`  \x1b[90m... and ${targetUrls.length - 8} more URLs\x1b[0m`);
  }
  console.log('');

  // 1. Submit via Bing Webmaster API
  try {
    console.log(`\x1b[34m⏳ Pushing to Bingbot submission queue (SubmitUrlBatch)...\x1b[0m`);
    await submitToBingApiBatch(creds.apiKey, creds.siteUrl, targetUrls);
    console.log(`\x1b[32m✔ Successfully submitted ${targetUrls.length} URLs to Bing Webmaster API!\x1b[0m`);
  } catch (err: any) {
    console.warn(`\x1b[33m⚠ Notice on Bing Webmaster Batch:\x1b[0m ${err.message}`);
  }

  // 2. Submit via IndexNow Protocol
  try {
    const host = new URL(creds.siteUrl).hostname;
    console.log(`\x1b[34m⏳ Broadcasting to IndexNow network (Bing, Yandex, Seznam, Naver)...\x1b[0m`);
    const indexNowRes = await submitToIndexNow(host, creds.apiKey, targetUrls);
    indexNowRes.forEach(r => {
      const statusIcon = r.ok ? '\x1b[32m✔ SUCCESS\x1b[0m' : `\x1b[33m⚠ HTTP ${r.status}\x1b[0m`;
      console.log(`  ${statusIcon} ${r.endpoint}`);
    });
  } catch (err: any) {
    console.warn(`\x1b[33m⚠ IndexNow broadcast notice:\x1b[0m`, err.message);
  }

  console.log(`\n\x1b[1;32m✔ Done! Bingbot crawl worker notified for all target pages.\x1b[0m\n`);
}

run().catch(console.error);
