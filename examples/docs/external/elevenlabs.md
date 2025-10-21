# ElevenLabs API Reference

## Overview

ElevenLabs provides AI-powered audio generation and analysis capabilities through their comprehensive API. This document covers the key features, endpoints, and best practices for implementing ElevenLabs services.

**Base URL**: `https://api.elevenlabs.io/v1`

## Authentication

All API requests require authentication using an API key in the `xi-api-key` header.

```bash
curl 'https://api.elevenlabs.io/v1/models' \
  -H 'Content-Type: application/json' \
  -H 'xi-api-key: YOUR_API_KEY'
```

### API Key Management

- **Security**: Never share API keys or expose them in client-side code
- **Scoping**: Keys can be restricted to specific endpoints
- **Quotas**: Character limits and credit quotas can be set per key
- **Best Practices**:
  - Store keys in environment variables
  - Rotate keys regularly
  - Implement rate limiting to prevent abuse

## Models (2025)

### Text-to-Speech Models

#### Eleven v3 (Alpha)
- **Features**: Most advanced speech synthesis model with 70+ language support
- **Use Cases**: Character discussions, audiobook production, high emotional range content
- **Characteristics**: Excellent contextual understanding and emotional range

#### Flash v2.5
- **Features**: Ultra-low latency (~75ms), supports 32 languages
- **Use Cases**: Real-time applications, voice agents, chatbots
- **Languages**: Includes Hungarian, Norwegian, Vietnamese + all v2 languages
- **Character Limit**: 3,000 characters

#### Turbo v2.5
- **Features**: High-quality, low-latency model
- **Use Cases**: Balance between quality and speed requirements
- **Characteristics**: Good middle ground between Flash and Multilingual models

#### Multilingual v2
- **Features**: Supports 29 languages with consistent voice quality
- **Use Cases**: Character voiceovers, professional content, cross-language consistency
- **Characteristics**: Maintains voice personality across language switches
- **Character Limit**: Up to 40,000 characters

### Speech-to-Text Model

#### Scribe v1
- **Features**: State-of-the-art speech recognition across 99 languages
- **Capabilities**:
  - Precise word-level timestamps
  - Speaker diarization (up to 32 speakers)
  - Dynamic audio tagging
  - Audio event detection (laughter, applause, etc.)
- **Use Cases**: Transcription services, meeting documentation, content analysis
- **File Support**: Audio and video files up to 3GB

### Music Generation

#### Eleven Music
- **Features**: Studio-grade music generation with multilingual support
- **Capabilities**: Complete control over genre, style, and structure

### Important Deprecation Notice

**v1 TTS models** (eleven_monolingual_v1, eleven_multilingual_v1) are deprecated and will be **removed December 15, 2025**. Migrate to newer models immediately.

## Text-to-Speech API

### Endpoint
```
POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
```

### Required Headers
- `xi-api-key`: Your API key
- `Content-Type`: application/json

### Path Parameters
- `voice_id`: Unique identifier for the chosen voice (get from `/v1/voices` endpoint)

### Query Parameters
- `enable_logging` (boolean): Toggle request history tracking (Enterprise can disable for privacy)
- `optimize_streaming_latency` (integer): Latency optimization (0-4 scale)
- `output_format` (string): Audio codec/quality options

### Request Body
```json
{
  "text": "Your text to convert to speech",
  "model_id": "eleven_multilingual_v2",
  "voice_settings": {
    "stability": 0.5,
    "similarity_boost": 0.5
  }
}
```

#### Required Fields
- `text`: Input text to convert

#### Optional Fields
- `model_id`: Speech generation model (defaults to eleven_multilingual_v2)
- `voice_settings`: Fine-tune voice characteristics

### Output Formats
Available formats with codec_sample_rate_bitrate notation:
- **MP3**: `mp3_22050_32`, `mp3_44100_64`, `mp3_44100_96`, `mp3_44100_128`, `mp3_44100_192`
- **PCM**: `pcm_16000`, `pcm_22050`, `pcm_24000`, `pcm_44100` (16-bit signed little-endian)
- **μ-law**: `ulaw_8000` (for Twilio compatibility)

### Response
- **200**: Generated audio file (binary)
- **422**: Validation error

### Text Normalization
- **Flash v2.5**: Normalization disabled by default for low latency
- **Enterprise**: Can enable normalization with `apply_text_normalization: "on"`
- **Turbo v2.5 & Flash v2.5**: Text normalization only available with Enterprise plans

## Speech-to-Text API

### Endpoint
```
POST https://api.elevenlabs.io/v1/speech-to-text
```

### Headers
- `xi-api-key`: Your API key
- `Content-Type`: multipart/form-data

### Parameters

#### Required
- `file`: Audio/video file to transcribe (max 3GB)

#### Optional
- `model_id`: Transcription model (defaults to Scribe v1)
- `language_code`: Audio language specification
- `tag_audio_events` (boolean): Include audio event markers (laughter, applause)
- `num_speakers` (integer): Expected number of speakers
- `timestamps_granularity`: Detail level (`none`, `word`, `character`)
- `diarize` (boolean): Enable speaker identification
- `use_multi_channel` (boolean): Transcribe multiple audio channels separately

### Response Formats
- **Standard**: Single transcript with optional timestamps and speaker labels
- **Multi-channel**: Separate transcripts for each audio channel
- **Export formats**: JSON, DOCX, PDF, TXT, HTML, SRT

### Capabilities
- **Languages**: 99 languages supported
- **Speakers**: Up to 32 speakers with diarization
- **Timestamps**: Word-level or character-level precision
- **Audio Events**: Detection of non-speech sounds
- **Multi-channel**: Separate processing of stereo/multi-channel audio

## Voice Management

### List Voices
```
GET https://api.elevenlabs.io/v1/voices
```

Returns all available voices with their IDs, names, and characteristics.

### Voice Selection
- **3,000+ voices** available across 32 languages
- Each voice has unique characteristics and language support
- Voice IDs are required for text-to-speech conversion

## Rate Limits & Usage

### Concurrency Limits
- **Non-Enterprise**: Standard concurrency limits apply
- **Enterprise**: No concurrent request limits
- **Burst Pricing**: Up to 3x normal concurrency during high demand (charged at 2x rate)
- **Burst Maximum**: 300 concurrent requests for non-enterprise

### Character Limits
- **API Keys**: Can have monthly character limits
- **Model Limits**: Vary by model (3,000-40,000 characters per request)
- **Enterprise**: Custom limits available

### Privacy Mode
- **Full Privacy**: Available for Enterprise customers when `enable_logging: false`
- **Standard**: Request logging enabled by default

## Error Handling

### Common Status Codes
- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized (invalid API key)
- **422**: Validation Error
- **429**: Rate Limit Exceeded
- **500**: Internal Server Error

### Best Practices
- Implement exponential backoff for rate limiting
- Validate input parameters before requests
- Handle audio format compatibility issues
- Monitor API key usage and quotas

## SDK Support

### Official Libraries
- **Python**: `pip install elevenlabs`
- **Node.js**: `npm install @elevenlabs/elevenlabs-js`
- **Other**: Go, Ruby, Java, PHP, C#, Swift, TypeScript

### Python Example
```python
from elevenlabs.client import ElevenLabs

client = ElevenLabs(api_key='YOUR_API_KEY')

# Text to Speech
audio = client.generate(
    text="Hello, world!",
    voice="Rachel",
    model="eleven_multilingual_v2"
)
```

### Node.js Example
```javascript
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const client = new ElevenLabsClient({
  apiKey: 'YOUR_API_KEY',
});

// Text to Speech
const audio = await client.generate({
  text: "Hello, world!",
  voice: "Rachel",
  model_id: "eleven_multilingual_v2"
});
```

## Real-time & Streaming

### WebSocket Support
- Available for real-time text-to-speech
- Optimized for conversational AI and live applications
- Supports streaming audio output

### Latency Optimization
- **Flash v2.5**: ~75ms latency for real-time applications
- **Streaming**: Optimized parameters available
- **Buffering**: Configurable latency vs quality trade-offs

## 2025 Updates & Features

### Recent Improvements
- **April 2025**: Enhanced Scribe v1 with improved multi-language performance and reduced hallucinations
- **June 2025**: Burst pricing implementation for automatic concurrency scaling
- **March 2025**: Scribe pricing reduction and improved Voice Activity Detection

### Upcoming Changes
- **December 15, 2025**: Complete removal of v1 TTS models (migration required)

### New Features
- **Workflow Expressions**: Complex conditional logic for deterministic workflows
- **Audio Alignment Data**: Synchronization data for lip-sync applications
- **Enhanced Models**: Support for Gemini 2.5 Flash and Claude Sonnet 4.5

## Compliance & Security

### Security Features
- **SOC2 Compliance**: Enterprise-grade security standards
- **GDPR Compliance**: European data protection compliance
- **End-to-end Encryption**: Secure data transmission
- **No-retention Mode**: Optional for Enterprise customers

### Data Handling
- **Logging**: Configurable request history tracking
- **Storage**: Optional data retention policies
- **Privacy**: Full privacy mode for sensitive applications

## Implementation Guidelines

### Model Selection
- **Quality Priority**: Multilingual v2
- **Latency Priority**: Flash v2.5
- **Balanced**: Turbo v2.5
- **Advanced Features**: Eleven v3 (Alpha)

### Performance Optimization
- Use appropriate output formats for your use case
- Implement caching for repeated text-to-speech requests
- Choose optimal model based on quality vs speed requirements
- Consider multi-channel processing for complex audio analysis

### Error Recovery
- Implement retry logic with exponential backoff
- Handle model deprecation gracefully
- Monitor API status and changelog for updates
- Validate audio formats before processing

This reference provides comprehensive coverage of ElevenLabs API capabilities as of October 2025. For the latest updates, consult the official documentation at https://elevenlabs.io/docs/.