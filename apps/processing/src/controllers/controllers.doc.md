# Controllers Documentation

## Overview

Controllers handle business logic between routes and services. They are injected into routes at runtime.

---

## VideosController

Manages video-related operations and processing initiation.

**Methods:**

### listVideos(deviceId)

Lists all videos for a device.

**Flow:**

1. DatabaseService.findVideosByDevice(deviceId)
2. Map results to API format
3. Generate thumbnail URLs via StorageService

**Returns:**

```json
[
  {
    "videoId": "string",
    "timestamp": "ISO8601",
    "status": "string",
    "recommended": "boolean",
    "duration": "number",
    "thumbnailUrl": "string"
  }
]
```

---

### getVideoDetails(deviceId, videoId)

Gets specific video metadata with all processed versions.

**Flow:**

1. DatabaseService.findVideo(deviceId, videoId) with versions included
2. Return null if not found
3. Map to API format with all version details

**Returns:**

```json
{
  "videoId": "string",
  "timestamp": "ISO8601",
  "status": "string",
  "recommended": "boolean",
  "duration": "number",
  "resolution": "string",
  "versions": [
    {
      "type": "string",
      "url": "string",
      "title": "string",
      "description": "string",
      "thumbnailUrl": "string"
    }
  ]
}
```

---

### initiateProcessing(deviceId, videoId)

Starts video processing pipeline.

**Flow:**

1. DatabaseService.findVideo(deviceId, videoId)
2. Throw error if not found
3. DatabaseService.createJob(videoId) → new Job
4. WorkerService.queueProcessingJob(jobId, videoId)
5. Return jobId immediately (202 Accepted)

**Returns:**

```json
{
  "jobId": "uuid"
}
```

---

## JobsController

Manages job status queries.

**Methods:**

### getJobStatus(jobId)

Retrieves current job status and progress.

**Flow:**

1. DatabaseService.getJobStatus(jobId)
2. Return null if not found
3. Map to API format

**Returns:**

```json
{
  "jobId": "uuid",
  "status": "string",
  "progress": "number (0-100)",
  "error": "string (optional)"
}
```

---

## Dependency Injection

Controllers are instantiated in `src/index.ts` and injected into routes:

```typescript
const videosController = new VideosController(
  databaseService,
  workerService,
  storageService
);

const jobsController = new JobsController(databaseService);

// Injected into routes via setter functions
// routeModule.setVideosController(videosController)
// routeModule.setJobsController(jobsController)
```

---

## Error Handling

Controllers throw descriptive errors:

- "Video not found: {deviceId}/{videoId}" → 404
- "Job not found: {jobId}" → 404
- Validation errors → 400 (caught in routes)

Routes catch and map to appropriate HTTP status codes.
