import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config();

function printBanner() {
  console.log('\x1b[36m╔═══════════════════════════════════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[36m║\x1b[0m  \x1b[1m\x1b[31m🔐  YouTube Shorts API & OAuth Setup Helper\x1b[0m                     \x1b[36m║\x1b[0m');
  console.log('\x1b[36m╚═══════════════════════════════════════════════════════════════════╝\x1b[0m\n');
}

async function checkYouTubeAuth() {
  console.log('\x1b[1m\x1b[31m[*] Checking YouTube Shorts Publishing Credentials:\x1b[0m');
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN;
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!clientId || !refreshToken || !clientSecret || clientId.includes('your_') || refreshToken.includes('your_')) {
    console.log('  ❌ \x1b[31mMissing or placeholder YouTube OAuth Credentials in .env\x1b[0m\n');
    console.log('\x1b[33m  📝 How to set up YouTube Shorts Auto-Publishing via Google Cloud:\x1b[0m');
    console.log('     1. Go to Google Cloud Console: \x1b[36mhttps://console.cloud.google.com\x1b[0m');
    console.log('     2. Navigate to \x1b[1mAPIs & Services -> Enabled APIs & Services\x1b[0m.');
    console.log('     3. Click \x1b[32m"+ ENABLE APIS AND SERVICES"\x1b[0m and enable \x1b[32m"YouTube Data API v3"\x1b[0m.');
    console.log('     4. Go to \x1b[1mOAuth consent screen\x1b[0m -> set User Type to \x1b[32mExternal\x1b[0m (add your email as a test user).');
    console.log('     5. Go to \x1b[1mCredentials -> Create Credentials -> OAuth Client ID\x1b[0m:');
    console.log('        • Application Type: \x1b[32mDesktop app\x1b[0m or \x1b[32mWeb application\x1b[0m');
    console.log('     6. Generate your Refresh Token with scope: \x1b[35mhttps://www.googleapis.com/auth/youtube.upload\x1b[0m');
    console.log('        (You can use Google OAuth 2.0 Playground: developers.google.com/oauthplayground)');
    console.log('     7. Add the following to your \x1b[36m.env\x1b[0m file:');
    console.log('        \x1b[90mYOUTUBE_CLIENT_ID="...apps.googleusercontent.com"\x1b[0m');
    console.log('        \x1b[90mYOUTUBE_CLIENT_SECRET="GOCSPX-..."\x1b[0m');
    console.log('        \x1b[90mYOUTUBE_REFRESH_TOKEN="1//04..."\x1b[0m\n');
    return false;
  }

  try {
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const resp = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });
    const data = await resp.json();

    if (data.access_token) {
      console.log(`  ✅ \x1b[32mYouTube OAuth Connected successfully!\x1b[0m (Access token verified)\n`);
      return true;
    } else {
      console.log(`  ⚠️  \x1b[33mYouTube OAuth Token Warning:\x1b[0m ${data.error_description || JSON.stringify(data)}\n`);
      return false;
    }
  } catch (err: any) {
    console.log(`  ⚠️  \x1b[33mCould not reach Google OAuth endpoint:\x1b[0m ${err.message}\n`);
    return false;
  }
}

async function main() {
  printBanner();
  const ytOk = await checkYouTubeAuth();

  console.log('\x1b[36m═══════════════════════════════════════════════════════════════════\x1b[0m');
  console.log('\x1b[1mStatus:\x1b[0m');
  console.log(`  • YouTube Shorts Publishing: ${ytOk ? '\x1b[32mREADY TO PUBLISH\x1b[0m' : '\x1b[33mNEEDS CONFIG (Dry-Run Simulation Available)\x1b[0m'}`);
  console.log('\x1b[36m═══════════════════════════════════════════════════════════════════\x1b[0m\n');
  console.log('\x1b[32m💡 You can test the full YouTube Shorts upload simulation anytime by running:\x1b[0m');
  console.log('   \x1b[1mnpm run video:publish -- --dry-run\x1b[0m\n');
}

main().catch(console.error);
