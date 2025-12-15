import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { AIProcessingController } from '@controllers/aiprocessing';

const router = new Hono();
const controller = new AIProcessingController();

// ============================================================================
// Validation Schemas
// ============================================================================

// --- POST /aiprocessing/createaijob ---
const postBodySchema = z.object({
  videoId: z.string(),
  type: z.enum(['emoji', 'engaging', 'subtitles']).default('emoji'),
});

// ============================================================================
// Route Handlers
// ============================================================================

router.post(
  '/',
  zValidator('json', postBodySchema),
  async (c) => {
    try {

      // Extract validated body parameters
      const { videoId, type } = c.req.valid('json');

      // Call controller method
      const result = await controller.createAIJob({
        videoId,
        type,
      });

      // Return response
      return c.json({ data: result });
    } catch (error) {
      console.error('Error in /aiprocessing/createaijob POST:', error);
      return c.json(
        { error: error instanceof Error ? error.message : 'Internal server error' },
        500
      );
    }
  }
);

export default router;
