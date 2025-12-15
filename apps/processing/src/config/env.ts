export const getEnv = () => {
  const env = {
    DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
    PORT: parseInt(process.env.PORT || '3000', 10),
    FILESERVER_BASE_URL: process.env.FILESERVER_BASE_URL!,
    FILESERVER_PATH_PREFIX: process.env.FILESERVER_PATH_PREFIX || '',
    FILESERVER_PASSWORD: process.env.FILESERVER_PASSWORD || '',
    NODE_ENV: process.env.NODE_ENV || 'development',
  };

  // Validate required environment variables
  if (!env.OPENAI_API_KEY) {
    throw new Error('Missing required environment variable: OPENAI_API_KEY');
  }

  if (!env.FILESERVER_BASE_URL) {
    throw new Error(
      'Missing required environment variable: FILESERVER_BASE_URL'
    );
  }

  return env;
};

export type Env = ReturnType<typeof getEnv>;
