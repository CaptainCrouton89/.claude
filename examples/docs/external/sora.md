# Sora 2 LLM Reference

## Current Status (October 2025)
- **Released**: September 30, 2025
- **API**: NOT PUBLIC - Expected late October/November 2025
- **Access**: iOS app + web (sora.com), US/Canada only
- **Alternative**: Use web interface via ChatGPT Plus/Pro subscription until API launches

## Critical Access Information

### Subscription Tiers
```yaml
Free:
  videos: Limited count
  resolution: 480p
  duration: Short clips
  watermark: Yes

ChatGPT Plus ($20/month):
  credits: 1000/month
  videos: ~50 @ 5-second 720p
  resolution: 720p max
  duration: 5 seconds max
  watermark: Yes

ChatGPT Pro ($200/month):
  credits: 10000/month
  videos: 500 priority + unlimited slow-queue
  resolution: 1080p (Sora 2 Pro model)
  duration: 20 seconds max
  watermark: App outputs only, API removes
```

### Future API Pricing (Not Active Yet)
```yaml
standard_720p: $0.10/second
pro_1080p: $0.50/second
clip_limits: [4, 8, 12, 16, 20] # seconds
max_duration: 20 # seconds per generation
```

## API Implementation (When Available)

### Authentication Pattern
```python
# Expected implementation (not yet active)
from openai import OpenAI
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Likely endpoint structure
response = client.video.create(
    model="sora-2",  # or "sora-2-pro" for 1080p
    prompt="...",
    duration=5,  # seconds
    resolution="720p",
    aspect_ratio="16:9"
)
```

### Webhook for Async Processing
```python
# Videos take 2-5 minutes to generate
webhook_url = "https://your-app.com/sora-webhook"
response = client.video.create(
    prompt="...",
    webhook_url=webhook_url,
    webhook_events=["video.completed", "video.failed"]
)
```

## Non-Obvious Constraints

### Generation Times
- **Initial request**: 2-5 minutes standard
- **Peak hours**: Up to hours for free tier
- **Pro priority queue**: ~2 minutes typical
- **Batch processing**: Not supported initially

### Hard Limits
```yaml
max_prompt_length: 500  # characters (estimate)
max_duration_per_clip: 20  # seconds
max_resolution: "1080p"  # 4K planned but not available
physics_complexity: 3  # simultaneous interactions before degradation
character_consistency: 1  # per scene (multiple characters break continuity)
```

### Model Capabilities Matrix
```yaml
supported:
  - text_to_video: true
  - image_to_video: true  # JPEG/PNG/WebP
  - audio_generation: true  # dialogue, sfx, ambient
  - style_transfer: ["realistic", "cinematic", "anime"]
  - aspect_ratios: ["16:9", "9:16", "1:1", "4:3"]

not_supported:
  - video_to_video: false
  - batch_generation: false
  - custom_models: false
  - frame_interpolation: false
  - resolution_upscaling: false  # must specify at generation
```

## Prompting Signatures

### Optimal Prompt Structure
```typescript
interface SoraPrompt {
  visual: string;      // 50-100 words, mini-script format
  dialogue?: string;   // Block format below visual
  camera?: {
    movement: "static" | "pan_left" | "pan_right" | "zoom_in" | "zoom_out" | "track";
    speed: "slow" | "medium" | "fast";
    framing: "wide" | "medium" | "close-up" | "extreme_close-up";
  };
  lighting?: string;   // "golden hour", "soft window", "neon cityscape"
  style?: "realistic" | "cinematic" | "anime";
}
```

### Cameo Feature Configuration
```yaml
setup:
  recordings_required: 3
  recording_duration: 10  # seconds each
  processing_time: 60-120  # minutes for initial avatar

usage:
  command: "cameo:person_name"  # in prompt
  limitations:
    - one_cameo_per_video: true
    - facial_expressions: limited
    - body_movements: predefined_only
```

## Known Failure Modes

### Physics Degradation Triggers
- Multiple object collisions simultaneously
- Complex fluid dynamics (splashing, pouring)
- Crowd scenes > 5 people
- Rapid camera movements with action
- Sports with precise ball physics

### Character Inconsistency Causes
- Multiple characters in scene
- Costume changes mid-scene
- Profile to frontal view transitions
- Scenes longer than 8 seconds

### Workaround Patterns
```python
# Split complex scenes
if scene_complexity > 3:
    clip1 = generate(prompt[:4_seconds])
    clip2 = generate(prompt[4:8_seconds])
    final = stitch_in_post(clip1, clip2)

# Maintain continuity
prompt_with_anchors = {
    "visual": base_prompt,
    "identity_anchors": [
        "navy blazer from Shot 1",
        "short brown hair",
        "round glasses"
    ],
    "color_palette": ["#1a2b3c", "#4d5e6f", "#ffffff"]
}
```

## Current Access Methods

### 1. Direct Access
```bash
# iOS App (primary method)
1. Download "Sora" from App Store (US/Canada only)
2. Join waitlist (1-3 days with Pro, 1-4 weeks standard)
3. Enable notifications for invite

# Web Access
https://sora.com (requires same waitlist approval)
```

### 2. Friend Pass System
- Active users receive 4 invite codes
- Codes expire after 7 days
- Share in OpenAI Discord #sora-2 channel

### 3. Third-Party Aggregators (Unofficial)
```python
# Replicate.com (unofficial, use with caution)
import replicate
output = replicate.run(
    "unofficial-sora-wrapper",  # Not endorsed by OpenAI
    input={"prompt": "..."}
)
```

## Recreation Workflow Implementation

### For Video Recreation Project
```python
# Current approach (no API)
workflow = {
    "step1": "Manual generation via sora.com",
    "step2": "Download generated videos",
    "step3": "Post-process for consistency",
    "step4": "Implement polling for API availability"
}

# Future API integration
async def generate_recreation_video(scene_description):
    # Prepare prompt with recreation specifics
    prompt = f"""
    Recreation of: {scene_description}
    Style: realistic
    Camera: static medium shot
    Duration: 5 seconds
    """

    # When API available
    response = await client.video.create_async(
        model="sora-2-pro",
        prompt=prompt,
        duration=5,
        resolution="1080p",
        webhook_url=WEBHOOK_ENDPOINT
    )

    return response.job_id
```

### Polling for API Availability
```python
# Check weekly for API launch
import requests

def check_sora_api_status():
    try:
        response = requests.get("https://api.openai.com/v1/models")
        models = response.json()
        return any("sora" in m["id"] for m in models["data"])
    except:
        return False
```

## Version: Sora 2 (September 2025)
**Last Updated**: October 14, 2025
**API Status**: Not Public (Expected November 2025)
**Documentation Sources**: OpenAI official, community testing, pricing analysis