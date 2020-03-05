import React, { FC, useState } from 'react';

import CodeEditor from './code-editor';

const Header: FC = ({ children }) => (
  <div style={{ flex: '0 0 3rem', borderBottom: '1px solid black', background: '#aaa' }}>{children}</div>
);
const Main: FC = ({ children }) => (
  <div style={{ flex: '1', display: 'flex', backgroundColor: '#ddd' }}>{children}</div>
);
const Panel: FC = ({ children }) => <div style={{ height: '100%' }}>{children}</div>;

const Playground: FC = () => {
  const [value, setValue] = useState('// Add some code here\n');
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
      <Header>Playground</Header>
      <Main>
        <Panel>Dropdowns...</Panel>
        <CodeEditor value={value} onChange={setValue} />
      </Main>
    </div>
  );
};

export default Playground;
