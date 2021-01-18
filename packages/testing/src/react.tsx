import { render as originalRender, RenderOptions, RenderResult } from '@testing-library/react';
import { FC, StrictMode } from 'react';
import * as React from 'react';

import { useRemirrorContext } from '@remirror/react';

/**
 * Render the component in `StrictMode`
 */
export function strictRender(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'queries'>,
): RenderResult {
  return originalRender(<StrictMode>{ui}</StrictMode>, options);
}

/**
 * A default editor for the react wrapper.
 */
export const DefaultEditor: FC = () => {
  const { getRootProps } = useRemirrorContext();

  return (
    <>
      <div {...getRootProps()} />
    </>
  );
};

export * from '@testing-library/react';
