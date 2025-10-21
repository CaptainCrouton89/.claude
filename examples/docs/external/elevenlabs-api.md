# ElevenLabs API Documentation

**Official Docs:** https://elevenlabs.io/docs
**Last Updated:** 2025-10-14

## Overview

ElevenLabs provides state-of-the-art AI audio APIs for:
- Text-to-Speech (TTS) generation
- Speech-to-Text (STT) transcription
- Multi-language support (32 languages for TTS, 99 for STT)
- Voice cloning and customization

## Authentication

**API Key Required:**
- Create in ElevenLabs dashboard
- Pass via header: `xi-api-key: YOUR_API_KEY`
- Store as managed secret (do NOT commit to git)

## Text-to-Speech API

### Endpoint

```
POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
```

### Models

#### Eleven v3 (Recommended)
- Latest and most advanced
- Natural, life-like speech
- High emotional range
- Contextual understanding
- Multi-language support

#### Eleven Turbo v2.5
- High quality with low latency
- Good balance of quality and speed
- Ideal for most applications

#### Eleven Flash v2.5
- Optimized for lowest latency
- Real-time applications
- Slightly lower quality vs Turbo

#### Deprecated Models (Remove by Dec 15, 2025)
- ⚠️ eleven_monolingual_v1
- ⚠️ eleven_multilingual_v1

### Request Parameters

#### Path Parameter
- `voice_id` (required): Identifies specific voice

#### Query Parameters
- `enable_logging`: Boolean to control request logging
- `optimize_streaming_latency`: Integer (0-4) for latency optimization
- `output_format`: Audio format specification

#### Request Body

```json
{
  "text": "string (required)",
  "model_id": "eleven_multilingual_v2",
  "voice_settings": {
    "stability": 0.5,
    "similarity_boost": 0.75
  }
}
```

### Output Formats

**MP3 Formats:**
- `mp3_22050_32` - 22.05kHz, 32kbps
- `mp3_44100_64` - 44.1kHz, 64kbps
- `mp3_44100_96` - 44.1kHz, 96kbps
- `mp3_44100_128` - 44.1kHz, 128kbps (default)
- `mp3_44100_192` - 44.1kHz, 192kbps

**PCM Formats:**
- `pcm_16000` - 16kHz
- `pcm_22050` - 22.05kHz
- `pcm_24000` - 24kHz
- `pcm_44100` - 44.1kHz
- `pcm_48000` - 48kHz

**Specialty Formats:**
- `ulaw_8000` - μ-law encoding
- `opus_16000` - Opus codec
- `opus_22050`
- `opus_24000`

### Language Support

**32 Languages Supported:**
English, Spanish, French, German, Italian, Portuguese, Polish, Dutch, Chinese, Japanese, Korean, Arabic, Hindi, and more.

### Performance

- Low latency: ~250-300ms
- 50% lower price per character
- 40,000 character limit per request

### Code Example

```python
import requests

url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
headers = {
    "xi-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json"
}

data = {
    "text": "Hello, this is a test of ElevenLabs text to speech.",
    "model_id": "eleven_multilingual_v2",
    "voice_settings": {
        "stability": 0.5,
        "similarity_boost": 0.75
    }
}

response = requests.post(url, json=data, headers=headers)

with open("output.mp3", "wb") as f:
    f.write(response.content)
```

## Speech-to-Text API

### Endpoint

```
POST https://api.elevenlabs.io/v1/speech-to-text
```

### Model

**Scribe v1:**
- State-of-the-art accuracy
- 99 languages supported
- Multiple voice styles
- Up to 32 speakers
- Audio and video files
- Files up to 3 GB
- Duration up to 10 hours

### Request Parameters

#### Mandatory
- `file`: Audio/video file to transcribe

#### Optional Parameters

```json
{
  "model_id": "scribe-v1",
  "language_code": "en",
  "tag_audio_events": false,
  "num_speakers": 2,
  "timestamps_granularity": "word",
  "diarize": true,
  "use_multi_channel": false,
  "additional_formats": ["srt", "json", "txt"]
}
```

**Parameter Details:**
- `language_code`: Specify audio language (auto-detect if omitted)
- `tag_audio_events`: Include laughter, applause, non-speech sounds
- `num_speakers`: Expected number of speakers (up to 32)
- `timestamps_granularity`: "none", "word", or "character"
- `diarize`: Enable speaker identification (threshold 0.1-0.4)
- `use_multi_channel`: Transcribe channels independently (up to 5)
- `additional_formats`: Export formats beyond default JSON

### Multichannel STT

**Feature:** Process up to 5 channels independently
- Each channel assigned speaker ID by channel number
- Useful for multi-track recordings
- Professional audio production workflows

### Webhook Support

**Asynchronous Processing:**
- Set `webhook: true` in request
- Request returns early
- Results delivered via configured webhook
- Ideal for long files (up to 10 hours)

### Cloud Storage URLs

**Supported:**
- AWS S3
- Google Cloud Storage
- Cloudflare R2
- CDNs
- Any HTTPS source
- Use pre-signed URLs or auth tokens

### Export Formats

- **JSON:** Segmented with timestamps
- **DOCX:** Microsoft Word document
- **PDF:** Portable Document Format
- **TXT:** Plain text
- **HTML:** Web-ready format
- **SRT:** Subtitle format

### Code Example

```python
import requests

url = "https://api.elevenlabs.io/v1/speech-to-text"
headers = {
    "xi-api-key": "YOUR_API_KEY"
}

files = {
    "file": open("audio.mp3", "rb")
}

data = {
    "model_id": "scribe-v1",
    "language_code": "en",
    "diarize": True,
    "num_speakers": 2,
    "timestamps_granularity": "word",
    "additional_formats": ["srt", "txt"]
}

response = requests.post(url, headers=headers, files=files, data=data)
result = response.json()

print(result["text"])
print(result["segments"])
```

## Features for Enterprise

### Text Normalization
- Modes: 'auto', 'on', 'off'
- Auto mode: System decides
- Available for Turbo v2.5 and Flash v2.5
- **Requires Enterprise plan**

### Deterministic Generation
- Use seed values for reproducible results
- Integer between 0 and 4294967295
- Same seed + prompt = same output

### Zero Retention Mode
- Available for enterprise customers
- Set `enable_logging: false`
- No log or transcript storage
- HIPAA compliance available (requires BAA)

### HIPAA Compliance
- Contact Sales for Business Associate Agreement (BAA)
- Required before HIPAA-related integrations
- Enterprise feature only

## Pricing

**Text-to-Speech:**
- Starting at $0.30 per 1,000 characters
- Volume discounts available
- Enterprise: Custom pricing

**Speech-to-Text:**
- Starting at $0.10 per minute
- Volume discounts available
- Enterprise: Custom pricing

**Subscription Tiers:**
- Free: Limited usage
- Creator: Enhanced features
- Pro: Professional features
- Enterprise: Custom solutions

## Rate Limits

Varies by subscription tier:
- Free: Low limits for testing
- Creator: Moderate limits
- Pro: High limits
- Enterprise: Custom limits

## Best Practices

### Text-to-Speech
1. Use Eleven v3 for best quality
2. Use Turbo v2.5 for balance
3. Use Flash v2.5 for real-time
4. Migrate from deprecated models
5. Store API keys securely
6. Use appropriate output format

### Speech-to-Text
1. Use webhook for files >1 hour
2. Enable diarization for multi-speaker
3. Specify language when known
4. Use multichannel for pro audio
5. Export multiple formats as needed
6. Consider cloud storage URLs

## SDKs and Languages

**Official SDKs:**
- Python
- JavaScript/TypeScript
- Go
- Ruby
- Java
- PHP
- C#
- Swift

## Resources

- Documentation: https://elevenlabs.io/docs
- API Reference: https://elevenlabs.io/docs/api-reference
- Dashboard: https://elevenlabs.io/app
- Support: https://elevenlabs.io/support

## Integration Notes

### For Video Recreation Project

**Audio Generation:**
- Generate voiceovers from metadata
- Match voice characteristics
- Sync with video timing
- Multi-language support

**Audio Analysis:**
- Transcribe existing audio
- Speaker identification
- Extract dialogue timing
- Generate audio metadata
