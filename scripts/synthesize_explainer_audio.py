#!/usr/bin/env python3
import sys
import os
import json
import argparse
import asyncio
import subprocess
import urllib.request
import urllib.parse
from pathlib import Path

# Voice lists
VOICE_CATALOG = [
    {
        "id": "en-US-ChristopherNeural",
        "name": "Christopher (Authoritative, Confident)",
        "engine": "edge-tts",
        "gender": "Male",
        "recommended": True
    },
    {
        "id": "en-US-GuyNeural",
        "name": "Guy (Energetic, Dynamic Marketing)",
        "engine": "edge-tts",
        "gender": "Male",
        "recommended": False
    },
    {
        "id": "en-US-AndrewMultilingualNeural",
        "name": "Andrew (Warm, Authentic, Modern)",
        "engine": "edge-tts",
        "gender": "Male",
        "recommended": False
    },
    {
        "id": "en-US-AvaNeural",
        "name": "Ava (Expressive, Clear, Friendly)",
        "engine": "edge-tts",
        "gender": "Female",
        "recommended": False
    },
    {
        "id": "en-US-EmmaNeural",
        "name": "Emma (Cheerful, Conversational)",
        "engine": "edge-tts",
        "gender": "Female",
        "recommended": False
    },
    {
        "id": "cloned-my-voice",
        "name": "Voicebox Local Cloned Voice (Requires local Voicebox server)",
        "engine": "voicebox",
        "gender": "Custom",
        "recommended": False
    }
]

BGM_OPTIONS = {
    "energetic-tech": "energetic_tech.mp3",
    "corporate-tech": "corporate_tech.mp3",
    "minimal-lofi": "minimal_lofi.mp3",
    "none": None
}

SCRIPT_SCENES = [
    {
        "scene": 1,
        "start": 0.0,
        "max_dur": 6.0,
        "text": "Still paying thirty dollars a month for slow, bloated website builders that never rank on Google?"
    },
    {
        "scene": 2,
        "start": 6.5,
        "max_dur": 6.0,
        "text": "LocalSurge gives every local business a one hundred percent free, high-converting storefront with zero hidden fees."
    },
    {
        "scene": 3,
        "start": 13.0,
        "max_dur": 6.5,
        "text": "Unlike heavy DIY builders, it loads in under zero point four seconds, destroying bounce rates and keeping visitors hooked."
    },
    {
        "scene": 4,
        "start": 20.0,
        "max_dur": 6.5,
        "text": "Pre-structured with LocalBusiness schema and local keyword SEO to help you dominate the Google 3-Pack."
    },
    {
        "scene": 5,
        "start": 27.0,
        "max_dur": 6.0,
        "text": "Equipped with one-tap calling, quote inquiry forms, and review badges to turn searchers into paying clients."
    },
    {
        "scene": 6,
        "start": 33.5,
        "max_dur": 6.0,
        "text": "Ready to grow your business? Head to localsurgeseo.com and claim your free storefront today!"
    }
]

async def synthesize_voicebox_speech(text, voice_id, output_path, voicebox_url="http://localhost:17493"):
    """Synthesizes speech using local Voicebox API with reference cloned voice sample."""
    try:
        url = f"{voicebox_url.rstrip('/')}/api/tts"
        cloned_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'videos', 'free-website-explainer', 'assets', 'audio', 'cloned_voice'))
        ref_wav = os.path.join(cloned_dir, f"{voice_id}.wav")
        ref_txt = os.path.join(cloned_dir, f"{voice_id}_transcript.txt")

        payload_dict = {
            "text": text,
            "voice_id": voice_id,
            "speed": 1.0
        }

        if os.path.exists(ref_wav):
            payload_dict["ref_audio_path"] = ref_wav
            if os.path.exists(ref_txt):
                with open(ref_txt, "r", encoding="utf-8") as f:
                    payload_dict["ref_text"] = f.read().strip()
            print(f"[+] Loaded recorded voice clone reference: {ref_wav}")

        payload = json.dumps(payload_dict).encode('utf-8')
        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
        
        loop = asyncio.get_event_loop()
        def _fetch():
            with urllib.request.urlopen(req, timeout=20) as resp:
                return resp.read()
        
        audio_data = await loop.run_in_executor(None, _fetch)
        with open(output_path, "wb") as f:
            f.write(audio_data)
        return True
    except Exception as e:
        print(f"[!] Voicebox API at {voicebox_url} unavailable ({e}). Falling back to Edge-TTS.", file=sys.stderr)
        return False

async def synthesize_edge_tts_speech(text, voice_id, output_path, rate="+0%"):
    """Synthesizes speech using Edge-TTS with natural relaxed human pacing."""
    import edge_tts
    communicate = edge_tts.Communicate(text, voice_id, rate=rate)
    await communicate.save(output_path)

def get_audio_duration(file_path):
    """Uses ffprobe to accurately get audio duration in seconds."""
    cmd = [
        'ffprobe', '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        file_path
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    try:
        return float(res.stdout.strip())
    except Exception:
        return 0.0

def adjust_tempo_if_needed(file_path, max_dur=6.2):
    """If audio exceeds max_dur, speeds up audio tempo cleanly without pitch distortion to fit exact window."""
    dur = get_audio_duration(file_path)
    if dur > max_dur:
        tempo = dur / max_dur
        # ffmpeg atempo filter supports values up to 2.0
        tempo = max(1.0, min(1.5, tempo))
        tmp_path = file_path + ".tmp.mp3"
        subprocess.run([
            'ffmpeg', '-y', '-i', file_path,
            '-filter:a', f'atempo={tempo:.3f}',
            '-b:a', '192k',
            tmp_path
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if os.path.exists(tmp_path) and os.path.getsize(tmp_path) > 0:
            os.replace(tmp_path, file_path)
        dur = get_audio_duration(file_path)
    return dur

async def generate_all_scene_audio(voice_id="en-US-ChristopherNeural", engine="edge-tts", voicebox_url="http://localhost:17493", bgm_theme="energetic-tech", output_dir=None):
    if not output_dir:
        output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'videos', 'free-website-explainer', 'assets', 'audio'))
    
    os.makedirs(output_dir, exist_ok=True)
    bgm_dir = os.path.join(output_dir, 'bgm')
    os.makedirs(bgm_dir, exist_ok=True)

    print(f"[*] Voice: {voice_id} (Engine: {engine})")
    print(f"[*] Target Audio Directory: {output_dir}")

    scene_files = []
    durations = []

    # 1. Synthesize 6 scene clips
    for item in SCRIPT_SCENES:
        scene_num = item["scene"]
        text = item["text"]
        max_dur = item["max_dur"]
        out_file = os.path.join(output_dir, f"vo_scene_{scene_num}.mp3")

        print(f"[*] Synthesizing Scene {scene_num} ({item['start']}s)...")
        success = False
        if engine == "voicebox":
            success = await synthesize_voicebox_speech(text, voice_id, out_file, voicebox_url)
        
        if not success:
            # Fallback or default to edge-tts with natural human rate
            edge_voice = voice_id if voice_id.startswith("en-") else "en-US-ChristopherNeural"
            await synthesize_edge_tts_speech(text, edge_voice, out_file, rate="+0%")

        dur = adjust_tempo_if_needed(out_file, max_dur)
        print(f"    -> vo_scene_{scene_num}.mp3 (duration: {dur:.2f}s)")
        scene_files.append(out_file)
        durations.append(dur)

    # 2. Build 40-second master voiceover track with accurate timing delays
    print("[*] Building 40-second aligned master voiceover track...")
    master_vo_file = os.path.join(output_dir, "voiceover_master.mp3")

    # Precise delays matching 40s scene rhythm:
    # Scene 1: 0ms, Scene 2: 6500ms, Scene 3: 13000ms, Scene 4: 20000ms, Scene 5: 27000ms, Scene 6: 33500ms
    delays_ms = [0, 6500, 13000, 20000, 27000, 33500]

    inputs = []
    filter_complex = []
    mix_inputs = []

    for idx, f in enumerate(scene_files):
        inputs.extend(['-i', f])
        d_ms = delays_ms[idx]
        filter_complex.append(f"[{idx}:a]adelay={d_ms}|{d_ms},apad=whole_dur=40[a{idx}];")
        mix_inputs.append(f"[a{idx}]")

    mix_str = "".join(filter_complex) + "".join(mix_inputs) + f"amix=inputs={len(scene_files)}:duration=longest:dropout_transition=0,volume=1.0[outa]"

    subprocess.run([
        'ffmpeg', '-y', *inputs,
        '-filter_complex', mix_str,
        '-map', '[outa]',
        '-t', '40.0',
        '-b:a', '192k',
        master_vo_file
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    # 3. Handle BGM selection and placement
    bgm_filename = BGM_OPTIONS.get(bgm_theme, "energetic_tech.mp3")
    bgm_dest = os.path.join(output_dir, "bgm.mp3")
    has_bgm = False

    if bgm_filename:
        src_bgm = os.path.join(bgm_dir, bgm_filename)
        if not os.path.exists(src_bgm):
            bgm_gen_script = os.path.join(os.path.dirname(__file__), 'generate_bgm_library.py')
            subprocess.run(['python3', bgm_gen_script], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        if os.path.exists(src_bgm):
            # Trim to 40.0s with subtle fade out
            subprocess.run([
                'ffmpeg', '-y', '-i', src_bgm,
                '-t', '40.0',
                '-af', 'afade=t=out:st=38.0:d=2.0,volume=0.28',
                '-b:a', '192k',
                bgm_dest
            ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            has_bgm = True
            print(f"[+] BGM configured: {bgm_theme} -> {bgm_dest}")

    # 4. Generate Composite Full Mix with Auto-Ducking (Voiceover + Ducked BGM)
    full_mix_file = os.path.join(output_dir, "full_mix.mp3")
    if has_bgm and os.path.exists(bgm_dest):
        print("[*] Generating composite full mix with sidechain voiceover carve...")
        sidechain_filter = (
            "[1:a]volume=0.35[bgm_base];"
            "[0:a]asplit=2[vo_out][vo_sc];"
            "[bgm_base][vo_sc]sidechaincompress=threshold=0.08:ratio=4:attack=20:release=350[ducked_bgm];"
            "[vo_out][ducked_bgm]amix=inputs=2:duration=first:dropout_transition=0[outmix]"
        )
        subprocess.run([
            'ffmpeg', '-y',
            '-i', master_vo_file,
            '-i', bgm_dest,
            '-filter_complex', sidechain_filter,
            '-map', '[outmix]',
            '-t', '40.0',
            '-b:a', '192k',
            full_mix_file
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    else:
        subprocess.run([
            'ffmpeg', '-y', '-i', master_vo_file,
            '-t', '40.0',
            '-b:a', '192k', full_mix_file
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    result = {
        "status": "success",
        "voice": voice_id,
        "engine": engine,
        "bgm": bgm_theme,
        "scene_clips": scene_files,
        "durations": durations,
        "master_voiceover": master_vo_file,
        "bgm_file": bgm_dest if has_bgm else None,
        "full_mix": full_mix_file
    }

    print("\n\x1b[32m[✓] All audio assets generated successfully!\x1b[0m")
    print(f"  • Scene 1..6 Clips: {output_dir}/vo_scene_1..6.mp3")
    print(f"  • Master Voiceover: {master_vo_file}")
    if has_bgm:
        print(f"  • Background Music: {bgm_dest}")
    print(f"  • Composite Mix:    {full_mix_file}\n")
    return result

def main():
    parser = argparse.ArgumentParser(description="Explainer Video Audio Synthesizer")
    parser.add_argument("--voice", type=str, default="en-US-ChristopherNeural", help="Voice ID or name")
    parser.add_argument("--engine", type=str, default="edge-tts", choices=["edge-tts", "voicebox"], help="TTS Engine")
    parser.add_argument("--voicebox-url", type=str, default="http://localhost:17493", help="Voicebox server URL")
    parser.add_argument("--bgm", type=str, default="energetic-tech", choices=["energetic-tech", "corporate-tech", "minimal-lofi", "none"], help="Background music mood")
    parser.add_argument("--output-dir", type=str, default=None, help="Output directory")
    parser.add_argument("--json", action="store_true", help="Output JSON result")
    parser.add_argument("--list-voices", action="store_true", help="Print available voices catalog")
    args = parser.parse_args()

    if args.list_voices:
        print(json.dumps({"voices": VOICE_CATALOG, "bgm_options": list(BGM_OPTIONS.keys())}, indent=2))
        return

    res = asyncio.run(generate_all_scene_audio(
        voice_id=args.voice,
        engine=args.engine,
        voicebox_url=args.voicebox_url,
        bgm_theme=args.bgm,
        output_dir=args.output_dir
    ))

    if args.json:
        print(json.dumps(res, indent=2))

if __name__ == "__main__":
    main()
