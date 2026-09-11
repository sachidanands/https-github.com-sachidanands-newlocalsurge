import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import * as dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

interface YouTubeCopy {
  title: string;
  description: string;
  tags: string[];
}

function printBanner() {
  console.log('\x1b[36m╔═══════════════════════════════════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[36m║\x1b[0m  \x1b[1m\x1b[31m🚀  LocalSurge YouTube Shorts Auto-Publisher\x1b[0m                      \x1b[36m║\x1b[0m');
  console.log('\x1b[36m╚═══════════════════════════════════════════════════════════════════╝\x1b[0m\n');
}

function promptUser(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

function findLatestRenderedVideo(): string | null {
  const rendersDir = path.resolve(process.cwd(), 'videos', 'free-website-explainer', 'renders');
  if (!fs.existsSync(rendersDir)) return null;

  const defaultFile = path.join(rendersDir, 'free-website-explainer.mp4');
  if (fs.existsSync(defaultFile)) return defaultFile;

  const files = fs.readdirSync(rendersDir)
    .filter(f => f.endsWith('.mp4'))
    .map(f => ({ name: f, time: fs.statSync(path.join(rendersDir, f)).mtimeMs }))
    .sort((a, b) => b.time - a.time);

  return files.length > 0 ? path.join(rendersDir, files[0].name) : null;
}

async function generateYouTubeCopy(videoTopic: string = "Free Local Website Storefront by LocalSurge SEO"): Promise<YouTubeCopy> {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (geminiApiKey && !geminiApiKey.includes('MY_GEMINI_API_KEY')) {
    try {
      console.log('\x1b[33m[*] Generating viral YouTube Shorts SEO copy via Gemini AI...\x1b[0m');
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      const prompt = `You are a high-performing YouTube Shorts growth strategist and local SEO marketing expert.
Generate viral YouTube Shorts metadata for a 40-second vertical video for LocalSurge SEO promoting:
"${videoTopic}".

Key value props:
- 100% Free Storefront for local businesses ($0 forever, zero hidden fees)
- Loads in under 0.4s (destroys bounce rates)
- Built-in LocalBusiness Schema to dominate the Google 3-Pack
- 1-tap direct calling and quote inquiry lead forms
- Website CTA: https://localsurgeseo.com

Respond ONLY in valid JSON with this exact structure:
{
  "title": "Punchy hook title under 70 characters ending with #Shorts",
  "description": "Engaging description with emojis, clear bullet points of benefits, CTA link to https://localsurgeseo.com, and relevant search hashtags",
  "tags": ["Shorts", "LocalSEO", "SmallBusiness", "WebDesign", "Google3Pack", "LocalSurgeSEO", "Marketing2026"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const text = response.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          title: parsed.title.includes('#Shorts') ? parsed.title : `${parsed.title} #Shorts`,
          description: parsed.description,
          tags: parsed.tags || ["Shorts", "LocalSEO", "SmallBusiness", "WebDesign", "Google3Pack", "LocalSurgeSEO"]
        };
      }
    } catch (e: any) {
      console.log(`\x1b[90m(AI generation fallback: ${e.message})\x1b[0m`);
    }
  }

  // Curated High-Converting Fallback Copy
  return {
    title: "Stop Paying $30/mo for Slow Websites! Free Storefront for Local Businesses 🚀 #Shorts",
    description: `Still paying $30/month for slow, bloated website builders that never rank on Google? 

LocalSurge gives every local business a 100% FREE, high-converting storefront with zero hidden fees.

⚡ Loads in under 0.4s flat (destroying bounce rates)
📍 Pre-structured with LocalBusiness Schema for Google 3-Pack rankings
📞 Equipped with 1-Tap direct calling & instant quote lead forms
🛡️ 100% Free Forever

👉 Claim your free storefront now: https://localsurgeseo.com

#Shorts #LocalSEO #SmallBusiness #WebDesign #Google3Pack #LocalBusinessGrowth #LocalSurgeSEO #DigitalMarketing2026`,
    tags: ["Shorts", "LocalSEO", "SmallBusinessGrowth", "WebDesign", "Google3Pack", "LocalSurgeSEO", "FreeWebsite", "LocalMarketing"]
  };
}

async function publishToYouTubeShorts(videoPath: string, copy: YouTubeCopy, isDryRun: boolean = false) {
  console.log('\n\x1b[1m\x1b[31m[YouTube Shorts] Publishing to YouTube Data API v3...\x1b[0m');

  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN;

  if (isDryRun || !clientId || !refreshToken || !clientSecret || clientId.includes('your_') || refreshToken.includes('your_')) {
    console.log(`  \x1b[33m[DRY-RUN / SIMULATION]\x1b[0m YouTube Shorts Upload Payload:`);
    console.log(`    • Title:         "${copy.title}"`);
    console.log(`    • Category ID:   28 (Science & Technology)`);
    console.log(`    • Tags:          ${copy.tags.join(', ')}`);
    console.log(`    • Privacy:       public`);
    console.log(`    • Video File:    ${videoPath} (${(fs.statSync(videoPath).size / (1024*1024)).toFixed(2)} MB)`);
    console.log(`  ✅ \x1b[32mYouTube Shorts simulation passed successfully!\x1b[0m\n`);
    return { status: 'simulated', platform: 'youtube' };
  }

  try {
    // 1. Get Access Token from Refresh Token
    console.log('  [*] Step 1/2: Refreshing Google OAuth access token...');
    const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });
    const tokenData = await tokenResp.json();
    if (!tokenData.access_token) {
      throw new Error(`OAuth token refresh failed: ${JSON.stringify(tokenData)}`);
    }
    const accessToken = tokenData.access_token;

    // 2. Upload Video via Multipart Upload
    console.log('  [*] Step 2/2: Uploading 40-second vertical video to YouTube channel...');
    const metadata = {
      snippet: {
        title: copy.title,
        description: copy.description,
        tags: copy.tags,
        categoryId: '28' // Science & Technology
      },
      status: {
        privacyStatus: 'public',
        selfDeclaredMadeForKids: false
      }
    };

    const boundary = '----YouTubeUploadBoundary' + Date.now();
    const metaHeader = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`;
    const videoHeader = `--${boundary}\r\nContent-Type: video/mp4\r\n\r\n`;
    const videoFooter = `\r\n--${boundary}--`;

    const fileBuffer = fs.readFileSync(videoPath);
    const multipartBody = Buffer.concat([
      Buffer.from(metaHeader),
      Buffer.from(videoHeader),
      fileBuffer,
      Buffer.from(videoFooter)
    ]);

    const uploadUrl = 'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status';
    const uploadResp = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
        'Content-Length': multipartBody.length.toString()
      },
      body: multipartBody
    });

    const uploadData = await uploadResp.json();

    if (uploadData.id) {
      console.log(`\n  🎉 \x1b[32mYouTube Short Published Successfully!\x1b[0m`);
      console.log(`     👉 Watch Short: \x1b[36mhttps://youtube.com/shorts/${uploadData.id}\x1b[0m\n`);
      return { status: 'success', platform: 'youtube', video_id: uploadData.id };
    } else {
      throw new Error(`YouTube API returned error: ${JSON.stringify(uploadData)}`);
    }
  } catch (err: any) {
    console.error(`  ❌ \x1b[31mYouTube Shorts Publish Error:\x1b[0m ${err.message}\n`);
    return { status: 'error', platform: 'youtube', error: err.message };
  }
}

async function main() {
  printBanner();

  const args = process.argv.slice(2);
  const fileArg = args.find(a => a.startsWith('--file='))?.split('=')[1];
  const isDryRun = args.includes('--dry-run') || args.includes('--mock');
  const isNonInteractive = args.includes('--non-interactive') || args.includes('-y') || args.includes('--yes');

  if (args.includes('--help') || args.includes('-h')) {
    console.log('\x1b[33mUsage:\x1b[0m');
    console.log('  npm run video:publish              \x1b[90m# Interactive YouTube Shorts review & publish\x1b[0m');
    console.log('  npm run video:publish -- [flags]   \x1b[90m# Direct publish with CLI flags\x1b[0m\n');
    console.log('\x1b[33mFlags:\x1b[0m');
    console.log('  --file=<path>          Path to MP4 video (defaults to latest rendered explainer)');
    console.log('  --dry-run              Simulate upload payload without live network API calls');
    console.log('  --yes, -y              Publish without terminal confirmation prompt\n');
    console.log('\x1b[33mExamples:\x1b[0m');
    console.log('  npm run video:publish -- --dry-run');
    console.log('  npm run video:publish -- --file=videos/free-website-explainer/renders/free-website-explainer.mp4\n');
    process.exit(0);
  }

  // 1. Resolve Video File
  const videoFile = fileArg ? path.resolve(process.cwd(), fileArg) : findLatestRenderedVideo();

  if (!videoFile || !fs.existsSync(videoFile)) {
    console.error('\x1b[31m[!] No rendered MP4 video found in videos/free-website-explainer/renders/\x1b[0m');
    console.log('💡 Run "npm run video:render" first to render your 40-second explainer video.\n');
    process.exit(1);
  }

  const stats = fs.statSync(videoFile);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);

  console.log(`\x1b[1mSelected Video:\x1b[0m \x1b[36m${videoFile}\x1b[0m (${sizeMb} MB)`);
  if (isDryRun) {
    console.log('\x1b[33mMode: DRY-RUN SIMULATION (No live requests will be sent)\x1b[0m\n');
  }

  // 2. Generate Copy & Tags
  const copy = await generateYouTubeCopy("Free Local Website Storefront by LocalSurge SEO");

  console.log('\x1b[32m═══════════════════════════════════════════════════════════════════\x1b[0m');
  console.log('\x1b[1m\x1b[33m📋 GENERATED YOUTUBE SHORTS METADATA PREVIEW \x1b[0m');
  console.log('\x1b[32m═══════════════════════════════════════════════════════════════════\x1b[0m');
  console.log(`\x1b[1m🎯 Title:\x1b[0m\n   ${copy.title}\n`);
  console.log(`\x1b[1m📝 Description:\x1b[0m\n${copy.description}\n`);
  console.log(`\x1b[1m🏷️  Tags:\x1b[0m\n   ${copy.tags.map(t => `#${t}`).join(' ')}\n`);
  console.log('\x1b[32m═══════════════════════════════════════════════════════════════════\x1b[0m\n');

  // 3. User Confirmation Prompt
  if (!isNonInteractive) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const confirm = await promptUser(rl, '\x1b[1mReady to publish to YouTube Shorts? (Y/n): \x1b[0m');
    rl.close();

    if (confirm.toLowerCase() === 'n' || confirm.toLowerCase() === 'no') {
      console.log('\n\x1b[90mPublishing cancelled by user.\x1b[0m\n');
      process.exit(0);
    }
  }

  // 4. Publish to YouTube Shorts
  await publishToYouTubeShorts(videoFile, copy, isDryRun);

  console.log('\x1b[32m╔═══════════════════════════════════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[32m║\x1b[0m  \x1b[1m\x1b[32m✨ YouTube Shorts Publishing Flow Complete!\x1b[0m                      \x1b[32m║\x1b[0m');
  console.log('\x1b[32m╚═══════════════════════════════════════════════════════════════════╝\x1b[0m\n');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
