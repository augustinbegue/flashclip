import { DatabaseService } from '../services/database/database.service';
import { StorageService } from '../services/storage/storage.service';
import { WorkerService } from '../services/worker/worker.service';

/**
 * VideosController handles business logic for video endpoints
 */
export class VideosController {
  constructor(
    private databaseService: DatabaseService,
    private workerService: WorkerService,
    private storageService: StorageService
  ) {}

  /**
   * List all videos for a device
   * This method now reconciles file server state with database
   */
  async listVideos(deviceId: string) {
    // Step 1: List videos from file server (source of truth)
    const fileServerVideos =
      await this.storageService.listDeviceVideos(deviceId);

    // Step 2: Reconcile with database
    // Create/update database entries for files on server
    const videoPromises = fileServerVideos.map((fileVideo) =>
      this.databaseService.upsertVideoFromFileServer({
        deviceId,
        videoId: fileVideo.videoId,
        filename: fileVideo.filename,
        size: fileVideo.size,
        modified: fileVideo.modified,
      })
    );

    await Promise.all(videoPromises);

    // Step 3: Mark or remove orphaned database entries (videos in DB but not on file server)
    const existingVideoIds = fileServerVideos.map((v) => v.videoId);
    await this.databaseService.reconcileVideos(deviceId, existingVideoIds);

    // Step 4: Fetch updated list from database with all metadata
    const videos = await this.databaseService.findVideosByDevice(deviceId);

    return videos.map((video) => ({
      videoId: video.videoId,
      timestamp: video.timestamp.toISOString(),
      status: video.status,
      recommended: video.recommended,
      duration: video.duration,
      thumbnailUrl:
        video.thumbnailUrl ||
        this.storageService.getThumbnailUrl(deviceId, video.videoId),
    }));
  }

  /**
   * Get video details with all versions
   */
  async getVideoDetails(deviceId: string, videoId: string) {
    await this.listVideos(deviceId); // Ensure reconciliation before fetching details
    const video = await this.databaseService.findVideo(deviceId, videoId);

    if (!video) {
      return null;
    }

    return {
      videoId: video.videoId,
      timestamp: video.timestamp.toISOString(),
      status: video.status,
      recommended: video.recommended,
      duration: video.duration,
      resolution: video.resolution,
      versions: video.versions.map((version) => ({
        type: version.type,
        url: version.url,
        title: version.title,
        description: version.description,
        thumbnailUrl: version.thumbnailUrl,
      })),
    };
  }

  /**
   * Initiate processing for a video
   */
  async initiateProcessing(deviceId: string, videoId: string) {
    await this.listVideos(deviceId); // Ensure reconciliation before fetching details
    const video = await this.databaseService.findVideo(deviceId, videoId);

    if (!video) {
      throw new Error(`Video not found: ${deviceId}/${videoId}`);
    }

    // Create job
    const job = await this.databaseService.createJob(video.id);

    // Queue processing
    await this.workerService.queueProcessingJob(job.jobId, video.id);

    return {
      jobId: job.jobId,
    };
  }
}
