/**
 * Auto-generated endpoints for aiprocessing */

import type { HTTPClient } from '../client';
import type { ApiResponse, PaginatedResponse } from '@repo/types';

export class AiprocessingEndpoints {
  constructor(private client: HTTPClient) {}

                                                                    
  /**
   * GET /aiprocessing/createaijob   */
  async createAIJob(): Promise<any> {
    return this.client.get(`/aiprocessing/createaijob`);  }
                                                                              
  /**
   * GET /aiprocessing/validatevideo   */
  async validateVideo(): Promise<any> {
    return this.client.get(`/aiprocessing/validatevideo`);  }
                                                                              
  /**
   * GET /aiprocessing/enqueuejob   */
  async enqueueJob(): Promise<any> {
    return this.client.get(`/aiprocessing/enqueuejob`);  }
                                                                              
  /**
   * GET /aiprocessing/listaijobs   */
  async listAIJobs(): Promise<any> {
    return this.client.get(`/aiprocessing/listaijobs`);  }
                                                                              
  /**
   * GET /aiprocessing/getaijob   */
  async getAIJob(): Promise<any> {
    return this.client.get(`/aiprocessing/getaijob`);  }
                                                                              
  /**
   * GET /aiprocessing/listaijobsbyvideo   */
  async listAIJobsByVideo(): Promise<any> {
    return this.client.get(`/aiprocessing/listaijobsbyvideo`);  }
            }
