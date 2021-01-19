/**
 * @module
 *
 * The error boundary components.
 */

import type { FC } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

/**
 * The error component to display.
 */
const Fallback: FC<FallbackProps> = (props) => {
  const { resetErrorBoundary, error } = props;
  return (
    <div>
      <h1>Error</h1>
      <pre>
        <code>{String(error?.stack ?? error?.message)}</code>
      </pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
};

interface RendererErrorBoundaryProps {
  /**
   * A method called when the user clicks the Try Again button.
   */
  onReset?: () => void;

  /**
   * Keys that should trigger a rerender for the child component.
   */
  resetKeys?: unknown[];
}

/**
 * The error boundary for the rendered component exported created by the
 * playground.
 */
export const RendererErrorBoundary: FC<RendererErrorBoundaryProps> = (props) => {
  const { children, onReset, resetKeys } = props;

  return (
    <ErrorBoundary FallbackComponent={Fallback} onReset={() => onReset?.()} resetKeys={resetKeys}>
      {children}
    </ErrorBoundary>
  );
};
