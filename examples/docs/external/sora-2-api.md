# OpenAI Sora 2 API Documentation

**Status:** Preview/Limited Access (October 2025)
**Official Docs:** https://platform.openai.com/docs/guides/video-generation
**Last Updated:** 2025-10-14

## Overview

Sora 2 is OpenAI's flagship text-to-video and audio generation system designed to produce short cinematic clips with synchronized dialogue, sound effects, persistent scene state, and improved physical realism. OpenAI considers this the "GPT-3.5 moment for video."

## Model Variants

### Sora 2
- **Focus:** Speed and flexibility
- **Use Case:** Rapid prototyping and experimentation
- **Max Resolution:** 1280x720 or 720x1280

### Sora 2 Pro
- **Focus:** Computational resources for refined details
- **Use Case:** High-quality production outputs
- **Max Resolution:** 1792x1024 or 1024x1792

## API Access

### Availability Status
- **Current Access:** Via sora.com and standalone iOS Sora app
- **API Status:** Planned but not broadly public yet (as of October 2025)
- **Future:** Will be available via OpenAI API

### Authentication
- Requires OpenAI account with paid tier (Tier 1 minimum)
- Free tiers do NOT support Sora models
- API key required (preview access requires approval)

## API Endpoints

### Primary Endpoint Family
```
POST /v1/videos
GET /v1/videos/{video_id}
GET /v1/videos
DELETE /v1/videos/{video_id}
```

## Request Parameters

### POST /v1/videos

```json
{
  "model": "sora-2",
  "prompt": "string",
  "size": "string",
  "seconds": "string"
}
```

**Parameters:**
- `model`: "sora-2" or "sora-2-pro"
- `prompt`: Text description of the video to generate
- `size`: Resolution string (e.g., "1280x720", "720x1280")
- `seconds`: Duration as string - "4", "8", or "12"

## Key Features

### Audio Generation
- Synchronized dialogue
- Sound effects that line up with on-screen action
- Audio generation integrated with video

### Physical Realism
- Markedly improved physical accuracy
- Persistent scene state
- Realistic motion and lighting

### Content Safety
- Rejects prompts involving real people
- No copyrighted content
- No inappropriate material
- Input images cannot include human faces
- Content policies for audiences under 18

## Limitations

### Technical
- Limited to 4, 8, or 12 second videos
- Resolution varies by model tier
- API access currently in preview

### Content
- No real people
- No copyrighted content
- No human faces in input images
- Subject to content policies

## Pricing

**Status:** Not publicly available yet
- Third-party providers claim 75-90% cheaper access
- Official pricing TBD with API release

## Rate Limits

- Free tier: Not supported
- Tier 1: Minimal RPM (exact limits TBD)
- Higher tiers: Increased limits with approval

## Azure Preview Access

Microsoft Azure offers preview-only pathway:
- Available to some tenants
- Asynchronous video job creation
- Preview status only

## Third-Party Access

Several providers claim API access:
- ⚠️ Verify legitimacy and compliance
- Pricing claims: 75-90% cheaper than official
- Use caution with unofficial providers

## Best Practices

1. Apply for preview access early
2. Use paid tier (Tier 1+)
3. Follow content policies strictly
4. Verify third-party providers before use
5. Monitor official docs for API release updates

## Code Example (Anticipated)

```python
import openai

client = openai.OpenAI(api_key="your-api-key")

response = client.videos.create(
    model="sora-2",
    prompt="A cinematic shot of a robot walking through a futuristic city",
    size="1280x720",
    seconds="8"
)

video_id = response.id
video_url = response.url
```

## Resources

- Official Announcement: https://openai.com/index/sora-2/
- System Card: https://openai.com/index/sora-2-system-card/
- Platform Docs: https://platform.openai.com/docs/guides/video-generation

## Notes for Development

- API documentation evolving rapidly
- Service still in preview/limited release
- Monitor OpenAI platform for updates
- Apply for preview access when available
- Consider Azure preview as alternative pathway
