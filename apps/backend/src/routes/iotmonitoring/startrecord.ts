import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { IoTMonitoringController } from '@controllers/iotmonitoring';

const router = new Hono();
const controller = new IoTMonitoringController();

// ============================================================================
// Validation Schemas
// ============================================================================

// --- POST /iotmonitoring/startrecord ---

// ============================================================================
// Route Handlers
// ============================================================================

router.post(
  '/',
  async (c) => {
    try {


      // Call controller method
      const result = await controller.startRecord(process.env.DEVICE_ID || 'demo-rpi');

      // Return response
      return c.json(result);
    } catch (error) {
      console.error('Error in /iotmonitoring/startrecord POST:', error);
      return c.json(
        { error: error instanceof Error ? error.message : 'Internal server error' },
        500
      );
    }
  }
);

export default router;
