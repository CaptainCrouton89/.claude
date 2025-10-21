# External API Documentation

> **Last Updated:** 2025-10-14
> **Purpose:** LLM-optimized reference documentation for video analysis & recreation project

This directory contains comprehensive documentation for all external APIs used in the Video Analysis & Recreation Toolkit. Each document is optimized for LLM consumption, focusing on non-obvious constraints, API signatures, and practical usage patterns.

## 📚 Available Documentation

### [Replicate API](./replicate.md)
**Purpose:** Video generation, image-to-video, and audio processing
**Key Models:**
- Google Veo 3 (text-to-video with audio support)
- ByteDance Seedance-1-Pro (professional quality)
- Alibaba Wan 2.5 (latest Chinese video generation)
- Minimax Hailuo-02 (Chinese video model)

**Pricing:** Variable per model, official models have predictable pricing
**Rate Limits:** 600 requests/min for predictions, 3000/min for other endpoints
**Best For:** Production video generation with multiple model options

**Important Notes:**
- Huawei models are NOT available on Replicate (use Huawei Cloud instead)
- Video URLs expire after 1 hour (critical for webhooks)
- Async operations require polling or webhook handling

---

### [ElevenLabs API](./elevenlabs.md)
**Purpose:** Audio generation (TTS/voice cloning) and transcription (STT)
**Key Features:**
- Text-to-speech with 1,000+ voices in 32 languages
- Speech-to-text supporting 99 languages
- Real-time streaming via WebSocket
- Voice cloning and design capabilities

**Pricing:**
- Free tier: 10,000 characters/month
- Starter: $5/mo for 30,000 chars
- Creator: $22/mo for 100,000 chars
- Pro: $99/mo for 500,000 chars

**Rate Limits:**
- Free: 2 concurrent requests, 10,000 chars/day
- Paid tiers increase limits significantly

**Best For:** Video recreation audio generation and speech transcription

**Important Notes:**
- Audio files up to 3GB for transcription
- Webhook support for async processing
- Streaming reduces latency to ~250-300ms

---

### [Gemini API](./gemini.md)
**Purpose:** Video analysis and image generation
**Key Models:**
- Gemini 2.5 Pro (video analysis, up to 2-hour videos)
- Gemini 2.5 Flash Image / "Nano Banana" (image generation)
- Imagen 3 (high-quality image generation)

**Pricing:**
- Gemini 2.5 Pro: $0.011 per 1K tokens (input)
- Nano Banana: $30 per 1M tokens
- Imagen 3: $0.03 per image

**Rate Limits:**
- Free tier: 5 RPM, 25 requests/day
- Paid tiers scale with usage

**Best For:** Video content analysis and image generation for recreation

**Important Notes:**
- "Nano Banana" is Google's official nickname for their image generation model
- Video processing at 1 FPS (120 frames max for 2-hour video)
- YouTube URLs supported but limited to 8 hours/day on free tier
- English-only prompts for Imagen 3
- Mandatory SynthID watermarks on all generated images

---

### [Sora 2 (OpenAI)](./sora.md)
**Purpose:** High-quality video generation with native audio
**Status:** ⚠️ No public API yet (expected late October/November 2025)

**Current Access:** iOS app and web interface only
**Pricing (via subscription):**
- Free: Limited 480p with watermarks
- ChatGPT Plus ($20/mo): 50 videos/month at 720p, 5s max
- ChatGPT Pro ($200/mo): 500 priority videos at 1080p, 20s max

**Key Features:**
- Text-to-video and image-to-video generation
- Native audio generation (dialogue, SFX, ambient)
- Up to 1080p resolution (4K planned)
- Maximum 20-second clips per generation
- 2-5 minute generation time

**Best For:** High-quality video recreation when API launches

**Important Notes:**
- US/Canada only at launch
- Manual generation required until API releases
- No batch processing or video-to-video editing
- Physics struggles with complex interactions
- Character consistency issues in multi-character scenes

**For Your Project:** Documentation includes code patterns for future API integration with webhook-based async processing patterns ready for when API launches.

---

## 🎯 Quick Reference by Use Case

### Video Analysis
1. **Gemini 2.5 Pro** - Best for comprehensive video understanding (up to 2 hours)
   - Supports YouTube URLs, local files, multiple formats
   - 1 FPS processing rate
   - Multimodal prompts (text + image context)

### Video Generation
1. **Replicate (Google Veo 3)** - Best for production-ready T2V with audio
   - Up to 1080p, 5-10s clips
   - Native audio support
   - Camera movement control
2. **Replicate (Alibaba Wan 2.5)** - Latest Chinese model alternative
3. **Sora 2** - Highest quality, but no API yet (use web interface)

### Image Generation
1. **Gemini Nano Banana** - Fast, cost-effective ($30/1M tokens)
2. **Imagen 3** - Premium quality ($0.03/image)

### Audio Generation
1. **ElevenLabs TTS** - Best voice quality, 1,000+ voices
   - 32 languages, streaming support
   - Voice cloning available

### Audio Transcription
1. **ElevenLabs STT** - 99 languages, 3GB file limit
   - Speaker diarization
   - Webhook support for async processing

---

## 💡 Integration Patterns

### For 4-8 Second Clips (Primary Use Case)
```bash
# 1. Analyze video with Gemini
# 2. Extract audio, transcribe with ElevenLabs
# 3. Generate recreation with Replicate Veo 3
# 4. Generate audio with ElevenLabs TTS
# 5. Combine using ffmpeg
```

### For Full-Length Videos (Stitching Workflow)
```bash
# 1. Split video into 8-second segments
# 2. Analyze each segment with Gemini (parallel)
# 3. Generate each segment with Replicate (parallel/sequential)
# 4. Stitch with ffmpeg
```

### For Image-to-Video Recreation
```bash
# 1. Extract key frames from original
# 2. Generate similar images with Gemini/Imagen
# 3. Animate images with Replicate I2V models
# 4. Add audio with ElevenLabs
```

---

## 🚨 Critical Constraints

1. **Replicate webhook URLs expire after 1 hour** - Download immediately
2. **Gemini video processing is 1 FPS** - 2-hour video = 120 frames max
3. **Sora 2 has no API yet** - Manual generation only until late Oct/Nov 2025
4. **ElevenLabs free tier is 10K chars/month** - ~7-10 minutes of audio
5. **Imagen 3 requires English prompts** - Translate if needed
6. **All Gemini images have mandatory watermarks** - Cannot be disabled

---

## 📖 Document Structure

Each API documentation file follows this structure:
1. **Authentication** - Exact header formats, token setup
2. **Core Endpoints** - Request/response formats with examples
3. **Rate Limits & Pricing** - Current as of Oct 2025
4. **Code Examples** - Production-ready patterns
5. **Best Practices** - Error handling, optimization
6. **Non-Obvious Gotchas** - Critical constraints that cause errors

---

## 🔄 Maintenance

These documents were generated on **2025-10-14** using:
- WebSearch for latest official information
- WebFetch from official documentation sites
- Context7 for API reference details

**Update Frequency:** Check for updates quarterly or when:
- New models are released
- Pricing changes
- Rate limits change
- API breaking changes occur

---

## 🤖 For Claude Code / LLM Usage

These documents are optimized for:
- Quick reference lookup during code generation
- Non-obvious constraint awareness
- Production-ready code patterns
- Cost and performance optimization

When using these docs:
1. Search for specific model names or capabilities
2. Check "Important Notes" sections for gotchas
3. Use code examples as templates
4. Verify rate limits before parallel execution
5. Consider cost implications in pricing sections
