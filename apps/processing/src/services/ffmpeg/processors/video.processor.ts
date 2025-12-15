import { CONSTANTS } from '../../../config/constants';
import { FileUtils } from '../../../utils/file.utils';
import { DatabaseService } from '../../database/database.service';
import { EmojiService } from '../../emoji/emoji.service';
import { OpenAIService } from '../../openai/openai.service';
import { TextProcessor } from '../../openai/processors/text.processor';
import { StorageService } from '../../storage/storage.service';
import { ASSConverter } from '../converters/ass.converter';
import { SRTConverter } from '../converters/srt.converter';
import { FFmpegService } from '../ffmpeg.service';
import { EmojiOverlay } from '../overlays/emoji.overlay';
import { SubtitleOverlay } from '../overlays/subtitle.overlay';
import { AudioProcessor } from './audio.processor';

/**
 * VideoProcessor orchestrates the entire video processing pipeline
 */
export class VideoProcessor {
  private ffmpegService: FFmpegService;
  private audioProcessor: AudioProcessor;
  private databaseService: DatabaseService;
  private openaiService: OpenAIService;
  private textProcessor: TextProcessor;
  private emojiService: EmojiService;
  private storageService: StorageService;
  private subtitleOverlay: SubtitleOverlay;
  private emojiOverlay: EmojiOverlay;

  constructor(
    ffmpegService: FFmpegService,
    databaseService: DatabaseService,
    openaiService: OpenAIService,
    emojiService: EmojiService,
    storageService: StorageService
  ) {
    this.ffmpegService = ffmpegService;
    this.audioProcessor = new AudioProcessor(ffmpegService);
    this.databaseService = databaseService;
    this.openaiService = openaiService;
    this.textProcessor = new TextProcessor();
    this.emojiService = emojiService;
    this.storageService = storageService;
    this.subtitleOverlay = new SubtitleOverlay(ffmpegService);
    this.emojiOverlay = new EmojiOverlay(ffmpegService);
  }

  /**
   * Main processing pipeline
   */
  async processVideo(jobId: string): Promise<void> {
    try {
      const tempDir = FileUtils.getTempJobDir(jobId);
      await FileUtils.ensureDir(tempDir);

      // Get job and video info
      const job = await this.databaseService.findJobById(jobId);
      if (!job) {
        throw new Error(`Job not found: ${jobId}`);
      }

      const video = await this.databaseService.getVideoById(job.videoId);
      if (!video) {
        throw new Error(`Video not found: ${job.videoId}`);
      }

      // Update job status and video status to PROCESSING
      await this.databaseService.updateJobProgress(
        jobId,
        CONSTANTS.PROGRESS.QUEUED,
        CONSTANTS.JOB_STATUS.PROCESSING
      );
      await this.databaseService.updateVideoStatus(
        video.id,
        CONSTANTS.VIDEO_STATUS.PROCESSING
      );

      // Step 1: Download video from storage (from upload/{deviceId}/{filename})
      console.log(
        `[VideoProcessor] Downloading video: ${video.deviceId}/${video.originalPath}`
      );
      const videoBuffer = await this.storageService.downloadVideo(
        video.deviceId,
        video.originalPath
      );
      const localVideoPath = FileUtils.getTempPath(jobId, 'original.mp4');
      await FileUtils.writeFile(localVideoPath, videoBuffer);

      // Step 2: Extract audio
      await this.databaseService.updateJobProgress(
        jobId,
        CONSTANTS.PROGRESS.AUDIO_EXTRACTED
      );
      const audioPath = FileUtils.getTempPath(jobId, 'audio.wav');
      await this.audioProcessor.extractAndPrepare(localVideoPath, audioPath);

      // Step 3: Transcribe audio with word-level timestamps
      await this.databaseService.updateJobProgress(
        jobId,
        CONSTANTS.PROGRESS.TRANSCRIBED
      );
      console.log(
        '[VideoProcessor] Transcribing audio with word-level detail...'
      );
      const words = await this.openaiService.transcribeAudio(audioPath);

      // Step 3a: Combine French apostrophes
      console.log('[VideoProcessor] Combining French apostrophes...');
      const combinedWords =
        this.textProcessor.combineWordsWithApostrophe(words);

      // Step 3b: Process with AI for spelling correction and emoji detection
      console.log(
        '[VideoProcessor] Processing with AI for spelling and emojis...'
      );
      const processed =
        await this.openaiService.processTranscriptionWithAI(combinedWords);
      const { words: correctedWords, emojis } = processed;

      // Save transcript data for debugging (dev mode only)
      const isDev = process.env.NODE_ENV !== 'production';
      if (isDev) {
        const transcriptPath = FileUtils.getTempPath(jobId, 'transcript.json');
        const emojiDataPath = FileUtils.getTempPath(
          jobId,
          'transcript_emojis.json'
        );

        await FileUtils.writeFile(
          transcriptPath,
          Buffer.from(JSON.stringify(correctedWords, null, 2))
        );
        await FileUtils.writeFile(
          emojiDataPath,
          Buffer.from(JSON.stringify(emojis, null, 2))
        );

        console.log(
          `[VideoProcessor] [DEV] Saved transcript data:\n  - ${transcriptPath}\n  - ${emojiDataPath}`
        );
      }

      // Create transcript text for analysis
      const transcriptText = correctedWords.map((w) => w.word).join(' ');

      // Step 4: Analyze transcript
      await this.databaseService.updateJobProgress(
        jobId,
        CONSTANTS.PROGRESS.TEXT_ANALYZED
      );
      const analysis =
        await this.openaiService.analyzeTranscript(transcriptText);
      await this.databaseService.updateVideoStatus(
        video.id,
        CONSTANTS.VIDEO_STATUS.PROCESSING,
        analysis.recommended
      );

      // Step 5: Create original version
      await this.databaseService.updateJobProgress(
        jobId,
        CONSTANTS.PROGRESS.ORIGINAL_VERSION
      );
      // TODO: Implement original version upload

      // Step 6: Create subtitled version (SRT) - 3 words per segment
      await this.databaseService.updateJobProgress(
        jobId,
        CONSTANTS.PROGRESS.SUBTITLED_VERSION
      );
      const srtPath = FileUtils.getTempPath(jobId, 'subtitled.srt');
      SRTConverter.convertWordsAndWrite(correctedWords, srtPath);
      const subtitledVideoPath = FileUtils.getTempPath(jobId, 'subtitled.mp4');
      await this.subtitleOverlay.apply(
        localVideoPath,
        srtPath,
        subtitledVideoPath
      );

      // Upload subtitled version
      const subtitledBuffer = await FileUtils.readFile(subtitledVideoPath);
      const subtitledResult = await this.storageService.uploadProcessedVersion(
        video.deviceId,
        video.videoId,
        'subtitled',
        subtitledBuffer
      );
      await this.databaseService.createVideoVersion(video.id, {
        type: 'SUBTITLED',
        url: subtitledResult.url,
        filePath: subtitledResult.filePath,
        title: 'Subtitled Version',
        description: 'Video with standard subtitles',
      });

      // Step 7: Create engaging version (ASS) - word-by-word with animations
      await this.databaseService.updateJobProgress(
        jobId,
        CONSTANTS.PROGRESS.ENGAGING_VERSION
      );
      const assPath = FileUtils.getTempPath(jobId, 'engaging.ass');
      ASSConverter.convertWordsAndWrite(correctedWords, assPath);
      const engagingVideoPath = FileUtils.getTempPath(jobId, 'engaging.mp4');
      await this.subtitleOverlay.apply(
        localVideoPath,
        assPath,
        engagingVideoPath
      );

      // Upload engaging version
      const engagingBuffer = await FileUtils.readFile(engagingVideoPath);
      const engagingResult = await this.storageService.uploadProcessedVersion(
        video.deviceId,
        video.videoId,
        'engaging',
        engagingBuffer
      );
      await this.databaseService.createVideoVersion(video.id, {
        type: 'SUBTITLED_ENGAGING',
        url: engagingResult.url,
        filePath: engagingResult.filePath,
        title: 'Engaging Subtitled Version',
        description: 'Video with stylized, animated word-by-word subtitles',
      });

      // Step 8: Create emoji version (overlay emojis on engaging version)
      await this.databaseService.updateJobProgress(
        jobId,
        CONSTANTS.PROGRESS.EMOJI_VERSION
      );

      // Use emojis from AI processing if available
      if (emojis.length > 0) {
        console.log(
          `[VideoProcessor] Adding ${emojis.length} emoji overlays...`
        );
        const emojiVideoPath = FileUtils.getTempPath(jobId, 'emoji.mp4');
        await this.emojiOverlay.apply(
          engagingVideoPath, // Use engaging version as base
          emojiVideoPath,
          emojis
        );

        // Upload emoji version
        const emojiBuffer = await FileUtils.readFile(emojiVideoPath);
        const emojiResult = await this.storageService.uploadProcessedVersion(
          video.deviceId,
          video.videoId,
          'emoji',
          emojiBuffer
        );
        await this.databaseService.createVideoVersion(video.id, {
          type: 'SUBTITLED_EMOJI',
          url: emojiResult.url,
          filePath: emojiResult.filePath,
          title: 'Emoji Enhanced Version',
          description: 'Video with animated subtitles and emoji overlays',
        });
      } else {
        console.log(
          '[VideoProcessor] No emojis detected, skipping emoji version'
        );
      }

      // Step 9: Mark job as completed
      await this.databaseService.updateJobProgress(
        jobId,
        CONSTANTS.PROGRESS.COMPLETED,
        CONSTANTS.JOB_STATUS.COMPLETED
      );
      await this.databaseService.updateVideoStatus(
        video.id,
        CONSTANTS.VIDEO_STATUS.PROCESSED
      );

      console.log(`[VideoProcessor] Processing completed for job ${jobId}`);

      // Cleanup temp files (skip in dev mode for debugging)
      if (isDev) {
        console.log(
          `[VideoProcessor] [DEV] Keeping temp files for debugging: ${tempDir}`
        );
      } else {
        await FileUtils.deleteDir(tempDir);
        console.log(`[VideoProcessor] Cleaned up temp directory: ${tempDir}`);
      }
    } catch (error) {
      console.error(
        `[VideoProcessor] Processing failed for job ${jobId}:`,
        error
      );
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      await this.databaseService.updateJobProgress(
        jobId,
        0,
        CONSTANTS.JOB_STATUS.FAILED,
        errorMessage
      );
      throw error;
    }
  }
}
