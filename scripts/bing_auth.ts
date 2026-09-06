import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export interface BingCredentials {
  apiKey: string;
  siteUrl: string;
}

export interface BingSite {
  Url: string;
  Role?: string;
  AuthenticationCode?: string;
  IsVerified?: boolean;
}

/**
 * Resolves Bing Webmaster Tools credentials from environment variables.
 */
export function getBingCredentials(): BingCredentials | null {
  const apiKey = process.env.BING_API_KEY || process.env.BING_WEBMASTER_API_KEY || '';
  const siteUrl = process.env.BING_SITE_URL || process.env.GSC_PROPERTY_URL || 'https://localsurgeseo.com/';

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_bing_webmaster_api_key')) {
    return null;
  }

  // Ensure siteUrl has standard format (trailing slash if domain only)
  let normalizedUrl = siteUrl.trim();
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = `https://${normalizedUrl}`;
  }
  if (!normalizedUrl.endsWith('/') && !normalizedUrl.includes('?')) {
    normalizedUrl = `${normalizedUrl}/`;
  }

  return {
    apiKey: apiKey.trim(),
    siteUrl: normalizedUrl
  };
}

/**
 * Validates connection with Bing Webmaster Tools API and retrieves verified sites.
 */
export async function testBingConnection(apiKey: string): Promise<{ success: boolean; sites: BingSite[]; error?: string }> {
  try {
    const url = `https://ssl.bing.com/webmaster/api.svc/json/GetUserSites?apikey=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        success: false,
        sites: [],
        error: `HTTP ${res.status}: ${errText}`
      };
    }

    const data = await res.json();
    const rawSites = data.d || data || [];
    const sites: BingSite[] = Array.isArray(rawSites) ? rawSites : [];

    return {
      success: true,
      sites
    };
  } catch (err: any) {
    return {
      success: false,
      sites: [],
      error: err.message
    };
  }
}

/**
 * Prints helpful instructions when Bing API Key is not configured.
 */
export function printBingSetupInstructions() {
  console.log(`
\x1b[33m┌────────────────────────────────────────────────────────────────────────┐\x1b[0m
\x1b[33m│ 🔑 Bing Webmaster Tools API Setup Instructions                         │\x1b[0m
\x1b[33m└────────────────────────────────────────────────────────────────────────┘\x1b[0m

To connect directly with the Bing Webmaster Tools & IndexNow API:

1. \x1b[1mGenerate Your Bing API Key:\x1b[0m
   - Log into \x1b[36mhttps://www.bing.com/webmasters\x1b[0m
   - Click the \x1b[1mSettings (Gear icon)\x1b[0m at top right
   - Select \x1b[36mAPI Access > API Key\x1b[0m
   - Click \x1b[1mGenerate API Key\x1b[0m and copy it.

2. \x1b[1mAdd Key to your \x1b[32m.env\x1b[0m file:\x1b[0m
   \x1b[90m# BING WEBMASTER TOOLS INTEGRATION\x1b[0m
   \x1b[32mBING_API_KEY\x1b[0m="your_copied_api_key_here"
   \x1b[32mBING_SITE_URL\x1b[0m="https://localsurgeseo.com/"

3. \x1b[1mVerify Site in Bing Webmaster Tools:\x1b[0m
   - If not yet added, click \x1b[1mAdd a Site\x1b[0m in Bing Webmaster Tools.
   - Quickest method: Click \x1b[32m"Import from Google Search Console"\x1b[0m (instant 1-click verification).
   - Or add the Bing verification meta tag / DNS record.

4. \x1b[1mRun Available Commands:\x1b[0m
   \x1b[36mnpm run bing:report\x1b[0m   - Pull Bing search analytics, rankings & generate audit report
   \x1b[36mnpm run bing:submit\x1b[0m   - Instant push URLs to Bing & IndexNow crawl index
   \x1b[36mnpm run bing:sitemaps\x1b[0m - Inspect or submit XML sitemaps to Bing
`);
}
