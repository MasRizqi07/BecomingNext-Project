import '@testing-library/jest-dom/vitest';

// Node 25+ shadows JSDOM's storage with an experimental global that is undefined unless a
// backing file is configured. Keep unit tests deterministic with the standard Storage contract.
const localStorageValues = new Map<string, string>();
const testLocalStorage: Storage = {
  get length() {
    return localStorageValues.size;
  },
  clear() {
    localStorageValues.clear();
  },
  getItem(key) {
    return localStorageValues.get(String(key)) ?? null;
  },
  key(index) {
    return [...localStorageValues.keys()][index] ?? null;
  },
  removeItem(key) {
    localStorageValues.delete(String(key));
  },
  setItem(key, value) {
    localStorageValues.set(String(key), String(value));
  },
};

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: testLocalStorage,
});
