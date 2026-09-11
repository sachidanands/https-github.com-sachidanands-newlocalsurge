#!/usr/bin/env python3
import os
import subprocess
import numpy as np
import wave

BGM_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'videos', 'free-website-explainer', 'assets', 'audio', 'bgm'))
os.makedirs(BGM_DIR, exist_ok=True)

SAMPLE_RATE = 44100
DURATION = 42.0  # 42 seconds to cover 40s video with margin

def save_wav_and_convert_mp3(samples, wav_path, mp3_path):
    # Normalize
    max_val = np.max(np.abs(samples))
    if max_val > 0:
        samples = samples / max_val * 0.85
    
    # 16-bit PCM stereo
    int_samples = (samples * 32767).astype(np.int16)
    with wave.open(wav_path, 'wb') as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(int_samples.tobytes())
    
    # Convert to MP3 using ffmpeg
    subprocess.run([
        'ffmpeg', '-y', '-i', wav_path,
        '-codec:a', 'libmp3lame', '-b:a', '192k',
        mp3_path
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if os.path.exists(wav_path):
        os.remove(wav_path)
    print(f"[+] Created BGM track: {mp3_path}")

def generate_energetic_tech():
    """Generates a 124 BPM upbeat tech pulse with sub-bass, hi-hats, and melodic arpeggio."""
    total_samples = int(SAMPLE_RATE * DURATION)
    bpm = 124
    beat_sec = 60.0 / bpm
    sixteenth_sec = beat_sec / 4.0

    left = np.zeros(total_samples)
    right = np.zeros(total_samples)

    # Chord progression: Am - F - C - G (Root frequencies: 220, 174.61, 261.63, 196.0)
    chords = [
        [220.0, 261.63, 329.63, 440.0],   # Am
        [174.61, 220.0, 261.63, 349.23],  # F
        [261.63, 329.63, 392.0, 523.25],  # C
        [196.0, 246.94, 293.66, 392.0]    # G
    ]

    # 1. Kick on every beat
    num_beats = int(DURATION / beat_sec)
    for b in range(num_beats):
        start_idx = int(b * beat_sec * SAMPLE_RATE)
        kick_dur = int(0.18 * SAMPLE_RATE)
        if start_idx + kick_dur < total_samples:
            kt = np.linspace(0, 0.18, kick_dur, endpoint=False)
            k_freq = 45.0 + 105.0 * np.exp(-kt * 28.0)
            k_phase = np.cumsum(2 * np.pi * k_freq / SAMPLE_RATE)
            k_env = np.exp(-kt * 18.0)
            kick_sample = np.sin(k_phase) * k_env * 0.7
            left[start_idx:start_idx+kick_dur] += kick_sample
            right[start_idx:start_idx+kick_dur] += kick_sample

    # 2. Hi-hat on every off-beat (16th notes)
    num_16ths = int(DURATION / sixteenth_sec)
    for s in range(num_16ths):
        if s % 2 == 1:
            start_idx = int(s * sixteenth_sec * SAMPLE_RATE)
            hat_dur = int(0.04 * SAMPLE_RATE)
            if start_idx + hat_dur < total_samples:
                noise = np.random.uniform(-1, 1, hat_dur)
                hat_env = np.exp(-np.linspace(0, 1, hat_dur) * 12.0)
                vol = 0.15 if (s % 4 == 2) else 0.08
                left[start_idx:start_idx+hat_dur] += noise * hat_env * vol * 0.8
                right[start_idx:start_idx+hat_dur] += noise * hat_env * vol * 1.2

    # 3. Synth Arpeggio
    arp_notes_per_chord = 16
    for chord_idx, chord in enumerate(chords * 8):
        chord_start_beat = chord_idx * 4
        for step in range(arp_notes_per_chord):
            note_time = (chord_start_beat + step * 0.25) * beat_sec
            start_idx = int(note_time * SAMPLE_RATE)
            note_dur = int(0.14 * SAMPLE_RATE)
            if start_idx + note_dur < total_samples:
                note_freq = chord[step % len(chord)]
                nt = np.linspace(0, 0.14, note_dur, endpoint=False)
                pluck = (
                    0.6 * np.sin(2 * np.pi * note_freq * nt) +
                    0.25 * np.sin(2 * np.pi * note_freq * 2 * nt) +
                    0.15 * np.sin(2 * np.pi * note_freq * 3 * nt)
                ) * np.exp(-nt * 14.0)
                
                pan = 0.5 + 0.3 * np.sin(step)
                left[start_idx:start_idx+note_dur] += pluck * (1 - pan) * 0.35
                right[start_idx:start_idx+note_dur] += pluck * pan * 0.35

    # 4. Warm Sub-Bassline (8th notes on root)
    for chord_idx, chord in enumerate(chords * 8):
        root_freq = chord[0] / 2.0
        for eighth in range(8):
            note_time = (chord_idx * 4 + eighth * 0.5) * beat_sec
            start_idx = int(note_time * SAMPLE_RATE)
            note_dur = int(0.35 * SAMPLE_RATE)
            if start_idx + note_dur < total_samples:
                bt = np.linspace(0, 0.35, note_dur, endpoint=False)
                bass = (np.sin(2 * np.pi * root_freq * bt) + 0.3 * np.sin(2 * np.pi * root_freq * 2 * bt)) * np.exp(-bt * 3.5)
                left[start_idx:start_idx+note_dur] += bass * 0.3
                right[start_idx:start_idx+note_dur] += bass * 0.3

    stereo = np.column_stack((left, right))
    wav_path = os.path.join(BGM_DIR, 'energetic_tech.wav')
    mp3_path = os.path.join(BGM_DIR, 'energetic_tech.mp3')
    save_wav_and_convert_mp3(stereo, wav_path, mp3_path)

def generate_corporate_tech():
    """Generates a smooth 110 BPM corporate tech track with bell tones, warm pads, and subtle drive."""
    total_samples = int(SAMPLE_RATE * DURATION)
    bpm = 110
    beat_sec = 60.0 / bpm

    left = np.zeros(total_samples)
    right = np.zeros(total_samples)

    chords = [
        [261.63, 329.63, 392.00, 493.88],  # Cmaj7
        [196.00, 246.94, 293.66, 392.00],  # G
        [220.00, 261.63, 329.63, 392.00],  # Am7
        [174.61, 220.00, 261.63, 329.63]   # Fmaj7
    ]

    for chord_idx, chord in enumerate(chords * 8):
        chord_start = chord_idx * 4 * beat_sec
        chord_dur = 4 * beat_sec
        start_idx = int(chord_start * SAMPLE_RATE)
        dur_samples = int(chord_dur * SAMPLE_RATE)
        if start_idx + dur_samples < total_samples:
            pt = np.linspace(0, chord_dur, dur_samples, endpoint=False)
            pad_env = np.sin(np.pi * pt / chord_dur) ** 0.5
            pad_sig = np.zeros(dur_samples)
            for f in chord:
                pad_sig += (np.sin(2 * np.pi * f * pt) + 0.2 * np.sin(2 * np.pi * f * 1.003 * pt)) * 0.15
            left[start_idx:start_idx+dur_samples] += pad_sig * pad_env * 0.25
            right[start_idx:start_idx+dur_samples] += pad_sig * pad_env * 0.25

    for chord_idx, chord in enumerate(chords * 8):
        chord_start_beat = chord_idx * 4
        steps = [0, 1, 2, 3, 2, 1, 3, 2]
        for idx, s in enumerate(steps):
            note_time = (chord_start_beat + idx * 0.5) * beat_sec
            start_idx = int(note_time * SAMPLE_RATE)
            note_dur = int(0.4 * SAMPLE_RATE)
            if start_idx + note_dur < total_samples:
                freq = chord[s % len(chord)] * 1.0
                bt = np.linspace(0, 0.4, note_dur, endpoint=False)
                bell = (np.sin(2 * np.pi * freq * bt) + 0.4 * np.sin(2 * np.pi * freq * 2.01 * bt) + 0.15 * np.sin(2 * np.pi * freq * 3.0 * bt)) * np.exp(-bt * 6.0)
                pan = 0.5 + 0.25 * np.sin(idx * 1.2)
                left[start_idx:start_idx+note_dur] += bell * (1 - pan) * 0.3
                right[start_idx:start_idx+note_dur] += bell * pan * 0.3

    num_beats = int(DURATION / beat_sec)
    for b in range(num_beats):
        start_idx = int(b * beat_sec * SAMPLE_RATE)
        if b % 2 == 0:
            k_dur = int(0.15 * SAMPLE_RATE)
            if start_idx + k_dur < total_samples:
                kt = np.linspace(0, 0.15, k_dur, endpoint=False)
                k_env = np.exp(-kt * 20.0)
                k_sig = np.sin(2 * np.pi * (50.0 + 80.0 * np.exp(-kt * 30)) * kt) * k_env * 0.45
                left[start_idx:start_idx+k_dur] += k_sig
                right[start_idx:start_idx+k_dur] += k_sig
        else:
            c_dur = int(0.1 * SAMPLE_RATE)
            if start_idx + c_dur < total_samples:
                noise = np.random.uniform(-1, 1, c_dur) * np.exp(-np.linspace(0, 1, c_dur) * 15.0) * 0.12
                left[start_idx:start_idx+c_dur] += noise
                right[start_idx:start_idx+c_dur] += noise

    stereo = np.column_stack((left, right))
    wav_path = os.path.join(BGM_DIR, 'corporate_tech.wav')
    mp3_path = os.path.join(BGM_DIR, 'corporate_tech.mp3')
    save_wav_and_convert_mp3(stereo, wav_path, mp3_path)

def generate_minimal_lofi():
    """Generates a chill 85 BPM Lo-Fi Rhodes keyboard beat with vinyl warmth."""
    total_samples = int(SAMPLE_RATE * DURATION)
    bpm = 85
    beat_sec = 60.0 / bpm

    left = np.zeros(total_samples)
    right = np.zeros(total_samples)

    chords = [
        [146.83, 174.61, 220.00, 261.63], # Dm7
        [196.00, 246.94, 293.66, 349.23], # G7
        [130.81, 164.81, 196.00, 246.94], # Cmaj7
        [220.00, 277.18, 329.63, 392.00]  # A7
    ]

    for chord_idx, chord in enumerate(chords * 8):
        chord_start = chord_idx * 4 * beat_sec
        for strum_beat in [0.0, 2.5]:
            start_idx = int((chord_start + strum_beat * beat_sec) * SAMPLE_RATE)
            dur = int(2.2 * SAMPLE_RATE)
            if start_idx + dur < total_samples:
                st = np.linspace(0, 2.2, dur, endpoint=False)
                sig = np.zeros(dur)
                for f in chord:
                    sig += (np.sin(2 * np.pi * f * st) + 0.3 * np.sin(2 * np.pi * f * 2.0 * st)) * np.exp(-st * 2.2) * 0.18
                left[start_idx:start_idx+dur] += sig * 0.35
                right[start_idx:start_idx+dur] += sig * 0.35

    vinyl = np.random.uniform(-0.015, 0.015, total_samples)
    left += vinyl
    right += vinyl

    stereo = np.column_stack((left, right))
    wav_path = os.path.join(BGM_DIR, 'minimal_lofi.wav')
    mp3_path = os.path.join(BGM_DIR, 'minimal_lofi.mp3')
    save_wav_and_convert_mp3(stereo, wav_path, mp3_path)

if __name__ == '__main__':
    print("[*] Generating studio BGM library...")
    generate_energetic_tech()
    generate_corporate_tech()
    generate_minimal_lofi()
    print("[+] All BGM tracks generated successfully in assets/audio/bgm/")
