/**
 * PNG file signature bytes
 */
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/**
 * Validate if a buffer is a valid PNG file
 */
export function isValidPNG(buffer: ArrayBuffer): boolean {
  const header = new Uint8Array(buffer.slice(0, 8));
  return PNG_SIGNATURE.every((byte, i) => header[i] === byte);
}

/**
 * Check if a file is a valid PNG
 */
export async function isValidPNGFile(filePath: string): Promise<boolean> {
  try {
    const file = Bun.file(filePath);
    if (!(await file.exists())) {
      return false;
    }
    const buffer = await file.arrayBuffer();
    return isValidPNG(buffer);
  } catch {
    return false;
  }
}

/**
 * Validate emoji duration
 */
export function isValidDuration(start: number, end: number): boolean {
  return end > start && end - start > 0;
}

/**
 * Validate device ID format
 */
export function isValidDeviceId(deviceId: string): boolean {
  return (
    typeof deviceId === 'string' && deviceId.length > 0 && deviceId.length < 255
  );
}

/**
 * Validate video ID format
 */
export function isValidVideoId(videoId: string): boolean {
  return (
    typeof videoId === 'string' && videoId.length > 0 && videoId.length < 255
  );
}

/**
 * Validate job ID format (UUID)
 */
export function isValidJobId(jobId: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(jobId);
}

/**
 * Validate that a value is a valid UUID
 */
export function isValidUUID(value: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}
