/// <reference path="./patches.d.ts" />

import { cleanup } from '@testing-library/react/pure';

afterEach(() => {
  cleanup();
});

export * from '@testing-library/react/pure';
