import React, { FC, useEffect, useState } from 'react';

import { isUndefined } from 'remirror/core';

export { useRemirrorPlayground } from './use-remirror-playground';

export const Playground: FC = () => {
  const [Component, setPlayground] = useState<FC | null>(null);

  const [hasBabel, setHasBabel] = useState(!isUndefined(window['Babel']));

  useEffect(() => {
    if (hasBabel) {
      return;
    }
    const checkForBabel = () => {
      if (typeof window['Babel'] !== 'undefined') {
        setHasBabel(true);
      }
    };
    const int = setInterval(checkForBabel, 100);

    return () => {
      clearInterval(int);
    };
  }, [hasBabel]);

  useEffect(() => {
    if (!hasBabel) {
      return;
    }
    import('./playground').then((playground) => {
      // This has to be a function, otherwise React breaks (not unexpectedly)
      setPlayground(() => playground.Playground);
    });
  }, [hasBabel]);

  return Component ? (
    <Component />
  ) : hasBabel ? (
    <p>Loading monaco editor...</p>
  ) : (
    <p>Waiting for babel...</p>
  );
};

declare global {
  interface Window {
    Babel: typeof Babel;
  }
}
