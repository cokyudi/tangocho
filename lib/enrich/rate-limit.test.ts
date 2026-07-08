import { describe, it, expect } from 'vitest';
import { APICallError } from 'ai';
import { isRateLimit } from './rate-limit';

const apiError = (statusCode: number) =>
  new APICallError({ message: 'x', url: 'u', requestBodyValues: {}, statusCode });

describe('isRateLimit', () => {
  it('detects a bare 429 APICallError', () => {
    expect(isRateLimit(apiError(429))).toBe(true);
  });

  it('detects a 429 wrapped in a RetryError-style .errors array', () => {
    expect(isRateLimit({ errors: [apiError(500), apiError(429)] })).toBe(true);
  });

  it('detects a 429 in .lastError or .cause', () => {
    expect(isRateLimit({ lastError: apiError(429) })).toBe(true);
    expect(isRateLimit({ cause: apiError(429) })).toBe(true);
  });

  it('is false for non-429 API errors', () => {
    expect(isRateLimit(apiError(500))).toBe(false);
    expect(isRateLimit({ errors: [apiError(503)] })).toBe(false);
  });

  it('is false for plain errors and non-objects', () => {
    expect(isRateLimit(new Error('boom'))).toBe(false);
    expect(isRateLimit(null)).toBe(false);
    expect(isRateLimit('429')).toBe(false);
  });
});
