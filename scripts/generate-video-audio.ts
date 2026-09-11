import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as readline from 'readline';

const VOICE_OPTIONS = [
  {
    id: 'en-US-ChristopherNeural',
    name: 'Christopher (Male - Authoritative, High Impact, Confident)',
    engine: 'edge-tts',
    tag: 'RECOMMENDED'
  },
  {
    id: 'en-US-GuyNeural',
    name: 'Guy (Male - Energetic, Dynamic Marketing, Passionate)',
    engine: 'edge-tts',
    tag: 'POPULAR'
  },
  {
    id: 'en-US-AndrewMultilingualNeural',
    name: 'Andrew (Male - Warm, Authentic Copilot, Conversational)',
    engine: 'edge-tts',
    tag: 'SMOOTH'
  },
  {
    id: 'en-US-AvaNeural',
    name: 'Ava (Female - Expressive, Friendly, Modern)',
    engine: 'edge-tts',
    tag: 'CLEAR'
  },
  {
    id: 'en-US-EmmaNeural',
    name: 'Emma (Female - Cheerful, Upbeat, Clear)',
    engine: 'edge-tts',
    tag: 'BRIGHT'
  },
  {
    id: 'cloned-my-voice',
    name: 'Voicebox Local AI (Your Cloned Voice Profile on port 17493)',
    engine: 'voicebox',
    tag: 'LOCAL AI'
  }
];

const BGM_OPTIONS = [
  {
    id: 'energetic-tech',
    name: 'Energetic Tech Pulse (124 BPM, Modern Electronic Synth & Bass)',
    tag: 'RECOMMENDED'
  },
  {
    id: 'corporate-tech',
    name: 'Corporate Tech (110 BPM, Bell Tones, Warm Ambient Drive)',
    tag: 'PROFESSIONAL'
  },
  {
    id: 'minimal-lofi',
    name: 'Minimal Lo-Fi (85 BPM, Warm Rhodes Piano Chords)',
    tag: 'CHILL'
  },
  {
    id: 'none',
    name: 'No Background Music (Voiceover Only)',
    tag: 'MUTE BGM'
  }
];

function printBanner() {
  console.log('\x1b[36m╔═══════════════════════════════════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[36m║\x1b[0m  \x1b[1m\x1b[35m🎙️  LocalSurge Video Audio Studio & Voicebox Synthesizer\x1b[0m          \x1b[36m║\x1b[0m');
  console.log('\x1b[36m╚═══════════════════════════════════════════════════════════════════╝\x1b[0m\n');
}

function promptUser(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

function getPythonExecutable(): string {
  const venvPython = path.resolve(process.cwd(), '.venv', 'bin', 'python3');
  if (fs.existsSync(venvPython)) return venvPython;
  const sysPython = 'python3';
  return sysPython;
}

async function runSynthesis(voiceId: string, engine: string, bgmTheme: string, voiceboxUrl: string = 'http://localhost:17493') {
  const pythonCmd = getPythonExecutable();
  const scriptPath = path.resolve(process.cwd(), 'scripts', 'synthesize_explainer_audio.py');

  console.log(`\n\x1b[33m[*] Synthesizing audio assets with:\x1b[0m`);
  console.log(`    • Voice:   \x1b[32m${voiceId}\x1b[0m (Engine: ${engine})`);
  console.log(`    • BGM:     \x1b[32m${bgmTheme}\x1b[0m`);
  console.log(`    • Runner:  \x1b[90m${pythonCmd}\x1b[0m\n`);

  return new Promise<void>((resolve, reject) => {
    const child = spawn(pythonCmd, [
      scriptPath,
      '--voice', voiceId,
      '--engine', engine,
      '--bgm', bgmTheme,
      '--voicebox-url', voiceboxUrl
    ], {
      stdio: 'inherit'
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log('\x1b[32m[✓] Audio synthesis complete! Tracks saved in videos/free-website-explainer/assets/audio/\x1b[0m');
        console.log('\x1b[36m💡 Next step: Run "npm run video:render" to render the final 1080x1920 MP4 video!\x1b[0m\n');
        resolve();
      } else {
        console.error(`\x1b[31m[!] Audio synthesis failed with exit code ${code}\x1b[0m`);
        reject(new Error(`Exit code ${code}`));
      }
    });
  });
}

async function main() {
  printBanner();

  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log('\x1b[33mUsage:\x1b[0m');
    console.log('  npm run video:audio              \x1b[90m# Interactive menu to select voice and BGM\x1b[0m');
    console.log('  npm run video:audio -- [flags]   \x1b[90m# Direct synthesis via CLI flags\x1b[0m\n');
    console.log('\x1b[33mFlags:\x1b[0m');
    console.log('  --voice=<id>         Voice ID (e.g., en-US-ChristopherNeural, en-US-GuyNeural, cloned-my-voice)');
    console.log('  --engine=<name>      Engine: "edge-tts" or "voicebox" (default: auto-detected)');
    console.log('  --bgm=<mood>         BGM: "energetic-tech", "corporate-tech", "minimal-lofi", "none"');
    console.log('  --voicebox-url=<url> Voicebox local server endpoint (default: http://localhost:17493)');
    console.log('  --non-interactive    Run without prompt using defaults or provided flags\n');
    console.log('\x1b[33mExamples:\x1b[0m');
    console.log('  npm run video:audio -- --voice=en-US-ChristopherNeural --bgm=energetic-tech');
    console.log('  npm run video:audio -- --voice=cloned-my-voice --engine=voicebox\n');
    process.exit(0);
  }

  const voiceFlag = args.find(a => a.startsWith('--voice='))?.split('=')[1];
  const engineFlag = args.find(a => a.startsWith('--engine='))?.split('=')[1];
  const bgmFlag = args.find(a => a.startsWith('--bgm='))?.split('=')[1];
  const voiceboxUrlFlag = args.find(a => a.startsWith('--voicebox-url='))?.split('=')[1] || 'http://localhost:17493';
  const isNonInteractive = args.includes('--non-interactive') || args.includes('-y') || !!(voiceFlag && bgmFlag);

  if (isNonInteractive || voiceFlag) {
    const chosenVoice = voiceFlag || 'en-US-ChristopherNeural';
    const isVoicebox = engineFlag === 'voicebox' || chosenVoice.includes('cloned') || chosenVoice.includes('voicebox');
    const chosenEngine = engineFlag || (isVoicebox ? 'voicebox' : 'edge-tts');
    const chosenBgm = bgmFlag || 'energetic-tech';

    await runSynthesis(chosenVoice, chosenEngine, chosenBgm, voiceboxUrlFlag);
    return;
  }

  // Interactive Menu Mode
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    console.log('\x1b[1m\x1b[33m[Step 1/2] Choose Voiceover Voice:\x1b[0m\n');
    VOICE_OPTIONS.forEach((v, idx) => {
      const tagColor = v.tag === 'RECOMMENDED' ? '\x1b[32m' : '\x1b[36m';
      console.log(`  \x1b[1m${idx + 1}.\x1b[0m ${tagColor}[${v.tag}]\x1b[0m \x1b[37m${v.name}\x1b[0m`);
      console.log(`     \x1b[90mID: ${v.id} (${v.engine})\x1b[0m\n`);
    });
    console.log(`  \x1b[1m7.\x1b[0m \x1b[35m[CUSTOM]\x1b[0m Enter custom Voicebox Voice ID or Edge-TTS name\n`);

    let voiceChoice = await promptUser(rl, '\x1b[1mSelect voice (1-7, default: 1):\x1b[0m ');
    if (!voiceChoice) voiceChoice = '1';

    let selectedVoice = VOICE_OPTIONS[0].id;
    let selectedEngine = VOICE_OPTIONS[0].engine;

    const numChoice = parseInt(voiceChoice, 10);
    if (numChoice >= 1 && numChoice <= VOICE_OPTIONS.length) {
      selectedVoice = VOICE_OPTIONS[numChoice - 1].id;
      selectedEngine = VOICE_OPTIONS[numChoice - 1].engine;
    } else if (numChoice === 7 || voiceChoice.toLowerCase() === 'custom') {
      const customId = await promptUser(rl, 'Enter Custom Voice ID (e.g. cloned-my-voice, en-US-BrianNeural): ');
      if (customId) {
        selectedVoice = customId;
        selectedEngine = customId.startsWith('en-') ? 'edge-tts' : 'voicebox';
      }
    }

    console.log(`\n\x1b[1m\x1b[33m[Step 2/2] Choose Background Music (BGM):\x1b[0m\n`);
    BGM_OPTIONS.forEach((b, idx) => {
      const tagColor = b.tag === 'RECOMMENDED' ? '\x1b[32m' : '\x1b[36m';
      console.log(`  \x1b[1m${idx + 1}.\x1b[0m ${tagColor}[${b.tag}]\x1b[0m \x1b[37m${b.name}\x1b[0m\n`);
    });

    let bgmChoice = await promptUser(rl, '\x1b[1mSelect BGM (1-4, default: 1):\x1b[0m ');
    if (!bgmChoice) bgmChoice = '1';

    let selectedBgm = BGM_OPTIONS[0].id;
    const bgmNum = parseInt(bgmChoice, 10);
    if (bgmNum >= 1 && bgmNum <= BGM_OPTIONS.length) {
      selectedBgm = BGM_OPTIONS[bgmNum - 1].id;
    }

    rl.close();

    await runSynthesis(selectedVoice, selectedEngine, selectedBgm, voiceboxUrlFlag);
  } catch (err) {
    rl.close();
    console.error(err);
    process.exit(1);
  }
}

main();
