import React, { FC, useCallback, useState } from 'react';

import CodeEditor from './code-editor';
import { Container, Header, Main, Panel } from './primitives';

const Playground: FC = () => {
  const [value, setValue] = useState('// Add some code here\n');
  const [advanced, setAdvanced] = useState(false);
  const handleToggleAdvanced = useCallback(() => {
    if (
      confirm(
        advanced
          ? 'Going back to simple mode will discard your code - are you sure?'
          : "Are you sure you want to enter advanced mode? You'll lose access to the configuration panel",
      )
    ) {
      setAdvanced(!advanced);
    }
  }, [advanced]);
  return (
    <Container>
      <Header>Playground</Header>
      <Main>
        <Panel>
          {advanced ? (
            <>
              <button onClick={handleToggleAdvanced}>Enter simple mode</button>
            </>
          ) : (
            <>
              <button onClick={handleToggleAdvanced}>Enter advanced mode</button>
            </>
          )}
        </Panel>
        <CodeEditor value={value} onChange={setValue} readOnly={!advanced} />
        <Panel flex='1'>
          <div style={{ padding: '1rem' }}>[Insert editor here]</div>
        </Panel>
      </Main>
    </Container>
  );
};

export default Playground;
