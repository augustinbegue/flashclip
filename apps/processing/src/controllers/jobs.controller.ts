import { DatabaseService } from '../services/database/database.service';

/**
 * JobsController handles business logic for job endpoints
 */
export class JobsController {
  constructor(private databaseService: DatabaseService) {}

  /**
   * Get job status
   */
  async getJobStatus(jobId: string) {
    const job = await this.databaseService.getJobStatus(jobId);

    if (!job) {
      return null;
    }

    return {
      jobId: job.jobId,
      status: job.status,
      progress: job.progress,
      error: job.error || undefined,
    };
  }
}
