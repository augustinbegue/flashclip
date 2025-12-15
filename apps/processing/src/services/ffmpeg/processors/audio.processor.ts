import { FFmpegService } from '../ffmpeg.service';

/**
 * AudioProcessor handles audio extraction and preparation for transcription
 */
export class AudioProcessor {
  private ffmpegService: FFmpegService;

  constructor(ffmpegService: FFmpegService) {
    this.ffmpegService = ffmpegService;
  }

  /**
   * Extract and prepare audio for transcription
   */
  async extractAndPrepare(
    videoPath: string,
    outputAudioPath: string
  ): Promise<void> {
    console.log(`[AudioProcessor] Extracting audio from ${videoPath}`);
    return this.ffmpegService.extractAudio(videoPath, outputAudioPath);
  }
}
