import { render as originalRender, RenderOptions, RenderResult } from '@testing-library/react';
import React, { FC, StrictMode } from 'react';

import { useRemirror } from '@remirror/react';

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
  const { getRootProps } = useRemirror();

  return (
    <>
      <div {...getRootProps()} />
    </>
  );
};

export { cleanup, act, fireEvent, render } from '@testing-library/react';
export type { RenderResult };
export {
  useRemirror,
  RemirrorProvider,
  useManager,
  useExtension,
  usePreset,
  createReactManager,
} from '@remirror/react';
