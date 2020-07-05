import { render as originalRender, RenderOptions,RenderResult } from '@testing-library/react';
import React, { StrictMode } from 'react';

export * from '@testing-library/react';

export function render(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'queries'>,
): RenderResult {
  return originalRender(<StrictMode>{ui}</StrictMode>, options);
}

export { originalRender };
