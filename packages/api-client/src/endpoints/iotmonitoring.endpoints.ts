/**
 * Auto-generated endpoints for iotmonitoring */

import type { HTTPClient } from '../client';
import type { ApiResponse, PaginatedResponse } from '@repo/types';

export class IotmonitoringEndpoints {
  constructor(private client: HTTPClient) {}

                                                                    
  /**
   * GET /iotmonitoring/listdevices   */
  async listDevices(): Promise<any> {
    return this.client.get(`/iotmonitoring/listdevices`);  }
                                                                              
  /**
   * GET /iotmonitoring/refreshdevicestatus   */
  async refreshDeviceStatus(): Promise<any> {
    return this.client.get(`/iotmonitoring/refreshdevicestatus`);  }
                                                                              
  /**
   * GET /iotmonitoring/listdevices-refreshdevicestatus   */
  async listDevices,RefreshDeviceStatus(): Promise<any> {
    return this.client.get(`/iotmonitoring/listdevices-refreshdevicestatus`);  }
            }
