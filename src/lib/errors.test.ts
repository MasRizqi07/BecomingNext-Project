import {describe, it, expect} from 'vitest';
import {formatServiceError} from './errors';

describe('formatServiceError', () => {
  it('formats resource-exhausted error codes', () => {
    const err = {code: 'functions/resource-exhausted'};
    expect(formatServiceError(err)).toBe('Your daily analysis limit has been reached.');
  });

  it('formats unauthenticated error codes', () => {
    const err = {code: 'auth/unauthenticated'};
    expect(formatServiceError(err)).toBe('Your session expired. Please sign in again.');
  });

  it('formats app-check error codes', () => {
    const err = {code: 'app-check/failed'};
    expect(formatServiceError(err)).toBe(
      'This request could not be verified. Refresh and try again.',
    );
  });

  it('provides safe generic fallback for other errors', () => {
    expect(formatServiceError(new Error('something else'))).toBe(
      'We could not complete the analysis. Your answers are safe; please try again.',
    );
  });
});
