export const CONSTANTS = {
  // File formats and paths
  TEMP_DIR: './tmp',
  DATA_DIR: './data',
  EMOJI_CACHE_FOLDER: './data/emojis/apple',

  // Subtitle settings
  WORDS_PER_SEGMENT: 3,

  // Emoji overlay settings
  EMOJI_DISPLAY_DURATION: 1.0,
  EMOJI_FADE_IN_DURATION: 0.5,
  EMOJI_FADE_OUT_DURATION: 0.2,
  EMOJI_SIZE: 140,
  EMOJI_Y_POSITION: 'H*0.15',

  // Video processing
  VIDEO_STATUS: {
    AVAILABLE: 'AVAILABLE',
    PROCESSED: 'PROCESSED',
    PROCESSING: 'PROCESSING',
    FAILED: 'FAILED',
  },

  // Job status
  JOB_STATUS: {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
  },

  // Video versions
  VERSION_TYPE: {
    ORIGINAL: 'ORIGINAL',
    SUBTITLED: 'SUBTITLED',
    SUBTITLED_ENGAGING: 'SUBTITLED_ENGAGING',
    SUBTITLED_EMOJI: 'SUBTITLED_EMOJI',
  },

  // Processing progress stages
  PROGRESS: {
    QUEUED: 5,
    AUDIO_EXTRACTED: 15,
    TRANSCRIBED: 30,
    TEXT_ANALYZED: 40,
    ORIGINAL_VERSION: 50,
    SUBTITLED_VERSION: 65,
    ENGAGING_VERSION: 80,
    EMOJI_VERSION: 95,
    COMPLETED: 100,
  },

  // Subtitle formats
  SUBTITLE_FORMATS: {
    SRT: 'srt',
    ASS: 'ass',
  },

  // FFmpeg settings
  FFMPEG: {
    // Audio extraction settings (optimized for speech recognition)
    AUDIO_CODEC: 'pcm_s16le', // Linear PCM 16-bit (for WAV)
    AUDIO_SAMPLE_RATE: '16000', // 16kHz optimal for speech recognition
    AUDIO_CHANNELS: '1', // Mono channel
    AUDIO_FORMAT: 'wav', // WAV format for transcription
    // Video encoding settings
    VIDEO_CODEC: 'libx264',
    VIDEO_BITRATE: '2000k',
    VIDEO_PRESET: 'medium',
  },
};
