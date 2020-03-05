import React, { FC, useCallback, useState } from 'react';

import CodeEditor from './code-editor';
import { Container, Header, Main, Panel } from './primitives';

interface CodeOptions {
  extensions?: Array<{ module: string; export?: string; version: string }>;
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
  addImport('@remirror/react', 'RemirrorProvider');
  addImport('@remirror/react', 'useExtensionManager');
  addImport('@remirror/react', 'useExtension');

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
        namedImports.push(name + (alias ? ` as ${alias}` : ''));
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
const SmallEditor = () => {
  const { getRootProps, commands } = useRemirror(); // Picked from the context.

  return (
    <div>
      <button onClick={() => commands.bold()}>bold<button>
      <button onClick={() => commands.italic()}>italic<button>
      <div {...getRootProps()} />
    </div>
  );
};

const SmallEditorWrapper = () => {
  const boldExtension = useExtension(BoldExtension, 2);
  const italicExtension = useExtension(ItalicExtension, 2);

  const extensionManager = useExtensionManager([italicExtension, boldExtension], {
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
  const [options, setOptions] = useState({} as CodeOptions);
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
        <CodeEditor value={code} onChange={setValue} readOnly={!advanced} />
        <Panel flex='1'>
          <div style={{ padding: '1rem' }}>[Insert editor here]</div>
        </Panel>
      </Main>
    </Container>
  );
};

export default Playground;
