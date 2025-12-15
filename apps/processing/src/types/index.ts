import type OpenAI from 'openai';

export type TranscriptionWord = OpenAI.Audio.Transcriptions.TranscriptionWord;

export interface WordWithEmoji {
  word: string;
  emoji: string;
  start: number;
  end: number;
}

export interface ProcessedTranscription {
  words: TranscriptionWord[];
  emojis: WordWithEmoji[];
}

export interface AIProcessingResponse {
  corrections?: Array<{
    original: string;
    corrected: string;
  }>;
  emojis?: Array<{
    word: string;
    emoji: string;
  }>;
}

export interface EmojiImageData {
  path: string;
  emoji: WordWithEmoji;
}
