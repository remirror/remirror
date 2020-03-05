import * as monaco from 'monaco-editor';
import React, { FC, useEffect, useRef } from 'react';

const CodeEditor: FC = () => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      monaco.editor.create(ref.current, {
        value: "function hello() {\n\talert('Hello world!');\n}",
        language: 'typescript',
        automaticLayout: true,
      });
    }
  }, []);

  return <div style={{ flex: '1', height: '100%', backgroundColor: '#f3f' }} ref={ref} />;
};

const Header: FC = ({ children }) => (
  <div style={{ flex: '0 0 3rem', borderBottom: '1px solid black', background: '#aaa' }}>{children}</div>
);
const Main: FC = ({ children }) => (
  <div style={{ flex: '1', display: 'flex', backgroundColor: '#ddd' }}>{children}</div>
);
const Panel: FC = ({ children }) => <div style={{ height: '100%' }}>{children}</div>;

const Playground: FC = () => {
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
        <CodeEditor />
      </Main>
    </div>
  );
};

export default Playground;
