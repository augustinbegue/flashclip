import { DatabaseService } from '../database/database.service';
import { VideoProcessor } from '../ffmpeg/processors/video.processor';

/**
 * WorkerService manages job queue and background processing
 */
export class WorkerService {
  private jobQueue: Array<{ jobId: string; videoId: string }> = [];
  private isProcessing = false;
  private videoProcessor: VideoProcessor;
  private databaseService: DatabaseService;

  constructor(
    videoProcessor: VideoProcessor,
    databaseService: DatabaseService
  ) {
    this.videoProcessor = videoProcessor;
    this.databaseService = databaseService;
  }

  /**
   * Queue a processing job
   */
  async queueProcessingJob(jobId: string, videoId: string): Promise<void> {
    this.jobQueue.push({ jobId, videoId });
    console.log(`[WorkerService] Queued job ${jobId} for video ${videoId}`);

    // Start processing if not already running
    if (!this.isProcessing) {
      this.startProcessing();
    }
  }

  /**
   * Start processing queued jobs
   */
  private async startProcessing(): Promise<void> {
    if (this.isProcessing || this.jobQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.jobQueue.length > 0) {
      const job = this.jobQueue.shift();
      if (!job) break;

      try {
        console.log(
          `[WorkerService] Processing job ${job.jobId} for video ${job.videoId}`
        );
        await this.videoProcessor.processVideo(job.jobId);
      } catch (error) {
        console.error(
          `[WorkerService] Failed to process job ${job.jobId}:`,
          error
        );
        // Error is already handled in VideoProcessor
      }
    }

    this.isProcessing = false;
  }

  /**
   * Get current queue status
   */
  getQueueStatus(): { queued: number; isProcessing: boolean } {
    return {
      queued: this.jobQueue.length,
      isProcessing: this.isProcessing,
    };
  }
}
