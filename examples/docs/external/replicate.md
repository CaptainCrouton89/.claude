# Replicate API Reference

> **Last Updated:** 2025-10-14
> **API Version:** v1
> **Official Documentation:** https://replicate.com/docs/

## Overview

Replicate is a cloud platform that allows developers to run AI models through a simple API without managing infrastructure. It specializes in video generation, image processing, and other AI tasks with over 100 official models available.

## Authentication

All API requests require an API token in the `Authorization` header:

```bash
Authorization: Bearer r8_Hw***********************************
```

**Getting Your API Token:**
1. Sign up at https://replicate.com
2. Navigate to Account Settings
3. Generate an API token
4. Store securely (never commit to version control)

## Base URL

```
https://api.replicate.com/v1
```

## Video Generation Capabilities

### Text-to-Video Models

| Model | Resolution | Duration | Speed | Use Case |
|-------|------------|----------|-------|----------|
| `google/veo-3` | Up to 1080p | 5-10s | Standard | **Recommended** - High quality, audio support |
| `google/veo-3-fast` | Up to 1080p | 5-10s | Fast | Quick generation with good quality |
| `bytedance/seedance-1-pro` | 480p-1080p | 5-10s | Standard | Professional quality videos (Chinese model) |
| `alibaba/wan-2.5-t2v` | Up to 1080p | 5-10s | Standard | Latest Alibaba Wan model |
| `alibaba/wan-2.2-t2v-fast` | 720p | 5s | Fast | Quick generation Alibaba model |
| `wavespeedai/wan-2.1-t2v-720p` | 720p | 5s | Fast (150s) | Open-source, high quality |
| `wavespeedai/wan-2.1-t2v-480p` | 480p | 5s | Very Fast (39s) | Open-source, quick generation |
| `minimax/hailuo-02` | 480p-1080p | 5-10s | Standard | Chinese Minimax model |

### Image-to-Video Models

| Model | Resolution | Duration | Features |
|-------|------------|----------|----------|
| `google/veo-3` | Up to 1080p | 5-10s | Camera movement control |
| `bytedance/seedance-1-pro` | 480p-1080p | 5-10s | Professional animation (Chinese model) |
| `alibaba/wan-2.2-i2v-fast` | 720p | 5s | Fast Alibaba image-to-video |
| `alibaba/wan-2.2-i2v-a14b` | Up to 1080p | 5-10s | High-quality Alibaba I2V model |
| `wavespeedai/wan-2.1-i2v-720p` | 720p | 5s | Open-source image animation |
| `wavespeedai/wan-2.1-i2v-480p` | 480p | 5s | Fast image animation |
| `character-ai/ovi-i2v` | 480p-720p | 5s | Character animation specialist |

### Video Analysis Models

While Replicate primarily focuses on generation, some models can analyze video content:

- **Video Understanding**: Caption generation, scene analysis
- **Video Processing**: Upscaling, style transfer, effects
- **Motion Analysis**: Object tracking, movement detection

### Chinese AI Video Models on Replicate

**Note**: Huawei does not currently have models on Replicate. Huawei's video generation AI (Pangu Models 5.5) is available exclusively through Huawei Cloud. However, several other Chinese companies have models available:

| Company | Models Available | Specialization |
|---------|-----------------|----------------|
| **ByteDance** | Seedance-1-Pro | Professional quality T2V/I2V |
| **Alibaba** | Wan 2.5, Wan 2.2 series | Text-to-video and image-to-video |
| **Tencent** | Hunyuan Image-3 | Image generation (multimodal) |
| **Minimax** | Hailuo-02 | Video generation |

For Huawei Pangu video generation capabilities, you would need to use Huawei Cloud ModelArts platform directly.

## Core API Endpoints

### 1. Create Prediction

**Endpoint:** `POST /predictions`

```bash
curl -X POST \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "version": "MODEL_VERSION_ID",
    "input": {
      "prompt": "A cat walking through a garden"
    }
  }' \
  https://api.replicate.com/v1/predictions
```

**Response:**
```json
{
  "id": "rrr4z55ocneqzikepnug6wmlc4",
  "version": "MODEL_VERSION_ID",
  "status": "starting",
  "input": {
    "prompt": "A cat walking through a garden"
  },
  "created_at": "2025-10-14T12:00:00.000Z"
}
```

### 2. Get Prediction Status

**Endpoint:** `GET /predictions/{prediction_id}`

```bash
curl -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  https://api.replicate.com/v1/predictions/rrr4z55ocneqzikepnug6wmlc4
```

**Response (Completed):**
```json
{
  "id": "rrr4z55ocneqzikepnug6wmlc4",
  "status": "succeeded",
  "output": [
    "https://replicate.delivery/pbxt/video.mp4"
  ],
  "started_at": "2025-10-14T12:00:01.000Z",
  "completed_at": "2025-10-14T12:02:30.000Z"
}
```

### 3. Using Official Models (Simplified)

For official models, you can use the simplified endpoint:

**Endpoint:** `POST /models/{owner}/{name}/predictions`

```bash
curl -X POST \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "prompt": "A serene lake at sunset with mountains in background"
    }
  }' \
  https://api.replicate.com/v1/models/google/veo-3/predictions
```

### 4. Webhooks for Long-Running Tasks

Video generation can take several minutes. Use webhooks to get notified:

```bash
curl -X POST \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "version": "MODEL_VERSION_ID",
    "input": {
      "prompt": "Dancing robot in a cyberpunk city"
    },
    "webhook": "https://your-app.com/webhook",
    "webhook_events_filter": ["completed"]
  }' \
  https://api.replicate.com/v1/predictions
```

## Common Input Parameters

### Text-to-Video

```json
{
  "prompt": "A majestic eagle soaring over mountains",
  "duration": 5,
  "resolution": "720p",
  "fps": 24,
  "seed": 42,
  "guidance_scale": 7.5
}
```

### Image-to-Video

```json
{
  "image": "https://example.com/input.jpg",
  "prompt": "Make this image come alive with gentle movement",
  "duration": 5,
  "resolution": "720p"
}
```

## Rate Limits

| Endpoint Type | Limit |
|---------------|-------|
| Prediction creation | 600 requests/minute |
| Other endpoints | 3000 requests/minute |

## Status Codes and Error Handling

### Prediction States
- `starting` - Prediction is being initialized
- `processing` - Model is running
- `succeeded` - Completed successfully
- `failed` - Error occurred
- `canceled` - Manually canceled

### Common HTTP Status Codes
- `200` - Success
- `201` - Prediction created
- `401` - Invalid API token
- `422` - Invalid input parameters
- `429` - Rate limit exceeded
- `500` - Server error

### Error Response Example
```json
{
  "detail": "Input validation error",
  "type": "invalid_input"
}
```

## Best Practices

### 1. Handle Async Operations
```javascript
// Wait for completion with polling
const checkPrediction = async (id) => {
  const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const prediction = await response.json();

  if (prediction.status === 'succeeded') {
    return prediction.output;
  } else if (prediction.status === 'failed') {
    throw new Error(prediction.error);
  } else {
    // Still processing, wait and check again
    await new Promise(resolve => setTimeout(resolve, 2000));
    return checkPrediction(id);
  }
};
```

### 2. Use Webhooks for Production
```javascript
// Better approach for production
const createPrediction = async (input) => {
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      version: 'MODEL_VERSION',
      input,
      webhook: 'https://your-app.com/webhook'
    })
  });
  return response.json();
};
```

### 3. Model Selection Guidelines

**For Quick Prototyping:**
- Use `wavespeedai/wan-2.1-t2v-480p` (39s generation time)

**For Production Quality:**
- Use `google/veo-3` (best quality, audio support)
- Use `bytedance/seedance-1-pro` (reliable professional results)

**For Cost Optimization:**
- Use official models for predictable pricing
- Choose appropriate resolution (480p vs 1080p)

## Video File Handling

### Output Format
- Videos are served from `replicate.delivery` CDN
- Common formats: MP4, WebM
- URLs are temporary and should be downloaded/stored

### Example Download
```javascript
const downloadVideo = async (url, filename) => {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  // Save to your storage system
  await saveToStorage(buffer, filename);
};
```

## Pricing Considerations

### Official Models
- Predictable pricing based on output metrics
- Per-second billing for video generation
- No cold start delays

### Community Models
- Billed by compute time (GPU seconds)
- May have cold start delays
- Variable pricing based on hardware

### Cost Optimization Tips
1. Use appropriate resolution for your use case
2. Leverage official models for consistent pricing
3. Implement efficient retry logic
4. Cache results when possible

## OpenAPI Schema

Full machine-readable API documentation:
```
https://api.replicate.com/openapi.json
```

Use this for:
- Generating client SDKs
- API exploration with tools like Postman
- Integration with API platforms

## Client Libraries

Official SDKs available:
- **Node.js**: `npm install replicate`
- **Python**: `pip install replicate`
- **Go**: Community maintained
- **PHP**: Community maintained

## Example: Complete Video Generation Workflow

```javascript
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function generateVideo(prompt) {
  try {
    // Create prediction
    const output = await replicate.run(
      "google/veo-3",
      {
        input: {
          prompt,
          duration: 5,
          resolution: "720p"
        }
      }
    );

    return output; // Array of video URLs
  } catch (error) {
    console.error('Video generation failed:', error);
    throw error;
  }
}

// Usage
const videoUrls = await generateVideo("A peaceful forest scene with falling leaves");
console.log('Generated videos:', videoUrls);
```

## Additional Resources

- **Official Documentation**: https://replicate.com/docs/
- **Community Discord**: Available through Replicate website
- **Model Explorer**: https://replicate.com/explore
- **Pricing Calculator**: https://replicate.com/pricing
- **Status Page**: https://status.replicate.com/

## Quick Reference

### Most Used Endpoints
```bash
# Create prediction
POST /v1/predictions

# Check status
GET /v1/predictions/{id}

# List models
GET /v1/models

# Get model details
GET /v1/models/{owner}/{name}
```

### Environment Variables
```bash
export REPLICATE_API_TOKEN="r8_your_token_here"
```

This reference covers the essential aspects of the Replicate API for video generation and analysis. Always refer to the official documentation for the most current information and detailed model-specific parameters.