import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

export interface GscCredentials {
  client_email: string;
  private_key: string;
  property_url: string;
}

/**
 * Resolves GSC credentials from environment variables or local files.
 */
export function getGscCredentials(): GscCredentials | null {
  const propertyUrl = process.env.GSC_PROPERTY_URL || process.env.GSC_PROPERTY || 'sc-domain:localsurgeseo.com';

  // 1. Check direct environment variables
  if (process.env.GSC_CLIENT_EMAIL && process.env.GSC_PRIVATE_KEY) {
    return {
      client_email: process.env.GSC_CLIENT_EMAIL,
      private_key: process.env.GSC_PRIVATE_KEY.replace(/\\n/g, '\n'),
      property_url: propertyUrl
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
          property_url: propertyUrl
        };
      }
    } catch (e) {
      console.warn(`[GSC Auth] Failed to read file from GOOGLE_APPLICATION_CREDENTIALS:`, e);
    }
  }

  // 3. Check local service_account.json in .agents, root or ~/.config/claude-seo/
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
              property_url: parsed.default_property || propertyUrl
            };
          }
        }
        if (parsed.client_email && parsed.private_key) {
          return {
            client_email: parsed.client_email,
            private_key: parsed.private_key,
            property_url: parsed.property_url || propertyUrl
          };
        }
      } catch {}
    }
  }

  return null;
}

/**
 * Generates an OAuth2 Bearer Access Token using a Google Cloud Service Account JWT assertion.
 */
export async function getGscAccessToken(creds: GscCredentials): Promise<string> {
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const claimSet = {
    iss: creds.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly https://www.googleapis.com/auth/webmasters https://www.googleapis.com/auth/indexing',
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
 * Prints helpful instructions when credentials are not configured.
 */
export function printGscSetupInstructions() {
  console.log(`
\x1b[33m┌────────────────────────────────────────────────────────────────────────┐\x1b[0m
\x1b[33m│ 🔑 Google Search Console API Setup Instructions                       │\x1b[0m
\x1b[33m└────────────────────────────────────────────────────────────────────────┘\x1b[0m

To connect directly with the Google Search Console API:

1. \x1b[1mCreate a Google Cloud Service Account:\x1b[0m
   - Go to: https://console.cloud.google.com/
   - Enable the \x1b[36mGoogle Search Console API\x1b[0m.
   - Go to IAM & Admin > Service Accounts > Create Service Account.
   - Under "Keys", click "Add Key" > "Create new key" (JSON).

2. \x1b[1mGrant Permission in Search Console:\x1b[0m
   - Go to: https://search.google.com/search-console
   - Select your property (e.g., \x1b[32msc-domain:localsurgeseo.com\x1b[0m)
   - Go to Settings > Users and permissions > Add User
   - Paste your service account email (\x1b[36m...@...gserviceaccount.com\x1b[0m) with \x1b[1mFull\x1b[0m permission.

3. \x1b[1mProvide Credentials (choose ONE option):\x1b[0m
   \x1b[32m• Option A:\x1b[0m Place the downloaded JSON file as \x1b[1mservice_account.json\x1b[0m in the project root.
   \x1b[32m• Option B:\x1b[0m Set in \x1b[1m.env\x1b[0m:
     \x1b[90mGSC_PROPERTY_URL="sc-domain:localsurgeseo.com"\x1b[0m
     \x1b[90mGSC_CLIENT_EMAIL="your-service-account@project.iam.gserviceaccount.com"\x1b[0m
     \x1b[90mGSC_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"\x1b[0m
`);
}
