import { FC } from 'react';

const BG_COLOR = '#e0dbf5';

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

export const Main: FC = function ({ children }) {
  return (
    <div style={{ flex: '1', display: 'flex', backgroundColor: BG_COLOR, overflow: 'hidden' }}>
      {children}
    </div>
  );
};

export const Panel: FC<{ flex?: string; vertical?: boolean; overflow?: boolean }> = function ({
  children,
  flex = '1 0 0',
  vertical,
  overflow = false,
}) {
  return (
    <div
      style={{
        height: '100%',
        flex,
        display: 'flex',
        flexDirection: vertical ? 'column' : 'row',
        overflow: overflow ? 'auto' : 'hidden',
      }}
    >
      {children}
    </div>
  );
};

export const Divide: FC = function () {
  return <div style={{ backgroundColor: 'black', flex: '0 0 1px' }}></div>;
};
