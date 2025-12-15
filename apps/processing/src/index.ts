import { PrismaClient } from '@prisma/client';
import { FileSystemRouter } from 'bun';
import { getEnv } from './config/env';
import { JobsController } from './controllers/jobs.controller';
import { VideosController } from './controllers/videos.controller';
import { DatabaseService } from './services/database/database.service';
import { EmojiService } from './services/emoji/emoji.service';
import { FFmpegService } from './services/ffmpeg/ffmpeg.service';
import { VideoProcessor } from './services/ffmpeg/processors/video.processor';
import { OpenAIService } from './services/openai/openai.service';
import { StorageService } from './services/storage/storage.service';
import { WorkerService } from './services/worker/worker.service';

// Initialize environment
const env = getEnv();

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize services
const databaseService = new DatabaseService(prisma);
const ffmpegService = new FFmpegService();
const openaiService = new OpenAIService(env.OPENAI_API_KEY);
const emojiService = new EmojiService();
const storageService = new StorageService(env);
const videoProcessor = new VideoProcessor(
  ffmpegService,
  databaseService,
  openaiService,
  emojiService,
  storageService
);
const workerService = new WorkerService(videoProcessor, databaseService);

// Initialize controllers
const videosController = new VideosController(
  databaseService,
  workerService,
  storageService
);
const jobsController = new JobsController(databaseService);

// Load emoji database on startup
await emojiService.loadEmojiDatabase();

// Setup router
const router = new FileSystemRouter({
  style: 'nextjs',
  dir: './src/routes',
  origin: `http://localhost:${env.PORT}`,
});

// Inject controllers into routes after they're loaded
const routeHandler = async (request: Request) => {
  const pathname = new URL(request.url).pathname;
  console.log(`[${request.method}] ${pathname}`);

  const route = router.match(request);

  console.log('Matched route:', route?.filePath);

  if (route) {
    // Dynamic import with controller injection
    const routeModule = await import(route.filePath);

    // Set controllers if route has setter functions
    if (
      routeModule.setVideosController &&
      typeof routeModule.setVideosController === 'function'
    ) {
      routeModule.setVideosController(videosController);
    }
    if (
      routeModule.setJobsController &&
      typeof routeModule.setJobsController === 'function'
    ) {
      routeModule.setJobsController(jobsController);
    }

    if (routeModule.default) {
      console.log('Handling request with method:', request.method);
      if (typeof routeModule.default[request.method] === 'function') {
        try {
          // Normalize params - convert arrays to single values
          const normalizedParams: Record<string, string> = {};
          for (const [key, value] of Object.entries(route.params)) {
            normalizedParams[key] = Array.isArray(value) ? value[0] : value;
          }

          return await routeModule.default[request.method](
            request,
            normalizedParams
          );
        } catch (error) {
          console.error('Route handler error:', error);
          return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
      } else {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
          status: 405,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
  }

  return new Response(JSON.stringify({ error: 'Not Found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
};

// Start server
Bun.serve({
  port: env.PORT,
  fetch: routeHandler,
});

console.log(`
🚀 Processing Service started
📍 Port: ${env.PORT}
🗄️  Database: ${env.DATABASE_URL}
🎬 API ready at http://localhost:${env.PORT}
`);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});
