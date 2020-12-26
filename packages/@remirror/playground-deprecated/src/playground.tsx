import assert from 'assert';
import { EventEmitter } from 'events';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { EditorState } from 'remirror';

import { debounce } from '@remirror/core-helpers';

import CodeEditor from './code-editor';
import { PlaygroundContext, PlaygroundContextObject } from './context';
import { ErrorBoundary } from './error-boundary';
import { makeRequire, REQUIRED_MODULES } from './execute';
import type { CodeOptions, Exports, RemirrorModules } from './interfaces';
import { makeCode } from './make-code';
import { Container, Divide, Main, Panel } from './primitives';
import { SimplePanel } from './simple-panel';
import { Viewer } from './viewer';

export { useRemirrorPlayground } from './use-remirror-playground';

/**
 * Returns a new object which is the module's exports with non-extensions
 * removed. Also removes built in required extensions since these are not
 * toggleable.
 */
function cleanse(moduleName: string, moduleExports: Exports): Exports {
  const cleansedExports = { ...moduleExports };

  if (moduleName === 'remirror/extensions') {
    delete cleansedExports.DocExtension;
  }

  if (moduleName === 'remirror/extensions') {
    delete cleansedExports.TextExtension;
  }

  /*
  if (moduleName === 'remirror/extensions') {
    delete cleansedExports.ParagraphExtension;
  }
  */

  return cleansedExports;
}

function useDebouncedValue<T>(value: T): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const debouncedUpdateTo = useMemo(
    () =>
      debounce(500, (value: T): void => {
        setDebouncedValue(value);
      }),
    [],
  );
  debouncedUpdateTo(value);
  return debouncedValue;
}

export const Playground: FC = () => {
  const [value, setValue] = useState('// Add some code here\n');
  const [contentValue, setContentValue] = useState<Readonly<EditorState> | null>(null);
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
    extensions: [],
    presets: [],
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
        setValue(makeCode(options));
        setAdvanced(true);
      } else {
        setAdvanced(false);
      }
    }
  }, [advanced, options]);

  const [debouncedValue, setDebouncedValue] = useState(value);

  const debouncedValueToSet = useDebouncedValue(value);
  useEffect(() => {
    setDebouncedValue(debouncedValueToSet);
  }, [debouncedValueToSet]);

  const code = useMemo(() => (advanced ? debouncedValue : makeCode(options)), [
    advanced,
    debouncedValue,
    options,
  ]);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    copy(code);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }, [code]);

  const windowHash = window.location.hash;
  const ourHash = useRef('');
  const [readyToSetUrlHash, setReadyToSetUrlHash] = useState(false);

  const setPlaygroundState = useCallback(
    (state) => {
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
        setDebouncedValue(code);
      }
    },
    [addModule],
  );
  useEffect(() => {
    if (windowHash && ourHash.current !== windowHash) {
      ourHash.current = windowHash;
      const parts = windowHash.replace(/^#+/, '').split('&');
      const part = parts.find((p) => p.startsWith('o/'));

      if (part) {
        try {
          const state = decode(part.slice(2));
          setPlaygroundState(state);
        } catch (error) {
          console.error(part.slice(2));
          console.error('Failed to parse above state; failed with following error:');
          console.error(error);
        }
      }
    }

    setReadyToSetUrlHash(true);
  }, [windowHash, setPlaygroundState]);

  const getPlaygroundState = useCallback(() => {
    const state = !advanced
      ? {
          m: 0,
          a: Object.keys(modules).filter((n) => !REQUIRED_MODULES.includes(n)),
          e: options.extensions,
          p: options.presets,
        }
      : {
          m: 1,
          c: value,
        };

    return state;
  }, [advanced, value, options, modules]);

  useEffect(() => {
    if (!readyToSetUrlHash) {
      /* Premature, we may not have finished reading it yet */
      return;
    }

    const state = getPlaygroundState();
    const encoded = encode(state);
    const hash = `#o/${encoded}`;

    if (hash !== ourHash.current) {
      ourHash.current = hash;
      window.location.hash = hash;
    }
  }, [readyToSetUrlHash, getPlaygroundState]);

  const [textareaValue, setTextareaValue] = useState('');
  const { playground, eventEmitter } = useMemo((): {
    playground: PlaygroundContextObject;
    eventEmitter: EventEmitter;
  } => {
    const eventEmitter = new EventEmitter();
    const playground: PlaygroundContextObject = {
      setContent: (state: Readonly<EditorState>) => {
        setContentValue(state);
      },
      onContentChange: (callback) => {
        eventEmitter.on('change', callback);
        return () => {
          eventEmitter.removeListener('change', callback);
        };
      },
    };
    return { playground, eventEmitter };
  }, [setContentValue]);

  const updateContent = useCallback<React.ChangeEventHandler<HTMLTextAreaElement>>(
    (e) => {
      const text = e.target.value;
      setTextareaValue(text);
      try {
        const json = JSON.parse(text);
        setPlaygroundState(json.playground);
        setTimeout(() => {
          // Trigger the change after a re-render
          eventEmitter.emit('change', json.doc);
        }, 0);
      } catch {
        // TODO: indicate JSON error
      }
    },
    [eventEmitter, setPlaygroundState],
  );

  const [textareaIsFocussed, setTextareaIsFocussed] = useState(false);

  useEffect(() => {
    if (!textareaIsFocussed) {
      const doc = contentValue ? contentValue.doc.toJSON() : null;
      const playgroundState = doc
        ? {
            doc,
            playground: getPlaygroundState(),
          }
        : null;
      setTextareaValue(playgroundState ? JSON.stringify(playgroundState, null, 2) : '');
    }
  }, [contentValue, textareaIsFocussed, getPlaygroundState]);

  return (
    <PlaygroundContext.Provider value={playground}>
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
                  flex: '3 0 0',
                  overflow: 'hidden',
                  backgroundColor: 'white',
                  display: 'flex',
                  position: 'relative',
                }}
              >
                <CodeEditor
                  value={advanced ? value : code}
                  onChange={setValue}
                  readOnly={!advanced}
                />
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
            <div style={{ flex: '2 0 0', display: 'flex', width: '100%', height: 0 }}>
              <ErrorBoundary>
                <div style={{ padding: '1rem', overflow: 'auto', flex: '1' }}>
                  <Viewer options={options} code={code} />
                </div>
              </ErrorBoundary>
              <Divide />
              <ErrorBoundary>
                <div style={{ overflow: 'auto', flex: '1' }}>
                  <textarea
                    value={textareaValue}
                    onChange={updateContent}
                    onFocus={() => setTextareaIsFocussed(true)}
                    onBlur={() => setTextareaIsFocussed(false)}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 0,
                      outline: 0,
                      margin: 0,
                      padding: 0,
                    }}
                  />
                </div>
              </ErrorBoundary>
            </div>
          </Panel>
        </Main>
      </Container>
    </PlaygroundContext.Provider>
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

  return JSON.parse(json);
}

/**
 * Encodes a POJO to a URL component string
 */
function encode(obj: object): string {
  const json = JSON.stringify(obj);
  return compressToEncodedURIComponent(json);
}
