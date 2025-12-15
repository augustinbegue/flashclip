import type { TranscriptionWord } from '../../../types';

// Liste des mots français qui prennent une apostrophe
const APOSTROPHE_WORDS = new Set([
  'd',
  'l',
  'j',
  'n',
  'm',
  't',
  's',
  'c',
  'qu',
  'D',
  'L',
  'J',
  'N',
  'M',
  'T',
  'S',
  'C',
  'Qu',
]);

/**
 * TextProcessor handles transcript formatting and analysis
 */
export class TextProcessor {
  /**
   * Combine words with apostrophe in French transcription
   * Examples: "l" + "homme" -> "l'homme", "aujourd" + "hui" -> "aujourd'hui"
   */
  combineWordsWithApostrophe(words: TranscriptionWord[]): TranscriptionWord[] {
    const combined: TranscriptionWord[] = [];
    let i = 0;

    while (i < words.length) {
      const currentWord = words[i]!;
      const nextWord = i + 1 < words.length ? words[i + 1] : null;

      // Cas 1: Le mot se termine déjà par une apostrophe (d', l', etc.)
      if (
        nextWord &&
        currentWord.word.length <= 3 &&
        (currentWord.word.endsWith("'") || currentWord.word.endsWith("'"))
      ) {
        combined.push({
          word: currentWord.word + nextWord.word,
          start: currentWord.start,
          end: nextWord.end,
        });
        i += 2;
      }
      // Cas 2: Le mot est dans la liste des mots à apostrophe (d, l, j, etc.)
      else if (
        nextWord &&
        APOSTROPHE_WORDS.has(currentWord.word) &&
        nextWord.word.length > 0
      ) {
        combined.push({
          word: currentWord.word + "'" + nextWord.word,
          start: currentWord.start,
          end: nextWord.end,
        });
        i += 2;
      }
      // Cas 3: Mots composés avec "aujourd" + "hui"
      else if (
        nextWord &&
        currentWord.word.toLowerCase() === 'aujourd' &&
        nextWord.word.toLowerCase() === 'hui'
      ) {
        combined.push({
          word: currentWord.word + "'hui",
          start: currentWord.start,
          end: nextWord.end,
        });
        i += 2;
      }
      // Cas 4: "presqu" + "ile" / "quelqu" + "un", etc.
      else if (
        nextWord &&
        currentWord.word.toLowerCase().endsWith('u') &&
        currentWord.word.length <= 7 &&
        (nextWord.word.toLowerCase().startsWith('il') ||
          nextWord.word.toLowerCase().startsWith('un'))
      ) {
        combined.push({
          word: currentWord.word + "'" + nextWord.word,
          start: currentWord.start,
          end: nextWord.end,
        });
        i += 2;
      }
      // Cas par défaut: garder le mot tel quel
      else {
        combined.push(currentWord);
        i++;
      }
    }

    console.log(
      `[TextProcessor] ✓ Combined apostrophes: ${words.length} words → ${combined.length} words`
    );
    return combined;
  }
  /**
   * Parse raw transcript from OpenAI into structured segments
   */
  parseTranscript(
    rawTranscript: string,
    segments: Array<{ id: number; text: string; start: number; end: number }>
  ): Array<{ id: number; text: string; start: number; end: number }> {
    return segments.filter((seg) => seg.text && seg.text.trim().length > 0);
  }

  /**
   * Format transcript for SRT subtitle format
   */
  formatForSRT(
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
   * Format transcript for ASS subtitle format
   */
  formatForASS(
    segments: Array<{ text: string; start: number; end: number }>,
    style?: {
      name?: string;
      fontSize?: number;
      fontColor?: string;
      outlineColor?: string;
    }
  ): string {
    const defaultStyle = {
      name: style?.name || 'Default',
      fontSize: style?.fontSize || 28,
      fontColor: style?.fontColor || '&H00FFFFFF',
      outlineColor: style?.outlineColor || '&H00000000',
    };

    let content = `[Script Info]
Title: Generated Subtitles
ScriptType: v4.00+

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: ${defaultStyle.name},Arial,${defaultStyle.fontSize},${defaultStyle.fontColor},&H00FFFFFF,${defaultStyle.outlineColor},&H00000000,0,0,0,0,100,100,0,0,1,2,0,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

    segments.forEach((segment) => {
      const start = this.formatASSTimestamp(segment.start);
      const end = this.formatASSTimestamp(segment.end);
      content += `Dialogue: 0,${start},${end},${defaultStyle.name},,0,0,0,,${segment.text}\n`;
    });

    return content;
  }

  /**
   * Enhance text for better readability
   * Split long sentences into shorter chunks
   */
  enhanceTextForReadability(text: string): string {
    // Replace multiple spaces with single space
    let enhanced = text.replace(/\s+/g, ' ').trim();

    // Split long sentences at natural breaking points
    enhanced = enhanced
      .replace(/([.!?])\s+/g, '$1\n')
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .join('\n');

    return enhanced;
  }

  /**
   * Extract key phrases from text
   */
  extractKeyPhrases(text: string): string[] {
    const phrases = text.match(/\b[\w\s]{3,}\b/g) || [];
    return [...new Set(phrases.map((p) => p.trim().toLowerCase()))].slice(
      0,
      10
    );
  }

  /**
   * Format time in SRT format (HH:MM:SS,mmm)
   */
  private formatTimestamp(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.round((seconds % 1) * 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
  }

  /**
   * Format time in ASS format (H:MM:SS.cc)
   */
  private formatASSTimestamp(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const cs = Math.round((seconds % 1) * 100);

    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  }
}
