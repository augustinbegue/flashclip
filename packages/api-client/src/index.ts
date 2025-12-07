/**
 * API Client
 * Auto-generated client with all endpoints
 */

import { HTTPClient, type HTTPClientConfig } from './client';
import { VideomanagementEndpoints } from './endpoints/videomanagement.endpoints';
import { AiprocessingEndpoints } from './endpoints/aiprocessing.endpoints';
import { StatisticsEndpoints } from './endpoints/statistics.endpoints';
import { IotmonitoringEndpoints } from './endpoints/iotmonitoring.endpoints';

export class APIClient {
  private http: HTTPClient;

  public readonly videomanagement: VideomanagementEndpoints;
  public readonly aiprocessing: AiprocessingEndpoints;
  public readonly statistics: StatisticsEndpoints;
  public readonly iotmonitoring: IotmonitoringEndpoints;

  constructor(config: HTTPClientConfig) {
    this.http = new HTTPClient(config);

    this.videomanagement = new VideomanagementEndpoints(this.http);
    this.aiprocessing = new AiprocessingEndpoints(this.http);
    this.statistics = new StatisticsEndpoints(this.http);
    this.iotmonitoring = new IotmonitoringEndpoints(this.http);
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string) {
    this.http.setAuthToken(token);
  }

  /**
   * Clear authentication token
   */
  clearAuthToken() {
    this.http.clearAuthToken();
  }
}

export function createAPIClient(config: HTTPClientConfig) {
  return new APIClient(config);
}
