import React, { FC, useCallback, useEffect, useRef, useState } from 'react';

import CodeEditor from './code-editor';
import { ErrorBoundary } from './error-boundary';
import { makeRequire } from './execute';
import { isExtensionName } from './exports';
import { CodeOptions, Exports, RemirrorModules } from './interfaces';
import { makeCode } from './make-code';
import { Container, Divide, Header, Main, Panel } from './primitives';
import { SimplePanel } from './simple-panel';
import { Viewer } from './viewer';

export { useRemirrorPlayground } from './use-remirror-playground';

function cleanse(moduleName: string, moduleExports: Exports): Exports {
  const cleansedExports = { ...moduleExports };
  if (moduleName === '@remirror/core') {
    delete cleansedExports.DocExtension;
    delete cleansedExports.TextExtension;
    delete cleansedExports.ParagraphExtension;
  }
  for (const exportName of Object.keys(cleansedExports)) {
    if (!isExtensionName(exportName)) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete cleansedExports[exportName];
    }
  }

  return cleansedExports;
}
const PRETTIER_SCRIPTS = [
  'https://unpkg.com/prettier@2.0.5/standalone.js',
  'https://unpkg.com/prettier@2.0.5/parser-typescript.js',
];

export const Playground: FC = () => {
  console.log('Playground pre hooks');
  const [value, setValue] = useState('// Add some code here\n');
  const [advanced, setAdvanced] = useState(false);
  const [modules, setModules] = useState<RemirrorModules>({});
  console.log('Playground post hooks');
  const addModule = useCallback((moduleName: string) => {
    setModules((oldModules) => ({
      ...oldModules,
      [moduleName]: {
        loading: true,
      },
    }));

    (async () => {
      const reqr = await makeRequire([moduleName]);
      const moduleExports = reqr(moduleName);
      setModules((oldModules) =>
        moduleName in oldModules
          ? {
              ...oldModules,
              [moduleName]: {
                loading: false,
                error: null,
                exports: cleanse(moduleName, moduleExports),
              },
            }
          : oldModules,
      );
    })().catch((error) => {
      setModules((oldModules) =>
        moduleName in oldModules
          ? {
              ...oldModules,
              [moduleName]: { loading: false, error },
            }
          : oldModules,
      );
    });
  }, []);
  const removeModule = useCallback((moduleName: string) => {
    setModules(({ [moduleName]: _moduleToDelete, ...remainingModules }) => remainingModules);
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

  // Load prettier for formatting
  const handleFormat = useCallback(() => {
    setValue(makeCode(options));
  }, [options]);
  const handleFormatRef = useRef(handleFormat);
  useEffect(() => {
    const loadedScripts: string[] = [];
    for (let i = 0, l = document.head.childNodes.length; i < l; i++) {
      const child = document.head.childNodes[i];
      if (child.nodeType === 1 && child.nodeName === 'SCRIPT') {
        const scriptEl = child as HTMLScriptElement;
        if (scriptEl.src) {
          loadedScripts.push(scriptEl.src);
        }
      }
    }
    const unlisten: Array<() => void> = [];
    const format = () => {
      if (loadedScripts.length === PRETTIER_SCRIPTS.length) {
        handleFormatRef.current();
      }
    };
    PRETTIER_SCRIPTS.forEach((script) => {
      if (!loadedScripts.includes(script)) {
        const scriptEl = document.createElement('script');
        scriptEl.src = script;
        scriptEl.addEventListener('load', format, false);
        unlisten.push(() => {
          scriptEl.removeEventListener('load', format, false);
        });
        document.head.append(scriptEl);
      }
    });
    return () => {
      for (const cb of unlisten) {
        cb();
      }
    };
  }, []);

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
