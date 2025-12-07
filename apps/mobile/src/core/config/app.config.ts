/**
 * App Configuration
 * Generated from spec
 */

export const APP_CONFIG = {
  name: 'Flashclip',
  slug: 'flashclip',
  version: '1.0.0',
  scheme: 'flashclip',
} as const;

export const ENV = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const;
