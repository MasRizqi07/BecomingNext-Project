import {beforeEach, describe, expect, it} from 'vitest';

import {useBecomingStore} from './useBecomingStore';

describe('useBecomingStore', () => {
  beforeEach(() => {
    sessionStorage.clear();
    useBecomingStore.getState().resetReflection();
  });

  it('stores an answer by stable question identifier', () => {
    useBecomingStore.getState().setResponse('fearedFuture', 'A future without meaningful work.');

    expect(useBecomingStore.getState().responses.fearedFuture).toBe(
      'A future without meaningful work.',
    );
  });

  it('clears private draft and analysis session state', () => {
    useBecomingStore.getState().setResponse('fearedFuture', 'A future without meaningful work.');
    useBecomingStore.getState().setActiveAnalysisId('34dee39a-b961-4b07-a928-e00e35155745');

    useBecomingStore.getState().resetReflection();

    expect(useBecomingStore.getState().responses).toEqual({});
    expect(useBecomingStore.getState().activeAnalysisId).toBeNull();
  });
});
