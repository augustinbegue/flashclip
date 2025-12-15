import OpenAI from 'openai';
import type {
  AIProcessingResponse,
  ProcessedTranscription,
  TranscriptionWord,
} from '../../types';

/**
 * OpenAIService handles transcription and text analysis
 */
export class OpenAIService {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  /**
   * Transcribe audio file using Whisper API with word-level timestamps
   */
  async transcribeAudio(audioPath: string): Promise<TranscriptionWord[]> {
    try {
      console.log(`[OpenAIService] Transcribing: ${audioPath}`);
      const file = Bun.file(audioPath);

      const response = await this.client.audio.transcriptions.create({
        model: 'whisper-1',
        file: file,
        response_format: 'verbose_json',
        timestamp_granularities: ['word'],
        language: 'fr',
      });

      if (!response.words || response.words.length === 0) {
        throw new Error('No transcription results found.');
      }

      console.log(`[OpenAIService] Transcribed ${response.words.length} words`);
      return response.words;
    } catch (error) {
      console.error('[OpenAIService] Transcription failed:', error);
      throw error;
    }
  }

  /**
   * Process transcription with AI for spelling correction and emoji detection
   */
  async processTranscriptionWithAI(
    words: TranscriptionWord[]
  ): Promise<ProcessedTranscription> {
    console.log(
      '[OpenAIService] Processing transcription for spelling correction and emojis...'
    );

    // Create a simple text representation of the transcription
    const transcriptionText = words.map((w) => w.word).join(' ');

    const prompt = `Voici une transcription en français :
${transcriptionText}`;

    const completion = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Tu es un assistant qui améliore les transcriptions en français.

Tâches à accomplir :
1. Corriger l'orthographe des mots mal transcrits (exemple: "ojord'ui" → "aujourd'hui")
2. Identifier les mots qui peuvent être associés a une emoji, de manière pratique ou figurée (exemple: "aujourd'hui" → "📅", "chien" → "🐶"). Soit créatif et pertinent, le but étant de rendre la vidéo plus engageante.

Important :
- Pour les corrections orthographiques : retourne le mot original et le mot corrigé
- Pour les emojis : retourne le mot (après correction si applicable) et l'emoji correspondant
- Format JSON :
{
  "corrections": [
    {
      "original": "ojord'ui",
      "corrected": "aujourd'hui"
    }
  ],
  "emojis": [
    {
      "word": "aujourd'hui",
      "emoji": "📅"
    }
  ]
}`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    const processed = JSON.parse(responseText) as AIProcessingResponse;

    // Apply spelling corrections
    const correctedWords = [...words];
    for (const correction of processed.corrections || []) {
      // Find the word in the array (case-insensitive match)
      const idx = correctedWords.findIndex(
        (w) => w.word.toLowerCase() === correction.original.toLowerCase()
      );
      if (idx >= 0) {
        const original = correctedWords[idx]!;
        correctedWords[idx] = {
          word: correction.corrected,
          start: original.start,
          end: original.end,
        };
      }
    }

    // Extract emojis with their timing by matching words
    const emojis = [];
    for (const emojiData of processed.emojis || []) {
      // Find the word in the corrected array (case-insensitive match)
      const matchingWord = correctedWords.find(
        (w) => w.word.toLowerCase() === emojiData.word.toLowerCase()
      );
      if (matchingWord) {
        emojis.push({
          word: matchingWord.word,
          emoji: emojiData.emoji,
          start: matchingWord.start,
          end: matchingWord.end,
        });
      }
    }

    console.log(
      `[OpenAIService] ✓ AI Processing: ${processed.corrections?.length || 0} corrections, ${emojis.length} emojis`
    );

    return { words: correctedWords, emojis };
  }

  /**
   * Analyze transcript to determine if video is recommended
   */
  async analyzeTranscript(transcript: string): Promise<{
    recommended: boolean;
    reason: string;
  }> {
    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content:
              'You are a content quality analyzer. Determine if a video transcript represents good quality content. Respond with JSON: { "recommended": boolean, "reason": string }',
          },
          {
            role: 'user',
            content: `Analyze this transcript and determine if it represents recommended content:\n\n${transcript}`,
          },
        ],
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      try {
        const result = JSON.parse(content);
        return {
          recommended: result.recommended || false,
          reason: result.reason || 'Analysis complete',
        };
      } catch {
        // If response is not valid JSON, try to extract boolean
        return {
          recommended: content.toLowerCase().includes('recommended'),
          reason: content,
        };
      }
    } catch (error) {
      console.error('[OpenAIService] Analysis failed:', error);
      // Default to not recommended on error
      return {
        recommended: false,
        reason: 'Analysis failed',
      };
    }
  }
}
