import type { Env } from '../../config/env';

/**
 * StorageService handles remote file server integration using copyparty
 *
 * Service to interact with a copyparty fileserver.
 * Provides methods to upload and download files.
 *
 * Authentication:
 * - Copyparty accepts password via header, cookie, or URL param
 * - Since we don't use usernames, password can be in any field
 *
 * File Structure:
 * - Original videos: upload/{deviceId}/*.mp4
 * - Processed videos: videos/{deviceId}/{videoId}/{version}.mp4
 *
 * @see https://github.com/9001/copyparty/blob/hovudstraum/README.md
 * @see https://github.com/9001/copyparty/blob/hovudstraum/docs/devnotes.md#http-api
 */
export class StorageService {
  private baseURL: string;
  private pathPrefix: string;
  private password: string;

  constructor(env: Env) {
    // Get credentials from environment
    this.baseURL = env.FILESERVER_BASE_URL.endsWith('/')
      ? env.FILESERVER_BASE_URL.slice(0, -1)
      : env.FILESERVER_BASE_URL;
    this.pathPrefix = env.FILESERVER_PATH_PREFIX
      ? env.FILESERVER_PATH_PREFIX.startsWith('/')
        ? env.FILESERVER_PATH_PREFIX
        : `/${env.FILESERVER_PATH_PREFIX}`
      : '';
    this.password = env.FILESERVER_PASSWORD;
  }

  /**
   * Build request headers with authentication
   */
  private getHeaders(
    additionalHeaders: Record<string, string> = {}
  ): Record<string, string> {
    return {
      ...(this.password && { PW: this.password }),
      ...additionalHeaders,
    };
  }

  /**
   * Build path with prefix
   */
  private buildPath(path: string): string {
    // Remove leading slash from path if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    // Combine prefix and path, ensuring proper formatting
    return this.pathPrefix
      ? `${this.pathPrefix}/${cleanPath}`
      : `/${cleanPath}`;
  }

  /**
   * Build full URL with optional query parameters
   */
  private buildURL(path: string, params: Record<string, string> = {}): string {
    const url = new URL(path, this.baseURL);

    // Add authentication as query param
    if (this.password) {
      params.pw = this.password;
    }

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, value);
      }
    });

    return url.toString();
  }

  /**
   * Download video from remote fileserver for processing
   * Original videos are found in upload/{deviceId}/*.mp4
   */
  async downloadVideo(deviceId: string, filename: string): Promise<Buffer> {
    // Handle legacy full paths - extract just the filename if a full path was stored
    let cleanFilename = filename;
    if (filename.includes('/')) {
      // Extract the last part of the path (the actual filename)
      cleanFilename = filename.split('/').pop() || filename;
    }

    const path = this.buildPath(`/upload/${deviceId}/${cleanFilename}`);
    console.log(`[StorageService] Downloading video from: ${path}`);

    const url = this.buildURL(path, {
      ls: '',
    });
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to download video: ${response.status} ${response.statusText}`
      );
    }

    return Buffer.from(await response.arrayBuffer());
  }

  /**
   * Upload original video to remote fileserver
   * Note: This is typically done by the capture device, not the processing server
   */
  async uploadVideo(
    deviceId: string,
    videoId: string,
    buffer: Buffer
  ): Promise<{ url: string; filePath: string }> {
    const path = this.buildPath(`/upload/${deviceId}/${videoId}.mp4`);
    console.log(
      `[StorageService] Uploading video: ${path} (${buffer.length} bytes)`
    );

    const url = this.buildURL(path, { j: '' });
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders({
        'Content-Type': 'application/octet-stream',
        Accept: 'json',
      }),
      body: buffer,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to upload video: ${response.status} ${response.statusText}`
      );
    }

    const result = (await response.json()) as { url: string };

    // Generate URL from path if not provided by server
    const videoUrl = result.url || `${this.baseURL}${path}`;

    return { url: videoUrl, filePath: path };
  }

  /**
   * Upload processed video variant to remote fileserver
   * Processed videos go to: videos/{deviceId}/{videoId}/{version}.mp4
   */
  async uploadProcessedVersion(
    deviceId: string,
    videoId: string,
    type: string,
    buffer: Buffer
  ): Promise<{ url: string; filePath: string }> {
    const path = this.buildPath(`/videos/${deviceId}/${videoId}/${type}.mp4`);
    console.log(
      `[StorageService] Uploading processed version: ${path} (${buffer.length} bytes)`
    );

    const url = this.buildURL(path, { j: '' });
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders({
        'Content-Type': 'application/octet-stream',
        Accept: 'json',
        Replace: '1', // Overwrite if exists
      }),
      body: buffer,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to upload processed video: ${response.status} ${response.statusText}`
      );
    }

    const result = (await response.json()) as { url: string };

    // Generate URL from path if not provided by server
    const videoUrl = result.url || `${this.baseURL}${path}`;

    return { url: videoUrl, filePath: path };
  }

  /**
   * Upload thumbnail to remote fileserver
   */
  async uploadThumbnail(
    deviceId: string,
    videoId: string,
    buffer: Buffer
  ): Promise<{ url: string; filePath: string }> {
    const path = this.buildPath(`/videos/${deviceId}/${videoId}/thumbnail.jpg`);
    console.log(
      `[StorageService] Uploading thumbnail: ${path} (${buffer.length} bytes)`
    );

    const url = this.buildURL(path, { j: '' });
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders({
        'Content-Type': 'image/jpeg',
        Accept: 'json',
        Replace: '1',
      }),
      body: buffer,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to upload thumbnail: ${response.status} ${response.statusText}`
      );
    }

    const result = (await response.json()) as { url: string };

    // Generate URL from path if not provided by server
    const thumbnailUrl = result.url || `${this.baseURL}${path}`;

    return { url: thumbnailUrl, filePath: path };
  }

  /**
   * Generate public URL for video
   */
  getVideoUrl(deviceId: string, videoId: string, version?: string): string {
    const filename = version ? `${version}.mp4` : 'original.mp4';
    const path = this.buildPath(`/videos/${deviceId}/${videoId}/${filename}`);
    return `${this.baseURL}${path}`;
  }

  /**
   * Generate URL for original video in upload folder
   */
  getOriginalVideoUrl(deviceId: string, filename: string): string {
    const path = this.buildPath(`/upload/${deviceId}/${filename}`);
    return `${this.baseURL}${path}`;
  }

  /**
   * Generate public URL for thumbnail
   */
  getThumbnailUrl(deviceId: string, videoId: string): string {
    const path = this.buildPath(`/videos/${deviceId}/${videoId}/thumbnail.jpg`);
    return `${this.baseURL}${path}`;
  }

  /**
   * Check if a file exists on the fileserver
   */
  async exists(path: string): Promise<boolean> {
    try {
      const url = this.buildURL(path, {});
      const response = await fetch(url, {
        method: 'HEAD',
        headers: this.getHeaders(),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * List files in a directory
   */
  async listFiles(
    path: string = '/',
    options: {
      format?: 'json' | 'text';
      includeDotfiles?: boolean;
    } = {}
  ): Promise<unknown> {
    const { format = 'json', includeDotfiles = false } = options;

    const params: Record<string, string> = {};
    if (format === 'json') {
      params.ls = '';
    } else if (format === 'text') {
      params.ls = 't';
    }

    if (includeDotfiles) {
      params.dots = '';
    }

    const url = this.buildURL(path, params);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to list files: ${response.status} ${response.statusText}
- URL: ${url}
        `
      );
    }

    return format === 'json' ? await response.json() : await response.text();
  }

  /**
   * List video files for a specific device from upload folder
   * Returns array of video file information
   */
  async listDeviceVideos(deviceId: string): Promise<
    Array<{
      filename: string;
      videoId: string;
      size: number;
      modified: Date;
    }>
  > {
    try {
      const path = this.buildPath(`/upload/${deviceId}/`);
      const result = (await this.listFiles(path, {
        format: 'json',
      })) as {
        files: Array<{
          lead: string;
          href: string;
          sz: number;
          ext: string;
          ts: number;
        }>;
      };

      if (!result || !Array.isArray(result.files)) {
        return [];
      }

      // Filter only .mp4 files and extract video IDs
      const filtered = result.files
        .filter((file) => file.ext === 'mp4' && file.href.endsWith('.mp4'))
        .map((file) => ({
          filename: file.href,
          videoId: file.href.replace('.mp4', ''),
          size: file.sz,
          modified: new Date(file.ts * 1000), // Convert Unix timestamp to Date
        }));

      return filtered;
    } catch (error) {
      console.error(
        `[StorageService] Failed to list videos for device ${deviceId}:`,
        error
      );
      return [];
    }
  }

  /**
   * Delete a file from the fileserver
   */
  async deleteFile(path: string): Promise<void> {
    const params: Record<string, string> = {
      delete: '',
    };

    const url = this.buildURL(path, params);
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to delete file: ${response.status} ${response.statusText}`
      );
    }
  }

  /**
   * Clean up temporary files
   * Note: This only handles local temp files since remote files are managed by fileserver
   */
  async cleanupTempFiles(paths: string[]): Promise<void> {
    const fs = await import('fs/promises');
    for (const path of paths) {
      try {
        await fs.unlink(path);
        console.log(`[StorageService] Cleaned up temp file: ${path}`);
      } catch (error) {
        console.error(`[StorageService] Failed to cleanup ${path}:`, error);
      }
    }
  }
}
