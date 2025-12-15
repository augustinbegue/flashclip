import { readFileSync } from 'fs';
import { join } from 'path';
import { CONSTANTS } from '../../config/constants';
import { isValidPNG } from '../../utils/validation.utils';

interface EmojiEntry {
  emoji: string;
  keywords: string[];
}

let emojiUrlMap: Map<string, string> | null = null;

/**
 * Load emoji URL mappings from emojis.json
 */
export async function loadEmojiUrlMap(): Promise<Map<string, string>> {
  if (emojiUrlMap) {
    return emojiUrlMap;
  }

  const emojiUrls = (await Bun.file('./data/emojis.json').json()) as string[];
  emojiUrlMap = new Map();

  // Extract emoji unicode from URL and create mapping
  // URL format: https://emojigraph.org/media/144/apple/[emoji-name]_[unicode].png
  for (const url of emojiUrls) {
    const match = url.match(/_([0-9a-f-]+)(?:_[0-9a-f]+)?\.png$/i);
    if (match && match[1]) {
      const unicodeStr = match[1];
      // Convert hex unicode to emoji character
      const codePoints = unicodeStr.split('-').map((hex) => parseInt(hex, 16));
      const emoji = String.fromCodePoint(...codePoints);
      emojiUrlMap.set(emoji, url);
    }
  }

  console.log(`[EmojiService] Loaded ${emojiUrlMap.size} emoji URL mappings`);
  return emojiUrlMap;
}

/**
 * Download emoji image from URL
 */
export async function downloadEmojiImage(url: string): Promise<string> {
  const urlParts = url.split('/');
  const filename = urlParts[urlParts.length - 1];
  const outputPath = join(
    CONSTANTS.EMOJI_CACHE_FOLDER,
    filename || 'emoji.png'
  );

  // Check if already downloaded AND valid
  const file = Bun.file(outputPath);
  if (await file.exists()) {
    // Verify it's a valid PNG
    const buffer = await file.arrayBuffer();
    if (isValidPNG(buffer)) {
      console.log(`[EmojiService] Using cached emoji: ${filename}`);
      return outputPath;
    } else {
      console.log(
        `[EmojiService] Cached file is invalid, re-downloading: ${filename}`
      );
    }
  }

  // Create directory if it doesn't exist
  await Bun.write(join(CONSTANTS.EMOJI_CACHE_FOLDER, '.gitkeep'), '');

  // Download the image with proper headers
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Accept: 'image/png,image/*',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to download emoji from ${url}: ${response.statusText}`
    );
  }

  // Verify content type
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('image')) {
    console.error(`[EmojiService] Invalid content type: ${contentType}`);
    console.error(`[EmojiService] URL: ${url}`);
    throw new Error(
      `Expected image but got ${contentType || 'unknown'} from ${url}`
    );
  }

  const arrayBuffer = await response.arrayBuffer();

  // Verify PNG signature before writing
  if (!isValidPNG(arrayBuffer)) {
    const header = new Uint8Array(arrayBuffer.slice(0, 4));
    throw new Error(
      `Downloaded file from ${url} is not a valid PNG (signature: ${Array.from(
        header
      )
        .map((b) => b.toString(16))
        .join(' ')})`
    );
  }

  await Bun.write(outputPath, arrayBuffer);
  console.log(`[EmojiService] Downloaded emoji: ${filename}`);

  return outputPath;
}

/**
 * Get emoji URL from cache
 */
export function getEmojiUrl(
  emoji: string,
  urlMap: Map<string, string>
): string | undefined {
  return urlMap.get(emoji);
}

/**
 * EmojiService manages emoji matching and timeline generation
 */
export class EmojiService {
  private emojiDatabase: EmojiEntry[] = [];
  private initialized = false;

  /**
   * Load emoji database from JSON file
   */
  async loadEmojiDatabase(): Promise<void> {
    try {
      const data = readFileSync('./data/emojis.json', 'utf-8');
      this.emojiDatabase = JSON.parse(data);
      this.initialized = true;
      console.log(
        `[EmojiService] Loaded ${this.emojiDatabase.length} emoji entries`
      );
    } catch (error) {
      console.error('[EmojiService] Failed to load emoji database:', error);
      throw error;
    }
  }

  /**
   * Match text to relevant emojis
   * Returns array of emoji objects with confidence scores
   */
  matchEmojis(
    text: string
  ): Array<{ emoji: string; keywords: string[]; confidence: number }> {
    if (!this.initialized) {
      throw new Error(
        'EmojiService not initialized. Call loadEmojiDatabase first.'
      );
    }

    const lowerText = text.toLowerCase();
    const matches: Array<{
      emoji: string;
      keywords: string[];
      confidence: number;
    }> = [];

    for (const entry of this.emojiDatabase) {
      let confidence = 0;

      for (const keyword of entry.keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          confidence += 1;
        }
      }

      if (confidence > 0) {
        matches.push({
          emoji: entry.emoji,
          keywords: entry.keywords,
          confidence,
        });
      }
    }

    // Sort by confidence descending
    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Generate emoji timeline from transcript
   * Groups emojis by time segments
   */
  generateEmojiTimeline(
    transcript: Array<{
      text: string;
      start: number;
      end: number;
    }>
  ): Array<{
    emoji: string;
    start: number;
    end: number;
    duration: number;
  }> {
    const timeline: Array<{
      emoji: string;
      start: number;
      end: number;
      duration: number;
    }> = [];

    for (const segment of transcript) {
      const matches = this.matchEmojis(segment.text);

      // Take top 3 matches for this segment
      for (const match of matches.slice(0, 3)) {
        timeline.push({
          emoji: match.emoji,
          start: segment.start - 0.2,
          end: segment.end,
          duration: segment.end - segment.start,
        });
      }
    }

    return timeline;
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}
