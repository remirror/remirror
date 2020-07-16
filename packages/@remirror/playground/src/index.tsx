import React, { FC, useEffect, useState } from 'react';

export const Playground: FC = () => {
  const [Component, setPlayground] = useState<FC | null>(null);

  const [hasBabel, setHasBabel] = useState(false);
  const [hasPrettier, setHasPrettier] = useState(false);

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
    if (hasPrettier) {
      return;
    }

    const checkForBabel = () => {
      if (typeof window['prettier'] !== 'undefined') {
        setHasPrettier(true);
      }
    };
    const int = setInterval(checkForBabel, 100);

    return () => {
      clearInterval(int);
    };
  }, [hasPrettier]);

  useEffect(() => {
    if (!hasBabel || !hasPrettier) {
      return;
    }

    import('./playground').then((playground) => {
      // This has to be a function, otherwise React breaks (not unexpectedly)
      setPlayground(() => playground.Playground);
    });
  }, [hasBabel, hasPrettier]);

  return Component ? <Component /> : <Loading hasBabel={hasBabel} hasPrettier={hasPrettier} />;
};

const Loading: FC<{ hasBabel: boolean; hasPrettier: boolean }> = ({ hasBabel, hasPrettier }) => {
  const [numberOfDots, setNumberOfDots] = useState(3);
  useEffect(() => {
    const dotsPlusPlus = () => {
      setNumberOfDots((dots) => (dots > 2 ? 0 : dots + 1));
    };
    const interval = setInterval(dotsPlusPlus, 300);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const show = {};
  const hide = { visibility: 'hidden' };

  const dots = [
    <span key={1} style={numberOfDots >= 1 ? show : hide}>
      .
    </span>,
    <span key={2} style={numberOfDots >= 2 ? show : hide}>
      .
    </span>,
    <span key={3} style={numberOfDots >= 3 ? show : hide}>
      .
    </span>,
  ];

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        maxWidth: '50rem',
        margin: '0 auto',
        padding: '2rem',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: '0 0 300px' }}>
        <img
          width='300'
          height='300'
          src='https://raw.githubusercontent.com/remirror/remirror/next/support/assets/logo-animated-light.svg?sanitize=true'
          alt='animated remirror logo'
        />
      </div>
      <div style={{ flex: '1 0 16rem', padding: '0 0 0 2rem', textAlign: 'center' }}>
        Loading{dots}
        <br />
        Babel: {!hasBabel ? '🤔' : '👍'}
        <br />
        Prettier: {!hasPrettier ? '🤔' : '👍'}
        <br />
        Playground: {!hasBabel || !hasPrettier ? '😴' : '🤔'}
        <br />
      </div>
    </div>
  );
};

declare global {
  interface Window {
    Babel: typeof Babel;
  }
}
