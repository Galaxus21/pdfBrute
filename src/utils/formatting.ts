/**
 * Formats a large number as a readable string with unit suffixes (e.g. 1,200,000 → "1.2M").
 */
export function formatCount(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)         return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/** Formats password recovery speed (e.g. 1500 -> "1.5k/s", 420 -> "420/s") */
export function formatSpeed(speed: number): string {
  if (speed > 1000) return `${(speed / 1000).toFixed(1)}k/s`;
  return `${speed}/s`;
}

/** Formats seconds into human-readable duration (e.g. 3665 -> "1h 1m 5s", 65 -> "1m 5s", 5 -> "5s") */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/** Formats elapsed milliseconds into stopwatch format MM:SS */
export function formatElapsedTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/** Formats file size in bytes to MB or KB */
export function formatFileSize(bytes: number): string {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}
