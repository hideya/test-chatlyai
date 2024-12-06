import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// モックのリセット
beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
