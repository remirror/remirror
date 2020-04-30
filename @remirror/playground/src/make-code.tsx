import { CodeOptions } from './interfaces';

function nameify(str: string): [string, string] {
  const base = str
    .replace(/[^\da-z]/gi, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+([\da-z])/gi, (_, capture: string) => capture.toUpperCase());
  // Need it to start with a letter - if it doesn't then prefix with `ext`
  const safeBase = base.match(/^[a-z]/i)
    ? base
    : `ext${base.slice(0, 1).toUpperCase()}${base.slice(1)}`;
  const upper = safeBase.slice(0, 1).toUpperCase() + safeBase.slice(1);
  const lower = safeBase.slice(0, 1).toLowerCase() + safeBase.slice(1);
  return [upper, lower];
}

export function makeCode(codeOptions: CodeOptions): string {
  const { extensions = [] } = codeOptions;

  const imports: {
    [moduleName: string]: Array<[string, string]>;
  } = {};

  function addImport(packageName: string, rawSpec: string | [string, string]) {
    const spec: [string, string] = typeof rawSpec === 'string' ? [rawSpec, rawSpec] : rawSpec;
    if (!imports[packageName]) {
      imports[packageName] = [];
    }
    const existing = imports[packageName].find(
      (oldSpec) => oldSpec[0] === spec[0] && oldSpec[1] === spec[1],
    );
    if (!existing) {
      imports[packageName].push(spec);
    }
  }

  addImport('react', ['default', 'React']);
  addImport('react', 'FC');
  addImport('@remirror/react', 'RemirrorProvider');
  addImport('@remirror/core', 'DocExtension');
  addImport('@remirror/core', 'TextExtension');
  addImport('@remirror/core', 'ParagraphExtension');
  addImport('@remirror/react', 'useManager');
  addImport('@remirror/react', 'useExtension');
  addImport('@remirror/react', 'useRemirror');
  addImport('@remirror/playground', 'useRemirrorPlayground');

  const useExtensions: string[] = [];
  const extensionList: string[] = [];
  extensions.forEach((ext) => {
    const [ExtensionName, extensionName] = nameify(
      ext.module + (ext.export ? `-${ext.export}` : ''),
    );
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
    if (namedImports.length > 0) {
      things.push(`{\n  ${namedImports.join(',\n  ')}\n}`);
    }
    importLines.push(`import ${things.join(', ')} from '${moduleName}';`);
  }

  const code = `\
${importLines.join('\n')}

// Set up the component to provide the functionality for the editor
const SmallEditor: FC = () => {
  const remirrorContext = useRemirror();
  useRemirrorPlayground(remirrorContext); // Remove this line
  const { getRootProps, commands } = remirrorContext;

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

  const extensionManager = useManager([
    DocExtension.of(),
    TextExtension.of(),
    ParagraphExtension.of(),
    ${extensionList.join(',\n    ')}
  ], {
    //excludeBaseExtensions: false,
  });

  return (
    <RemirrorProvider manager={extensionManager}>
      <SmallEditor />
    </RemirrorProvider>
  );
};

export default SmallEditorWrapper;
`;
  if (window.prettier) {
    return window.prettier.format(code, {
      parser: 'typescript',
      plugins: (window as any).prettierPlugins,
    });
  } else {
    return code;
  }
}
