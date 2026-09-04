import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

export interface Ga4Credentials {
  client_email: string;
  private_key: string;
  property_id?: string;
  measurement_id?: string;
}

/**
 * Resolves GA4 credentials from environment variables or local files.
 */
export function getGa4Credentials(): Ga4Credentials | null {
  const propertyId = process.env.GA4_PROPERTY_ID || process.env.GA_PROPERTY_ID;
  const measurementId = process.env.GA4_MEASUREMENT_ID || process.env.GA_MEASUREMENT_ID || 'G-FDD0ZMHBQ7';

  // 1. Check direct environment variables
  if (process.env.GA_CLIENT_EMAIL && process.env.GA_PRIVATE_KEY) {
    return {
      client_email: process.env.GA_CLIENT_EMAIL,
      private_key: process.env.GA_PRIVATE_KEY.replace(/\\n/g, '\n'),
      property_id: propertyId,
      measurement_id: measurementId
    };
  }

  // 2. Check GOOGLE_APPLICATION_CREDENTIALS path
  const gAuthPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (gAuthPath && fs.existsSync(gAuthPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(gAuthPath, 'utf8'));
      if (data.client_email && data.private_key) {
        return {
          client_email: data.client_email,
          private_key: data.private_key,
          property_id: propertyId,
          measurement_id: measurementId
        };
      }
    } catch (e) {
      console.warn(`[GA4 Auth] Failed to read file from GOOGLE_APPLICATION_CREDENTIALS:`, e);
    }
  }

  // 3. Check local service_account.json in .agents, root or config
  const candidatePaths = [
    path.join(process.cwd(), '.agents', 'service_account.json'),
    path.join(process.cwd(), 'service_account.json'),
    path.join(process.cwd(), 'gsc_credentials.json'),
    path.join(process.env.HOME || '', '.config', 'claude-seo', 'service_account.json'),
    path.join(process.env.HOME || '', '.config', 'claude-seo', 'google-api.json')
  ];

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      try {
        const raw = fs.readFileSync(candidate, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed.service_account_path && fs.existsSync(parsed.service_account_path)) {
          const sa = JSON.parse(fs.readFileSync(parsed.service_account_path, 'utf8'));
          if (sa.client_email && sa.private_key) {
            return {
              client_email: sa.client_email,
              private_key: sa.private_key,
              property_id: parsed.ga4_property_id || propertyId,
              measurement_id: parsed.ga4_measurement_id || measurementId
            };
          }
        }
        if (parsed.client_email && parsed.private_key) {
          return {
            client_email: parsed.client_email,
            private_key: parsed.private_key,
            property_id: parsed.ga4_property_id || propertyId,
            measurement_id: parsed.ga4_measurement_id || measurementId
          };
        }
      } catch {}
    }
  }

  return null;
}

/**
 * Generates an OAuth2 Bearer Access Token with analytics scopes.
 */
export async function getGa4AccessToken(creds: Ga4Credentials): Promise<string> {
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const claimSet = {
    iss: creds.client_email,
    scope: 'https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/analytics',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const b64Url = (obj: any) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  const unsignedToken = `${b64Url(header)}.${b64Url(claimSet)}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedToken);
  const signature = signer
    .sign(creds.private_key, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const jwt = `${unsignedToken}.${signature}`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google OAuth2 Token Request Failed (${response.status}): ${errorText}`);
  }

  const tokenData = await response.json();
  return tokenData.access_token;
}

/**
 * Auto-discovers accessible GA4 Properties via Google Analytics Admin API
 */
export async function discoverGa4Properties(accessToken: string): Promise<Array<{ propertyId: string; displayName: string }>> {
  try {
    const res = await fetch('https://analyticsadmin.googleapis.com/v1beta/accountSummaries', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    const properties: Array<{ propertyId: string; displayName: string }> = [];

    if (data.accountSummaries) {
      for (const acc of data.accountSummaries) {
        if (acc.propertySummaries) {
          for (const prop of acc.propertySummaries) {
            // prop.property is in format "properties/123456789"
            const id = prop.property.replace('properties/', '');
            properties.push({
              propertyId: id,
              displayName: prop.displayName || id
            });
          }
        }
      }
    }

    return properties;
  } catch {
    return [];
  }
}

/**
 * Prints helpful instructions when GA4 credentials or property access need setup.
 */
export function printGa4SetupInstructions(serviceAccountEmail?: string) {
  const email = serviceAccountEmail || 'ais-gemini-key-a0d1f274a1304d3@924153174991.iam.gserviceaccount.com';
  console.log(`
\x1b[33m┌────────────────────────────────────────────────────────────────────────┐\x1b[0m
\x1b[33m│ 📊 Google Analytics 4 (GA4) API Setup Instructions                     │\x1b[0m
\x1b[33m└────────────────────────────────────────────────────────────────────────┘\x1b[0m

To pull live analytics reports directly from GA4:

1. \x1b[1mGrant Permission in Google Analytics:\x1b[0m
   - Go to: \x1b[36mhttps://analytics.google.com/\x1b[0m
   - Click the gear icon (\x1b[1mAdmin\x1b[0m) at bottom left.
   - Under \x1b[1mProperty\x1b[0m, click \x1b[1mProperty Access Management\x1b[0m.
   - Click the blue \x1b[1m+\x1b[0m button > \x1b[1mAdd users\x1b[0m.
   - Enter your service account email:
     \x1b[32m${email}\x1b[0m
   - Select the \x1b[1mViewer\x1b[0m role and click \x1b[1mAdd\x1b[0m.

2. \x1b[1mFind your GA4 Property ID:\x1b[0m
   - In Google Analytics Admin > Property > \x1b[1mProperty Details\x1b[0m.
   - Copy the numeric \x1b[1mProperty ID\x1b[0m (e.g. \x1b[36m472819230\x1b[0m).

3. \x1b[1mAdd to .env:\x1b[0m
   \x1b[90mGA4_PROPERTY_ID="your_numeric_property_id"\x1b[0m
`);
}
