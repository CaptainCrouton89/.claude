# Replicate Video Models API Documentation

**Platform:** https://replicate.com
**Last Updated:** 2025-10-14

## Overview

Replicate provides scalable cloud APIs for running state-of-the-art video generation and analysis models. Platform features pay-per-second pricing and automatic scaling.

## Platform Features

### Official Models
- Always-on with predictable pricing
- Charged by output (not runtime)
- Per image, per token, or per video length
- Production-ready APIs

### Pricing Model
- Pay only for what you use
- No charges when idle
- Per-second billing during execution
- No expensive GPU costs when not in use

### API Structure
- Every model has own OpenAPI schema
- Machine-readable JSON Schema format
- Consistent interface across models
- Documentation on each model page

## Video Generation Models

### Google Veo Series

#### Veo-3 (Recommended)
**Use Case:** Most users generating custom videos
**Features:**
- State-of-the-art video generation
- Audio generation included
- Faithfully follows complex instructions
- Realistic physics simulation
- Wide range of visual styles

**Specifications:**
- Resolution: 720p, 1080p
- Duration: Variable
- Audio: Integrated

#### Veo-3-fast
**Use Case:** Faster, cheaper alternative
**Features:**
- Same quality as Veo-3
- Optimized for speed
- Lower cost per video

#### Veo-2
**Features:**
- Predecessor to Veo-3
- Strong instruction following
- Physics simulation
- Multiple visual styles

**Model ID:** `google/veo-2`

### Bytedance Seedance Series

#### Seedance-1-pro
**Specifications:**
- Duration: 5-10 seconds
- Resolution: 480p, 1080p
- Modes: Text-to-video, Image-to-video

#### Seedance-1-lite
**Specifications:**
- Duration: 5-10 seconds
- Resolution: 480p, 720p
- More economical option

### Kling Series

**Versions:** v1.6, v2.0, v2.1

#### Kling v2.1
**Features:**
- Image-to-video generation
- Duration: 5s and 10s videos
- Resolution: 720p and 1080p

**Model ID:** `kling/v2.1`

#### Kling 2.5 Turbo Pro
**Features:**
- Pro-level quality
- Text-to-video
- Image-to-video
- Smooth motion
- Cinematic depth
- Strong prompt adherence

### Wan Series (Open Source)

#### Wan 2.1
**Status:** Newest open-source model, topping leaderboards
**Features:**
- Text-to-video
- Image-to-video
- Multiple resolution options

**Performance:**
- 480p: 5s video in 39 seconds
- 720p: 5s video in 150 seconds

**Flavors:**
- Text-to-video 480p
- Text-to-video 720p
- Image-to-video 480p
- Image-to-video 720p

**Model ID:** `wan/2.1`

### Hailuo / MiniMax Series

#### Hailuo 2 (video-01)
**Official Launch:** First AI-native video generation model from MiniMax
**Features:**
- Text-to-video
- Image-to-video
- High-definition at 720p
- 25 fps
- Cinematic camera movement

**Specifications:**
- Duration: 6s (current), 10s (next version)
- Resolution: 720p (standard), 1080p (pro)

**Model ID:** `minimax/video-01`

#### video-01-live
**Specialty:** Live2D and animation
**Features:**
- Image-to-video focused
- Optimized for animated content
- Trained for animation use cases

**Last Updated:** 6/25/2025

### CogVideoX Series

#### CogVideoX1.5-5B
**Features:**
- 10-second video support
- Higher resolution
- Open-source
- Fine-tuning support via CogKit

#### CogVideoX1.5-5B-I2V
**Features:**
- Image-to-video generation
- Any resolution support
- Fine-tuning capabilities

**Recent Updates (2025):**
- 2025/03/24: CogKit framework launched
- 2025/02/28: DDIM Inverse support
- 2025/01/08: Updated Lora fine-tuning code

**Model ID:** `zai-org/cogvideox-5b`

### LTX-Video

**Innovation:** First DiT-based video generation model
**Features:**
- Real-time generation
- Faster than playback
- 24 FPS at 768x512
- Low latency

**Model ID:** `ltx-video`

## Fine-Tuning Capabilities

### Video Model Fine-Tuning (New in 2025)

**Supported Models:**
- Tencent's HunyuanVideo

**Fine-Tuning For:**
- Style transfer
- Motion characteristics
- Character consistency
- Camera movement
- Visual appearance and color grading

**Unique Capability:** In-motion style transfer
- Captures camera motion
- Preserves character movement
- Maintains artistic style

## API Integration

### Authentication

```bash
export REPLICATE_API_TOKEN="your-api-token"
```

### Python Client

```python
import replicate

output = replicate.run(
    "google/veo-3",
    input={
        "prompt": "A serene mountain landscape at sunset",
        "duration": 5,
        "resolution": "720p"
    }
)

print(output)
```

### JavaScript Client

```javascript
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const output = await replicate.run(
  "google/veo-3",
  {
    input: {
      prompt: "A serene mountain landscape at sunset",
      duration: 5,
      resolution: "720p"
    }
  }
);

console.log(output);
```

### REST API

```bash
curl -X POST \
  -H "Authorization: Token $REPLICATE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "version": "model-version-id",
    "input": {
      "prompt": "A serene mountain landscape at sunset",
      "duration": 5,
      "resolution": "720p"
    }
  }' \
  https://api.replicate.com/v1/predictions
```

## Model Management API (2025 Updates)

### Update Model Metadata

**New Feature:** Update models via API
**Capabilities:**
- Update descriptions
- Modify README content
- Manage links
- Sort models via API

**Endpoint:**
```
PATCH /v1/models/{owner}/{name}
```

### List Models with Sorting

```bash
curl -X GET \
  -H "Authorization: Token $REPLICATE_API_TOKEN" \
  "https://api.replicate.com/v1/models?sort=created_at"
```

## Common Parameters

### Text-to-Video Models

**Typical Inputs:**
- `prompt`: Text description (required)
- `duration`: Video length in seconds
- `resolution`: Output resolution
- `aspect_ratio`: Video aspect ratio
- `fps`: Frames per second
- `seed`: Random seed for reproducibility

### Image-to-Video Models

**Typical Inputs:**
- `image`: Input image URL or file
- `prompt`: Optional text guidance
- `duration`: Video length
- `motion_strength`: Animation intensity
- `resolution`: Output resolution

## Model Collections

### Explore Collections
- Text-to-Video: https://replicate.com/collections/text-to-video
- Image-to-Video: https://replicate.com/collections/image-to-video
- Video Editing: Various inpainting and effect models

### Browse Models
- Explore page: https://replicate.com/explore
- Filter by type, popularity, recency
- Community models available

## Performance Comparison

**Benchmarking:**
- Artificial Analysis Arena: https://artificialanalysis.ai
- Community leaderboards
- Rapid advancement in field

**Current Leaders (Oct 2025):**
1. Google Veo-3
2. Wan 2.1
3. Kling 2.5 Turbo Pro
4. Hailuo 2

## Custom Model Deployment

### Using Cog

**Cog:** Replicate's tool for packaging models
**Features:**
- Deploy custom models
- Define inputs/outputs
- Automatic API generation
- Scale on Replicate infrastructure

**Example cog.yaml:**
```yaml
build:
  gpu: true
  python_version: "3.11"
  python_packages:
    - torch==2.0.0
    - transformers==4.30.0

predict: "predict.py:Predictor"
```

## Data Privacy

### MiniMax Models
- Data sent from Replicate to MiniMax
- Review MiniMax privacy policy
- Enterprise options available

### Other Models
- Varies by model provider
- Check individual model pages
- Some run entirely on Replicate

## Best Practices

### Model Selection
1. **Most Users:** Google Veo-3 for quality and versatility
2. **Speed Priority:** Veo-3-fast or LTX-Video
3. **Open Source:** Wan 2.1 or CogVideoX
4. **Animation:** video-01-live
5. **Fine-Tuning:** HunyuanVideo

### Optimization
1. Use appropriate resolution for use case
2. Set seed for reproducible results
3. Monitor costs with output-based pricing
4. Test with shorter durations first
5. Leverage official models for reliability

### Integration
1. Use official SDKs (Python, JavaScript)
2. Handle async predictions properly
3. Store webhooks for notifications
4. Implement retry logic
5. Monitor model updates

## Resources

- Platform: https://replicate.com
- Documentation: https://replicate.com/docs
- Changelog: https://replicate.com/changelog
- Blog: https://replicate.com/blog
- API Reference: https://replicate.com/docs/reference

## Integration Notes

### For Video Recreation Project

**Video Generation:**
- Use Veo-3 for high-quality generation
- Image-to-video for frame-based recreation
- Multiple models for style variety
- Fine-tuning for consistency

**Workflow:**
- Generate individual clips
- Stitch with FFmpeg
- Use image-to-video for keyframes
- Style transfer for matching

**Cost Optimization:**
- Start with lower resolutions
- Use faster models for testing
- Official models for production
- Monitor output-based pricing
