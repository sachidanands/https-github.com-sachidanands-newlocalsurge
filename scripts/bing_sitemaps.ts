import fs from 'fs';
import path from 'path';
import { getBingCredentials, printBingSetupInstructions } from './bing_auth';

async function listFeeds(apiKey: string, siteUrl: string) {
  const url = `https://ssl.bing.com/webmaster/api.json/GetFeeds?apikey=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ siteUrl })
  });

  if (!res.ok) {
    throw new Error(`GetFeeds API Error (${res.status}): ${await res.text()}`);
  }

  const data = await res.json();
  return data.d !== undefined ? data.d : data;
}

async function submitFeed(apiKey: string, siteUrl: string, feedUrl: string) {
  const url = `https://ssl.bing.com/webmaster/api.json/SubmitFeed?apikey=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ siteUrl, feedUrl })
  });

  if (!res.ok) {
    throw new Error(`SubmitFeed API Error (${res.status}): ${await res.text()}`);
  }

  return true;
}

async function run() {
  const args = process.argv.slice(2);
  const action = args[0] || 'list';
  const targetFeed = args[1] || 'https://localsurgeseo.com/sitemap_index.xml';

  console.log(`\x1b[1;36m========================================================================\x1b[0m`);
  console.log(`\x1b[1;36m       🗺️  BING WEBMASTER TOOLS — Sitemaps & Feeds Submitter           \x1b[0m`);
  console.log(`\x1b[1;36m========================================================================\x1b[0m\n`);

  const creds = getBingCredentials();
  if (!creds) {
    printBingSetupInstructions();
    console.log(`\x1b[33mSample Local Sitemap Status:\x1b[0m`);
    console.log(`• Master Index:    \x1b[1mhttps://localsurgeseo.com/sitemap_index.xml\x1b[0m`);
    console.log(`• Status:          Ready for Bing Submission`);
    console.log(`• Sub-Sitemaps:    sitemap_pages.xml, sitemap_locations.xml, sitemap_blogs.xml`);
    console.log(`• Total URLs:      52+ crawled routes\n`);
    return;
  }

  try {
    if (action === 'submit') {
      console.log(`\x1b[34mSubmitting sitemap '${targetFeed}' to Bing for site: ${creds.siteUrl}...\x1b[0m`);
      await submitFeed(creds.apiKey, creds.siteUrl, targetFeed);
      console.log(`\x1b[32m✔ Sitemap successfully submitted to Bing Webmaster Tools!\x1b[0m\n`);
    } else {
      console.log(`\x1b[34mFetching registered feeds & sitemaps for site: ${creds.siteUrl}...\x1b[0m`);
      const feeds = await listFeeds(creds.apiKey, creds.siteUrl);
      if (Array.isArray(feeds) && feeds.length > 0) {
        console.log(`\x1b[32m✔ Registered Sitemaps in Bing:\x1b[0m\n`);
        feeds.forEach((f: any) => {
          console.log(`  • \x1b[1m${f.Url || f.feedUrl}\x1b[0m`);
          console.log(`    Status: \x1b[32m${f.Status || 'Active'}\x1b[0m | URLs: \x1b[36m${f.UrlCount || f.CompressedUrlCount || 'N/A'}\x1b[0m | Last Crawled: ${f.LastCrawled || 'Recent'}\n`);
        });
      } else {
        console.log(`\x1b[33mℹ️ No sitemaps found yet in Bing Webmaster Tools.\x1b[0m`);
        console.log(`Submitting master sitemap '${targetFeed}' automatically...`);
        await submitFeed(creds.apiKey, creds.siteUrl, targetFeed);
        console.log(`\x1b[32m✔ Master sitemap submitted to Bing!\x1b[0m\n`);
      }
    }
  } catch (err: any) {
    console.error(`\x1b[31m✖ Error with Bing Sitemaps API:\x1b[0m`, err.message);
  }
}

run().catch(console.error);
