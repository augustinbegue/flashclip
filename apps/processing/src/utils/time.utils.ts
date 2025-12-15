/**
 * Convert seconds to SRT/ASS time format (HH:MM:SS,mmm)
 */
export function secondsToTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

/**
 * Convert SRT time format to seconds
 */
export function timestampToSeconds(timestamp: string): number {
  const [time, ms] = timestamp.split(',');
  const [hours, minutes, seconds] = time.split(':').map(Number);

  return hours * 3600 + minutes * 60 + seconds + parseInt(ms || '0') / 1000;
}

/**
 * Format time for ASS format (HH:MM:SS.cc)
 */
export function secondsToAssTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const cs = Math.round((seconds % 1) * 100);

  return `${String(hours).padStart(1, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}
