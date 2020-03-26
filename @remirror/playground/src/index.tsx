import React, { FC, useCallback, useState } from 'react';

import CodeEditor from './code-editor';
import { ErrorBoundary } from './error-boundary';
import { CodeOptions } from './interfaces';
import { Container, Divide, Header, Main, Panel } from './primitives';
import { SimplePanel } from './simple-panel';
import { Viewer } from './viewer';

function nameify(str: string): [string, string] {
  const base = str
    .replace(/[^a-z0-9]/gi, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+([a-z0-9])/gi, (_, capture: string) => capture.toUpperCase());
  // Need it to start with a letter - if it doesn't then prefix with `ext`
  const safeBase = base.match(/^[a-z]/i) ? base : `ext${base.substr(0, 1).toUpperCase()}${base.substr(1)}`;
  const upper = safeBase.substr(0, 1).toUpperCase() + safeBase.substr(1);
  const lower = safeBase.substr(0, 1).toLowerCase() + safeBase.substr(1);
  return [upper, lower];
}

function makeCode(codeOptions: CodeOptions): string {
  const { extensions = [] } = codeOptions;

  const imports: {
    [moduleName: string]: Array<[string, string]>;
  } = {};

  function addImport(packageName: string, rawSpec: string | [string, string]) {
    const spec: [string, string] = typeof rawSpec === 'string' ? [rawSpec, rawSpec] : rawSpec;
    if (!imports[packageName]) {
      imports[packageName] = [];
    }
    const existing = imports[packageName].find(oldSpec => oldSpec[0] === spec[0] && oldSpec[1] === spec[1]);
    if (!existing) {
      imports[packageName].push(spec);
    }
  }

  addImport('react', ['default', 'React']);
  addImport('react', 'FC');
  addImport('@remirror/react', 'RemirrorProvider');
  addImport('@remirror/react', 'useExtensionManager');
  addImport('@remirror/react', 'useExtension');

  const useExtensions: string[] = [];
  const extensionList: string[] = [];
  extensions.forEach(ext => {
    const [ExtensionName, extensionName] = nameify(ext.module + (ext.export ? `-${ext.export}` : ''));
    addImport(ext.module, ext.export ? [ext.export, ExtensionName] : ['default', ExtensionName]);
    useExtensions.push(`const ${extensionName} = useExtension(${ExtensionName}, 2);`);
    extensionList.push(extensionName);
  });

  const importLines = [];
  const modules = Object.keys(imports).sort();
  for (const moduleName of modules) {
    const importsFromModule = imports[moduleName];
    importsFromModule.sort((a, b) => a[0].localeCompare(b[0]));
    let defaultName: string | null = null;
    const namedImports: string[] = [];
    for (const [name, alias] of importsFromModule) {
      if (name === 'default') {
        if (defaultName) {
          throw new Error(`Cannot have two default imports from '${moduleName}'`);
        }
        defaultName = alias;
      } else {
        namedImports.push(name + (alias && alias !== name ? ` as ${alias}` : ''));
      }
    }
    const things: string[] = [];
    if (defaultName) {
      things.push(defaultName);
    }
    if (namedImports.length) {
      things.push(`{\n  ${namedImports.join(',\n  ')}\n}`);
    }
    importLines.push(`import ${things.join(', ')} from '${moduleName}';`);
  }

  const code = `\
${importLines.join('\n')}

// Set up the component to provide the functionality for the editor
const SmallEditor: FC = () => {
  const { getRootProps, commands } = useRemirror(); // Picked from the context.

  return (
    <div>
      <button onClick={() => commands.bold()}>bold</button>
      <button onClick={() => commands.italic()}>italic</button>
      <div {...getRootProps()} />
    </div>
  );
};

const SmallEditorWrapper = () => {
  ${useExtensions.join('\n  ')}

  const extensionManager = useExtensionManager([
    ${extensionList.join(',\n    ')}
  ], {
    excludeBaseExtensions: false,
  });

  return (
    <RemirrorProvider extensionManager={extensionManager}>
      <SmallEditor />
    </RemirrorProvider>
  );
};

export default SmallEditorWrapper;
`;
  // TODO: prettier
  return code;
}

const Playground: FC = () => {
  const [value, setValue] = useState('// Add some code here\n');
  const [advanced, setAdvanced] = useState(false);
  const [options, setOptions] = useState({
    extensions: [
      {
        module: '@remirror/core-extensions',
        export: 'BoldExtension',
      },
      {
        module: '@remirror/core-extensions',
        export: 'ItalicExtension',
      },
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
            <SimplePanel options={options} setOptions={setOptions} onAdvanced={handleToggleAdvanced} />
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

export default Playground;
