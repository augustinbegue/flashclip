import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { VideoManagementController } from '@controllers/videomanagement';

const router = new Hono();
const controller = new VideoManagementController();

// ============================================================================
// Validation Schemas
// ============================================================================

// --- GET /videomanagement/filtervideos ---
const getQuerySchema = z.object({
  query: z.string().optional(),
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
      const { query } = c.req.valid('query');

      // Call controller method
      const result = await controller.filterVideos({
        query,
      });

      // Return response
      return c.json(result);
    } catch (error) {
      console.error('Error in /videomanagement/filtervideos GET:', error);
      return c.json(
        { error: error instanceof Error ? error.message : 'Internal server error' },
        500
      );
    }
  }
);

export default router;
