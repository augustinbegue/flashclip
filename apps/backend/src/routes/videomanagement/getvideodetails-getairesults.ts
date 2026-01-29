import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { VideoManagementController } from '@controllers/videomanagement';

const router = new Hono();
const controller = new VideoManagementController();

// ============================================================================
// Validation Schemas
// ============================================================================

// --- GET /videomanagement/getvideodetails-getairesults ---

// ============================================================================
// Route Handlers
// ============================================================================

router.get(
  '/',
  async (c) => {
    try {


      // Call controller method
      const result = await controller.getVideoDetails,GetAIResults();

      // Return response
      return c.json(result);
    } catch (error) {
      console.error('Error in /videomanagement/getvideodetails-getairesults GET:', error);
      return c.json(
        { error: error instanceof Error ? error.message : 'Internal server error' },
        500
      );
    }
  }
);

export default router;
