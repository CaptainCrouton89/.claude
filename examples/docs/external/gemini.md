# Google Gemini API Reference

*Last updated: 2025-10-14*

## Overview

Google's Gemini API provides powerful multimodal AI capabilities including text generation, image understanding, video analysis, and image generation. The API supports multiple programming languages and offers both REST and SDK-based access.

## Authentication

### API Key Setup
- Obtain API key from: https://aistudio.google.com/apikey
- Set as environment variable: `GOOGLE_AI_API_KEY`
- Include in requests via header: `x-goog-api-key: YOUR_API_KEY`

### SDK Support
- Python, JavaScript, Go, Java, REST
- Official client libraries available for all supported languages

## Models Overview

### Current Primary Models (2025)

| Model | Description | Context Window | Best For |
|-------|-------------|----------------|----------|
| `gemini-2.5-pro` | State-of-the-art thinking model | 1,048,576 tokens | Complex reasoning, STEM, code |
| `gemini-2.5-flash` | Best price-performance balance | 1,048,576 tokens | Large-scale processing, agentic tasks |
| `gemini-2.5-flash-lite` | Fastest and most cost-efficient | 1,048,576 tokens | High throughput applications |
| `gemini-2.5-flash-image` | Native image generation | 1,048,576 tokens | Text-to-image generation |

### Model Version Types
- **Stable**: Specific, consistent model version
- **Preview**: Production-ready with potential changes
- **Latest**: Most recent release
- **Experimental**: Not suitable for production

## Video Analysis Capabilities

### Supported Features
- Video description and summarization
- Content segmentation and extraction
- Audio transcription
- Timestamp-specific queries
- Object detection and tracking

### Technical Specifications
- **Sampling Rate**: 1 frame per second
- **Maximum Duration**:
  - 2 hours at default resolution
  - 6 hours at low resolution (2M context models)
- **Token Cost**: ~300 tokens per second of video
- **Supported Models**: Gemini 2.0, 2.5 series

### Supported Video Formats
- MP4, MPEG, MOV, AVI, FLV, MKV, WEBM

### Implementation Methods

#### File API Upload (Recommended for >20MB)
```python
import google.generativeai as genai

# Upload video file
video_file = genai.upload_file(path="video.mp4")

# Generate content with video
response = model.generate_content([
    "Describe what happens in this video",
    video_file
])
```

#### Inline Video Data (<20MB)
```python
# For smaller files
with open("video.mp4", "rb") as video_file:
    video_data = video_file.read()

response = model.generate_content([
    "Analyze this video",
    {"mime_type": "video/mp4", "data": video_data}
])
```

#### YouTube URL Processing
```python
response = model.generate_content([
    "Summarize this video",
    {"mime_type": "video/youtube", "data": "https://youtube.com/watch?v=VIDEO_ID"}
])
```

### Advanced Video Features
- **Custom Frame Rate**: Configure sampling beyond default 1 FPS
- **Video Clipping**: Process specific time intervals
- **Timestamp Queries**: Reference specific moments in video

## Image Understanding Capabilities

### Core Features
- Image captioning and description
- Visual question answering
- Object detection and segmentation
- Image classification
- Bounding box generation

### Model Enhancements
- **Gemini 2.0**: Enhanced object detection
- **Gemini 2.5**: Enhanced segmentation + object detection

### Supported Image Formats
- PNG, JPEG, WEBP, HEIC, HEIF

### Technical Limits
- **Maximum**: 3,600 image files per request
- **File Size**: <20MB for inline, any size via File API
- **Processing**: Tile-based for larger images

### Implementation Examples

#### Single Image Analysis
```python
import google.generativeai as genai

model = genai.GenerativeModel("gemini-2.5-flash")

# From file
response = model.generate_content([
    "What objects do you see in this image?",
    {"mime_type": "image/jpeg", "data": open("image.jpg", "rb").read()}
])

# From File API
image_file = genai.upload_file("image.jpg")
response = model.generate_content(["Describe this image", image_file])
```

#### Multiple Image Processing
```python
images = [genai.upload_file(f"image_{i}.jpg") for i in range(3)]
response = model.generate_content([
    "Compare these images and identify differences",
    *images
])
```

## Image Generation Capabilities

### Model: `gemini-2.5-flash-image`

### Features
- Text-to-image generation
- Multimodal response generation (text + images)
- Locale-aware generation
- High-quality text rendering in images
- Multiple aspect ratios (1:1, 3:2, 16:9, etc.)

### Supported Languages
Best performance: EN, es-MX, ja-JP, zh-CN, hi-IN

### Implementation
```python
model = genai.GenerativeModel("gemini-2.5-flash-image")

response = model.generate_content([
    "Create a detailed illustration of a futuristic city with flying cars"
])

# Access generated image
if response.candidates[0].content.parts:
    for part in response.candidates[0].content.parts:
        if hasattr(part, 'inline_data'):
            # Save image data
            with open('generated_image.jpg', 'wb') as f:
                f.write(part.inline_data.data)
```

### Best Practices
- Be specific and detailed in prompts
- Provide context and intent
- Use step-by-step instructions
- Iterate and refine generations

### Limitations
- Maximum 3 images per input
- No audio/video input support for image generation
- Safety filters may block certain requests

## Vision/Multimodal Capabilities

### Multimodal Input Support
- **Text**: Natural language prompts
- **Images**: Multiple formats, inline or via File API
- **Video**: File upload or YouTube URLs
- **Audio**: Supported in 2.5 models
- **PDFs**: Document analysis

### Advanced Vision Features
- **Object Detection**: Identify and locate objects
- **Segmentation**: Precise object boundaries
- **OCR**: Text extraction from images
- **Spatial Understanding**: Relationships between objects
- **Visual Reasoning**: Complex visual problem solving

## Rate Limits and Best Practices

### Rate Limits
- Varies by model and usage tier
- Monitor via API responses
- Implement exponential backoff for retries

### Performance Optimization
- **Large Files**: Use File API for >20MB
- **Batch Processing**: Group related requests
- **Caching**: Reuse uploaded files across requests
- **Prompt Placement**: Place text prompts after media in content array

### Error Handling
```python
try:
    response = model.generate_content(prompt)
except Exception as e:
    if "rate limit" in str(e).lower():
        # Implement backoff strategy
        time.sleep(2 ** retry_count)
    else:
        # Handle other errors
        print(f"Error: {e}")
```

## Common Endpoints

### Generate Content
```
POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
```

### File Upload
```
POST https://generativelanguage.googleapis.com/upload/v1beta/files
```

### List Models
```
GET https://generativelanguage.googleapis.com/v1beta/models
```

## Quick Start Example

```python
import google.generativeai as genai
import os

# Configure API key
genai.configure(api_key=os.environ["GOOGLE_AI_API_KEY"])

# Initialize model
model = genai.GenerativeModel("gemini-2.5-flash")

# Text generation
response = model.generate_content("Explain quantum computing")
print(response.text)

# Image analysis
image_file = genai.upload_file("photo.jpg")
response = model.generate_content([
    "What's happening in this image?",
    image_file
])
print(response.text)

# Video analysis
video_file = genai.upload_file("video.mp4")
response = model.generate_content([
    "Summarize the key events in this video",
    video_file
])
print(response.text)
```

## Additional Resources

- **Official Documentation**: https://ai.google.dev/gemini-api/docs
- **API Key Generation**: https://aistudio.google.com/apikey
- **Model Reference**: https://ai.google.dev/gemini-api/docs/models
- **Release Notes**: https://ai.google.dev/gemini-api/docs/changelog
- **Cloud Console**: https://cloud.google.com/vertex-ai

## Safety and Content Policies

- Built-in safety filters for harmful content
- Configurable safety settings
- Content policies apply to all modalities
- Review usage policies before production deployment