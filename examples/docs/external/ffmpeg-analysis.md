# FFmpeg Video Analysis Documentation

**Tool:** FFmpeg & FFprobe
**Official Docs:** https://ffmpeg.org/documentation.html
**Last Updated:** 2025-10-14

## Overview

FFmpeg is a comprehensive suite of tools for handling video, audio, and multimedia data. FFprobe is the companion tool for analyzing and inspecting multimedia files without modification.

## Core Tools

### FFmpeg
- Video/audio encoding and decoding
- Format conversion
- Stream manipulation
- Filtering and effects
- Metadata modification

### FFprobe
- Media file analysis
- Metadata extraction
- Stream inspection
- Frame-by-frame analysis
- Format detection

## Installation

### macOS
```bash
brew install ffmpeg
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install ffmpeg
```

### Verify Installation
```bash
ffmpeg -version
ffprobe -version
```

## FFprobe: Media Analysis

### Basic Information

**Get all information:**
```bash
ffprobe -i video.mp4
```

**Quiet output (suppress logs):**
```bash
ffprobe -v quiet -i video.mp4
```

### JSON Output

**Complete media information:**
```bash
ffprobe -v quiet -print_format json -show_format -show_streams video.mp4
```

**Save to file:**
```bash
ffprobe -v quiet -print_format json -show_format -show_streams video.mp4 > metadata.json
```

**Compact output:**
```bash
ffprobe -v quiet -print_format json -show_format -show_streams video.mp4 | jq -c
```

### Stream Analysis

**Video streams only:**
```bash
ffprobe -v quiet -select_streams v:0 -show_entries stream -of json video.mp4
```

**Audio streams only:**
```bash
ffprobe -v quiet -select_streams a:0 -show_entries stream -of json video.mp4
```

**All streams:**
```bash
ffprobe -v quiet -show_streams -of json video.mp4
```

### Format Information

**Format details:**
```bash
ffprobe -v quiet -show_format -of json video.mp4
```

**Duration:**
```bash
ffprobe -v quiet -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 video.mp4
```

**Bit rate:**
```bash
ffprobe -v quiet -show_entries format=bit_rate -of default=noprint_wrappers=1:nokey=1 video.mp4
```

### Frame Analysis

**Frame-by-frame breakdown:**
```bash
ffprobe -v quiet -show_frames -of json video.mp4
```

**Keyframes only:**
```bash
ffprobe -v quiet -select_streams v:0 -show_frames -show_entries frame=key_frame,pkt_pts_time -of json video.mp4 | jq '.frames[] | select(.key_frame==1)'
```

**Frame count:**
```bash
ffprobe -v quiet -count_frames -show_entries stream=nb_read_frames -of default=noprint_wrappers=1:nokey=1 video.mp4
```

### Metadata Extraction

**All metadata tags:**
```bash
ffprobe -v quiet -show_entries format_tags -of json video.mp4
```

**Stream-specific metadata:**
```bash
ffprobe -v quiet -show_entries stream_tags:format_tags -of json video.mp4
```

**Export to text file:**
```bash
ffmpeg -i video.mp4 -c copy -map_metadata 0 -f ffmetadata metadata.txt
```

## FFmpeg: Audio Extraction

### Extract Audio Track

**Copy audio codec (no re-encoding):**
```bash
ffmpeg -i video.mp4 -vn -acodec copy audio.aac
```

**Convert to MP3:**
```bash
ffmpeg -i video.mp4 -vn -acodec libmp3lame -q:a 2 audio.mp3
```

**Convert to WAV:**
```bash
ffmpeg -i video.mp4 -vn -acodec pcm_s16le audio.wav
```

**Extract specific audio stream:**
```bash
ffmpeg -i video.mp4 -map 0:a:0 -acodec copy audio.aac
```

### Extract Multiple Audio Tracks

```bash
ffmpeg -i video.mp4 -map 0:a:0 audio_track1.aac -map 0:a:1 audio_track2.aac
```

## Frame Extraction

### Extract All Frames

```bash
ffmpeg -i video.mp4 frames/frame_%04d.png
```

### Extract at Specific FPS

**1 frame per second:**
```bash
ffmpeg -i video.mp4 -vf fps=1 frames/frame_%04d.png
```

**Custom FPS:**
```bash
ffmpeg -i video.mp4 -vf fps=0.5 frames/frame_%04d.png
```

### Extract Keyframes Only

```bash
ffmpeg -i video.mp4 -vf "select='eq(pict_type,I)'" -vsync vfr keyframes/frame_%04d.png
```

### Extract Specific Frame

**By timestamp:**
```bash
ffmpeg -ss 00:00:05 -i video.mp4 -vframes 1 frame_at_5s.png
```

**By frame number:**
```bash
ffmpeg -i video.mp4 -vf "select='eq(n,100)'" -vframes 1 frame_100.png
```

## Scene Detection

### Detect Scene Changes

**Using scene filter:**
```bash
ffmpeg -i video.mp4 -vf "select='gt(scene,0.4)',showinfo" -vsync vfr scenes/scene_%04d.png
```

**Get scene change timestamps:**
```bash
ffmpeg -i video.mp4 -vf "select='gt(scene,0.4)',showinfo" -f null - 2>&1 | grep showinfo
```

**Adjust sensitivity (0.0-1.0):**
```bash
ffmpeg -i video.mp4 -vf "select='gt(scene,0.3)',showinfo" -vsync vfr scenes/scene_%04d.png
```

## Resolution and Quality

### Get Resolution

```bash
ffprobe -v quiet -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 video.mp4
```

### Get Frame Rate

```bash
ffprobe -v quiet -select_streams v:0 -show_entries stream=r_frame_rate -of default=noprint_wrappers=1:nokey=1 video.mp4
```

### Get Codec Information

```bash
ffprobe -v quiet -select_streams v:0 -show_entries stream=codec_name,codec_long_name -of json video.mp4
```

## Thumbnail Generation

### Generate Thumbnails

**Single thumbnail at 5 seconds:**
```bash
ffmpeg -ss 00:00:05 -i video.mp4 -vframes 1 -q:v 2 thumbnail.jpg
```

**Multiple thumbnails at intervals:**
```bash
ffmpeg -i video.mp4 -vf fps=1/10 thumbnails/thumb_%04d.jpg
```

**Contact sheet (grid of thumbnails):**
```bash
ffmpeg -i video.mp4 -vf "select='not(mod(n,100))',tile=4x4" -frames:v 1 contact_sheet.png
```

## Output Formats

### JSON (Recommended for Parsing)

```bash
ffprobe -v quiet -print_format json -show_format -show_streams video.mp4
```

### XML

```bash
ffprobe -v quiet -print_format xml -show_format -show_streams video.mp4
```

### CSV

```bash
ffprobe -v quiet -print_format csv -show_format -show_streams video.mp4
```

### Plain Text

```bash
ffprobe -v quiet -print_format flat -show_format -show_streams video.mp4
```

## Advanced Use Cases

### Motion Detection Analysis

**Extract motion vectors:**
```bash
ffmpeg -flags2 +export_mvs -i video.mp4 -vf codecview=mv=pf+bf+bb motion_vectors.mp4
```

### Audio Waveform Extraction

**Generate waveform image:**
```bash
ffmpeg -i audio.mp3 -filter_complex "showwavespic=s=1920x1080" waveform.png
```

### Audio Spectrum Analysis

**Generate spectrum image:**
```bash
ffmpeg -i audio.mp3 -filter_complex "showspectrumpic=s=1920x1080" spectrum.png
```

### Video Segment Information

**Get segment timing:**
```bash
ffprobe -v quiet -show_packets -select_streams v -of json video.mp4
```

## Python Integration

### Using subprocess

```python
import subprocess
import json

def get_video_metadata(video_path):
    cmd = [
        'ffprobe',
        '-v', 'quiet',
        '-print_format', 'json',
        '-show_format',
        '-show_streams',
        video_path
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    return json.loads(result.stdout)

metadata = get_video_metadata('video.mp4')
print(f"Duration: {metadata['format']['duration']} seconds")
print(f"Resolution: {metadata['streams'][0]['width']}x{metadata['streams'][0]['height']}")
```

### Extract Frames

```python
import subprocess

def extract_frames(video_path, output_dir, fps=1):
    cmd = [
        'ffmpeg',
        '-i', video_path,
        '-vf', f'fps={fps}',
        f'{output_dir}/frame_%04d.png'
    ]

    subprocess.run(cmd, check=True)

extract_frames('video.mp4', 'frames', fps=1)
```

### Extract Audio

```python
import subprocess

def extract_audio(video_path, output_path, format='mp3'):
    cmd = [
        'ffmpeg',
        '-i', video_path,
        '-vn',
        '-acodec', 'libmp3lame' if format == 'mp3' else 'pcm_s16le',
        '-q:a', '2',
        output_path
    ]

    subprocess.run(cmd, check=True)

extract_audio('video.mp4', 'audio.mp3')
```

## Error Detection

### Verify File Integrity

```bash
ffmpeg -v error -i video.mp4 -f null - 2>error.log
```

### Check for Corrupted Frames

```bash
ffmpeg -v error -i video.mp4 -map 0:v:0 -f null - 2>&1 | grep -i error
```

## Performance Optimization

### Parallel Processing

**Use multiple threads:**
```bash
ffmpeg -threads 8 -i video.mp4 -vf fps=1 frames/frame_%04d.png
```

### Hardware Acceleration

**macOS (VideoToolbox):**
```bash
ffmpeg -hwaccel videotoolbox -i video.mp4 -vf fps=1 frames/frame_%04d.png
```

**NVIDIA GPU:**
```bash
ffmpeg -hwaccel cuda -i video.mp4 -vf fps=1 frames/frame_%04d.png
```

## Best Practices

### For Analysis
1. Use `-v quiet` to suppress unnecessary logs
2. Output to JSON for machine parsing
3. Use `-show_format` and `-show_streams` for complete info
4. Combine with `jq` for JSON filtering
5. Save results to files for reuse

### For Extraction
1. Use `-c copy` to avoid re-encoding when possible
2. Specify exact streams with `-map`
3. Use appropriate codecs for target format
4. Consider quality settings (-q:v, -q:a)
5. Test on small segments first

### Error Handling
1. Check exit codes in scripts
2. Validate input files before processing
3. Use `-v error` to detect issues
4. Implement retry logic for network sources
5. Log errors for debugging

## Resources

- Official Documentation: https://ffmpeg.org/documentation.html
- FFmpeg Wiki: https://trac.ffmpeg.org/wiki
- FFprobe Documentation: https://ffmpeg.org/ffprobe.html
- FFmpeg Filters: https://ffmpeg.org/ffmpeg-filters.html
- Formats Documentation: https://ffmpeg.org/ffmpeg-formats.html

## Integration Notes

### For Video Recreation Project

**Metadata Extraction:**
- Use FFprobe for comprehensive video metadata
- Extract format, codec, resolution, duration
- Frame-by-frame analysis for timing
- Audio stream information
- Scene change detection

**Frame Extraction:**
- Extract frames at regular intervals
- Identify keyframes
- Generate thumbnails
- Scene-based extraction

**Audio Processing:**
- Extract audio tracks
- Convert to analysis-friendly formats
- Generate waveforms
- Spectrum analysis

**Quality Analysis:**
- Verify file integrity
- Check for corruption
- Analyze bitrates
- Codec compatibility
