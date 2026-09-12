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

# Voice options
VOICE_CATALOG = [
    {
        "id": "cloned-my-voice",
        "name": "User Recorded Voice Clone (Voicebox Local)",
        "engine": "voicebox",
        "gender": "Custom",
        "recommended": True
    },
    {
        "id": "en-US-ChristopherNeural",
        "name": "Christopher (Authoritative, Confident)",
        "engine": "edge-tts",
        "gender": "Male",
        "recommended": False
    },
    {
        "id": "en-US-GuyNeural",
        "name": "Guy (Energetic, Dynamic Marketing)",
        "engine": "edge-tts",
        "gender": "Male",
        "recommended": False
    }
]

BGM_OPTIONS = {
    "corporate-tech": "corporate_tech.mp3",
    "energetic-tech": "energetic_tech.mp3",
    "minimal-lofi": "minimal_lofi.mp3",
    "none": None
}

MAPPACK_SCENES = [
    {
        "scene": 1,
        "start": 0.0,
        "max_dur": 6.8,
        "text": "If your business isn't ranking in Google's Local 3-Pack, you're literally handing seventy percent of phone calls to your competitors across the street."
    },
    {
        "scene": 2,
        "start": 7.0,
        "max_dur": 7.2,
        "text": "Most contractors pick one generic category like 'Contractor' or 'Plumber' and stop there. But Google matches search intent with pinpoint specificity."
    },
    {
        "scene": 3,
        "start": 14.5,
        "max_dur": 7.2,
        "text": "First, log into your Google Business Profile and add three hyper-specific secondary categories for high-ticket emergency jobs."
    },
    {
        "scene": 4,
        "start": 22.0,
        "max_dur": 7.5,
        "text": "Second, lock in your exact Google Place ID coordinates and ensure your schema markup matches your service radius to the exact mile."
    },
    {
        "scene": 5,
        "start": 30.0,
        "max_dur": 7.5,
        "text": "Third, boost your review velocity. When customers mention your specific service in five-star reviews, Google boosts your Map Pack rank by thirty percent."
    },
    {
        "scene": 6,
        "start": 38.0,
        "max_dur": 8.0,
        "text": "We just published the full step-by-step Map Pack Domination Guide with free audit tools on our blog at localsurgeseo.com."
    },
    {
        "scene": 7,
        "start": 46.5,
        "max_dur": 8.0,
        "text": "Read the full guide and scan your Google Place ID for free today at localsurgeseo.com. Link in description!"
    }
]

async def get_or_create_cloned_profile(voicebox_url="http://localhost:17493"):
    """Finds or registers the cloned voice profile in Voicebox."""
    loop = asyncio.get_event_loop()
    
    # 1. Check existing profiles
    profiles_url = f"{voicebox_url.rstrip('/')}/profiles"
    req = urllib.request.Request(profiles_url, headers={"Accept": "application/json"})
    
    def _fetch_profiles():
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode('utf-8'))
    
    profiles = await loop.run_in_executor(None, _fetch_profiles)
    for p in profiles:
        if "Ved" in p.get("name", "") or p.get("voice_type") == "cloned" or p.get("default_engine") == "luxtts":
            return p["id"]
    
    # 2. Create profile if none exists
    create_payload = json.dumps({
        "name": "Ved (Cloned Voice)",
        "description": "Authentic cloned voice profile for LocalSurge SEO videos and reels",
        "language": "en",
        "default_engine": "luxtts",
        "voice_type": "cloned"
    }).encode('utf-8')
    
    create_req = urllib.request.Request(profiles_url, data=create_payload, headers={"Content-Type": "application/json"})
    def _create_profile():
        with urllib.request.urlopen(create_req, timeout=10) as resp:
            return json.loads(resp.read().decode('utf-8'))
            
    new_profile = await loop.run_in_executor(None, _create_profile)
    profile_id = new_profile["id"]
    
    # 3. Upload voice sample
    cloned_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'videos', 'google-map-pack-reel', 'assets', 'audio', 'cloned_voice'))
    ref_wav = os.path.join(cloned_dir, "cloned-my-voice.wav")
    ref_txt = os.path.join(cloned_dir, "cloned-my-voice_transcript.txt")
    
    if os.path.exists(ref_wav):
        sample_url = f"{voicebox_url.rstrip('/')}/profiles/{profile_id}/samples"
        ref_text = "Still paying thirty dollars a month for slow, bloated website builders that never rank on Google? LocalSurge gives every local business a one hundred percent free, high-converting storefront with zero hidden fees."
        if os.path.exists(ref_txt):
            with open(ref_txt, "r", encoding="utf-8") as f:
                ref_text = f.read().strip()
                
        def _upload_sample():
            cmd = [
                'curl', '-s', '-X', 'POST', sample_url,
                '-F', f'file=@{ref_wav}',
                '-F', f'reference_text={ref_text}'
            ]
            subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            
        await loop.run_in_executor(None, _upload_sample)
        
    return profile_id

async def synthesize_voicebox_speech(text, voice_id, output_path, voicebox_url="http://localhost:17493"):
    """Synthesizes speech using local Voicebox API with reference cloned voice sample."""
    try:
        loop = asyncio.get_event_loop()
        profile_id = await get_or_create_cloned_profile(voicebox_url)
        
        # 1. Trigger speech generation
        gen_url = f"{voicebox_url.rstrip('/')}/generate"
        payload = json.dumps({
            "profile_id": profile_id,
            "text": text,
            "engine": "luxtts"
        }).encode('utf-8')
        
        req = urllib.request.Request(gen_url, data=payload, headers={"Content-Type": "application/json"})
        def _post_generate():
            with urllib.request.urlopen(req, timeout=15) as resp:
                return json.loads(resp.read().decode('utf-8'))
                
        gen_data = await loop.run_in_executor(None, _post_generate)
        gen_id = gen_data["id"]
        
        # 2. Poll generation status until completed
        status_url = f"{voicebox_url.rstrip('/')}/history/{gen_id}"
        is_done = False
        for _ in range(60): # Max 30 seconds
            await asyncio.sleep(0.5)
            def _check_status():
                s_req = urllib.request.Request(status_url, headers={"Accept": "application/json"})
                with urllib.request.urlopen(s_req, timeout=10) as s_resp:
                    return json.loads(s_resp.read().decode('utf-8'))
            
            s_data = await loop.run_in_executor(None, _check_status)
            status = s_data.get("status")
            if status == "completed":
                is_done = True
                break
            elif status == "failed":
                err = s_data.get("error", "Unknown Voicebox error")
                raise RuntimeError(f"Generation failed: {err}")
                
        if not is_done:
            raise TimeoutError("Voicebox generation timed out")
            
        # 3. Download generated audio and convert to MP3
        audio_url = f"{voicebox_url.rstrip('/')}/audio/{gen_id}"
        tmp_wav = output_path + ".tmp.wav"
        
        def _download_audio():
            a_req = urllib.request.Request(audio_url)
            with urllib.request.urlopen(a_req, timeout=15) as a_resp:
                with open(tmp_wav, "wb") as f:
                    f.write(a_resp.read())
            # Convert to mp3 with libmp3lame
            subprocess.run([
                'ffmpeg', '-y', '-i', tmp_wav,
                '-c:a', 'libmp3lame',
                '-b:a', '192k',
                output_path
            ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            if os.path.exists(tmp_wav):
                os.remove(tmp_wav)
                
        await loop.run_in_executor(None, _download_audio)
        return True
    except Exception as e:
        print(f"[!] Voicebox API at {voicebox_url} unavailable ({e}). Falling back to Edge-TTS.", file=sys.stderr)
        return False

async def synthesize_edge_tts_speech(text, voice_id, output_path, rate="+0%"):
    """Synthesizes speech using Edge-TTS with natural human pacing."""
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

def adjust_tempo_if_needed(file_path, max_dur=8.0):
    """If audio exceeds max_dur, speeds up audio tempo cleanly without pitch distortion."""
    dur = get_audio_duration(file_path)
    if dur > max_dur:
        tempo = dur / max_dur
        tempo = max(1.0, min(1.4, tempo))
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

async def generate_all_scene_audio(voice_id="cloned-my-voice", engine="voicebox", voicebox_url="http://localhost:17493", bgm_theme="corporate-tech", output_dir=None):
    if not output_dir:
        output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'videos', 'google-map-pack-reel', 'assets', 'audio'))
    
    os.makedirs(output_dir, exist_ok=True)
    bgm_dir = os.path.join(output_dir, 'bgm')
    os.makedirs(bgm_dir, exist_ok=True)

    print(f"[*] Voice ID: {voice_id} (Engine: {engine})")
    print(f"[*] Target Audio Directory: {output_dir}")

    scene_files = []
    durations = []

    # 1. Synthesize 7 scene clips
    for item in MAPPACK_SCENES:
        scene_num = item["scene"]
        text = item["text"]
        max_dur = item["max_dur"]
        out_file = os.path.join(output_dir, f"vo_scene_{scene_num}.mp3")

        print(f"[*] Generating Scene {scene_num} ({max_dur}s): \"{text[:45]}...\"")
        success = False
        if engine == "voicebox" or "cloned" in voice_id:
            success = await synthesize_voicebox_speech(text, voice_id, out_file, voicebox_url)
        
        if not success:
            fallback_voice = "en-US-ChristopherNeural" if ("cloned" in voice_id or engine == "voicebox") else voice_id
            await synthesize_edge_tts_speech(text, fallback_voice, out_file, rate="+0%")

        dur = adjust_tempo_if_needed(out_file, max_dur)
        scene_files.append(out_file)
        durations.append(dur)
        print(f"    -> Rendered: {dur:.2f}s (Budget: {max_dur}s)")

    # 2. Build Master Voiceover Track (55.0s Timeline)
    master_vo = os.path.join(output_dir, "voiceover_master.mp3")
    print("\n[*] Assembling Master Voiceover track aligned with 55s scene timings...")

    filter_complex_parts = []
    inputs = []
    for i, item in enumerate(MAPPACK_SCENES):
        inputs.extend(['-i', scene_files[i]])
        delay_ms = int(item["start"] * 1000)
        filter_complex_parts.append(f"[{i}:a]adelay={delay_ms}|{delay_ms}[a{i}]")

    mix_inputs = "".join([f"[a{i}]" for i in range(len(MAPPACK_SCENES))])
    filter_complex = f"{';'.join(filter_complex_parts)};{mix_inputs}amix=inputs={len(MAPPACK_SCENES)}:duration=longest:dropout_transition=0,volume=1.8[vo_out]"

    cmd = [
        'ffmpeg', '-y',
        *inputs,
        '-filter_complex', filter_complex,
        '-map', '[vo_out]',
        '-c:a', 'libmp3lame',
        '-b:a', '256k',
        master_vo
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"[+] Master voiceover track saved: {master_vo} ({get_audio_duration(master_vo):.2f}s)")

    # 3. Dynamic BGM Mixing with Voiceover Carve & Ducking
    full_mix = os.path.join(output_dir, "full_mix.mp3")
    bgm_filename = BGM_OPTIONS.get(bgm_theme, "corporate_tech.mp3")

    if bgm_filename:
        bgm_path = os.path.join(bgm_dir, bgm_filename)
        # Check parent folder if not yet in project bgm folder
        if not os.path.exists(bgm_path):
            alt_bgm = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'videos', 'free-website-explainer', 'assets', 'audio', 'bgm', bgm_filename))
            if os.path.exists(alt_bgm):
                bgm_path = alt_bgm

        if os.path.exists(bgm_path):
            print(f"[*] Applying dynamic auto-ducking to BGM ({bgm_filename}) across 55s video...")
            duck_filter = (
                f"[0:a]asplit=2[vo1][vo2];"
                f"[1:a]volume=0.22,afade=t=in:st=0:d=1.5,afade=t=out:st=52.0:d=3.0[bgm];"
                f"[bgm][vo1]sidechaincompress=threshold=0.12:ratio=4:attack=20:release=350[ducked_bgm];"
                f"[ducked_bgm][vo2]amix=inputs=2:duration=first:dropout_transition=0,volume=1.8,alimiter=limit=0.95[out]"
            )
            cmd_bgm = [
                'ffmpeg', '-y',
                '-i', master_vo,
                '-stream_loop', '-1', '-i', bgm_path,
                '-filter_complex', duck_filter,
                '-map', '[out]',
                '-t', '55.0',
                '-c:a', 'libmp3lame',
                '-b:a', '256k',
                full_mix
            ]
            subprocess.run(cmd_bgm, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            print(f"[+] Pristine 55-second Full Mix generated: {full_mix}")
        else:
            print(f"[!] BGM file {bgm_filename} not found, using master voiceover as final mix.")
            import shutil
            shutil.copy(master_vo, full_mix)
    else:
        import shutil
        shutil.copy(master_vo, full_mix)

    return full_mix

def main():
    parser = argparse.ArgumentParser(description="Google Map Pack 55s Reel Audio Synthesizer")
    parser.add_argument("--voice", default="cloned-my-voice", help="Voice ID")
    parser.add_argument("--engine", default="voicebox", choices=["voicebox", "edge-tts"], help="Speech engine")
    parser.add_argument("--bgm", default="corporate-tech", choices=list(BGM_OPTIONS.keys()), help="BGM Theme")
    parser.add_argument("--voicebox-url", default="http://localhost:17493", help="Voicebox server URL")
    parser.add_argument("--output-dir", default=None, help="Output assets directory")

    args = parser.parse_args()
    asyncio.run(generate_all_scene_audio(
        voice_id=args.voice,
        engine=args.engine,
        voicebox_url=args.voicebox_url,
        bgm_theme=args.bgm,
        output_dir=args.output_dir
    ))

if __name__ == "__main__":
    main()
