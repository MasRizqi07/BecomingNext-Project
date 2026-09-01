import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import {
  isolateApplicationForModal,
  restoreApplicationAfterModal,
} from '@/components/primitives/modalIsolation';

describe('modal application isolation', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="main-content" aria-hidden="false"></div>';
    const applicationRoot = document.getElementById('main-content');
    if (applicationRoot) applicationRoot.inert = false;
    document.body.style.overflow = 'auto';
  });

  afterEach(() => {
    document.body.innerHTML = '';
    document.body.style.overflow = '';
  });

  it('keeps the application isolated until every modal layer closes', () => {
    const applicationRoot = document.getElementById('main-content');
    expect(applicationRoot).not.toBeNull();

    isolateApplicationForModal();
    isolateApplicationForModal();
    expect(applicationRoot?.inert).toBe(true);
    expect(applicationRoot?.getAttribute('aria-hidden')).toBe('true');
    expect(document.body.style.overflow).toBe('hidden');

    restoreApplicationAfterModal();
    expect(applicationRoot?.inert).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');

    restoreApplicationAfterModal();
    expect(applicationRoot?.inert).toBe(false);
    expect(applicationRoot?.getAttribute('aria-hidden')).toBe('false');
    expect(document.body.style.overflow).toBe('auto');
  });
});
