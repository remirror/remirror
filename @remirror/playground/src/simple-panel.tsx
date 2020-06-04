import React, { FC, Fragment, useCallback, useMemo } from 'react';

import { CodeOptions, ExtensionSpec, RemirrorModules } from './interfaces';

export interface SimplePanelProps {
  options: CodeOptions;
  setOptions: (newOptions: CodeOptions) => void;
  onAdvanced: () => void;
  modules: RemirrorModules;
  addModule: (moduleName: string) => void;
  removeModule: (moduleName: string) => void;
}
/*
const knownExtensions: ExtensionSpec[] = [
  {
    module: '@remirror/core',
    export: 'ParagraphExtension',
  },
  {
    module: '@remirror/core',
    export: 'BoldExtension',
  },
  {
    module: '@remirror/core',
    export: 'ItalicExtension',
  },
  {
    module: '@remirror/core',
    export: 'UnderlineExtension',
  },
];
*/

interface ExtensionCheckboxProps {
  options: CodeOptions;
  setOptions: (newOptions: CodeOptions) => void;
  spec: ExtensionSpec;
  hideModuleName: boolean;
}

const ExtensionCheckbox: FC<ExtensionCheckboxProps> = function (props) {
  const { options, setOptions, spec, hideModuleName } = props;
  const existingIndex = useMemo(
    () =>
      options.extensions.findIndex(
        (otherSpec) => otherSpec.module === spec.module && otherSpec.export === spec.export,
      ),
    [options.extensions, spec.export, spec.module],
  );
  const handleChange = useCallback(() => {
    if (existingIndex >= 0) {
      const newExtensions = [...options.extensions];
      newExtensions.splice(existingIndex, 1);
      setOptions({
        ...options,
        extensions: newExtensions,
      });
    } else {
      setOptions({
        ...options,
        extensions: [...options.extensions, spec],
      });
    }
  }, [existingIndex, options, setOptions, spec]);
  const text = hideModuleName
    ? spec.export
      ? spec.export
      : 'default'
    : `${spec.module}${spec.export ? ` : ${spec.export}` : ''}`;
  return (
    <div>
      <label>
        <input type='checkbox' checked={existingIndex >= 0} onChange={handleChange} /> {text}
      </label>
    </div>
  );
};

export const SimplePanel: FC<SimplePanelProps> = function (props) {
  const { options, setOptions, onAdvanced, modules, addModule, removeModule } = props;

  const onAddModule = useCallback(() => {
    const moduleName = prompt('What module name do you wish to add?');
    if (moduleName) {
      addModule(moduleName);
    }
  }, [addModule]);

  /*
  const grouped = useMemo(() => {
    const groups: { [module: string]: ExtensionSpec[] } = {};
    for (const ext of knownExtensions) {
      if (!groups[ext.module]) {
        groups[ext.module] = [];
      }
      groups[ext.module].push(ext);
    }
    return groups;
  }, []);
  */
  //const modules = Object.keys(grouped).sort();
  return (
    <div>
      <button onClick={onAdvanced}>Enter advanced mode</button>
      {Object.keys(modules).map((moduleName) => {
        const mod = modules[moduleName];
        return (
          <Fragment key={moduleName}>
            <p>
              <strong>{moduleName}</strong>{' '}
              {moduleName !== '@remirror/core' ? (
                <button onClick={() => removeModule(moduleName)} title='remove'>
                  -
                </button>
              ) : null}
            </p>
            {mod.loading ? (
              <em>Loading...</em>
            ) : mod.error ? (
              <em>An error occurred: {String(mod.error)}</em>
            ) : (
              Object.keys(mod.exports).map((exportName) => (
                <ExtensionCheckbox
                  key={`${`${moduleName}|${exportName ?? 'default'}`}`}
                  spec={{ module: moduleName, export: exportName }}
                  options={options}
                  setOptions={setOptions}
                  hideModuleName
                />
              ))
            )}
          </Fragment>
        );
      })}
      <p>
        <button onClick={onAddModule}>+ Add module</button>
      </p>
    </div>
  );
};
