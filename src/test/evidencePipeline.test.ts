import {describe, expect, it} from 'vitest';

import authConfig from '../../playwright.auth.config';
import publicConfig from '../../playwright.config';
import phase1Config from '../../playwright.phase1.config';

describe('Playwright evidence isolation', () => {
  it('retains every suite in a dedicated output directory', () => {
    const outputDirectories = [
      publicConfig.outputDir,
      phase1Config.outputDir,
      authConfig.outputDir,
    ];

    expect(outputDirectories).toEqual([
      'test-results/public',
      'test-results/phase1',
      'test-results/auth',
    ]);
    expect(new Set(outputDirectories).size).toBe(outputDirectories.length);
    expect(publicConfig.preserveOutput).toBe('always');
    expect(phase1Config.preserveOutput).toBe('always');
    expect(authConfig.preserveOutput).toBe('always');
  });

  it('uses dedicated HTML report directories', () => {
    expect(publicConfig.reporter).toContainEqual([
      'html',
      {open: 'never', outputFolder: 'playwright-report/public'},
    ]);
    expect(phase1Config.reporter).toContainEqual([
      'html',
      {open: 'never', outputFolder: 'playwright-report/phase1'},
    ]);
    expect(authConfig.reporter).toContainEqual([
      'html',
      {open: 'never', outputFolder: 'playwright-report/auth'},
    ]);
  });
});
