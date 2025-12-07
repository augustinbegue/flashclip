/**
 * Auto-generated endpoints for videomanagement */

import type { HTTPClient } from '../client';
import type { ApiResponse, PaginatedResponse } from '@repo/types';

export class VideomanagementEndpoints {
  constructor(private client: HTTPClient) {}

                                                                    
  /**
   * GET /videomanagement/listvideos   */
  async listVideos(): Promise<any> {
    return this.client.get(`/videomanagement/listvideos`);  }
                                                                              
  /**
   * GET /videomanagement/filtervideos   */
  async filterVideos(): Promise<any> {
    return this.client.get(`/videomanagement/filtervideos`);  }
            }
