import { existsSync } from 'fs';
import {
  readFile as fsReadFile,
  writeFile as fsWriteFile,
  mkdir,
  rm,
} from 'fs/promises';
import { join } from 'path';

export const FileUtils = {
  /**
   * Ensure a directory exists
   */
  async ensureDir(path: string): Promise<void> {
    if (!existsSync(path)) {
      await mkdir(path, { recursive: true });
    }
  },

  /**
   * Delete a directory and its contents
   */
  async deleteDir(path: string): Promise<void> {
    if (existsSync(path)) {
      await rm(path, { recursive: true, force: true });
    }
  },

  /**
   * Delete a single file
   */
  async deleteFile(path: string): Promise<void> {
    if (existsSync(path)) {
      await rm(path, { force: true });
    }
  },

  /**
   * Write buffer to file
   */
  async writeFile(path: string, data: Buffer | string): Promise<void> {
    await fsWriteFile(path, data);
  },

  /**
   * Read file as buffer
   */
  async readFile(path: string): Promise<Buffer> {
    return await fsReadFile(path);
  },

  /**
   * Get a temporary directory path
   */
  getTempPath(jobId: string, filename: string): string {
    return `./tmp/${jobId}/${filename}`;
  },

  /**
   * Get a temporary directory root for a job
   */
  getTempJobDir(jobId: string): string {
    return `./tmp/${jobId}`;
  },
};

/**
 * Get absolute path from relative path
 */
export function getAbsolutePath(relativePath: string): string {
  return join(process.cwd(), relativePath);
}
