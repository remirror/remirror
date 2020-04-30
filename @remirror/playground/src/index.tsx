import React, { FC, useCallback, useEffect, useState } from 'react';

import CodeEditor from './code-editor';
import { ErrorBoundary } from './error-boundary';
import { CodeOptions, RemirrorModules } from './interfaces';
import { makeCode } from './make-code';
import { Container, Divide, Header, Main, Panel } from './primitives';
import { SimplePanel } from './simple-panel';
import { Viewer } from './viewer';

export const Playground: FC = function () {
  const [value, setValue] = useState('// Add some code here\n');
  const [advanced, setAdvanced] = useState(false);
  const [modules, setModules] = useState<RemirrorModules>({});
  const addModule = useCallback((moduleName: string) => {
    setModules((oldModules) => ({
      ...oldModules,
      [moduleName]: {
        loading: true,
      },
    }));
  }, []);
  const removeModule = useCallback((moduleName: string) => {
    setModules(({ [moduleName]: _deleteMe, ...otherModules }) => otherModules);
  }, []);
  useEffect(() => {
    const CORE = '@remirror/core';
    if (!modules[CORE]) {
      addModule(CORE);
    }
  });
  const [options, setOptions] = useState({
    extensions: [
      // {
      //   module: '@remirror/core-extensions',
      //   export: 'BoldExtension',
      // },
      // {
      //   module: '@remirror/core-extensions',
      //   export: 'ItalicExtension',
      // },
    ],
  } as CodeOptions);
  const handleToggleAdvanced = useCallback(() => {
    if (
      confirm(
        advanced
          ? 'Going back to simple mode will discard your code - are you sure?'
          : "Are you sure you want to enter advanced mode? You'll lose access to the configuration panel",
      )
    ) {
      if (!advanced) {
        setAdvanced(true);
        setValue(makeCode(options));
      } else {
        setAdvanced(false);
      }
    }
  }, [advanced, options]);

  const code = advanced ? value : makeCode(options);
  return (
    <Container>
      <Header>Playground</Header>
      <Main>
        <Panel flex='0 0 16rem'>
          {advanced ? (
            <div>
              <button onClick={handleToggleAdvanced}>Enter simple mode</button>
            </div>
          ) : (
            <SimplePanel
              options={options}
              setOptions={setOptions}
              modules={modules}
              addModule={addModule}
              removeModule={removeModule}
              onAdvanced={handleToggleAdvanced}
            />
          )}
        </Panel>
        <Divide />
        <Panel vertical>
          <ErrorBoundary>
            <CodeEditor value={code} onChange={setValue} readOnly={!advanced} />
          </ErrorBoundary>
          <Divide />
          <ErrorBoundary>
            <Viewer options={options} code={code} />
          </ErrorBoundary>
        </Panel>
      </Main>
    </Container>
  );
};
