import { FFmpegService } from '../ffmpeg.service';

/**
 * SubtitleOverlay applies subtitle files to videos
 */
export class SubtitleOverlay {
  private ffmpegService: FFmpegService;

  constructor(ffmpegService: FFmpegService) {
    this.ffmpegService = ffmpegService;
  }

  /**
   * Apply subtitle file to video
   */
  async apply(
    videoPath: string,
    subtitlePath: string,
    outputPath: string
  ): Promise<void> {
    console.log(`[SubtitleOverlay] Applying ${subtitlePath} to ${videoPath}`);
    return this.ffmpegService.addSubtitles(videoPath, subtitlePath, outputPath);
  }
}
