import React from 'react';

export class ErrorBoundary extends React.Component<{}, { error: Error | null }> {
  public static getDerivedStateFromError(error: Error) {
    return { error };
  }

  constructor(props: {}) {
    super(props);
    this.state = { error: null };
  }

  public render() {
    if (this.state.error) {
      // You can render any custom fallback UI
      return (
        <div>
          <h1>Error</h1>
          <pre>
            <code>{String(this.state.error.stack ?? this.state.error)}</code>
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
