# FFmpeg Service Documentation

## Overview

FFmpegService encapsulates all video processing operations. It includes nested processors, converters, and overlays for a complete video transformation pipeline.

---

## FFmpegService (Main Wrapper)

Wraps fluent-ffmpeg library for video operations.

**Core Methods:**

### extractAudio(inputPath, outputPath)

Extracts audio track from video for transcription.

- Codec: AAC
- Bitrate: 128k
- No video stream

### getVideoMetadata(videoPath)

Retrieves video properties without modification.

**Returns:**

```typescript
{
  duration: number,      // seconds
  resolution: string,    // "1920x1080"
  codec: string         // "h264"
}
```

### generateThumbnail(videoPath, outputPath, timestamp)

Creates a single frame JPEG at specified timestamp (default 1s).

### addSubtitles(videoPath, subtitlePath, outputPath)

Burns subtitle file into video using FFmpeg subtitle filter.

- Preserves video codec
- Applies styling via FFmpeg filter

### addEmojiOverlay(videoPath, outputPath, filterComplex)

Applies FFmpeg filter_complex for emoji overlays.

- Uses drawtext filters
- Emoji text rendered at specific timestamps

### copyVideo(inputPath, outputPath)

Copies video and audio without re-encoding (for original version).

- Fastest operation
- No quality loss

---

## AudioProcessor

Prepares audio for AI transcription.

```typescript
class AudioProcessor {
  extractAndPrepare(videoPath, outputAudioPath)
    → Calls FFmpegService.extractAudio()
    → Returns audio file ready for OpenAI Whisper
}
```

---

## VideoProcessor (Main Orchestrator)

Coordinates entire processing pipeline. **This is the main entry point for background jobs.**

### processVideo(jobId, videoId)

**Pipeline Steps:**

1. **Setup**
   - Create temp directory
   - Fetch job and video from database
   - Update job: PENDING → PROCESSING

2. **Audio Extraction** (5% → 15%)
   - Download video from remote storage
   - Extract audio using AudioProcessor
   - Save to temp directory

3. **Transcription** (15% → 30%)
   - Send audio to OpenAI Whisper API
   - Get transcript with timing segments
   - Parse and validate segments

4. **Analysis** (30% → 40%)
   - Analyze transcript quality
   - Determine recommended flag
   - Update video with recommendation

5. **Version Generation** (40% → 95%)
   - **Original** (40% → 50%)
     - Copy video without encoding
     - Upload to remote
   - **Subtitled** (50% → 65%)
     - Convert transcript to SRT
     - Apply subtitles via SubtitleOverlay
     - Upload
   - **Engaging** (65% → 80%)
     - Convert transcript to ASS format
     - Apply enhanced styling
     - Upload
   - **Emoji** (80% → 95%)
     - Match text to emojis via EmojiService
     - Generate timeline
     - Apply emojis via EmojiOverlay
     - Upload

6. **Completion** (95% → 100%)
   - Update job: COMPLETED
   - Update video: PROCESSED
   - Clean temp files
   - Mark as finished

**Error Handling:**

- Catch any error during pipeline
- Set job status to FAILED
- Store error message
- Clean temp files
- Rethrow for logging

---

## SRTConverter

Generates SubRip (.srt) subtitle format.

```
1
00:00:00,000 --> 00:00:05,000
First subtitle

2
00:00:05,000 --> 00:00:10,000
Second subtitle
```

**Methods:**

- `convertAndWrite(segments, path)` - Generate and write to file
- `toSRT(segments)` - Return format string
- Private: `formatTimestamp()` - HH:MM:SS,mmm format

---

## ASSConverter

Generates Advanced SubStation Alpha (.ass) format with styling.

**Features:**

- Font styling (name, size, color)
- Outline and shadow effects
- V4+ format (modern standard)
- Custom style definitions

**Methods:**

- `convertAndWrite(segments, path, style?)` - Generate with optional styling
- `toASS(segments, style?)` - Return format string
- Private: `formatASSTimestamp()` - H:MM:SS.cc format

---

## SubtitleOverlay

Applies subtitle files to videos during rendering.

```typescript
class SubtitleOverlay {
  apply(videoPath, subtitlePath, outputPath)
    → Calls FFmpegService.addSubtitles()
    → Burns subtitles into final video
}
```

---

## EmojiOverlay

Adds animated emoji text overlays to videos.

### generateFilterComplex(emojiTimeline)

Creates FFmpeg filter_complex string for emoji rendering:

```
drawtext=text='😀':fontsize=60:fontcolor=white:x=(w-text_w)/2:y=h-100:enable='between(t,0,5)',
drawtext=text='😂':fontsize=60:fontcolor=white:x=(w-text_w)/2:y=h-100:enable='between(t,5,10)',
...
```

### apply(videoPath, outputPath, emojiTimeline)

- Generate filter complex
- Call FFmpegService.addEmojiOverlay()
- Render emojis at specified times

**Timeline Format:**

```typescript
[
  { emoji: '😀', start: 0, end: 5 },
  { emoji: '😂', start: 5, end: 10 },
];
```

---

## Temporary File Management

Files created in `tmp/{jobId}/`:

- `original.mp4` - Downloaded source video
- `audio.mp3` - Extracted audio
- `subtitled.srt` - SRT subtitle file
- `subtitled.mp4` - Final subtitled video
- `engaging.ass` - ASS subtitle file
- `engaging.mp4` - Final engaging video
- `emoji.mp4` - Final emoji video

All cleaned up after job completion.

---

## Error Handling

Each FFmpeg operation:

- Logs detailed error message
- Includes context (input/output paths)
- Propagates error up to VideoProcessor
- Triggers job failure and cleanup
