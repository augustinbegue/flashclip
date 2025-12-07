import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { AIProcessingController } from '@controllers/aiprocessing';

const router = new Hono();
const controller = new AIProcessingController();

// ============================================================================
// Validation Schemas
// ============================================================================

// --- GET /aiprocessing/listaijobsbyvideo ---

// ============================================================================
// Route Handlers
// ============================================================================

router.get(
  '/',
  async (c) => {
    try {


      // Call controller method
      const result = await controller.listAIJobsByVideo();

      // Return response
      return c.json(result);
    } catch (error) {
      console.error('Error in /aiprocessing/listaijobsbyvideo GET:', error);
      return c.json(
        { error: error instanceof Error ? error.message : 'Internal server error' },
        500
      );
    }
  }
);

export default router;
