import React, { FC, useEffect, useState } from 'react';

export const Playground: FC = () => {
  const [Component, setPlayground] = useState<FC | null>(null);

  const [hasBabel, setHasBabel] = useState(typeof window['Babel'] !== 'undefined');

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
