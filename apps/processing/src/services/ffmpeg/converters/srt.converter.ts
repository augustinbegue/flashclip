import { writeFileSync } from 'fs';
import { CONSTANTS } from '../../../config/constants';
import type { TranscriptionWord } from '../../../types';
import { secondsToTimestamp } from '../../../utils/time.utils';

/**
 * SRTConverter converts transcript segments to SRT subtitle format
 */
export class SRTConverter {
  /**
   * Convert word-level transcription to SRT format and write to file
   */
  static convertWordsAndWrite(
    words: TranscriptionWord[],
    outputPath: string
  ): void {
    const srtContent = this.wordsToSRT(words);
    writeFileSync(outputPath, srtContent, 'utf-8');
    console.log(`[SRTConverter] Written to ${outputPath}`);
  }

  /**
   * Convert word-level transcription to SRT format
   * Groups words into segments based on WORDS_PER_SEGMENT
   */
  static wordsToSRT(words: TranscriptionWord[]): string {
    let srt = '';
    let index = 1;

    for (let i = 0; i < words.length; i += CONSTANTS.WORDS_PER_SEGMENT) {
      const segment = words.slice(i, i + CONSTANTS.WORDS_PER_SEGMENT);

      if (segment.length === 0) continue;

      const firstWord = segment[0];
      const lastWord = segment[segment.length - 1];

      if (!firstWord || !lastWord) continue;

      const startSecs = firstWord.start;
      const endSecs = lastWord.end;

      const subtitleText = segment.map((w) => w.word).join(' ');

      srt += `${index}\n`;
      srt += `${secondsToTimestamp(startSecs)} --> ${secondsToTimestamp(endSecs)}\n`;
      srt += `${subtitleText}\n\n`;
      index++;
    }

    return srt;
  }

  /**
   * Convert transcript segments to SRT format and write to file
   * @deprecated Use convertWordsAndWrite for word-level transcription
   */
  static convertAndWrite(
    segments: Array<{ text: string; start: number; end: number }>,
    outputPath: string
  ): void {
    const srtContent = this.toSRT(segments);
    writeFileSync(outputPath, srtContent, 'utf-8');
    console.log(`[SRTConverter] Written to ${outputPath}`);
  }

  /**
   * Convert transcript segments to SRT format string
   * @deprecated Use wordsToSRT for word-level transcription
   */
  static toSRT(
    segments: Array<{ text: string; start: number; end: number }>
  ): string {
    const lines: string[] = [];

    segments.forEach((segment, index) => {
      lines.push(`${index + 1}`);
      lines.push(
        `${this.formatTimestamp(segment.start)} --> ${this.formatTimestamp(segment.end)}`
      );
      lines.push(segment.text);
      lines.push('');
    });

    return lines.join('\n');
  }

  /**
   * Format time in SRT format (HH:MM:SS,mmm)
   * @deprecated Use secondsToTimestamp from time.utils.ts
   */
  private static formatTimestamp(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.round((seconds % 1) * 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
  }
}
