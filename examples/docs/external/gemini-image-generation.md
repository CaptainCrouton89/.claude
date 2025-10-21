# Gemini 2.5 Flash Image (Nano Banana) API Documentation

**Model ID:** `gemini-2.5-flash-image-preview`
**Codename:** Nano Banana
**Official Docs:** https://ai.google.dev/gemini-api/docs/image-generation
**Last Updated:** 2025-10-14

## Overview

Gemini 2.5 Flash Image (aka "Nano Banana") is Google's state-of-the-art image generation and editing model released on August 26, 2025. Top-rated image editing model in the world with over 500 million images edited in the Gemini app by September 2025.

## API Endpoint

```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent
```

## Authentication

**API Key Required:**
- Obtain from Google AI Studio: https://aistudio.google.com
- Pass via header: `x-goog-api-key: $GEMINI_API_KEY`

**Example:**
```bash
curl -X POST \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent
```

## Core Capabilities

### 1. Image Generation Modes

- **Text-to-Image:** Generate images from text descriptions
- **Image + Text Editing:** Modify existing images with text instructions
- **Multi-Image Composition:** Combine up to 3 images with text
- **Style Transfer:** Apply styles from reference images
- **Iterative Refinement:** Conversational editing over multiple turns

### 2. Character Consistency

Maintains appearance of characters/objects across multiple prompts and edits - a fundamental challenge this model addresses effectively.

## Request Parameters

### Input Types
- **Text prompts:** Simple or complex descriptions
- **Images:** Up to 3 input images
- **Combination:** Text + images

### Output Configuration

**Aspect Ratios:**
- 1:1 (Square)
- 2:3 (Portrait)
- 3:2 (Landscape)
- 16:9 (Widescreen)
- And more

**Resolution:**
- Up to 1024x1024 pixels

**Response Modalities:**
- Text
- Image
- Both

## Pricing

**Rate:** $30.00 per 1 million output tokens

**Per Image Cost:**
- Fixed: 1290 tokens per image
- Cost: $0.039 per image

## Language Support

**Best Performance:**
- English (EN)
- Spanish - Mexico (es-MX)
- Japanese (ja-JP)
- Chinese - China (zh-CN)
- Hindi (hi-IN)

## Limitations

### Technical
- No audio/video input support
- Maximum 3 input images per request
- Cloud-only (not on-device despite "Nano" nickname)

### Output
- All images include visible watermark
- SynthID digital watermark embedded
- Clearly marked as AI-generated

## Safety & Compliance

- Visible watermarks on all generated images
- Invisible SynthID digital watermarks
- Content policy enforcement
- CSAM detection and prevention

## Code Examples

### Python (Text-to-Image)

```python
import google.generativeai as genai

genai.configure(api_key="YOUR_API_KEY")
model = genai.GenerativeModel('gemini-2.5-flash-image-preview')

response = model.generate_content(
    "A serene mountain landscape at sunset with pine trees"
)

image_url = response.candidates[0].content.parts[0].inline_data
```

### Python (Image Editing)

```python
import google.generativeai as genai
from PIL import Image

genai.configure(api_key="YOUR_API_KEY")
model = genai.GenerativeModel('gemini-2.5-flash-image-preview')

img = Image.open('input.jpg')
response = model.generate_content([
    img,
    "Add a rainbow in the sky and make it look more vibrant"
])

edited_image = response.candidates[0].content.parts[0].inline_data
```

### JavaScript

```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' });

const result = await model.generateContent(
  'A futuristic city with flying cars'
);

const imageData = result.response.candidates[0].content.parts[0].inlineData;
```

### REST API

```bash
curl -X POST \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "A magical forest with glowing mushrooms"
      }]
    }]
  }' \
  https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent
```

## Availability

### Google AI Platform
- **Gemini API:** Available now
- **Google AI Studio:** Available now
- **Access:** https://aistudio.google.com

### Vertex AI (Enterprise)
- Available for enterprise customers
- Enhanced security and compliance
- SLA support

### Gemini App
- Available in consumer Gemini app
- Over 500M images edited as of Sept 2025

## Performance Benchmarks

- Top-rated on LMArena
- State-of-the-art on multiple benchmarks
- High accuracy for character consistency
- Fast generation times

## Use Cases

### Recommended Applications
1. Conversational image editing workflows
2. Character-consistent content creation
3. Multi-image composition and style transfer
4. Iterative design refinement
5. Rapid prototyping and concept art
6. Marketing and advertising assets

### Best Practices
1. Use conversational approach for refinement
2. Leverage character consistency for series
3. Provide detailed prompts for best results
4. Use multiple images for complex compositions
5. Iterate over multiple turns for precision

## Clarifications

**"Nano Banana" Naming:**
- Codename used in media and community
- Official name: Gemini 2.5 Flash Image
- Despite "Nano," this is NOT an on-device model
- All processing happens in the cloud

**On-Device Capabilities:**
- Android's Gemini Nano covers text/audio and image description
- Generative image workflows run in cloud only
- No on-device image generation/editing in 2025

## Resources

- Official Docs: https://ai.google.dev/gemini-api/docs/image-generation
- Google AI Studio: https://aistudio.google.com
- Blog Announcement: https://blog.google/products/gemini/updated-image-editing-model/
- Hackathon Kit: https://github.com/google-gemini/nano-banana-hackathon-kit

## Integration Notes

### For Video Recreation Project
- Use for image-to-video workflows
- Generate keyframes for stitching
- Style-consistent frame generation
- Scene reconstruction from metadata
- Character consistency across frames
