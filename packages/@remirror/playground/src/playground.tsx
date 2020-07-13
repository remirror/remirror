import React, { FC, useCallback, useEffect, useRef, useState } from 'react';

import CodeEditor from './code-editor';
import { ErrorBoundary } from './error-boundary';
import { makeRequire, REQUIRED_MODULES } from './execute';
import { CodeOptions, Exports, RemirrorModules } from './interfaces';
import { makeCode } from './make-code';
import { Container, Divide, Main, Panel } from './primitives';
import { SimplePanel } from './simple-panel';
import { Viewer } from './viewer';
import { decompressFromEncodedURIComponent, compressToEncodedURIComponent } from 'lz-string';
import assert from 'assert';

export { useRemirrorPlayground } from './use-remirror-playground';

/**
 * Returns a new object which is the module's exports with non-extensions
 * removed. Also removes built in required extensions since these are not
 * toggleable.
 */
function cleanse(moduleName: string, moduleExports: Exports): Exports {
  const cleansedExports = { ...moduleExports };

  if (moduleName === 'remirror/extension/doc') {
    delete cleansedExports.DocExtension;
  }

  if (moduleName === 'remirror/extension/text') {
    delete cleansedExports.TextExtension;
  }

  /*
  if (moduleName === 'remirror/extension/paragraph') {
    delete cleansedExports.ParagraphExtension;
  }
  */

  return cleansedExports;
}

const PRETTIER_SCRIPTS = [
  'https://unpkg.com/prettier@2.0.5/standalone.js',
  'https://unpkg.com/prettier@2.0.5/parser-typescript.js',
];

export const Playground: FC = () => {
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
    for (const requiredModule of REQUIRED_MODULES) {
      if (!modules[requiredModule]) {
        addModule(requiredModule);
      }
    }
  });
  const [options, setOptions] = useState({
    extensions: [
      // {
      //   module: 'remirror/extensions/bold',
      //   export: 'BoldExtension',
      // },
      // {
      //   module: 'remirror/extensions/italic',
      //   export: 'ItalicExtension',
      // },
    ],
    presets: [],
  } as CodeOptions);

  // Load prettier for formatting
  const handleFormat = useCallback(() => {
    setValue(makeCode(options));
  }, [options]);
  const handleFormatRef = useRef(handleFormat);
  useEffect(() => {
    handleFormatRef.current = handleFormat;
  }, [handleFormat]);
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

    const format = (e: Event) => {
      const element = e.target ? (e.target as HTMLScriptElement) : null;

      if (!element) {
        return;
      }

      loadedScripts.push(element.src);

      if (PRETTIER_SCRIPTS.every((script) => loadedScripts.includes(script))) {
        handleFormatRef.current();
      }
    };

    PRETTIER_SCRIPTS.forEach((script) => {
      if (!loadedScripts.includes(script)) {
        const scriptEl = document.createElement('script');
        scriptEl.addEventListener('load', format, false);
        unlisten.push(() => {
          scriptEl.removeEventListener('load', format, false);
        });
        scriptEl.src = script;
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
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    copy(code);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }, [code]);

  const windowHash = window.location.hash;
  let ourHash = useRef('');
  let [readyToSetUrlHash, setReadyToSetUrlHash] = useState(false);
  useEffect(() => {
    if (windowHash && ourHash.current !== windowHash) {
      ourHash.current = windowHash;
      const parts = windowHash.replace(/^#+/, '').split('&');
      const part = parts.find((p) => p.startsWith('o/'));
      if (part) {
        try {
          const state = decode(part.substr(2));
          console.log('Restoring state');
          console.dir(state);
          assert(typeof state === 'object' && state, 'Expected state to be an object');
          assert(typeof state.m === 'number', 'Expected mode to be a number');
          if (state.m === 0) {
            /* basic mode */
            setAdvanced(false);
            setOptions({ extensions: state.e, presets: state.p });
            if (Array.isArray(state.a)) {
              state.a.forEach((moduleName: string) => addModule(moduleName));
            }
          } else if (state.m === 1) {
            /* advanced mode */
            assert(typeof state.c === 'string', 'Expected code to be a string');
            const code = state.c;
            setAdvanced(true);
            setValue(code);
          }
        } catch (e) {
          console.error(part.substr(2));
          console.error('Failed to parse above state; failed with following error:');
          console.error(e);
        }
      }
    }
    setReadyToSetUrlHash(true);
  }, [windowHash]);

  useEffect(() => {
    if (!readyToSetUrlHash) {
      /* Premature, we may not have finished reading it yet */
      return;
    }
    let state;
    if (!advanced) {
      state = {
        m: 0,
        a: Object.keys(modules).filter((n) => !REQUIRED_MODULES.includes(n)),
        e: options.extensions,
        p: options.presets,
      };
    } else {
      state = {
        m: 1,
        c: value,
      };
    }
    const encoded = encode(state);
    const hash = `o/${encoded}`;
    if (hash !== ourHash.current) {
      ourHash.current = hash;
      window.location.hash = hash;
    }
  }, [advanced, value, options, modules, readyToSetUrlHash]);

  return (
    <Container>
      <Main>
        {advanced ? null : (
          <>
            <Panel flex='0 0 18rem' overflow>
              <SimplePanel
                options={options}
                setOptions={setOptions}
                modules={modules}
                addModule={addModule}
                removeModule={removeModule}
                onAdvanced={handleToggleAdvanced}
              />
            </Panel>
            <Divide />
          </>
        )}
        <Panel vertical>
          <ErrorBoundary>
            <div
              style={{
                flex: '1',
                overflow: 'hidden',
                backgroundColor: 'white',
                display: 'flex',
                position: 'relative',
              }}
            >
              <CodeEditor value={code} onChange={setValue} readOnly={!advanced} />
              <div style={{ position: 'absolute', bottom: '1rem', right: '2rem' }}>
                {advanced ? (
                  <button onClick={handleToggleAdvanced}>☑️ Enter simple mode</button>
                ) : (
                  <button onClick={handleToggleAdvanced}>🤓 Enter advanced mode</button>
                )}
                <button onClick={handleCopy} style={{ marginLeft: '0.5rem' }}>
                  📋 {copied ? 'Copied code!' : 'Copy code'}
                </button>
              </div>
            </div>
          </ErrorBoundary>
          <Divide />
          <ErrorBoundary>
            <div style={{ padding: '1rem', flex: '0 0 10rem', overflow: 'auto' }}>
              <Viewer options={options} code={code} />
            </div>
          </ErrorBoundary>
        </Panel>
      </Main>
    </Container>
  );
};

/** Copies text to the clipboard */
const copy = (text: string) => {
  const textarea = document.createElement('textarea');
  textarea.style.position = 'absolute';
  textarea.style.top = '0';
  textarea.style.left = '-10000px';
  textarea.style.opacity = '0.0001';
  document.body.append(textarea);
  textarea.value = text;
  textarea.select();
  textarea.setSelectionRange(0, 999999);
  document.execCommand('copy');
  textarea.remove();
};

/**
 * Decodes a URL component string to POJO.
 */
function decode(data: string) {
  const json = decompressFromEncodedURIComponent(data);
  if (!json) {
    throw new Error('Failed to decode');
  }
  const obj = JSON.parse(json);
  return obj;
}

/**
 * Encodes a POJO to a URL component string
 */
function encode(obj: object): string {
  const json = JSON.stringify(obj);
  const data = compressToEncodedURIComponent(json);
  return data;
}
