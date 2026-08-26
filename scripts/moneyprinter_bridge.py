#!/usr/bin/env python3
import sys
import os
import json
import argparse
import asyncio
import math
import re
import urllib.request
import urllib.parse
from pathlib import Path

# Fix moviepy / imageio_ffmpeg path if needed
try:
    import imageio_ffmpeg
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    os.environ["IMAGEIO_FFMPEG_EXE"] = ffmpeg_exe
except Exception:
    pass

import edge_tts
from PIL import Image, ImageDraw, ImageFont
import numpy as np

try:
    import moviepy.editor as mp
except ImportError:
    import moviepy as mp

# Default settings
DEFAULT_VOICE = "en-US-ChristopherNeural"
VIDEO_WIDTH = 1080
VIDEO_HEIGHT = 1920
FPS = 30

async def generate_voicebox_speech(text, voice_id, output_path, voicebox_url="http://localhost:17493"):
    """Synthesizes speech using Voicebox local AI server API."""
    try:
        url = f"{voicebox_url.rstrip('/')}/api/tts"
        payload = json.dumps({"text": text, "voice_id": voice_id, "speed": 1.0}).encode('utf-8')
        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
        
        loop = asyncio.get_event_loop()
        def _fetch():
            with urllib.request.urlopen(req, timeout=30) as resp:
                return resp.read()
        
        audio_data = await loop.run_in_executor(None, _fetch)
        with open(output_path, "wb") as f:
            f.write(audio_data)
        print(f"[+] Voicebox AI synthesized speech successfully -> {output_path}")
        return True
    except Exception as e:
        print(f"[Voicebox API Warning] Could not reach Voicebox server at {voicebox_url}: {e}", file=sys.stderr)
        return False

async def generate_speech(text, voice, output_mp3_path, engine="edge-tts", voicebox_url="http://localhost:17493"):
    """Generates speech audio using Voicebox or EdgeTTS fallback."""
    if engine == "voicebox":
        success = await generate_voicebox_speech(text, voice, output_mp3_path, voicebox_url)
        if success:
            return
        print("[*] Falling back to EdgeTTS for voice synthesis...", file=sys.stderr)
        
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output_mp3_path)

def get_audio_duration(audio_path):
    """Gets audio duration in seconds using moviepy."""
    audio_clip = mp.AudioFileClip(audio_path)
    dur = audio_clip.duration
    audio_clip.close()
    return dur

def create_gradient_background(width, height, frame_idx, total_frames, color_theme='purple'):
    """Generates a dynamic 1080x1920 gradient background frame."""
    t = frame_idx / max(1, total_frames)
    shift = math.sin(t * math.pi * 2) * 0.15
    
    if color_theme == 'blue':
        c1 = (15 + int(20 * shift), 23 + int(30 * shift), 42 + int(40 * shift))
        c2 = (30 + int(40 * shift), 58 + int(60 * shift), 138 + int(70 * shift))
    elif color_theme == 'emerald':
        c1 = (6, 78 + int(30 * shift), 59 + int(30 * shift))
        c2 = (4 + int(10 * shift), 47 + int(20 * shift), 46 + int(30 * shift))
    else: # purple / indigo
        c1 = (15, 23, 42) # slate 900
        c2 = (88 + int(30 * shift), 28 + int(20 * shift), 135 + int(40 * shift)) # purple 900

    # Create smooth vertical gradient
    arr = np.zeros((height, width, 3), dtype=np.uint8)
    for y in range(height):
        ratio = y / height
        # Add subtle radial influence
        r = int(c1[0] * (1 - ratio) + c2[0] * ratio)
        g = int(c1[1] * (1 - ratio) + c2[1] * ratio)
        b = int(c1[2] * (1 - ratio) + c2[2] * ratio)
        arr[y, :, :] = [r, g, b]
    return arr

def fetch_pexels_video(query, pexels_api_key, output_dir):
    """Optional: Fetches a vertical stock video from Pexels if API key is provided."""
    if not pexels_api_key:
        return None
    try:
        url = f"https://api.pexels.com/videos/search?query={urllib.parse.quote(query)}&orientation=portrait&per_page=3"
        req = urllib.request.Request(url, headers={"Authorization": pexels_api_key})
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            if data.get("videos"):
                video_files = data["videos"][0]["video_files"]
                # Find HD vertical video
                hd_file = next((f for f in video_files if f.get("width") == 1080 or f.get("height") == 1920), video_files[0])
                download_url = hd_file["link"]
                target_file = os.path.join(output_dir, "stock_bg.mp4")
                urllib.request.urlretrieve(download_url, target_file)
                return target_file
    except Exception as e:
        print(f"[Pexels Fetch Warning] {e}", file=sys.stderr)
    return None

def wrap_text(text, font, max_width):
    """Wraps text into lines that fit within max_width."""
    words = text.split()
    lines = []
    current_line = []
    
    for word in words:
        current_line.append(word)
        line_str = " ".join(current_line)
        bbox = font.getbbox(line_str)
        w = bbox[2] - bbox[0]
        if w > max_width and len(current_line) > 1:
            current_line.pop()
            lines.append(" ".join(current_line))
            current_line = [word]
            
    if current_line:
        lines.append(" ".join(current_line))
    return lines

def create_title_overlay(title, category, width=1080, height=300):
    """Creates a top banner card for the video."""
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw pill badge for Category
    category_text = category.upper()
    try:
        badge_font = ImageFont.truetype("DejaVuSans-Bold.ttf", 28)
        title_font = ImageFont.truetype("DejaVuSans-Bold.ttf", 40)
    except IOError:
        badge_font = ImageFont.load_default()
        title_font = ImageFont.load_default()

    bbox = badge_font.getbbox(category_text)
    bw = bbox[2] - bbox[0]
    bh = bbox[3] - bbox[1]
    
    badge_x = (width - (bw + 40)) // 2
    badge_y = 40
    draw.rounded_rectangle([badge_x, badge_y, badge_x + bw + 40, badge_y + bh + 20], radius=20, fill=(99, 102, 241, 230))
    draw.text((badge_x + 20, badge_y + 8), category_text, fill=(255, 255, 255, 255), font=badge_font)
    
    # Wrapped Title
    title_lines = wrap_text(title, title_font, width - 120)
    y_offset = badge_y + bh + 40
    for line in title_lines[:2]:
        l_bbox = title_font.getbbox(line)
        lw = l_bbox[2] - l_bbox[0]
        lx = (width - lw) // 2
        # Text shadow
        draw.text((lx + 3, y_offset + 3), line, fill=(0, 0, 0, 180), font=title_font)
        draw.text((lx, y_offset), line, fill=(255, 255, 255, 255), font=title_font)
        y_offset += 48
        
    return np.array(img)

def create_subtitle_overlay(text, width=1080, height=400, is_cta=False):
    """Creates an animated center subtitle card for current spoken phrase."""
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    try:
        font = ImageFont.truetype("DejaVuSans-Bold.ttf", 46 if not is_cta else 42)
    except IOError:
        font = ImageFont.load_default()

    lines = wrap_text(text, font, width - 160)
    
    # Calculate box height
    line_height = 58
    box_h = len(lines) * line_height + 60
    box_w = width - 120
    box_x = 60
    box_y = (height - box_h) // 2

    # Draw semi-transparent rounded backdrop card
    bg_color = (244, 63, 94, 235) if is_cta else (15, 23, 42, 210) # Rose gradient for CTA, dark for subtitles
    border_color = (251, 113, 133, 255) if is_cta else (99, 102, 241, 200)
    
    draw.rounded_rectangle([box_x, box_y, box_x + box_w, box_y + box_h], radius=24, fill=bg_color, outline=border_color, width=3)

    # Draw text lines
    y_pos = box_y + 30
    for line in lines:
        bbox = font.getbbox(line)
        lw = bbox[2] - bbox[0]
        lx = (width - lw) // 2
        
        # Shadow
        draw.text((lx + 2, y_pos + 2), line, fill=(0, 0, 0, 160), font=font)
        # Text
        text_color = (255, 255, 255, 255) if not is_cta else (255, 241, 242, 255)
        draw.text((lx, y_pos), line, fill=text_color, font=font)
        y_pos += line_height

    return np.array(img)

def set_dur(clip, d):
    return clip.with_duration(d) if hasattr(clip, "with_duration") else clip.set_duration(d)

def set_start_time(clip, s):
    return clip.with_start(s) if hasattr(clip, "with_start") else clip.set_start(s)

def set_pos(clip, pos):
    return clip.with_position(pos) if hasattr(clip, "with_position") else clip.set_position(pos)

def set_aud(clip, audio):
    return clip.with_audio(audio) if hasattr(clip, "with_audio") else clip.set_audio(audio)

def render_reel(input_data):
    """Renders 9:16 vertical Reel MP4 using moviepy and generated assets."""
    title = input_data.get("title", "New Local Surge SEO Guide")
    category = input_data.get("category", "SEO Guide")
    script_lines = input_data.get("script_lines", [])
    cta_text = input_data.get("cta", "Link in bio to read full guide!")
    voice = input_data.get("voice", DEFAULT_VOICE)
    engine = input_data.get("voice_engine", "edge-tts")
    voicebox_url = input_data.get("voicebox_url", "http://localhost:17493")
    output_dir = input_data.get("output_dir", "./output")
    slug = input_data.get("slug", "reel")
    pexels_key = os.environ.get("PEXELS_API_KEY", "")

    os.makedirs(output_dir, exist_ok=True)
    
    # 1. Combine script into full text for audio synthesis
    full_speech_text = ". ".join(script_lines) + ". " + cta_text
    mp3_path = os.path.join(output_dir, f"{slug}_audio.mp3")
    
    print(f"[*] Synthesizing speech with engine: '{engine}' and voice: '{voice}'...")
    asyncio.run(generate_speech(full_speech_text, voice, mp3_path, engine=engine, voicebox_url=voicebox_url))
    
    audio_duration = get_audio_duration(mp3_path)
    print(f"[+] Speech synthesized. Duration: {audio_duration:.2f} seconds")

    # 2. Check for Pexels background video
    stock_bg_path = fetch_pexels_video(category + " business website", pexels_key, output_dir)
    
    if stock_bg_path and os.path.exists(stock_bg_path):
        print("[*] Using Pexels stock video background...")
        bg_clip = mp.VideoFileClip(stock_bg_path).resize((VIDEO_WIDTH, VIDEO_HEIGHT))
        if bg_clip.duration < audio_duration:
            bg_clip = mp.vfx.loop(bg_clip, duration=audio_duration)
        else:
            bg_clip = bg_clip.subclip(0, audio_duration)
    else:
        print("[*] Generating dynamic gradient canvas background...")
        total_frames = int(audio_duration * FPS)
        def make_frame(t):
            frame_idx = int(t * FPS)
            return create_gradient_background(VIDEO_WIDTH, VIDEO_HEIGHT, frame_idx, total_frames, color_theme='purple')
        bg_clip = set_dur(mp.VideoClip(make_frame), audio_duration)

    # 3. Create Title Banner Clip (Top of video)
    title_img = create_title_overlay(title, category, VIDEO_WIDTH, 320)
    title_clip = set_pos(set_dur(mp.ImageClip(title_img), audio_duration), ('center', 100))

    # 4. Create Segment Subtitle Clips
    line_count = len(script_lines)
    cta_duration = 3.5
    main_speech_duration = max(1.0, audio_duration - cta_duration)
    segment_duration = main_speech_duration / max(1, line_count)

    subtitle_clips = []
    current_t = 0.0

    for idx, line in enumerate(script_lines):
        dur = segment_duration if idx < line_count - 1 else (main_speech_duration - current_t)
        sub_img = create_subtitle_overlay(line, VIDEO_WIDTH, 400, is_cta=False)
        sub_clip = set_pos(set_start_time(set_dur(mp.ImageClip(sub_img), dur), current_t), ('center', 950))
        subtitle_clips.append(sub_clip)
        current_t += dur

    # End Card CTA clip
    cta_img = create_subtitle_overlay(f"🚀 {cta_text}\n👉 Click link in post!", VIDEO_WIDTH, 450, is_cta=True)
    cta_dur = max(1.0, audio_duration - current_t)
    cta_clip = set_pos(set_start_time(set_dur(mp.ImageClip(cta_img), cta_dur), current_t), ('center', 920))
    subtitle_clips.append(cta_clip)

    # 5. Composite Final Video
    final_audio = mp.AudioFileClip(mp3_path)
    composite = set_aud(mp.CompositeVideoClip([bg_clip, title_clip] + subtitle_clips), final_audio)

    output_mp4_path = os.path.join(output_dir, f"{slug}_facebook_reel.mp4")
    print(f"[*] Rendering Reel MP4 to: {output_mp4_path}")
    
    composite.write_videofile(
        output_mp4_path,
        fps=FPS,
        codec="libx264",
        audio_codec="aac",
        pixel_format="yuv420p",
        threads=4,
        logger=None
    )
    
    # Close clips
    composite.close()
    final_audio.close()
    bg_clip.close()

    result = {
        "status": "success",
        "output_video": output_mp4_path,
        "audio_file": mp3_path,
        "duration_seconds": round(audio_duration, 2),
        "slug": slug
    }
    return result

def main():
    parser = argparse.ArgumentParser(description="MoneyPrinterTurbo Reel Generator Bridge")
    parser.add_argument("--input-json", type=str, help="JSON payload string or path to JSON file")
    args = parser.parse_args()

    if not args.input_json:
        # Read from stdin if no arg passed
        raw_json = sys.stdin.read()
    elif os.path.exists(args.input_json):
        with open(args.input_json, "r") as f:
            raw_json = f.read()
    else:
        raw_json = args.input_json

    try:
        input_data = json.loads(raw_json)
    except Exception as e:
        print(json.dumps({"status": "error", "message": f"Invalid JSON input: {e}"}))
        sys.exit(1)

    try:
        res = render_reel(input_data)
        print(json.dumps(res, indent=2))
    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
