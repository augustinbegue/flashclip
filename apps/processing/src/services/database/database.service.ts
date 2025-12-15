import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { CONSTANTS } from '../../config/constants';

export class DatabaseService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Find all videos for a device
   */
  async findVideosByDevice(deviceId: string) {
    return this.prisma.video.findMany({
      where: { deviceId },
      orderBy: { timestamp: 'desc' },
    });
  }

  /**
   * Find a specific video with all its versions
   */
  async findVideo(deviceId: string, videoId: string) {
    return this.prisma.video.findUnique({
      where: {
        deviceId_videoId: { deviceId, videoId },
      },
      include: {
        versions: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  /**
   * Create a new video record
   */
  async createVideo(data: {
    deviceId: string;
    videoId: string;
    timestamp: Date;
    duration: number;
    resolution: string;
    thumbnailUrl?: string;
    originalPath: string;
  }) {
    return this.prisma.video.create({
      data: {
        ...data,
        status: CONSTANTS.VIDEO_STATUS.AVAILABLE,
        recommended: false,
      },
    });
  }

  /**
   * Update video processing status
   */
  async updateVideoStatus(id: string, status: string, recommended?: boolean) {
    return this.prisma.video.update({
      where: { id },
      data: {
        status,
        ...(recommended !== undefined && { recommended }),
      },
    });
  }

  /**
   * Create a new processing job
   */
  async createJob(videoId: string) {
    const jobId = uuidv4();
    return this.prisma.job.create({
      data: {
        jobId,
        videoId,
        status: CONSTANTS.JOB_STATUS.PENDING,
        progress: 0,
      },
    });
  }

  /**
   * Update job progress and status
   */
  async updateJobProgress(
    jobId: string,
    progress: number,
    status?: string,
    error?: string
  ) {
    return this.prisma.job.update({
      where: { jobId },
      data: {
        progress,
        ...(status && { status }),
        ...(error && { error }),
      },
    });
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string) {
    return this.prisma.job.findUnique({
      where: { jobId },
      include: {
        video: {
          select: { id: true, videoId: true, deviceId: true },
        },
      },
    });
  }

  /**
   * Create a video version (processed variant)
   */
  async createVideoVersion(
    videoId: string,
    data: {
      type: string;
      url: string;
      title: string;
      description: string;
      thumbnailUrl?: string;
      filePath: string;
    }
  ) {
    return this.prisma.videoVersion.create({
      data: {
        videoId,
        ...data,
      },
    });
  }

  /**
   * Get video by ID (internal use)
   */
  async getVideoById(id: string) {
    return this.prisma.video.findUnique({
      where: { id },
    });
  }

  /**
   * Find job by jobId
   */
  async findJobById(jobId: string) {
    return this.prisma.job.findUnique({
      where: { jobId },
    });
  }

  /**
   * Find video by deviceId and videoId (without versions)
   */
  async findVideoByDeviceAndVideoId(deviceId: string, videoId: string) {
    return this.prisma.video.findUnique({
      where: {
        deviceId_videoId: { deviceId, videoId },
      },
    });
  }

  /**
   * Create or update video entry from file server scan
   */
  async upsertVideoFromFileServer(data: {
    deviceId: string;
    videoId: string;
    filename: string;
    size: number;
    modified: Date;
  }) {
    // Try to find existing video
    const existing = await this.findVideoByDeviceAndVideoId(
      data.deviceId,
      data.videoId
    );

    if (existing) {
      // Video exists in DB, update timestamp if needed
      return existing;
    }

    // Video doesn't exist in DB, create it with placeholder data
    return this.prisma.video.create({
      data: {
        deviceId: data.deviceId,
        videoId: data.videoId,
        timestamp: data.modified,
        duration: 0, // Will be updated when metadata is extracted
        resolution: 'unknown', // Will be updated when metadata is extracted
        originalPath: data.filename, // Just the filename, path is constructed by StorageService
        status: CONSTANTS.VIDEO_STATUS.AVAILABLE,
        recommended: false,
      },
    });
  }

  /**
   * Mark videos as deleted if they don't exist on file server
   * Optionally can delete them from database
   */
  async reconcileVideos(
    deviceId: string,
    existingVideoIds: string[],
    deleteOrphans: boolean = false
  ) {
    const dbVideos = await this.findVideosByDevice(deviceId);
    const orphanedVideos = dbVideos.filter(
      (video) => !existingVideoIds.includes(video.videoId)
    );

    if (deleteOrphans) {
      // Delete orphaned videos from database
      await this.prisma.video.deleteMany({
        where: {
          deviceId,
          videoId: {
            notIn: existingVideoIds,
          },
        },
      });
      console.log(
        `[DatabaseService] Deleted ${orphanedVideos.length} orphaned videos for device ${deviceId}`
      );
    }

    return {
      orphaned: orphanedVideos.length,
      deleted: deleteOrphans ? orphanedVideos.length : 0,
    };
  }
}
