import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { VideoManagementController } from '@controllers/videomanagement';

const router = new Hono();
const controller = new VideoManagementController();

// ============================================================================
// Validation Schemas
// ============================================================================

// --- GET /videomanagement/getvideodetails ---
const getQuerySchema = z.object({
  videoId: z.string(),
});

// ============================================================================
// Route Handlers
// ============================================================================

router.get(
  '/',
  zValidator('query', getQuerySchema),
  async (c) => {
    try {

      // Extract validated query parameters
      const { videoId } = c.req.valid('query');

      // Call controller method
      const result = await controller.getVideoDetails({
        videoId,
      });

      // Return response
      return c.json({ data: result });
    } catch (error) {
      console.error('Error in /videomanagement/getvideodetails GET:', error);
      return c.json(
        { error: error instanceof Error ? error.message : 'Internal server error' },
        500
      );
    }
  }
);

export default router;
