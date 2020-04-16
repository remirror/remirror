import React, { FC } from 'react';

export const Container: FC = function ({ children }) {
  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
};

export const Header: FC = function ({ children }) {
  return (
    <div style={{ flex: '0 0 3rem', borderBottom: '1px solid black', background: '#aaa' }}>
      {children}
    </div>
  );
};

export const Main: FC = function ({ children }) {
  return <div style={{ flex: '1', display: 'flex', backgroundColor: '#ddd' }}>{children}</div>;
};

export const Panel: FC<{ flex?: string; vertical?: boolean }> = function ({
  children,
  flex = '1 0 0',
  vertical,
}) {
  return (
    <div
      style={{ height: '100%', flex, display: 'flex', flexDirection: vertical ? 'column' : 'row' }}
    >
      {children}
    </div>
  );
};

export const Divide: FC = function () {
  return <div style={{ backgroundColor: 'black', flex: '0 0 1px' }}></div>;
};
