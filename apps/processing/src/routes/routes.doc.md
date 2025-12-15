# Routes Documentation

## Endpoints Overview

All routes follow the schema defined in the parent README.

### GET /devices/:deviceId/videos

List all videos for a device.

**Parameters:**

- `deviceId` (string, path) - Device identifier

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "videoId": "string",
      "timestamp": "ISO8601",
      "status": "AVAILABLE|PROCESSED|PROCESSING|FAILED",
      "recommended": "boolean",
      "duration": "number (seconds)",
      "thumbnailUrl": "string (URL)"
    }
  ]
}
```

**Error (400):** Invalid deviceId

---

### GET /devices/:deviceId/videos/:videoId

Get video details with all available versions.

**Parameters:**

- `deviceId` (string, path) - Device identifier
- `videoId` (string, path) - Video identifier

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "videoId": "string",
    "timestamp": "ISO8601",
    "status": "AVAILABLE|PROCESSED|PROCESSING|FAILED",
    "recommended": "boolean",
    "duration": "number (seconds)",
    "resolution": "string (1920x1080)",
    "versions": [
      {
        "type": "ORIGINAL|SUBTITLED|SUBTITLED_ENGAGING|SUBTITLED_EMOJI",
        "url": "string (download URL)",
        "title": "string",
        "description": "string",
        "thumbnailUrl": "string (URL)"
      }
    ]
  }
}
```

**Error (400):** Invalid deviceId or videoId
**Error (404):** Video not found

---

### POST /devices/:deviceId/videos/:videoId/process

Initiate video processing. Returns immediately with jobId.

**Parameters:**

- `deviceId` (string, path) - Device identifier
- `videoId` (string, path) - Video identifier

**Response (202 Accepted):**

```json
{
  "success": true,
  "data": {
    "jobId": "uuid"
  }
}
```

**Error (400):** Invalid deviceId or videoId
**Error (404):** Video not found

---

### GET /jobs/:jobId/status

Get processing job status and progress.

**Parameters:**

- `jobId` (string, path) - Job identifier (UUID)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "jobId": "uuid",
    "status": "PENDING|PROCESSING|COMPLETED|FAILED",
    "progress": "number (0-100)",
    "error": "string (if failed, optional)"
  }
}
```

**Error (400):** Invalid jobId format
**Error (404):** Job not found

---

## Implementation Notes

1. **Validation**: All route parameters are validated before reaching controllers
2. **Error Handling**: Consistent error response format across all endpoints
3. **Async Processing**: Video processing happens in background (202 Accepted)
4. **Progress Tracking**: Client polls job status endpoint for progress updates
5. **State Management**: Database tracks all state changes for reliability
