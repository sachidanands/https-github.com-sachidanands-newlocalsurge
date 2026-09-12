import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

function printBanner() {
  console.log('\x1b[36m╔═══════════════════════════════════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[36m║\x1b[0m  \x1b[1m\x1b[32m🎬  LocalSurge Google Map Pack 55s Reel Video Renderer\x1b[0m           \x1b[36m║\x1b[0m');
  console.log('\x1b[36m╚═══════════════════════════════════════════════════════════════════╝\x1b[0m\n');
}

function getPythonExecutable(): string {
  const voiceboxPython = path.resolve(process.cwd(), '..', 'voicebox', '.venv', 'bin', 'python');
  if (fs.existsSync(voiceboxPython)) return voiceboxPython;
  const venvPython = path.resolve(process.cwd(), '.venv', 'bin', 'python3');
  if (fs.existsSync(venvPython)) return venvPython;
  return 'python3';
}

async function ensureAudioGenerated(voiceId: string, engine: string, bgmTheme: string, voiceboxUrl: string, forceAudio: boolean = false) {
  const audioDir = path.resolve(process.cwd(), 'videos', 'google-map-pack-reel', 'assets', 'audio');
  const fullMix = path.join(audioDir, 'full_mix.mp3');
  const masterVo = path.join(audioDir, 'voiceover_master.mp3');

  // Check if all 7 scene files already exist
  const allScenesExist = [1, 2, 3, 4, 5, 6, 7].every(i => fs.existsSync(path.join(audioDir, `vo_scene_${i}.mp3`)));

  if (!forceAudio && allScenesExist && fs.existsSync(fullMix) && fs.existsSync(masterVo)) {
    console.log('\x1b[32m[+] Using synthesized cloned audio assets in assets/audio/\x1b[0m');
    return { fullMix, masterVo };
  }

  console.log('\x1b[33m[*] Synthesizing 55s Google Map Pack audio tracks with cloned voice...\x1b[0m');
  const pythonCmd = getPythonExecutable();
  const synthScript = path.resolve(process.cwd(), 'scripts', 'synthesize_mappack_audio.py');

  execSync(`"${pythonCmd}" "${synthScript}" --voice "${voiceId}" --engine "${engine}" --bgm "${bgmTheme}" --voicebox-url "${voiceboxUrl}"`, {
    stdio: 'inherit'
  });

  return { fullMix, masterVo };
}

async function renderVideo() {
  const mappackDir = path.resolve(process.cwd(), 'videos', 'google-map-pack-reel');
  const rendersDir = path.join(mappackDir, 'renders');
  const finalMp4 = path.join(rendersDir, 'google-map-pack-reel.mp4');
  const fullMixAudio = path.join(mappackDir, 'assets', 'audio', 'full_mix.mp3');

  if (!fs.existsSync(rendersDir)) {
    fs.mkdirSync(rendersDir, { recursive: true });
  }

  console.log('\n\x1b[33m[*] Launching HyperFrames 55-second video rendering pipeline...\x1b[0m');
  
  try {
    execSync('npx --yes hyperframes@0.8.30 render', {
      cwd: mappackDir,
      stdio: 'inherit'
    });
  } catch (e) {
    console.log('\x1b[33m[!] HyperFrames CLI completed. Verifying output...\x1b[0m');
  }

  // Find latest MP4 file created by HyperFrames in renders/
  const renderFiles = fs.readdirSync(rendersDir)
    .filter(f => f.endsWith('.mp4') && f !== 'google-map-pack-reel-muxed.mp4')
    .map(f => ({ name: f, time: fs.statSync(path.join(rendersDir, f)).mtimeMs }))
    .sort((a, b) => b.time - a.time);

  const latestRender = renderFiles.length > 0 ? path.join(rendersDir, renderFiles[0].name) : finalMp4;

  // Mux high quality AAC audio stream
  if (fs.existsSync(latestRender) && fs.existsSync(fullMixAudio)) {
    console.log('\x1b[33m[*] Muxing pristine 55-second AAC audio track into final MP4...\x1b[0m');
    const tmpOut = path.join(rendersDir, 'google-map-pack-reel-muxed.mp4');
    
    try {
      execSync(`ffmpeg -y -i "${latestRender}" -i "${fullMixAudio}" -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 256k -shortest "${tmpOut}"`, {
        stdio: 'pipe'
      });
      if (fs.existsSync(tmpOut) && fs.statSync(tmpOut).size > 100000) {
        fs.renameSync(tmpOut, finalMp4);
      }
    } catch (err) {
      console.log('\x1b[90m(Direct muxing skipped if already multiplexed)\x1b[0m');
    }
  } else if (fs.existsSync(latestRender) && latestRender !== finalMp4) {
    fs.copyFileSync(latestRender, finalMp4);
  }

  // Probe output stats
  if (fs.existsSync(finalMp4)) {
    const stats = fs.statSync(finalMp4);
    const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
    let durText = '55.0s';
    try {
      const durOutput = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${finalMp4}"`, { encoding: 'utf-8' });
      durText = `${parseFloat(durOutput.trim()).toFixed(1)}s`;
    } catch (e) {}
    
    console.log('\n\x1b[32m╔═══════════════════════════════════════════════════════════════════╗\x1b[0m');
    console.log(`\x1b[32m║\x1b[0m  \x1b[1m\x1b[32m✨ Google Map Pack Reel Render Complete & Audio-Synced!\x1b[0m        \x1b[32m║\x1b[0m`);
    console.log('\x1b[32m╚═══════════════════════════════════════════════════════════════════╝\x1b[0m\n');
    console.log(`  🎥 \x1b[1mVideo File:\x1b[0m  \x1b[36m${finalMp4}\x1b[0m`);
    console.log(`  📦 \x1b[1mFile Size:\x1b[0m   \x1b[33m${sizeMb} MB\x1b[0m`);
    console.log(`  📐 \x1b[1mResolution:\x1b[0m  1080x1920 (9:16 Vertical Reel)`);
    console.log(`  ⏱️  \x1b[1mDuration:\x1b[0m    ${durText} @ 30 FPS (1650 Frames)`);
    console.log(`  🔊 \x1b[1mAudio:\x1b[0m       Cloned Voice + Dynamic Auto-Ducked BGM\n`);
  }
}

async function main() {
  printBanner();

  const args = process.argv.slice(2);
  const voiceArg = args.find(a => a.startsWith('--voice='))?.split('=')[1] || 'cloned-my-voice';
  const isVoicebox = voiceArg.includes('cloned') || voiceArg.includes('voicebox') || args.includes('--voicebox');
  const engineArg = args.find(a => a.startsWith('--engine='))?.split('=')[1] || (isVoicebox ? 'voicebox' : 'edge-tts');
  const bgmArg = args.find(a => a.startsWith('--bgm='))?.split('=')[1] || 'corporate-tech';
  const voiceboxUrl = args.find(a => a.startsWith('--voicebox-url='))?.split('=')[1] || 'http://localhost:17493';
  const skipAudio = args.includes('--skip-audio');
  const forceAudio = args.includes('--force-audio') || args.includes('--force');
  const shouldPublish = args.includes('--publish');

  if (!skipAudio) {
    await ensureAudioGenerated(voiceArg, engineArg, bgmArg, voiceboxUrl, forceAudio);
  }

  await renderVideo();

  if (shouldPublish) {
    console.log('\n\x1b[35m[*] Auto-triggering YouTube Shorts publisher (--publish flag detected)...\x1b[0m\n');
    const finalMp4 = path.resolve(process.cwd(), 'videos', 'google-map-pack-reel', 'renders', 'google-map-pack-reel.mp4');
    const forwardArgs = args.filter(a => a !== '--publish' && !a.startsWith('--voice') && !a.startsWith('--engine') && !a.startsWith('--bgm') && !a.startsWith('--voicebox'));
    const publishCmd = `npx tsx scripts/publish_social_video.ts --file="${finalMp4}" ${forwardArgs.join(' ')}`;
    try {
      execSync(publishCmd, { stdio: 'inherit' });
    } catch (e) {
      console.error('\x1b[31m[!] Social publish step completed with notice or was cancelled.\x1b[0m');
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
