import { CONSTANTS } from '../../../config/constants';
import type { EmojiImageData, WordWithEmoji } from '../../../types';
import { getAbsolutePath } from '../../../utils/file.utils';
import { isValidDuration } from '../../../utils/validation.utils';
import {
  downloadEmojiImage,
  getEmojiUrl,
  loadEmojiUrlMap,
} from '../../emoji/emoji.service';
import { FFmpegService } from '../ffmpeg.service';

/**
 * Download all emoji images and prepare them for overlay
 */
async function prepareEmojiImages(
  emojis: WordWithEmoji[]
): Promise<EmojiImageData[]> {
  const urlMap = await loadEmojiUrlMap();
  const emojiImages: EmojiImageData[] = [];

  for (const emoji of emojis) {
    const url = getEmojiUrl(emoji.emoji, urlMap);
    if (!url) {
      console.warn(`[EmojiOverlay] No URL found for emoji: ${emoji.emoji}`);
      continue;
    }

    try {
      const imagePath = await downloadEmojiImage(url);
      // Convert to absolute path to avoid FFmpeg issues
      const absolutePath = getAbsolutePath(imagePath);
      emojiImages.push({ path: absolutePath, emoji });
    } catch (error) {
      console.warn(
        `[EmojiOverlay] Failed to download emoji ${emoji.emoji}:`,
        error
      );
    }
  }

  return emojiImages;
}

/**
 * Filter emojis with valid durations
 */
function filterValidEmojis(emojiImages: EmojiImageData[]): EmojiImageData[] {
  return emojiImages.filter((item) => {
    const { start, end } = item.emoji;
    if (!isValidDuration(start, end)) {
      console.warn(
        `[EmojiOverlay] Skipping emoji ${item.emoji.emoji} with invalid duration`
      );
      return false;
    }
    return true;
  });
}

/**
 * Overlay emojis on video using FFmpeg with advanced image-based approach
 * Uses working filter structure: format=rgba,fade=in:st=X:d=Y:alpha=1,fade=out:st=Z:d=W:alpha=1
 */
async function overlayEmojisOnVideoAdvanced(
  videoPath: string,
  emojiImages: Array<{ path: string; start: number; end: number }>,
  outputPath: string,
  videoDuration: number,
  config: {
    displayDuration: number;
    fadeInDuration: number;
    fadeOutDuration: number;
    size: number;
    yPosition: string;
  }
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      if (emojiImages.length === 0) {
        console.log('[EmojiOverlay] No emojis to overlay, copying video');
        await Bun.write(outputPath, await Bun.file(videoPath).arrayBuffer());
        resolve();
        return;
      }

      // Build FFmpeg command using the working structure from poc-ai
      const { spawn } = await import('child_process');
      const inputs = ['-i', videoPath];
      const fadeFilters: string[] = [];
      const overlayFilters: string[] = [];

      for (let i = 0; i < emojiImages.length; i++) {
        const { path: imagePath, start, end } = emojiImages[i]!;
        const duration = Math.max(end - start, config.displayDuration);
        const fadeOutStart =
          start + duration - duration * config.fadeOutDuration;

        // Add image input with loop - duration matches video duration to prevent infinite loop
        inputs.push('-loop', '1', '-t', String(videoDuration), '-i', imagePath);

        // Create filter with scale, format, and fade effects
        // Note: Dynamic zoom/bounce effects are complex in FFmpeg overlay
        // Using fade in/out which creates a smooth appearance/disappearance effect
        const fadeFilter =
          `[${i + 1}:0] scale=${config.size}:${config.size}:force_original_aspect_ratio=decrease,` +
          `format=rgba,` +
          `fade=in:st=${start}:d=${duration * config.fadeInDuration}:alpha=1,` +
          `fade=out:st=${fadeOutStart}:d=${duration * config.fadeOutDuration}:alpha=1 ` +
          `[t${i}]`;

        fadeFilters.push(fadeFilter);
      }

      // Build overlay chain with movement and scale effects
      let currentLabel = '0:0';
      for (let i = 0; i < emojiImages.length; i++) {
        const { start, end } = emojiImages[i]!;
        const duration = Math.max(end - start, config.displayDuration);
        const isLastEmoji = i === emojiImages.length - 1;
        const outputLabel = isLastEmoji ? '' : `[t${emojiImages.length + i}]`;

        const moveToLeft = i % 2 === 0;

        const moveStartTime = start;

        // Create expressions for animated position with ease-out curve
        // Start from center of screen and move to corner
        const startXNum = '(W-w)/2'; // Center horizontally
        const startYNum = '(H-h)/2'; // Center vertically
        const endXNum = moveToLeft ? 'W*0.45' : 'W*0.55';
        const endYNum = 'H*0.20';

        // Ease-out curve: progress = 1 - (1 - t)^2
        // This makes movement start fast and slow down at the end
        // t = linear progress (0 to 1)
        // eased = 1 - (1 - t)^2
        const linearProgress = `min(1\\,max(0\\,(t-${moveStartTime})/${duration}))`;
        const easeOutProgress = `(1-pow(1-${linearProgress}\\,2))`;

        // Use enable to control when overlay is active, and animate x,y position
        // x = start + (end - start) * easedProgress
        const xExpr = `${startXNum}+(${endXNum}-${startXNum})*${easeOutProgress}`;
        const yExpr = `${startYNum}+(${endYNum}-${startYNum})*${easeOutProgress}`;

        // Create overlay filter with animated position and enable
        const overlayFilter = `[${currentLabel}][t${i}] overlay=x='${xExpr}':y='${yExpr}':enable='between(t\\,${start}\\,${start + duration})'${outputLabel}`;
        overlayFilters.push(overlayFilter);

        currentLabel = `t${emojiImages.length + i}`;
      }

      // Combine all filters
      const filterComplex = [...fadeFilters, ...overlayFilters].join('; ');

      const args = [
        ...inputs,
        '-filter_complex',
        filterComplex,
        '-map',
        '0:a?',
        '-c:a',
        'copy',
        '-c:v',
        'libx264',
        '-preset',
        'fast',
        '-pix_fmt',
        'yuv420p',
        '-y',
        outputPath,
      ];

      console.log(
        '[EmojiOverlay] FFmpeg command:',
        ['ffmpeg', ...args].join(' ')
      );
      const ffmpeg = spawn('ffmpeg', args);
      ffmpeg.stderr.on('data', (data) => {
        console.log(`[EmojiOverlay] FFmpeg: ${data}`);
      });
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          console.log(
            `[EmojiOverlay] Video with emoji overlays created: ${outputPath}`
          );

          resolve();
        } else {
          reject(new Error(`FFmpeg exited with code ${code}`));
        }
      });

      ffmpeg.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * EmojiOverlay adds animated emoji overlays to videos using image-based approach
 */
export class EmojiOverlay {
  private ffmpegService: FFmpegService;

  constructor(ffmpegService: FFmpegService) {
    this.ffmpegService = ffmpegService;
  }

  /**
   * Generate FFmpeg filter complex for emoji overlay (legacy text-based approach)
   * This creates text-based emoji overlays at different times
   * @deprecated Use apply() method instead for image-based overlays with animations
   */
  generateFilterComplex(
    emojiTimeline: Array<{
      emoji: string;
      start: number;
      end: number;
    }>
  ): string {
    // Build FFmpeg drawtext filters for each emoji
    const filters = emojiTimeline.map((item) => {
      const start = Math.floor(item.start);
      const end = Math.floor(item.end);

      return `drawtext=text='${item.emoji}':fontsize=60:fontcolor=white:x=(w-text_w)/2:y=h-100:enable='between(t,${start},${end})'`;
    });

    // Join all filters with comma
    return filters.join(',');
  }

  /**
   * Apply emoji overlay to video using advanced image-based approach
   */
  async apply(
    videoPath: string,
    outputPath: string,
    emojis: WordWithEmoji[]
  ): Promise<void> {
    console.log(
      `[EmojiOverlay] Adding ${emojis.length} emojis to video with image-based overlay`
    );

    const emojiImages = await prepareEmojiImages(emojis);
    const validEmojis = filterValidEmojis(emojiImages);

    if (validEmojis.length === 0) {
      console.log('[EmojiOverlay] No valid emojis to overlay, copying video');
      await Bun.write(outputPath, await Bun.file(videoPath).arrayBuffer());
      return;
    }

    const absoluteVideoPath = getAbsolutePath(videoPath);
    const absoluteOutputPath = getAbsolutePath(outputPath);

    // Get video duration to prevent infinite loop in emoji inputs
    const videoDuration =
      await this.ffmpegService.getVideoDuration(absoluteVideoPath);
    console.log(`[EmojiOverlay] Video duration: ${videoDuration.toFixed(2)}s`);
    const emojiData = validEmojis.map((item) => ({
      path: item.path,

      start: item.emoji.start,
      end: item.emoji.end,
    }));

    await overlayEmojisOnVideoAdvanced(
      absoluteVideoPath,
      emojiData,
      absoluteOutputPath,
      videoDuration,
      {
        displayDuration: CONSTANTS.EMOJI_DISPLAY_DURATION,
        fadeInDuration: CONSTANTS.EMOJI_FADE_IN_DURATION,
        fadeOutDuration: CONSTANTS.EMOJI_FADE_OUT_DURATION,
        size: CONSTANTS.EMOJI_SIZE,
        yPosition: CONSTANTS.EMOJI_Y_POSITION,
      }
    );
  }

  /**
   * Apply emoji overlay to video using legacy text-based approach
   * @deprecated Use apply() method instead
   */
  async applyLegacy(
    videoPath: string,
    outputPath: string,
    emojiTimeline: Array<{
      emoji: string;
      start: number;
      end: number;
    }>
  ): Promise<void> {
    const filterComplex = this.generateFilterComplex(emojiTimeline);
    console.log(
      `[EmojiOverlay] Adding ${emojiTimeline.length} emojis to video (legacy)`
    );
    return this.ffmpegService.addEmojiOverlay(
      videoPath,
      outputPath,
      filterComplex
    );
  }
}
