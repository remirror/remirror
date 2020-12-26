import type { CodeOptions } from './interfaces';

function nameify(str: string): string {
  const base = str
    .replace(/[^\da-z]/gi, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+([\da-z])/gi, (_, capture: string) => capture.toUpperCase());
  // Need it to start with a letter - if it doesn't then prefix with `ext`
  const safeBase = base.match(/^[a-z]/i)
    ? base
    : `ext${base.slice(0, 1).toUpperCase()}${base.slice(1)}`;
  return safeBase.slice(0, 1).toUpperCase() + safeBase.slice(1);
  //const lower = safeBase.slice(0, 1).toLowerCase() + safeBase.slice(1);
  //return [upper, lower];
}

export function makeCode(codeOptions: CodeOptions): string {
  const { extensions = [], presets = [] } = codeOptions;

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
  addImport('remirror/react', 'Remirror');
  //addImport('remirror/extensions', 'BoldExtension');
  //addImport('remirror/extensions', 'ItalicExtension');
  addImport('remirror/react', 'useManager');
  // addImport('remirror/react', 'useExtension');
  addImport('remirror/react', 'useRemirror');
  addImport('@remirror/playground', 'useRemirrorPlayground');

  const combinedNames: string[] = [];
  const combinedList: string[] = [];
  [...extensions, ...presets].forEach((ext) => {
    const Name = nameify(
      /* Official extensions are guaranteed to be uniquely named, so just use
       * the export name, otherwise we need to scope the name to the module to
       * avoid clashes.
       */
      ext.export && (ext.module.startsWith('remirror/') || ext.module.startsWith('@remirror/'))
        ? ext.export
        : ext.module + (ext.export ? `-${ext.export}` : ''),
    );
    addImport(ext.module, ext.export ? [ext.export, Name] : ['default', Name]);
    combinedNames.push(Name);
    combinedList.push(`new ${Name}()`);
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

  const actions: string[] = [];

  if (combinedNames.includes(`BoldExtension`)) {
    actions.push(`<button onClick={() => commands.toggleBold()}>bold</button>`);
  }

  if (combinedNames.includes(`ItalicExtension`)) {
    actions.push(`<button onClick={() => commands.toggleItalic()}>italic</button>`);
  }

  const code = `\
${importLines.join('\n')}

const EXTENSIONS = () => [
  ${combinedList.join(',\n  ')}
];

/**
 * This component contains the editor and any toolbars/chrome it requires.
 */
const SmallEditor: FC = () => {
  const { getRootProps${actions.length > 0 ? ', commands' : ''} } = useRemirror();


  return (
    <div>
      ${actions.join('\n')}
      <div {...getRootProps()} />
    </div>
  );
};

const SmallEditorContainer = () => {
  const extensionManager = useManager(EXTENSIONS);

  const { value, onChange } = useRemirrorPlayground(extensionManager); // Delete this line

  return (
    <Remirror
      manager={extensionManager}
      value={value}
      onChange={onChange}
    >
      <SmallEditor />
    </Remirror>
  );
};

export default SmallEditorContainer;
`;

  if (window.prettier) {
    return window.prettier.format(code, {
      parser: 'typescript',
      plugins: (window as any).prettierPlugins,
    });
  }

  return code;
}
