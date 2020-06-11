import { CodeOptions } from './interfaces';

function nameify(str: string): string {
  const base = str
    .replace(/[^\da-z]/gi, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+([\da-z])/gi, (_, capture: string) => capture.toUpperCase());
  // Need it to start with a letter - if it doesn't then prefix with `ext`
  const safeBase = base.match(/^[a-z]/i)
    ? base
    : `ext${base.slice(0, 1).toUpperCase()}${base.slice(1)}`;
  const upper = safeBase.slice(0, 1).toUpperCase() + safeBase.slice(1);
  return upper;
  //const lower = safeBase.slice(0, 1).toLowerCase() + safeBase.slice(1);
  //return [upper, lower];
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
  addImport('remirror/react', 'RemirrorProvider');
  //addImport('remirror/extension/bold', 'BoldExtension');
  //addImport('remirror/extension/italic', 'ItalicExtension');
  addImport('remirror/react', 'useManager');
  // addImport('remirror/react', 'useExtension');
  addImport('remirror/react', 'useRemirror');
  addImport('@remirror/playground', 'useRemirrorPlayground');

  const extensionNames: string[] = [];
  const extensionList: string[] = [];
  extensions.forEach((ext) => {
    const ExtensionName = nameify(
      /* Official extensions are guaranteed to be uniquely named, so just use
       * the export name, otherwise we need to scope the name to the module to
       * avoid clashes.
       */
      ext.export && (ext.module.startsWith('remirror/') || ext.module.startsWith('@remirror/'))
        ? ext.export
        : ext.module + (ext.export ? `-${ext.export}` : ''),
    );
    addImport(ext.module, ext.export ? [ext.export, ExtensionName] : ['default', ExtensionName]);
    extensionNames.push(ExtensionName);
    extensionList.push(`new ${ExtensionName}()`);
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

  console.log(extensionNames);
  const actions: string[] = [];
  if (extensionNames.includes(`BoldExtension`)) {
    actions.push(`<button onClick={() => commands.toggleBold()}>bold</button>`);
  }
  if (extensionNames.includes(`ItalicExtension`)) {
    actions.push(`<button onClick={() => commands.toggleItalic()}>italic</button>`);
  }

  const code = `\
${importLines.join('\n')}

// Set up the component to provide the functionality for the editor
const SmallEditor: FC = () => {
  const { getRootProps${
    actions.length ? ', commands' : ''
  } } = useRemirror(); // Picked from the context.
  useRemirrorPlayground(); // Remove this line

  return (
    <div>
      ${actions.join('\n')}
      <div {...getRootProps()} />
    </div>
  );
};

const SmallEditorWrapper = () => {
  const extensionManager = useManager([
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
