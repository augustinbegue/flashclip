/**
 * Auto-generated endpoints for statistics */

import type { HTTPClient } from '../client';
import type { ApiResponse, PaginatedResponse } from '@repo/types';

export class StatisticsEndpoints {
  constructor(private client: HTTPClient) {}

                                                                    
  /**
   * GET /statistics/getdashboardstats   */
  async getDashboardStats(): Promise<any> {
    return this.client.get(`/statistics/getdashboardstats`);  }
                                                                              
  /**
   * GET /statistics/aggregatestats   */
  async aggregateStats(): Promise<any> {
    return this.client.get(`/statistics/aggregatestats`);  }
                                                                              
  /**
   * GET /statistics/createstatistic   */
  async createStatistic(): Promise<any> {
    return this.client.get(`/statistics/createstatistic`);  }
                                                                              
  /**
   * GET /statistics/exportstats   */
  async exportStats(): Promise<any> {
    return this.client.get(`/statistics/exportstats`);  }
                                                                              
  /**
   * GET /statistics/getuserstorage   */
  async getUserStorage(): Promise<any> {
    return this.client.get(`/statistics/getuserstorage`);  }
                                                                              
  /**
   * GET /statistics/getdashboardstats-aggregatestats   */
  async getDashboardStats,AggregateStats(): Promise<any> {
    return this.client.get(`/statistics/getdashboardstats-aggregatestats`);  }
            }
