import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { exec, execSync } from 'child_process';

const PORT = 4500;
const CLONED_DIR = path.resolve(process.cwd(), 'videos', 'free-website-explainer', 'assets', 'audio', 'cloned_voice');
const HTML_FILE = path.resolve(process.cwd(), 'scripts', 'voice-studio.html');

if (!fs.existsSync(CLONED_DIR)) {
  fs.mkdirSync(CLONED_DIR, { recursive: true });
}

function printBanner() {
  console.log('\x1b[36m╔═══════════════════════════════════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[36m║\x1b[0m  \x1b[1m\x1b[35m🎙️  LocalSurge AI Voice Cloning Recording Studio\x1b[0m                 \x1b[36m║\x1b[0m');
  console.log('\x1b[36m╚═══════════════════════════════════════════════════════════════════╝\x1b[0m\n');
  console.log(`  🌐 Studio Server Running at: \x1b[1m\x1b[32mhttp://localhost:${PORT}\x1b[0m`);
  console.log(`  📁 Cloned Voices Stored in:  \x1b[90m${CLONED_DIR}\x1b[0m\n`);
  console.log('\x1b[33m💡 Opening browser studio now... Press Ctrl+C to stop server.\x1b[0m\n');
}

function openBrowser(url: string) {
  const start = process.platform === 'darwin' ? 'open' :
                process.platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${start} ${url}`, () => {});
}

// Simple multipart form parser for binary audio + text fields
function parseMultipart(buffer: Buffer, boundary: string): { audioBuffer?: Buffer; transcript?: string; voiceId?: string } {
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  let audioBuffer: Buffer | undefined;
  let transcript = '';
  let voiceId = 'cloned-my-voice';

  let start = buffer.indexOf(boundaryBuffer);
  while (start !== -1) {
    const nextStart = buffer.indexOf(boundaryBuffer, start + boundaryBuffer.length);
    if (nextStart === -1) break;

    const part = buffer.subarray(start + boundaryBuffer.length, nextStart);
    const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'));
    if (headerEnd !== -1) {
      const headers = part.subarray(0, headerEnd).toString('utf-8');
      const body = part.subarray(headerEnd + 4, part.length - 2); // strip trailing \r\n

      if (headers.includes('name="audio"')) {
        audioBuffer = body;
      } else if (headers.includes('name="transcript"')) {
        transcript = body.toString('utf-8').trim();
      } else if (headers.includes('name="voice_id"')) {
        voiceId = body.toString('utf-8').trim();
      }
    }
    start = nextStart;
  }

  return { audioBuffer, transcript, voiceId };
}

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Serve Studio UI
  if ((req.method === 'GET' || req.method === 'HEAD') && (req.url === '/' || req.url === '/voice-studio.html')) {
    if (fs.existsSync(HTML_FILE)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      if (req.method === 'HEAD') {
        res.end();
        return;
      }
      fs.createReadStream(HTML_FILE).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Voice studio HTML file not found.');
    }
    return;
  }

  // Handle Save Voice API
  if (req.method === 'POST' && req.url === '/api/save-voice') {
    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary=(.+)$/);

    if (!boundaryMatch) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'error', message: 'Missing multipart boundary header' }));
      return;
    }

    const boundary = boundaryMatch[1];
    const chunks: Buffer[] = [];

    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const fullBuffer = Buffer.concat(chunks);
      const parsed = parseMultipart(fullBuffer, boundary);

      if (!parsed.audioBuffer || parsed.audioBuffer.length === 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', message: 'No audio data received' }));
        return;
      }

      try {
        const rawTemp = path.join(CLONED_DIR, 'raw_temp.webm');
        fs.writeFileSync(rawTemp, parsed.audioBuffer);

        const targetVoiceId = parsed.voiceId || 'cloned-my-voice';
        const targetWav = path.join(CLONED_DIR, `${targetVoiceId}.wav`);
        const transcriptPath = path.join(CLONED_DIR, `${targetVoiceId}_transcript.txt`);
        const metaPath = path.join(CLONED_DIR, `${targetVoiceId}_meta.json`);

        console.log(`\n\x1b[33m[*] Received ${parsed.audioBuffer.length} bytes of raw audio recording...\x1b[0m`);
        console.log(`[*] Processing studio audio filters (80Hz rumble cut + afftdn noise reduction + level normalization)...`);

        // FFmpeg audio clean-up pipeline:
        // 1. highpass=f=80: cuts low-frequency room rumble and desk thumps
        // 2. afftdn=nf=-25: adaptive FFT gentle noise suppressor
        // 3. dynaudnorm: dynamics audio normalizer for consistent broadcast level
        // 4. -ar 24000 -ac 1: pristine mono 24kHz (optimal for Voicebox / F5-TTS / XTTS zero-shot voice cloning)
        execSync(`ffmpeg -y -i "${rawTemp}" -af "highpass=f=80,afftdn=nf=-25,dynaudnorm=f=150:g=15:p=0.95:m=10.0:r=0.9" -ar 24000 -ac 1 "${targetWav}"`, {
          stdio: 'pipe'
        });

        if (fs.existsSync(rawTemp)) {
          fs.unlinkSync(rawTemp);
        }

        // Save transcript
        const spokenText = parsed.transcript || 'Sample voice recording for LocalSurge AI storefront explainer.';
        fs.writeFileSync(transcriptPath, spokenText, 'utf-8');

        // Measure duration
        const durOutput = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${targetWav}"`, { encoding: 'utf-8' });
        const durationSec = parseFloat(durOutput.trim()) || 0.0;

        // Save metadata
        const metadata = {
          voice_id: targetVoiceId,
          created_at: new Date().toISOString(),
          duration_seconds: Math.round(durationSec * 100) / 100,
          sample_rate: 24000,
          channels: 1,
          format: 'wav',
          file_path: targetWav,
          transcript: spokenText
        };
        fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2), 'utf-8');

        console.log(`\x1b[32m[+] Voice profile "${targetVoiceId}" saved successfully!\x1b[0m`);
        console.log(`    • Audio File:  \x1b[36m${targetWav}\x1b[0m`);
        console.log(`    • Duration:    \x1b[33m${metadata.duration_seconds}s\x1b[0m`);
        console.log(`    • Transcript:  "${spokenText.slice(0, 70)}..."\n`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'success',
          voice_id: targetVoiceId,
          duration: metadata.duration_seconds,
          file_path: targetWav
        }));
      } catch (err: any) {
        console.error('\x1b[31m[!] Audio processing error:\x1b[0m', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', message: err.message || 'Processing failed' }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  printBanner();
  openBrowser(`http://localhost:${PORT}`);
});
