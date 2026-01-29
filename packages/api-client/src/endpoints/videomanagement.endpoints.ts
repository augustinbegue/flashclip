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
                                                                                                                                          
  /**
   * GET /videomanagement/getvideodetails   */
  async getVideoDetails(): Promise<any> {
    return this.client.get(`/videomanagement/getvideodetails`);  }
                                                                              
  /**
   * GET /videomanagement/listvideos-filtervideos   */
  async listVideos,FilterVideos(): Promise<any> {
    return this.client.get(`/videomanagement/listvideos-filtervideos`);  }
                                                                              
  /**
   * GET /videomanagement/getvideodetails-getairesults   */
  async getVideoDetails,GetAIResults(): Promise<any> {
    return this.client.get(`/videomanagement/getvideodetails-getairesults`);  }
            }
