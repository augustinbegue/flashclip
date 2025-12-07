import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { StatisticsController } from '@controllers/statistics';

const router = new Hono();
const controller = new StatisticsController();

// ============================================================================
// Validation Schemas
// ============================================================================

// --- GET /statistics/getuserstorage ---

// ============================================================================
// Route Handlers
// ============================================================================

router.get(
  '/',
  async (c) => {
    try {


      // Call controller method
      const result = await controller.getUserStorage();

      // Return response
      return c.json(result);
    } catch (error) {
      console.error('Error in /statistics/getuserstorage GET:', error);
      return c.json(
        { error: error instanceof Error ? error.message : 'Internal server error' },
        500
      );
    }
  }
);

export default router;
