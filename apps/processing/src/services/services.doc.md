# Services Documentation

## DatabaseService

Prisma ORM wrapper for all database operations.

**Methods:**

- `findVideosByDevice(deviceId)` - Get all videos for device, ordered by timestamp DESC
- `findVideo(deviceId, videoId)` - Get video with all versions included
- `createVideo(data)` - Create new video record with initial status AVAILABLE
- `updateVideoStatus(id, status, recommended?)` - Update video processing status
- `createJob(videoId)` - Create processing job with unique jobId
- `updateJobProgress(jobId, progress, status?, error?)` - Update job state
- `getJobStatus(jobId)` - Get job with video reference
- `createVideoVersion(videoId, data)` - Add processed video variant

**Models:**

- Video: deviceId, videoId, timestamp, status, recommended, duration, resolution
- Job: jobId (unique), videoId (FK), status, progress (0-100), error
- VideoVersion: type, url, filePath, title, description, thumbnailUrl

---

## FFmpegService (with nested components)

Video processing operations wrapper around fluent-ffmpeg library.

**Main Service Methods:**

- `extractAudio(inputPath, outputPath)` - Extract audio track for transcription
- `getVideoMetadata(videoPath)` - Get duration, resolution, codec info
- `generateThumbnail(videoPath, outputPath, timestamp?)` - Create thumbnail at timestamp
- `addSubtitles(videoPath, subtitlePath, outputPath)` - Burn SRT/ASS into video
- `addEmojiOverlay(videoPath, outputPath, filterComplex)` - Add emoji animations
- `copyVideo(inputPath, outputPath)` - Copy without re-encoding

### AudioProcessor

Extracts and prepares audio for transcription.

- `extractAndPrepare(videoPath, outputAudioPath)` → audio file

### VideoProcessor (Main Pipeline)

Orchestrates entire processing workflow.

- `processVideo(jobId, videoId)` - Full pipeline:
  1. Download video
  2. Extract audio
  3. Transcribe
  4. Analyze
  5. Create 4 versions
  6. Upload
  7. Mark complete

### SRT/ASS Converters

Convert transcript segments to subtitle formats.

- `convertAndWrite(segments, outputPath)` - Write to file
- `toSRT/toASS(segments)` - Return format string

### Subtitle/Emoji Overlays

Apply overlays to videos via FFmpeg filters.

- `apply(videoPath, outputPath, config)` - Generate and apply

---

## OpenAIService (with nested components)

AI transcription and text analysis via OpenAI APIs.

**Main Service Methods:**

- `transcribeAudio(audioPath)` - Whisper API transcription with segments
- `analyzeTranscript(transcript)` - GPT analysis: recommended flag + reason
- `generateEngagingText(transcript)` - GPT rewrite for better subtitles

### TextProcessor

Formats transcripts for different subtitle formats.

- `parseTranscript(raw, segments)` - Filter and structure segments
- `formatForSRT/formatForASS(segments, style?)` - Generate subtitle content
- `enhanceTextForReadability(text)` - Split long sentences
- `extractKeyPhrases(text)` - Get top 10 phrases

---

## EmojiService

Matches transcript text to relevant emojis.

**Methods:**

- `loadEmojiDatabase()` - Load emoji mappings from JSON
- `matchEmojis(text)` - Find emojis with confidence scores
- `generateEmojiTimeline(segments)` - Create timed emoji animations
- `isInitialized()` - Check if loaded

**Data:**

- emojis.json: Array of {emoji, keywords[]} entries

---

## StorageService

Remote fileserver integration using copyparty protocol (no local storage).

**File Structure:**

- Original videos: `uploads/{deviceId}/*.mp4` (uploaded by capture device)
- Processed videos: `videos/{deviceId}/{videoId}/{version}.mp4`
- Thumbnails: `videos/{deviceId}/{videoId}/thumbnail.jpg`

**Methods:**

- `downloadVideo(deviceId, filename)` - Download original from uploads folder
- `uploadVideo(deviceId, videoId, buffer)` - Upload original video
- `uploadProcessedVersion(deviceId, videoId, type, buffer)` - Upload variant (subtitled/engaging/emoji)
- `uploadThumbnail(deviceId, videoId, buffer)` - Save thumbnail
- `getVideoUrl(deviceId, videoId, version?)` - Generate public URL for processed video
- `getOriginalVideoUrl(deviceId, filename)` - Generate URL for original in uploads
- `getThumbnailUrl(deviceId, videoId)` - Generate thumbnail URL
- `exists(path)` - Check if file exists on server
- `listFiles(path, options?)` - List directory contents
- `deleteFile(path)` - Remove file from server
- `cleanupTempFiles(paths)` - Remove local temp files

**Configuration:**

- FILESERVER_BASE_URL - Copyparty server endpoint
- FILESERVER_PATH_PREFIX - Optional path prefix for all file operations (e.g., "/flashclip" or "myproject")
- FILESERVER_PASSWORD - Password for authentication

**Authentication:**

Uses copyparty's PW header and query parameter authentication with password only.

**API Reference:**

Based on copyparty HTTP API (https://github.com/9001/copyparty)

---

## WorkerService

Job queue and background processing orchestration.

**Methods:**

- `queueProcessingJob(jobId, videoId)` - Add to queue and start if idle
- `getQueueStatus()` - Return {queued, isProcessing}

**Implementation:**

- In-memory queue with simple async processing
- Prevents concurrent processing, sequential job execution
- Can be upgraded to Redis/Bull for distributed processing

---

## Service Interactions

```
Route → Controller → Services

VideosController
├─ calls DatabaseService.findVideosByDevice/findVideo
├─ calls WorkerService.queueProcessingJob
└─ calls StorageService.getThumbnailUrl

JobsController
└─ calls DatabaseService.getJobStatus

WorkerService
└─ executes VideoProcessor.processVideo

VideoProcessor
├─ calls AudioProcessor
├─ calls OpenAIService + TextProcessor
├─ calls EmojiService
├─ calls SRTConverter/ASSConverter
├─ calls SubtitleOverlay/EmojiOverlay
├─ calls StorageService
└─ calls DatabaseService (for progress updates)
```
