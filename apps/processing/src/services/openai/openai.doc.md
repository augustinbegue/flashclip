# OpenAI Service Documentation

## Overview

OpenAIService handles AI-powered transcription and text analysis. Includes nested TextProcessor for format conversions.

---

## OpenAIService

Wraps OpenAI APIs for video content processing.

### transcribeAudio(audioPath)

Uses Whisper API for speech-to-text transcription.

**Process:**

1. Read audio file from disk
2. Send to OpenAI Whisper with `response_format: "verbose_json"`
3. Parse response with segments and timestamps
4. Filter empty segments

**Returns:**

```typescript
{
  text: string,           // Full transcript
  segments: [
    {
      id: number,
      text: string,       // Segment text
      start: number,      // Start time in seconds
      end: number         // End time in seconds
    }
  ]
}
```

**Errors:**

- File read errors
- API errors (rate limit, auth, etc.)
- Re-throws as Error

---

### analyzeTranscript(transcript)

Uses GPT-4 to analyze transcript quality and recommend content.

**Prompt:**

```
Role: You are a content quality analyzer
Task: Determine if video transcript represents good quality content
Output: JSON { "recommended": boolean, "reason": string }
```

**Returns:**

```typescript
{
  recommended: boolean,   // Is content worth watching?
  reason: string         // Explanation
}
```

**Fallback:**

- If JSON parsing fails, checks for "recommended" in text response
- On error, defaults to `{ recommended: false, reason: "Analysis failed" }`

---

### generateEngagingText(transcript)

Uses GPT-4 to rewrite transcript for better subtitle readability.

**Prompt:**

```
Role: You are a subtitle writer
Task: Improve transcript for video subtitles (concise, engaging)
```

**Returns:**

```typescript
[
  {
    text: string, // Improved text
    start: number, // 0 (alignment not implemented)
    end: number, // 0 (would need further processing)
  },
];
```

**Note:** Output timing requires alignment with original segments in real implementation.

---

## TextProcessor

Formats transcripts for different subtitle formats and enhances readability.

### parseTranscript(rawTranscript, segments)

Filters and structures transcript segments.

**Process:**

1. Take segments array from Whisper API
2. Filter out empty/whitespace-only segments
3. Return structured array

**Returns:**

```typescript
[
  {
    id: number,
    text: string,
    start: number,
    end: number,
  },
];
```

---

### formatForSRT(segments)

Converts segments to SRT subtitle format.

**Format:**

```
1
00:00:00,000 --> 00:00:05,000
First line

2
00:00:05,000 --> 00:00:10,000
Second line
```

**Returns:** Format string (ready to write to .srt file)

---

### formatForASS(segments, style?)

Converts segments to ASS subtitle format with optional styling.

**Format:**

```
[Script Info]
Title: Generated Subtitles
ScriptType: v4.00+

[V4+ Styles]
Format: Name, Fontname, Fontsize, ...
Style: Default,Arial,28,&H00FFFFFF,...

[Events]
Format: Layer, Start, End, Style, ...
Dialogue: 0,0:00:00.00,0:00:05.00,Default,,0,0,0,,First line
```

**Options:**

```typescript
{
  name?: string,      // Style name (default: "Default")
  fontSize?: number   // Font size (default: 28)
}
```

**Returns:** Full ASS format string with styling header

---

### enhanceTextForReadability(text)

Improves text formatting for display.

**Operations:**

1. Replace multiple spaces with single space
2. Split long sentences at natural breaks (. ! ?)
3. Filter empty lines

**Returns:** Enhanced text

---

### extractKeyPhrases(text)

Extracts top keywords/phrases from text.

**Process:**

1. Find word sequences (3+ chars)
2. Convert to lowercase
3. Deduplicate
4. Return top 10

**Returns:** string[] - array of phrases

---

## Time Formatting

### SRT Format: HH:MM:SS,mmm

```
00:00:05,123  (5 seconds 123 milliseconds)
```

### ASS Format: H:MM:SS.cc

```
0:00:05.12    (5 seconds 12 centiseconds)
```

---

## Processing Flow

**Typical Pipeline:**

1. **OpenAIService.transcribeAudio()**

   ```
   audio.mp3 → Whisper API → raw transcript + segments
   ```

2. **TextProcessor.parseTranscript()**

   ```
   raw transcript → filtered segments
   ```

3. **OpenAIService.analyzeTranscript()**

   ```
   full transcript → GPT-4 → recommended flag
   ```

4. **TextProcessor.formatForSRT/ASS()**

   ```
   segments → SRT/ASS format string
   ```

5. **Converters write to file**
   ```
   format string → subtitled.srt / engaging.ass
   ```

---

## Error Handling

**OpenAI API Errors:**

- Rate limits → Error (retry needed)
- Auth errors → Error (check API key)
- Parsing failures → Log warning, use defaults

**File Errors:**

- Audio file not found → Error
- Write permission denied → Error

All errors propagate to VideoProcessor for job failure handling.
