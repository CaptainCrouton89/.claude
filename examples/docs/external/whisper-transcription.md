# OpenAI Whisper Transcription Documentation

**Tool:** OpenAI Whisper
**Official Repo:** https://github.com/openai/whisper
**Last Updated:** 2025-10-14

## Overview

Whisper is OpenAI's robust speech recognition system trained on 680,000 hours of multilingual data. It provides state-of-the-art transcription accuracy across 99 languages with strong performance in noisy environments.

## Model Architecture

**Type:** Encoder-decoder Transformer
**Input:** 30-second audio chunks converted to log-Mel spectrograms
**Output:** Transcribed text with optional timestamps

## Available Models

### Model Sizes

| Model | Parameters | English-only | Multilingual | VRAM | Relative Speed |
|-------|-----------|--------------|--------------|------|----------------|
| tiny | 39M | ✓ | ✓ | ~1 GB | ~32x |
| base | 74M | ✓ | ✓ | ~1 GB | ~16x |
| small | 244M | ✓ | ✓ | ~2 GB | ~6x |
| medium | 769M | ✓ | ✓ | ~5 GB | ~2x |
| large | 1550M | - | ✓ | ~10 GB | 1x |
| turbo | 809M | - | ✓ | ~6 GB | ~8x |

### Latest Models (2025)

**turbo (Recommended):**
- Optimized version of large-v3
- Faster transcription
- Minimal accuracy degradation
- Best balance of speed and quality

**large-v3:**
- Most accurate model
- Multilingual only
- Higher VRAM requirement
- Slower but best quality

## Installation

### Python Package

```bash
pip install openai-whisper
```

**With advanced features:**
```bash
pip install openai-whisper[complete]
```

### FFmpeg Required

```bash
brew install ffmpeg
```

## Command Line Usage

### Basic Transcription

```bash
whisper audio.mp3
```

**Specify model:**
```bash
whisper audio.mp3 --model turbo
```

**Output formats:**
```bash
whisper audio.mp3 --output_format json
whisper audio.mp3 --output_format srt
whisper audio.mp3 --output_format vtt
whisper audio.mp3 --output_format txt
```

**All formats at once:**
```bash
whisper audio.mp3 --output_format all
```

### Language Options

**Auto-detect (default):**
```bash
whisper audio.mp3
```

**Specify language:**
```bash
whisper audio.mp3 --language en
whisper audio.mp3 --language es
whisper audio.mp3 --language zh
```

**English-only model:**
```bash
whisper audio.mp3 --model medium.en
```

### Translation to English

```bash
whisper audio.mp3 --task translate
```

### Advanced Options

**With timestamps:**
```bash
whisper audio.mp3 --verbose True
```

**Word-level timestamps:**
```bash
whisper audio.mp3 --word_timestamps True
```

**Custom output directory:**
```bash
whisper audio.mp3 --output_dir transcripts/
```

**Device selection:**
```bash
whisper audio.mp3 --device cuda
whisper audio.mp3 --device cpu
```

## Python API

### Basic Usage

```python
import whisper

model = whisper.load_model("turbo")

result = model.transcribe("audio.mp3")

print(result["text"])
```

### With Options

```python
import whisper

model = whisper.load_model("turbo")

result = model.transcribe(
    "audio.mp3",
    language="en",
    task="transcribe",
    temperature=0.0,
    word_timestamps=True,
    verbose=True
)

print(result["text"])
print(result["segments"])
```

### Extract Detailed Information

```python
import whisper

model = whisper.load_model("turbo")
result = model.transcribe("audio.mp3", word_timestamps=True)

for segment in result["segments"]:
    start = segment["start"]
    end = segment["end"]
    text = segment["text"]

    print(f"[{start:.2f}s - {end:.2f}s]: {text}")

    if "words" in segment:
        for word in segment["words"]:
            word_start = word["start"]
            word_end = word["end"]
            word_text = word["word"]
            print(f"  {word_text}: {word_start:.2f}s - {word_end:.2f}s")
```

### Process Multiple Files

```python
import whisper
from pathlib import Path

model = whisper.load_model("turbo")

audio_files = Path("audio_files").glob("*.mp3")

for audio_file in audio_files:
    print(f"Processing {audio_file.name}...")

    result = model.transcribe(str(audio_file))

    output_file = audio_file.with_suffix(".txt")
    output_file.write_text(result["text"])

    print(f"Saved to {output_file}")
```

## Language Support

### Supported Languages (99 total)

**Major Languages:**
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Dutch (nl)
- Russian (ru)
- Chinese (zh)
- Japanese (ja)
- Korean (ko)
- Arabic (ar)
- Hindi (hi)
- Turkish (tr)
- Polish (pl)
- Ukrainian (uk)
- Vietnamese (vi)
- Indonesian (id)
- Thai (th)
- And 80+ more...

### Language Detection

```python
import whisper

model = whisper.load_model("turbo")

audio = whisper.load_audio("audio.mp3")
audio = whisper.pad_or_trim(audio)

mel = whisper.log_mel_spectrogram(audio).to(model.device)

_, probs = model.detect_language(mel)
detected_language = max(probs, key=probs.get)

print(f"Detected language: {detected_language}")
```

## Output Formats

### JSON Format

```json
{
  "text": "Full transcription text",
  "segments": [
    {
      "id": 0,
      "seek": 0,
      "start": 0.0,
      "end": 5.0,
      "text": " Segment text",
      "tokens": [1, 2, 3],
      "temperature": 0.0,
      "avg_logprob": -0.5,
      "compression_ratio": 1.5,
      "no_speech_prob": 0.01
    }
  ],
  "language": "en"
}
```

### SRT Format (Subtitles)

```
1
00:00:00,000 --> 00:00:05,000
First subtitle line

2
00:00:05,000 --> 00:00:10,000
Second subtitle line
```

### VTT Format (WebVTT)

```
WEBVTT

00:00:00.000 --> 00:00:05.000
First subtitle line

00:00:05.000 --> 00:00:10.000
Second subtitle line
```

### Plain Text

```
Complete transcription as plain text with no timestamps.
```

## OpenAI API Access

### API Endpoint

```
POST https://api.openai.com/v1/audio/transcriptions
```

### Python Client

```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

with open("audio.mp3", "rb") as audio_file:
    transcript = client.audio.transcriptions.create(
        model="whisper-1",
        file=audio_file,
        response_format="json"
    )

print(transcript.text)
```

### With Timestamps

```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

with open("audio.mp3", "rb") as audio_file:
    transcript = client.audio.transcriptions.create(
        model="whisper-1",
        file=audio_file,
        response_format="verbose_json",
        timestamp_granularities=["word", "segment"]
    )

for segment in transcript.segments:
    print(f"[{segment.start}s - {segment.end}s]: {segment.text}")
```

### Translation to English

```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

with open("audio_spanish.mp3", "rb") as audio_file:
    translation = client.audio.translations.create(
        model="whisper-1",
        file=audio_file
    )

print(translation.text)
```

## Azure OpenAI Integration

### Availability (2025)

**Azure OpenAI Regions:**
- East US 2
- India South
- North Central US
- Norway East
- Sweden Central
- Switzerland North
- West Europe

**Azure AI Speech Regions:**
- Australia East
- East US
- North Central US
- South Central US
- Southeast Asia
- West Europe

### Azure Python Client

```python
from azure.ai.openai import OpenAIClient
from azure.identity import DefaultAzureCredential

client = OpenAIClient(
    endpoint="https://your-resource.openai.azure.com/",
    credential=DefaultAzureCredential()
)

with open("audio.mp3", "rb") as audio_file:
    result = client.audio.transcribe(
        file=audio_file,
        model="whisper"
    )

print(result.text)
```

## Advanced Features

### Speaker Diarization

**Note:** Whisper doesn't natively support speaker diarization. Combine with other tools:

```python
import whisper
from pyannote.audio import Pipeline

whisper_model = whisper.load_model("turbo")
diarization = Pipeline.from_pretrained("pyannote/speaker-diarization")

transcript = whisper_model.transcribe("audio.mp3", word_timestamps=True)

diarization_result = diarization("audio.mp3")

for turn, _, speaker in diarization_result.itertracks(yield_label=True):
    print(f"Speaker {speaker}: {turn.start:.1f}s - {turn.end:.1f}s")
```

### Noise Handling

Whisper is trained to handle noisy audio, but preprocessing can help:

```python
import whisper
from pydub import AudioSegment
from pydub.effects import normalize

audio = AudioSegment.from_mp3("noisy_audio.mp3")

normalized = normalize(audio)
normalized.export("clean_audio.mp3", format="mp3")

model = whisper.load_model("turbo")
result = model.transcribe("clean_audio.mp3")
```

### Long Audio Files

For files >30 minutes, process in chunks:

```python
import whisper
from pydub import AudioSegment

model = whisper.load_model("turbo")

audio = AudioSegment.from_mp3("long_audio.mp3")

chunk_length_ms = 10 * 60 * 1000
chunks = [audio[i:i + chunk_length_ms] for i in range(0, len(audio), chunk_length_ms)]

full_transcript = ""

for i, chunk in enumerate(chunks):
    chunk.export(f"chunk_{i}.mp3", format="mp3")

    result = model.transcribe(f"chunk_{i}.mp3")
    full_transcript += result["text"] + " "

    print(f"Processed chunk {i+1}/{len(chunks)}")

print(full_transcript)
```

## Performance Optimization

### GPU Acceleration

**CUDA (NVIDIA):**
```python
import whisper

model = whisper.load_model("turbo", device="cuda")
result = model.transcribe("audio.mp3")
```

**Check GPU usage:**
```python
import torch

print(f"CUDA available: {torch.cuda.is_available()}")
print(f"GPU count: {torch.cuda.device_count()}")
```

### Batch Processing

```python
import whisper
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

model = whisper.load_model("turbo")

def transcribe_file(audio_path):
    result = model.transcribe(str(audio_path))
    output_path = audio_path.with_suffix(".txt")
    output_path.write_text(result["text"])
    return f"Completed: {audio_path.name}"

audio_files = list(Path("audio").glob("*.mp3"))

with ThreadPoolExecutor(max_workers=4) as executor:
    results = executor.map(transcribe_file, audio_files)
    for result in results:
        print(result)
```

## OpenAI API Pricing (2025)

**Whisper API:**
- $0.006 per minute (as of 2025)
- Charged per audio minute
- No subscription required
- Pay-as-you-go

**Example costs:**
- 1 hour: $0.36
- 10 hours: $3.60
- 100 hours: $36.00

## Best Practices

### Model Selection
1. Use **turbo** for best speed/quality balance
2. Use **large-v3** for maximum accuracy
3. Use **small** or **medium** for resource-constrained environments
4. Use English-only models (*.en) for English audio

### Accuracy Optimization
1. Preprocess audio to reduce noise
2. Specify language when known
3. Use word timestamps for precise timing
4. Set temperature=0 for consistent results
5. Normalize audio levels

### Performance
1. Use GPU acceleration when available
2. Process long files in chunks
3. Batch process multiple files
4. Use appropriate model size
5. Cache model loading

### Integration
1. Store API keys securely
2. Handle rate limits
3. Implement retry logic
4. Validate audio formats
5. Save results incrementally

## Resources

- GitHub Repository: https://github.com/openai/whisper
- OpenAI API Docs: https://platform.openai.com/docs/guides/speech-to-text
- Model Card: https://github.com/openai/whisper/blob/main/model-card.md
- Paper: "Robust Speech Recognition via Large-Scale Weak Supervision"

## Integration Notes

### For Video Recreation Project

**Audio Transcription:**
- Extract audio from video with FFmpeg
- Transcribe using Whisper turbo model
- Generate word-level timestamps
- Extract dialogue timing
- Identify speech segments
- Detect language automatically

**Metadata Generation:**
- Include transcription in video metadata JSON
- Word-level timing for synchronization
- Speaker segments (with additional tools)
- Language detection results
- Confidence scores per segment

**Recreation Workflow:**
- Transcribe original video audio
- Use transcription for voiceover generation
- Match timing with original
- Regenerate audio with ElevenLabs
- Sync with recreated video
