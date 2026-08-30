export function formatServiceError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = String(error.code);
    if (code.includes('resource-exhausted')) return 'Your daily analysis limit has been reached.';
    if (code.includes('unauthenticated')) return 'Your session expired. Please sign in again.';
    if (code.includes('app-check')) {
      return 'This request could not be verified. Refresh and try again.';
    }
  }
  return 'We could not complete the analysis. Your answers are safe; please try again.';
}
