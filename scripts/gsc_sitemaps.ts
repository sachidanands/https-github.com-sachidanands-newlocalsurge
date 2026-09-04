import fs from 'fs';
import path from 'path';
import { getGscCredentials, getGscAccessToken, printGscSetupInstructions } from './gsc_auth';

async function listSitemaps(accessToken: string, propertyUrl: string) {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(propertyUrl)}/sitemaps`;
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  if (!res.ok) {
    throw new Error(`Sitemaps API Error (${res.status}): ${await res.text()}`);
  }
  return await res.json();
}

async function submitSitemap(accessToken: string, propertyUrl: string, sitemapPath: string) {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(propertyUrl)}/sitemaps/${encodeURIComponent(sitemapPath)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  if (!res.ok) {
    throw new Error(`Submit Sitemap API Error (${res.status}): ${await res.text()}`);
  }
  return true;
}

async function run() {
  const args = process.argv.slice(2);
  const action = args[0] || 'list';
  const targetSitemap = args[1] || 'https://localsurgeseo.com/sitemap.xml';

  console.log(`\x1b[1;36m========================================================================\x1b[0m`);
  console.log(`\x1b[1;36m       🗺️  GOOGLE SEARCH CONSOLE — Sitemaps Status & Submitter          \x1b[0m`);
  console.log(`\x1b[1;36m========================================================================\x1b[0m\n`);

  const creds = getGscCredentials();
  if (!creds) {
    printGscSetupInstructions();
    console.log(`\x1b[33mSample Local Sitemap Status:\x1b[0m`);
    console.log(`• Sitemap URL:     \x1b[1mhttps://localsurgeseo.com/sitemap.xml\x1b[0m`);
    console.log(`• Last Submitted:  ${new Date().toISOString()}`);
    console.log(`• Discovered URLs: \x1b[32m52 pages\x1b[0m (Location landing pages, Blog posts, SEO tool)`);
    console.log(`• Format:          XML (Valid sitemap standard)`);
    console.log(`• Status:          \x1b[32mSUCCESS (No errors detected)\x1b[0m\n`);
    return;
  }

  try {
    const token = await getGscAccessToken(creds);
    if (action === 'submit') {
      console.log(`\x1b[34mSubmitting sitemap '${targetSitemap}' to ${creds.property_url}...\x1b[0m`);
      await submitSitemap(token, creds.property_url, targetSitemap);
      console.log(`\x1b[32m✔ Sitemap successfully submitted to Google Search Console!\x1b[0m\n`);
    } else {
      console.log(`\x1b[34mFetching sitemaps for property: ${creds.property_url}...\x1b[0m`);
      const data = await listSitemaps(token, creds.property_url);
      console.log(`\x1b[32m✔ Submitted Sitemaps:\x1b[0m\n`, JSON.stringify(data, null, 2));
    }
  } catch (err: any) {
    console.error(`\x1b[31m✖ Error with Sitemaps API:\x1b[0m`, err.message);
  }
}

run().catch(console.error);
