import React, { FC } from 'react';

export const Container: FC = ({ children }) => (
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
export const Header: FC = ({ children }) => (
  <div style={{ flex: '0 0 3rem', borderBottom: '1px solid black', background: '#aaa' }}>{children}</div>
);
export const Main: FC = ({ children }) => (
  <div style={{ flex: '1', display: 'flex', backgroundColor: '#ddd' }}>{children}</div>
);
export const Panel: FC = ({ children }) => <div style={{ height: '100%' }}>{children}</div>;
