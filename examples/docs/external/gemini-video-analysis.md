# Gemini Video Analysis API Documentation

**Official Docs:** https://ai.google.dev/gemini-api/docs/video-understanding
**Last Updated:** 2025-10-14

## Overview

Gemini 2.5 models provide state-of-the-art video understanding capabilities with 2M token context windows, enabling analysis of videos up to 6 hours long. Models can describe, segment, extract information, answer questions, and transcribe audio from video files.

## Supported Models

### Gemini 2.5 Pro
- **Context Window:** 2M tokens
- **Max Video Length:** 2 hours (default resolution) or 6 hours (low resolution)
- **Performance:** State-of-the-art on key benchmarks
- **Surpasses:** GPT 4.1 under comparable conditions

### Gemini 2.5 Flash
- **Context Window:** 1M-2M tokens (varies by version)
- **Max Video Length:** 1 hour (default resolution) or 3 hours (low resolution)
- **Performance:** Fast processing with high accuracy
- **Cost:** More economical than Pro

### Gemini 2.0 Models
- All Gemini 2.0 models support video processing
- Varying context windows and capabilities

## API Endpoints

### Google AI for Developers

```
POST https://generativelanguage.googleapis.com/v1beta/models/{model-name}:generateContent
```

**Example:**
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
```

### Vertex AI (Google Cloud)

```
POST https://aiplatform.googleapis.com/v1/projects/{project}/locations/{location}/publishers/google/models/{model}:generateContent
```

## Authentication

### Google AI API
```bash
curl -X POST \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
```

### Vertex AI
Uses Google Cloud authentication (Service Account or OAuth)

## Video Input Methods

### 1. File API (Recommended for Large Files)

**Use When:**
- Files larger than 20MB
- Videos longer than ~1 minute

**Process:**
1. Upload video via File API
2. Reference in generateContent request

**Sampling:**
- Default: 1 frame per second (FPS)
- Audio: Processed at 1Kbps (single channel)
- Timestamps: Added every second

### 2. Inline Video Data

**Use When:**
- Files smaller than 20MB
- Videos shorter than ~1 minute

**Method:**
- Base64-encode video data
- Include directly in request

### 3. YouTube URL (Preview)

**Feature:** Direct YouTube URL input
**Status:** Preview feature
**Limits:**
- Free tier: Up to 8 hours per day
- Paid tier: No length restrictions

## Supported Video Formats

- MP4
- MPEG
- MOV
- AVI
- FLV
- MPG
- WebM
- WMV
- 3GPP

## Video Processing Options

### Media Resolution

**Default Resolution:**
- Frames: 258 tokens per frame + timestamps
- Quality: Standard

**Low Resolution:**
- Frames: 66 tokens per frame + timestamps
- Quality: Reduced but faster processing
- Duration: Up to 3x longer videos

### Custom Configuration

**Frame Rate Sampling:**
- Customize FPS sampling rate
- Adjust for motion-heavy content

**Clipping Intervals:**
- Process specific time ranges
- Analyze segments of interest

## Request Structure

### Python Example

```python
import google.generativeai as genai

genai.configure(api_key="YOUR_API_KEY")
model = genai.GenerativeModel('models/gemini-2.5-flash')

video_file = genai.upload_file(path="video.mp4")

response = model.generate_content([
    video_file,
    "Please summarize the video in 3 sentences."
])

print(response.text)
```

### JavaScript Example

```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const video = await fileManager.uploadFile('video.mp4', {
  mimeType: 'video/mp4',
});

const result = await model.generateContent([
  {
    fileData: {
      fileUri: video.file.uri,
      mimeType: video.file.mimeType,
    }
  },
  { text: 'Describe what happens in this video.' },
]);

console.log(result.response.text());
```

## Capabilities

### Video Understanding

1. **Scene Description**
   - Detailed visual descriptions
   - Object and person identification
   - Action recognition

2. **Temporal Analysis**
   - Scene change detection
   - Timeline extraction
   - Event sequencing

3. **Content Extraction**
   - Key moment identification
   - Chapter generation with timestamps
   - Summary creation

4. **Question Answering**
   - Answer questions about video content
   - Reference specific timestamps
   - Multi-hop reasoning

### Audio Processing

1. **Transcription**
   - Speech-to-text
   - Multi-language support
   - Speaker context

2. **Audio + Video Analysis**
   - Synchronized understanding
   - Audio-visual correlation
   - Context-aware responses

## Advanced Use Cases

### 1. Video Summarization

```python
prompt = """
Provide a detailed summary of this video including:
- Main topics discussed
- Key events or scenes
- Timeline of important moments
"""

response = model.generate_content([video_file, prompt])
```

### 2. Chapter Generation

```python
prompt = """
Generate chapter markers for this video with:
- Timestamp (MM:SS format)
- Chapter title
- Brief description
"""

response = model.generate_content([video_file, prompt])
```

### 3. Frame-by-Frame Analysis

```python
prompt = """
Analyze this video frame by frame and describe:
- Visual changes between scenes
- Object movements
- Camera transitions
"""

response = model.generate_content([video_file, prompt])
```

### 4. Content Comparison

```python
prompt = """
Compare these two videos and identify:
- Similarities in content
- Differences in style
- Common themes
"""

response = model.generate_content([video1, video2, prompt])
```

## Best Practices

### Optimization

1. **Use one video per prompt** for best results
2. **Place text prompt after video part** in contents array
3. **Be aware of 1 FPS sampling** for fast-moving sequences
4. **Use low resolution** for longer videos (3x duration)
5. **Customize frame rate** for motion-heavy content

### Performance

1. **Upload large files via File API** (>20MB)
2. **Use inline data for small files** (<20MB)
3. **Process segments with clipping** for focused analysis
4. **Choose appropriate model** (Flash vs Pro)
5. **Monitor token usage** for cost optimization

### Quality

1. **Provide clear, specific prompts**
2. **Request structured output** (JSON, timestamps)
3. **Use multi-turn conversation** for refinement
4. **Specify detail level needed**
5. **Test with sample videos first**

## Token Usage

### Calculation

**Default Media Resolution:**
- ~258 tokens per frame
- ~300 tokens per video second
- Plus timestamp tokens

**Low Media Resolution:**
- ~66 tokens per frame
- ~75-100 tokens per video second
- Plus timestamp tokens

**Example:**
- 1-minute video at default resolution: ~18,000 tokens
- 1-minute video at low resolution: ~4,500 tokens

## Pricing

**Google AI API:**
- Free tier with limits
- Paid tier: Per-token pricing
- YouTube URL: Free tier 8 hours/day

**Vertex AI:**
- Pay-per-token model
- Enterprise pricing available
- Volume discounts

## Rate Limits

### Free Tier
- Limited requests per minute
- Limited total usage per day
- YouTube: 8 hours per day

### Paid Tier
- Higher RPM limits
- No daily usage caps
- YouTube: Unlimited

## Limitations

### Technical
- Maximum 10 videos per request (Gemini 2.5+)
- 1 FPS default sampling
- Context window constraints

### Content
- Subject to content policies
- Some content may be filtered
- CSAM detection enabled

## Integration Examples

### Firebase AI Logic

```javascript
import { getVertexAI, getGenerativeModel } from 'firebase/vertexai-preview';

const vertexAI = getVertexAI(firebaseApp);
const model = getGenerativeModel(vertexAI, { model: 'gemini-2.5-flash' });

const result = await model.generateContent([
  {
    inlineData: {
      data: base64VideoData,
      mimeType: 'video/mp4',
    }
  },
  { text: 'What is shown in this video?' },
]);
```

### Vertex AI (Python)

```python
from vertexai.generative_models import GenerativeModel, Part

model = GenerativeModel("gemini-2.5-flash")

video = Part.from_uri(
    uri="gs://your-bucket/video.mp4",
    mime_type="video/mp4"
)

response = model.generate_content([
    video,
    "Summarize the video with timestamps"
])

print(response.text)
```

## Benchmarks

**Gemini 2.5 Pro Performance:**
- State-of-the-art on key video understanding benchmarks
- Surpasses GPT 4.1 under comparable testing
- Significantly improved from 2.0 series

**Improvements in 2.5:**
- Higher quality video processing
- Better temporal understanding
- Enhanced audio-visual correlation
- More accurate scene detection

## Resources

- Official Docs: https://ai.google.dev/gemini-api/docs/video-understanding
- Vertex AI Docs: https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/video-understanding
- Firebase Docs: https://firebase.google.com/docs/ai-logic/analyze-video
- Cookbook: https://github.com/google-gemini/cookbook
- Google AI Studio: https://aistudio.google.com

## Integration Notes

### For Video Recreation Project

**Video Analysis:**
- Extract comprehensive scene descriptions
- Generate frame-by-frame metadata
- Identify key moments and transitions
- Create timeline with timestamps
- Transcribe audio dialogue
- Detect scene changes
- Extract visual features
- Generate summaries at multiple levels

**Metadata Generation:**
- Structured JSON output
- Queryable by time ranges
- Detail levels: frame/scene/summary
- Combined audio-visual analysis
