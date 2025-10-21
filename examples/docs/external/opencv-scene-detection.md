# OpenCV & PySceneDetect Documentation

**Tools:** OpenCV, PySceneDetect
**Last Updated:** 2025-10-14

## Overview

OpenCV provides comprehensive video processing capabilities in Python, while PySceneDetect specializes in scene cut and transition detection. Together they enable robust video frame analysis and scene detection.

## PySceneDetect

### Overview

**Project:** Python and OpenCV-based scene detection
**Status:** Production/Stable (as of Aug 2025)
**License:** Free and open-source
**GitHub:** https://github.com/Breakthrough/PySceneDetect

### Installation

```bash
pip install scenedetect[opencv]
```

**Requirements:**
- Python >=3.7
- OpenCV (opencv-python)
- NumPy

### Basic Usage

#### Command Line

**Simple scene detection:**
```bash
scenedetect -i video.mp4 detect-content
```

**Save scene list:**
```bash
scenedetect -i video.mp4 detect-content list-scenes
```

**Split video into clips:**
```bash
scenedetect -i video.mp4 detect-content split-video
```

**Adjust sensitivity:**
```bash
scenedetect -i video.mp4 detect-content -t 27
```

#### Python API

**Basic detection:**
```python
from scenedetect import open_video, SceneManager
from scenedetect.detectors import ContentDetector

video = open_video('video.mp4')
scene_manager = SceneManager()
scene_manager.add_detector(ContentDetector())

scene_manager.detect_scenes(video)
scene_list = scene_manager.get_scene_list()

for i, scene in enumerate(scene_list):
    print(f'Scene {i+1}: {scene[0].get_seconds():.2f}s - {scene[1].get_seconds():.2f}s')
```

**With frame numbers:**
```python
from scenedetect import open_video, SceneManager
from scenedetect.detectors import ContentDetector

video = open_video('video.mp4')
scene_manager = SceneManager()
scene_manager.add_detector(ContentDetector(threshold=30))

scene_manager.detect_scenes(video, show_progress=True)

for scene in scene_manager.get_scene_list():
    start_frame = scene[0].get_frames()
    end_frame = scene[1].get_frames()
    start_time = scene[0].get_seconds()
    end_time = scene[1].get_seconds()

    print(f'Scene: frames {start_frame}-{end_frame} ({start_time:.2f}s - {end_time:.2f}s)')
```

### Detection Methods

#### 1. ContentDetector

**Use:** Detect cuts based on content changes
**Algorithm:** Compares frame differences
**Best For:** Fast cuts, hard transitions

```python
from scenedetect.detectors import ContentDetector

detector = ContentDetector(threshold=27.0)
scene_manager.add_detector(detector)
```

**Parameters:**
- `threshold`: Sensitivity (default: 27.0, lower = more sensitive)
- `min_scene_len`: Minimum scene length in frames

#### 2. AdaptiveDetector

**Use:** Adaptive content-based detection
**Algorithm:** Adjusts to video characteristics
**Best For:** Videos with varying content

```python
from scenedetect.detectors import AdaptiveDetector

detector = AdaptiveDetector()
scene_manager.add_detector(detector)
```

**Parameters:**
- `adaptive_threshold`: Base threshold
- `min_scene_len`: Minimum scene length
- `window_width`: Adaptation window size

#### 3. ThresholdDetector

**Use:** Detect fades to/from black
**Algorithm:** Pixel intensity thresholding
**Best For:** Fade transitions, black frames

```python
from scenedetect.detectors import ThresholdDetector

detector = ThresholdDetector(threshold=12.0, min_percent=0.95)
scene_manager.add_detector(detector)
```

**Parameters:**
- `threshold`: Black level (0-255)
- `min_percent`: Minimum % of pixels below threshold
- `fade_bias`: Bias for fade in/out

### Advanced Features

#### Save Scene Data

```python
from scenedetect import open_video, SceneManager, save_images
from scenedetect.detectors import ContentDetector

video = open_video('video.mp4')
scene_manager = SceneManager()
scene_manager.add_detector(ContentDetector())
scene_manager.detect_scenes(video)

scene_list = scene_manager.get_scene_list()

save_images(
    scene_list=scene_list,
    video=video,
    num_images=3,
    output_dir='scene_thumbnails'
)
```

#### Export to CSV

```python
from scenedetect import open_video, SceneManager
from scenedetect.detectors import ContentDetector
from scenedetect.scene_manager import write_scene_list

video = open_video('video.mp4')
scene_manager = SceneManager()
scene_manager.add_detector(ContentDetector())
scene_manager.detect_scenes(video)

scene_list = scene_manager.get_scene_list()

with open('scenes.csv', 'w') as f:
    write_scene_list(f, scene_list)
```

#### Multiple Detectors

```python
from scenedetect import open_video, SceneManager
from scenedetect.detectors import ContentDetector, ThresholdDetector

video = open_video('video.mp4')
scene_manager = SceneManager()

scene_manager.add_detector(ContentDetector(threshold=27))
scene_manager.add_detector(ThresholdDetector(threshold=12))

scene_manager.detect_scenes(video)
```

## OpenCV Video Processing

### Installation

```bash
pip install opencv-python
```

**Optional (with GUI support):**
```bash
pip install opencv-contrib-python
```

### Basic Video Reading

```python
import cv2

cap = cv2.VideoCapture('video.mp4')

while cap.isOpened():
    ret, frame = cap.read()

    if not ret:
        break

    cv2.imshow('Frame', frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
```

### Extract Video Properties

```python
import cv2

cap = cv2.VideoCapture('video.mp4')

fps = cap.get(cv2.CAP_PROP_FPS)
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
duration = frame_count / fps

print(f"FPS: {fps}")
print(f"Resolution: {width}x{height}")
print(f"Frame count: {frame_count}")
print(f"Duration: {duration:.2f} seconds")

cap.release()
```

### Frame-by-Frame Processing

```python
import cv2
import numpy as np

cap = cv2.VideoCapture('video.mp4')
frame_number = 0

while cap.isOpened():
    ret, frame = cap.read()

    if not ret:
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    cv2.imwrite(f'frames/frame_{frame_number:04d}.png', frame)

    frame_number += 1

cap.release()
```

### Scene Detection with OpenCV

#### Content-Based Detection

```python
import cv2
import numpy as np

def detect_scenes(video_path, threshold=30):
    cap = cv2.VideoCapture(video_path)

    prev_frame = None
    scene_changes = []
    frame_number = 0

    while cap.isOpened():
        ret, frame = cap.read()

        if not ret:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        if prev_frame is not None:
            diff = cv2.absdiff(prev_frame, gray)
            mean_diff = np.mean(diff)

            if mean_diff > threshold:
                timestamp = frame_number / cap.get(cv2.CAP_PROP_FPS)
                scene_changes.append({
                    'frame': frame_number,
                    'timestamp': timestamp,
                    'diff': mean_diff
                })

        prev_frame = gray
        frame_number += 1

    cap.release()
    return scene_changes

scenes = detect_scenes('video.mp4', threshold=30)
for scene in scenes:
    print(f"Scene change at frame {scene['frame']} ({scene['timestamp']:.2f}s), diff: {scene['diff']:.2f}")
```

#### Histogram-Based Detection

```python
import cv2
import numpy as np

def detect_scenes_histogram(video_path, threshold=0.5):
    cap = cv2.VideoCapture(video_path)

    prev_hist = None
    scene_changes = []
    frame_number = 0

    while cap.isOpened():
        ret, frame = cap.read()

        if not ret:
            break

        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

        hist = cv2.calcHist([hsv], [0, 1], None, [50, 60], [0, 180, 0, 256])
        hist = cv2.normalize(hist, hist).flatten()

        if prev_hist is not None:
            diff = cv2.compareHist(prev_hist, hist, cv2.HISTCMP_CORREL)

            if diff < threshold:
                timestamp = frame_number / cap.get(cv2.CAP_PROP_FPS)
                scene_changes.append({
                    'frame': frame_number,
                    'timestamp': timestamp,
                    'similarity': diff
                })

        prev_hist = hist
        frame_number += 1

    cap.release()
    return scene_changes

scenes = detect_scenes_histogram('video.mp4', threshold=0.5)
```

### Motion Detection

#### Background Subtraction

```python
import cv2

cap = cv2.VideoCapture('video.mp4')
bg_subtractor = cv2.createBackgroundSubtractorMOG2()

while cap.isOpened():
    ret, frame = cap.read()

    if not ret:
        break

    fg_mask = bg_subtractor.apply(frame)

    cv2.imshow('Motion', fg_mask)

    if cv2.waitKey(30) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
```

#### Frame Differencing

```python
import cv2
import numpy as np

cap = cv2.VideoCapture('video.mp4')

ret, frame1 = cap.read()
ret, frame2 = cap.read()

while cap.isOpened():
    diff = cv2.absdiff(frame1, frame2)
    gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)

    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    _, thresh = cv2.threshold(blur, 20, 255, cv2.THRESH_BINARY)

    dilated = cv2.dilate(thresh, None, iterations=3)
    contours, _ = cv2.findContours(dilated, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

    for contour in contours:
        if cv2.contourArea(contour) < 500:
            continue

        (x, y, w, h) = cv2.boundingRect(contour)
        cv2.rectangle(frame1, (x, y), (x+w, y+h), (0, 255, 0), 2)

    cv2.imshow('Motion Detection', frame1)

    frame1 = frame2
    ret, frame2 = cap.read()

    if not ret or cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
```

### Keyframe Extraction

```python
import cv2
import numpy as np

def extract_keyframes(video_path, threshold=30, min_interval=30):
    cap = cv2.VideoCapture(video_path)

    prev_frame = None
    keyframes = []
    frame_number = 0
    last_keyframe = -min_interval

    while cap.isOpened():
        ret, frame = cap.read()

        if not ret:
            break

        if frame_number - last_keyframe < min_interval:
            frame_number += 1
            continue

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        if prev_frame is not None:
            diff = cv2.absdiff(prev_frame, gray)
            mean_diff = np.mean(diff)

            if mean_diff > threshold:
                timestamp = frame_number / cap.get(cv2.CAP_PROP_FPS)
                keyframes.append({
                    'frame': frame_number,
                    'timestamp': timestamp,
                    'image': frame.copy()
                })
                last_keyframe = frame_number

        prev_frame = gray
        frame_number += 1

    cap.release()
    return keyframes

keyframes = extract_keyframes('video.mp4', threshold=30, min_interval=30)

for i, kf in enumerate(keyframes):
    cv2.imwrite(f'keyframes/keyframe_{i:04d}.png', kf['image'])
    print(f"Keyframe {i} at {kf['timestamp']:.2f}s")
```

## Performance Optimization

### GPU Acceleration

**Check CUDA availability:**
```python
import cv2

print(cv2.cuda.getCudaEnabledDeviceCount())
```

**Use GPU modules:**
```python
import cv2

gpu_frame = cv2.cuda_GpuMat()
gpu_frame.upload(frame)
```

### Multi-threading

```python
import cv2
from concurrent.futures import ThreadPoolExecutor

def process_frame(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    return gray

cap = cv2.VideoCapture('video.mp4')
frames = []

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
    frames.append(frame)

cap.release()

with ThreadPoolExecutor(max_workers=8) as executor:
    processed = list(executor.map(process_frame, frames))
```

## Best Practices

### PySceneDetect
1. Use ContentDetector for most cases
2. Adjust threshold based on video type
3. Set minimum scene length to avoid false positives
4. Combine multiple detectors for robustness
5. Save scene data for reuse

### OpenCV
1. Release VideoCapture after use
2. Use grayscale for faster processing
3. Implement frame skipping for large videos
4. Use appropriate thresholds for detection
5. Consider GPU acceleration for real-time

### Integration
1. PySceneDetect for scene detection
2. OpenCV for custom frame analysis
3. Combine both for comprehensive analysis
4. Export data in structured format (JSON/CSV)
5. Parallelize processing when possible

## Resources

- PySceneDetect: https://github.com/Breakthrough/PySceneDetect
- PySceneDetect Docs: https://scenedetect.com
- OpenCV Docs: https://docs.opencv.org
- OpenCV Python Tutorials: https://docs.opencv.org/master/d6/d00/tutorial_py_root.html

## Integration Notes

### For Video Recreation Project

**Scene Detection:**
- Use PySceneDetect for accurate scene boundaries
- Extract scene timestamps
- Generate scene thumbnails
- Combine with FFmpeg for verification

**Frame Analysis:**
- Keyframe extraction
- Motion detection
- Visual feature extraction
- Shot composition analysis

**Metadata Generation:**
- Scene boundaries with timestamps
- Keyframe locations
- Motion intensity metrics
- Visual transition types
