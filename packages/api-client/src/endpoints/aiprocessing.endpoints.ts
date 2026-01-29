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
                                                                              
  /**
   * GET /aiprocessing/listaijobs-getaijob-listaijobsbyvideo   */
  async listAIJobs,GetAIJob,ListAIJobsByVideo(): Promise<any> {
    return this.client.get(`/aiprocessing/listaijobs-getaijob-listaijobsbyvideo`);  }
                                                                              
  /**
   * GET /aiprocessing/createaijob-validatevideo-enqueuejob   */
  async createAIJob,ValidateVideo,EnqueueJob(): Promise<any> {
    return this.client.get(`/aiprocessing/createaijob-validatevideo-enqueuejob`);  }
            }
