/**
 * Server Configuration
 * Hono app setup with middleware and routes
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

export function createApp() {
  const app = new Hono();

  // Middleware
  app.use(logger());
  app.use(
    cors({
      origin: ["http://localhost:5173"],
      allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    })
  );
  app.use(prettyJSON());

  // Health check
  app.get('/health', (c) => {
    return c.json({ status: 'ok' });
  });

  // TODO: Register routes
  // app.route('/api/features', routes);

  // 404 handler
  app.notFound((c) => {
    return c.json({ error: 'Not found' }, 404);
  });

  // Error handler
  app.onError((err, c) => {
    console.error('Error:', err);
    return c.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      500
    );
  });

  return app;
}

export const PORT = 3000;
export const API_PREFIX = '/api';
