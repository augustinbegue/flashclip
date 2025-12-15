import { writeFileSync } from 'fs';
import type { TranscriptionWord } from '../../../types';
import { secondsToAssTimestamp } from '../../../utils/time.utils';

const ASS_HEADER = `[Script Info]
Title: Generated Subtitle
ScriptType: v4.00+
Collisions: Normal
PlayDepth: 0
Timer: 100.0000

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Impact,40,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,0,5,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text`;

/**
 * ASSConverter converts transcript segments to ASS subtitle format with styling
 */
export class ASSConverter {
  /**
   * Convert word-level transcription to ASS format with animations and write to file
   */
  static convertWordsAndWrite(
    words: TranscriptionWord[],
    outputPath: string
  ): void {
    const assContent = this.wordsToASS(words);
    writeFileSync(outputPath, assContent, 'utf-8');
    console.log(`[ASSConverter] Written to ${outputPath}`);
  }

  /**
   * Convert word-level transcription to ASS format with animations
   * Process one word at a time with zoom and bounce effects
   */
  static wordsToASS(words: TranscriptionWord[]): string {
    let events = '';

    // Process one word at a time for ASS subtitles (text only)
    for (const wordInfo of words) {
      const startSecs = wordInfo.start;
      const endSecs = wordInfo.end;

      const startTime = secondsToAssTimestamp(startSecs);
      const endTime = secondsToAssTimestamp(endSecs);
      const duration = endSecs - startSecs;
      const zoomDuration = Math.min(duration * 0.2, 0.1); // 20% of duration, max 0.1 seconds for zoom
      const bounceDuration = Math.min(duration * 0.25, 0.15); // 25% of duration, max 0.15 seconds for bounce

      const subtitleText = wordInfo.word.toUpperCase();

      events += `\nDialogue: 0,${startTime},${endTime},Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,${zoomDuration * 1000},\\fscx110\\fscy110)\\t(${zoomDuration * 1000},${(zoomDuration + bounceDuration) * 1000},\\fscx100\\fscy100)}${subtitleText}`;
    }

    return `${ASS_HEADER}${events}`;
  }

  /**
   * Convert transcript segments to ASS format and write to file
   * @deprecated Use convertWordsAndWrite for word-level transcription
   */
  static convertAndWrite(
    segments: Array<{ text: string; start: number; end: number }>,
    outputPath: string,
    style?: { name?: string; fontSize?: number }
  ): void {
    const assContent = this.toASS(segments, style);
    writeFileSync(outputPath, assContent, 'utf-8');
    console.log(`[ASSConverter] Written to ${outputPath}`);
  }

  /**
   * Convert transcript segments to ASS format string
   * @deprecated Use wordsToASS for word-level transcription
   */
  static toASS(
    segments: Array<{ text: string; start: number; end: number }>,
    style?: { name?: string; fontSize?: number }
  ): string {
    const styleName = style?.name || 'Default';
    const fontSize = style?.fontSize || 28;

    let content = `[Script Info]
Title: Generated Subtitles
ScriptType: v4.00+

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: ${styleName},Arial,${fontSize},&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,0,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

    segments.forEach((segment) => {
      const start = this.formatASSTimestamp(segment.start);
      const end = this.formatASSTimestamp(segment.end);
      content += `Dialogue: 0,${start},${end},${styleName},,0,0,0,,${segment.text}\n`;
    });

    return content;
  }

  /**
   * Format time in ASS format (H:MM:SS.cc)
   * @deprecated Use secondsToAssTimestamp from time.utils.ts
   */
  private static formatASSTimestamp(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const cs = Math.round((seconds % 1) * 100);

    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  }
}
