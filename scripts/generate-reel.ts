import { execSync, spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { BLOG_POSTS, BlogPost } from '../src/data/blogData';

// Domain URL for Facebook post link promotion
const SITE_DOMAIN = 'https://newlocalsurge.com';

function printHeader() {
  console.log('\x1b[36m===============================================================\x1b[0m');
  console.log('\x1b[1m\x1b[35m 🚀 MoneyPrinterTurbo Facebook Reel Generator for NewLocalSurge \x1b[0m');
  console.log('\x1b[36m===============================================================\x1b[0m\n');
}

function listAvailableSlugs() {
  printHeader();
  console.log('\x1b[33mAvailable Blog Post Slugs:\x1b[0m\n');
  BLOG_POSTS.forEach((post, idx) => {
    console.log(`  ${idx + 1}. \x1b[36m${post.slug}\x1b[0m`);
    console.log(`     \x1b[90mTitle: "${post.title}"\x1b[0m`);
    console.log(`     \x1b[90mCategory: ${post.category} | Read Time: ${post.readTime}\x1b[0m\n`);
  });
  console.log('\x1b[32mUsage:\x1b[0m');
  console.log('  npm run generate-reel <slug>\n');
  console.log('\x1b[32mExample:\x1b[0m');
  console.log('  npm run generate-reel 10-second-website-hack-why-meta-titles-matter\n');
}

function extractScriptFromBlog(post: BlogPost): { hook: string; lines: string[]; cta: string } {
  // Extract hook from description or alert box
  const hook = post.description.replace(/If you came here from our latest Facebook Reel,?\s*/i, '');
  
  // Select key section highlights
  const lines: string[] = [];
  lines.push(hook);

  // Parse sections for high-impact lines
  post.sections.forEach(sec => {
    if (sec.type === 'alert-box') {
      const cleanText = sec.content.replace(/^[\s💡🛠️⚠️PRO TRUTHFACTACTIONABLE STEP:]+/i, '').trim();
      if (cleanText.length < 140) lines.push(cleanText);
    } else if (sec.type === 'quote') {
      const cleanQuote = sec.content.replace(/^"|"$/g, '').trim();
      if (cleanQuote.length < 130) lines.push(cleanQuote);
    } else if (sec.type === 'bullet-list' && sec.items) {
      // Pick top bullet point
      const topItem = sec.items[0];
      if (topItem && topItem.length < 120) {
        lines.push(topItem.split(':')[0] || topItem);
      }
    }
  });

  // Fallback line if script is too short
  if (lines.length < 3) {
    lines.push(`Optimize your ${post.category} strategy today with proven techniques.`);
  }

  const cta = `Read the full step-by-step breakdown on NewLocalSurge!`;

  return { hook, lines, cta };
}

function generateFacebookPostCopy(post: BlogPost, videoPath: string) {
  const blogUrl = `${SITE_DOMAIN}/blog/${post.slug}`;
  const categoryHashtag = post.category.replace(/[^a-zA-Z0-9]/g, '');

  console.log('\n\x1b[32m===============================================================\x1b[0m');
  console.log('\x1b[1m\x1b[33m 📲 READY-TO-USE FACEBOOK POST CAPTION \x1b[0m');
  console.log('\x1b[32m===============================================================\x1b[0m\n');
  
  const captionText = 
`🔥 ${post.title}

${post.description}

👇 Read the full step-by-step guide & access our free browser tools here:
👉 ${blogUrl}

#LocalSEO #SearchEngineOptimization #${categoryHashtag} #SmallBusinessGrowth #NewLocalSurge #DigitalMarketing2026`;

  console.log('\x1b[37m' + captionText + '\x1b[0m\n');
  console.log('\x1b[36m===============================================================\x1b[0m');
  console.log(`\x1b[1m\x1b[32m 🎥 Generated Reel Video MP4: \x1b[0m ${videoPath}`);
  console.log('\x1b[36m===============================================================\x1b[0m\n');
}

async function main() {
  const args = process.argv.slice(2);
  const targetSlug = args.find(a => !a.startsWith('--'));

  if (!targetSlug) {
    listAvailableSlugs();
    process.exit(0);
  }

  const useVoicebox = args.includes('--voicebox') || args.some(a => a.startsWith('--voice='));
  const voiceArg = args.find(a => a.startsWith('--voice='))?.split('=')[1] || "cloned-my-voice";
  const voiceEngine = useVoicebox ? "voicebox" : "edge-tts";

  const post = BLOG_POSTS.find(p => p.slug === targetSlug);

  if (!post) {
    console.error(`\x1b[31m[Error] Blog post slug "${targetSlug}" not found in blogData.ts\x1b[0m\n`);
    listAvailableSlugs();
    process.exit(1);
  }

  printHeader();
  console.log(`\x1b[1m[*] Generating Facebook Reel for:\x1b[0m "${post.title}"`);
  console.log(`[*] Category: ${post.category} | Author: ${post.author.name}`);
  console.log(`[*] Voice Engine: \x1b[33m${voiceEngine}\x1b[0m ${useVoicebox ? `(Voice ID: ${voiceArg})` : ''}\n`);

  const { hook, lines, cta } = extractScriptFromBlog(post);

  console.log('\x1b[33m[*] Extracted Video Script Highlights:\x1b[0m');
  lines.forEach((l, idx) => console.log(`   ${idx + 1}. ${l}`));
  console.log(`   CTA: ${cta}\n`);

  const outputDir = path.resolve(process.cwd(), 'dist', 'reels');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const payload = {
    title: post.title,
    category: post.category,
    slug: post.slug,
    script_lines: lines,
    cta: cta,
    voice: useVoicebox ? voiceArg : "en-US-ChristopherNeural",
    voice_engine: voiceEngine,
    voicebox_url: "http://localhost:17493",
    output_dir: outputDir
  };

  const bridgeScript = path.resolve(process.cwd(), 'scripts', 'moneyprinter_bridge.py');
  const venvPython = path.resolve(process.cwd(), '.venv', 'bin', 'python3');
  const pythonCmd = fs.existsSync(venvPython) ? venvPython : 'python3';

  console.log(`[*] Launching MoneyPrinterTurbo engine via ${pythonCmd}...`);

  const pythonProc = spawn(pythonCmd, [bridgeScript, '--input-json', JSON.stringify(payload)]);

  let stdoutData = '';
  let stderrData = '';

  pythonProc.stdout.on('data', (data) => {
    const text = data.toString();
    stdoutData += text;
    // Log progress messages to terminal
    if (text.includes('[*]') || text.includes('[+]')) {
      process.stdout.write(`\x1b[90m${text}\x1b[0m`);
    }
  });

  pythonProc.stderr.on('data', (data) => {
    stderrData += data.toString();
  });

  pythonProc.on('close', (code) => {
    if (code !== 0) {
      console.error(`\x1b[31m[Error] MoneyPrinterTurbo Python engine failed with code ${code}\x1b[0m`);
      console.error(stderrData || stdoutData);
      process.exit(1);
    }

    try {
      // Find JSON response in stdout
      const jsonMatch = stdoutData.match(/\{[\s\S]*"status":\s*"success"[\s\S]*\}/);
      if (jsonMatch) {
        const res = JSON.parse(jsonMatch[0]);
        generateFacebookPostCopy(post, res.output_video);
      } else {
        console.log(stdoutData);
        generateFacebookPostCopy(post, path.join(outputDir, `${post.slug}_facebook_reel.mp4`));
      }
    } catch (e) {
      console.log(stdoutData);
      generateFacebookPostCopy(post, path.join(outputDir, `${post.slug}_facebook_reel.mp4`));
    }
  });
}

main();
