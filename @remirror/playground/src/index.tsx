import React, { FC, useState } from 'react';

import CodeEditor from './code-editor';
import { Container, Header, Main, Panel } from './primitives';

const Playground: FC = () => {
  const [value, setValue] = useState('// Add some code here\n');
  return (
    <Container>
      <Header>Playground</Header>
      <Main>
        <Panel>Dropdowns...</Panel>
        <CodeEditor value={value} onChange={setValue} />
        <Panel flex='1'>
          <div style={{ padding: '1rem' }}>[Insert editor here]</div>
        </Panel>
      </Main>
    </Container>
  );
};

export default Playground;
