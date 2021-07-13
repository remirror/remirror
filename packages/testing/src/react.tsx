import { render as originalRender, RenderOptions, RenderResult } from '@testing-library/react';
import * as hooks from '@testing-library/react-hooks';
import { FC, ReactElement, StrictMode } from 'react';
import TestRenderer from 'react-test-renderer';
import { useRemirrorContext } from '@remirror/react';

/**
 * Render the component in `StrictMode`
 */
export function strictRender(
  ui: ReactElement,
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
export { hooks, TestRenderer };
