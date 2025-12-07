/**
 * HTTP Client
 * Base HTTP client with interceptors and auth
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@repo/types';

export interface HTTPClientConfig {
  baseUrl: string;
  timeout: number;
  retries?: number;
  auth?: {
    type: 'bearer' | 'api-key' | 'cookie';
    tokenKey: string;
    headerName?: string;
    headerPrefix?: string;
  };
}

export class HTTPClient {
  private client: AxiosInstance;
  private authToken?: string;
  private config: HTTPClientConfig;

  constructor(config: HTTPClientConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      headers: this.getDefaultHeaders(),
    });

    this.setupInterceptors();
  }

  private getDefaultHeaders() {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.authToken && this.config.auth) {
          const { type, headerName = 'Authorization', headerPrefix = 'Bearer ' } = this.config.auth;
          
          if (type === 'bearer') {
            config.headers[headerName] = `${headerPrefix}${this.authToken}`;
          } else if (type === 'api-key') {
            config.headers['X-API-Key'] = this.authToken;
          } else if (type === 'cookie') {
            config.withCredentials = true;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle common errors
        if (error.response?.status === 401) {
          // Unauthorized - token might be expired
          this.authToken = undefined;
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  clearAuthToken() {
    this.authToken = undefined;
  }
}

export function createHTTPClient(config: HTTPClientConfig): HTTPClient {
  return new HTTPClient(config);
}
