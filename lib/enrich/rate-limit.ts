import { APICallError } from 'ai';

// The AI SDK throws a RetryError wrapping the final APICallError once retries
// are exhausted; unwrap both to spot Gemini's free-tier 429 (5 req/min).
export function isRateLimit(err: unknown): boolean {
  const candidates: unknown[] = [err];
  if (err && typeof err === 'object') {
    const e = err as { errors?: unknown[]; lastError?: unknown; cause?: unknown };
    if (Array.isArray(e.errors)) candidates.push(...e.errors);
    if (e.lastError) candidates.push(e.lastError);
    if (e.cause) candidates.push(e.cause);
  }
  return candidates.some((c) => APICallError.isInstance(c) && c.statusCode === 429);
}
