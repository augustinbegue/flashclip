import ffmpeg from 'fluent-ffmpeg';
import { CONSTANTS } from '../../config/constants';

/**
 * FFmpegService wraps fluent-ffmpeg for video processing operations
 */
export class FFmpegService {
  /**
   * Extract audio from video file
   * Uses WAV format with PCM encoding optimized for speech recognition
   * Applies audio filters for noise reduction and normalization:
   * - highpass=f=80: Remove low frequency noise below 80Hz
   * - lowpass=f=8000: Remove high frequency noise above 8kHz
   * - loudnorm=I=-20: Normalize audio loudness to -20 LUFS
   */
  async extractAudio(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(
        `[FFmpegService] Extracting audio from ${inputPath} to ${outputPath}`
      );

      const command = ffmpeg(inputPath)
        .output(outputPath)
        .audioCodec(CONSTANTS.FFMPEG.AUDIO_CODEC) // pcm_s16le
        .audioFilters([
          'highpass=f=80', // Remove low frequency noise
          'lowpass=f=8000', // Remove high frequency noise
          'loudnorm=I=-20', // Normalize loudness
        ])
        .audioFrequency(parseInt(CONSTANTS.FFMPEG.AUDIO_SAMPLE_RATE)) // 16000 Hz
        .audioChannels(parseInt(CONSTANTS.FFMPEG.AUDIO_CHANNELS)) // 1 (mono)
        .format(CONSTANTS.FFMPEG.AUDIO_FORMAT) // wav
        .noVideo()
        .on('start', (commandLine) => {
          console.log('[FFmpegService] FFmpeg command:', commandLine);
        })
        .on('progress', (progress) => {
          console.log('[FFmpegService] FFmpeg progress:', progress);
        })
        .on('end', () => {
          console.log(`[FFmpegService] Audio extracted: ${outputPath}`);
          resolve();
        })
        .on('error', (error, stdout, stderr) => {
          console.error('[FFmpegService] Audio extraction failed:', error);
          console.error('[FFmpegService] FFmpeg stdout:', stdout);
          console.error('[FFmpegService] FFmpeg stderr:', stderr);
          reject(error);
        });

      command.run();
    });
  }

  /**
   * Get video metadata (duration, resolution, codec info)
   */
  async getVideoMetadata(videoPath: string): Promise<{
    duration: number;
    resolution: string;
    codec: string;
  }> {
    return new Promise((resolve, reject) => {
      console.log(`[FFmpegService] Extracting metadata from ${videoPath}`);

      ffmpeg.ffprobe(videoPath, (error, metadata) => {
        if (error) {
          console.error('[FFmpegService] Metadata extraction failed:', error);
          console.error(
            '[FFmpegService] Error details:',
            JSON.stringify(error, null, 2)
          );
          reject(error);
          return;
        }

        const videoStream = metadata.streams.find(
          (s) => s.codec_type === 'video'
        );
        const duration = metadata.format.duration || 0;
        const resolution = videoStream
          ? `${videoStream.width}x${videoStream.height}`
          : 'unknown';
        const codec = videoStream?.codec_name || 'unknown';

        console.log(
          `[FFmpegService] Video metadata: duration=${duration}s, resolution=${resolution}, codec=${codec}`
        );

        resolve({
          duration,
          resolution,
          codec,
        });
      });
    });
  }

  /**
   * Get video duration in seconds using ffprobe
   */
  async getVideoDuration(videoPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      console.log(`[FFmpegService] Getting duration for ${videoPath}`);

      ffmpeg.ffprobe(videoPath, (error, metadata) => {
        if (error) {
          console.error('[FFmpegService] Duration extraction failed:', error);
          reject(error);
          return;
        }

        const duration = metadata.format.duration || 0;
        console.log(`[FFmpegService] Video duration: ${duration}s`);
        resolve(duration);
      });
    });
  }

  /**
   * Generate thumbnail from video
   */
  async generateThumbnail(
    videoPath: string,
    outputPath: string,
    timestamp: number = 1
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(
        `[FFmpegService] Generating thumbnail from ${videoPath} at timestamp ${timestamp}s`
      );

      ffmpeg(videoPath)
        .screenshots({
          timestamps: [timestamp],
          filename: outputPath,
          folder: outputPath.substring(0, outputPath.lastIndexOf('/')),
        })
        .on('start', (commandLine) => {
          console.log('[FFmpegService] FFmpeg command:', commandLine);
        })
        .on('end', () => {
          console.log(`[FFmpegService] Thumbnail generated: ${outputPath}`);
          resolve();
        })
        .on('error', (error, stdout, stderr) => {
          console.error('[FFmpegService] Thumbnail generation failed:', error);
          console.error('[FFmpegService] FFmpeg stdout:', stdout);
          console.error('[FFmpegService] FFmpeg stderr:', stderr);
          reject(error);
        });
    });
  }

  /**
   * Add subtitles to video
   * Supports both SRT and ASS subtitle formats
   */
  async addSubtitles(
    videoPath: string,
    subtitlePath: string,
    outputPath: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(
        `[FFmpegService] Adding subtitles from ${subtitlePath} to ${videoPath}`
      );

      // Determine subtitle format from file extension
      const isASS = subtitlePath.toLowerCase().endsWith('.ass');
      const subtitleFilter = isASS
        ? `ass=${subtitlePath.replace(/:/g, '\\:')}`
        : `subtitles=${subtitlePath.replace(/:/g, '\\:')}`;

      ffmpeg(videoPath)
        .output(outputPath)
        .videoCodec(CONSTANTS.FFMPEG.VIDEO_CODEC)
        .videoBitrate(CONSTANTS.FFMPEG.VIDEO_BITRATE)
        .audioCodec('copy') // Copy audio without re-encoding
        .addOption('-preset', CONSTANTS.FFMPEG.VIDEO_PRESET)
        .addOption('-vf', subtitleFilter)
        .on('start', (commandLine) => {
          console.log('[FFmpegService] FFmpeg command:', commandLine);
        })
        .on('progress', (progress) => {
          console.log('[FFmpegService] FFmpeg progress:', progress);
        })
        .on('end', () => {
          console.log(`[FFmpegService] Subtitles added: ${outputPath}`);
          resolve();
        })
        .on('error', (error, stdout, stderr) => {
          console.error('[FFmpegService] Subtitle addition failed:', error);
          console.error('[FFmpegService] FFmpeg stdout:', stdout);
          console.error('[FFmpegService] FFmpeg stderr:', stderr);
          reject(error);
        })
        .run();
    });
  }

  /**
   * Add emoji overlay to video
   */
  async addEmojiOverlay(
    videoPath: string,
    outputPath: string,
    filterComplex: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(
        `[FFmpegService] Adding emoji overlay to ${videoPath} with filter: ${filterComplex}`
      );

      ffmpeg(videoPath)
        .output(outputPath)
        .videoCodec(CONSTANTS.FFMPEG.VIDEO_CODEC)
        .audioCodec('copy') // Copy audio without re-encoding
        .addOption('-preset', 'fast') // Use fast preset for overlays as per legacy
        .addOption('-filter_complex', filterComplex)
        .addOption('-pix_fmt', 'yuv420p') // Ensure compatibility
        .on('start', (commandLine) => {
          console.log('[FFmpegService] FFmpeg command:', commandLine);
        })
        .on('progress', (progress) => {
          console.log('[FFmpegService] FFmpeg progress:', progress);
        })
        .on('end', () => {
          console.log(`[FFmpegService] Emoji overlay added: ${outputPath}`);
          resolve();
        })
        .on('error', (error, stdout, stderr) => {
          console.error('[FFmpegService] Emoji overlay failed:', error);
          console.error('[FFmpegService] FFmpeg stdout:', stdout);
          console.error('[FFmpegService] FFmpeg stderr:', stderr);
          reject(error);
        })
        .run();
    });
  }

  /**
   * Copy video without re-encoding (for original version)
   */
  async copyVideo(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(
        `[FFmpegService] Copying video from ${inputPath} to ${outputPath}`
      );

      ffmpeg(inputPath)
        .output(outputPath)
        .videoCodec('copy')
        .audioCodec('copy')
        .on('start', (commandLine) => {
          console.log('[FFmpegService] FFmpeg command:', commandLine);
        })
        .on('progress', (progress) => {
          console.log('[FFmpegService] FFmpeg progress:', progress);
        })
        .on('end', () => {
          console.log(`[FFmpegService] Video copied: ${outputPath}`);
          resolve();
        })
        .on('error', (error, stdout, stderr) => {
          console.error('[FFmpegService] Copy failed:', error);
          console.error('[FFmpegService] FFmpeg stdout:', stdout);
          console.error('[FFmpegService] FFmpeg stderr:', stderr);
          reject(error);
        })
        .run();
    });
  }
}
