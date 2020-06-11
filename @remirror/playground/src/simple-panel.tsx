import React, { FC, Fragment, useCallback, useMemo } from 'react';

import { REQUIRED_MODULES } from './execute';
import { CodeOptions, ModuleSpec, RemirrorModules } from './interfaces';
import { isExtensionName, isPresetName } from './exports';

export interface SimplePanelProps {
  options: CodeOptions;
  setOptions: (newOptions: CodeOptions) => void;
  onAdvanced: () => void;
  modules: RemirrorModules;
  addModule: (moduleName: string) => void;
  removeModule: (moduleName: string) => void;
}

interface ExtensionCheckboxProps {
  options: CodeOptions;
  setOptions: (newOptions: CodeOptions) => void;
  spec: ModuleSpec;
  hideModuleName: boolean;
  type: 'preset' | 'extension';
}

const ExtensionOrPresetCheckbox: FC<ExtensionCheckboxProps> = function (props) {
  const { options, setOptions, spec, hideModuleName, type } = props;
  const optionName: 'presets' | 'extensions' = (type + 's') as any;
  const list = options[optionName];
  const existingIndex = useMemo(
    () =>
      list.findIndex(
        (otherSpec) => otherSpec.module === spec.module && otherSpec.export === spec.export,
      ),
    [list, spec.export, spec.module],
  );
  const handleChange = useCallback(() => {
    if (existingIndex >= 0) {
      const collection = [...(options as any)[optionName]];
      collection.splice(existingIndex, 1);
      setOptions({
        ...options,
        [optionName]: collection,
      });
    } else {
      setOptions({
        ...options,
        [optionName]: [...(options as any)[optionName], spec],
      });
    }
  }, [existingIndex, options, setOptions, spec, optionName]);
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

      <p>
        <strong>Remirror core extensions</strong>{' '}
      </p>
      {Object.keys(modules).map((moduleName) => {
        if (!REQUIRED_MODULES.includes(moduleName)) {
          return null;
        }
        const mod = modules[moduleName];
        return mod.loading ? (
          <em>Loading...</em>
        ) : mod.error ? (
          <em>An error occurred: {String(mod.error)}</em>
        ) : (
          Object.keys(mod.exports).map((exportName) =>
            isExtensionName(exportName) ? (
              <ExtensionOrPresetCheckbox
                key={`${`${moduleName}|${exportName ?? 'default'}`}`}
                spec={{ module: moduleName, export: exportName }}
                options={options}
                setOptions={setOptions}
                hideModuleName
                type='extension'
              />
            ) : null,
          )
        );
      })}

      <p>
        <strong>Remirror core presets</strong>{' '}
      </p>
      {Object.keys(modules).map((moduleName) => {
        if (!REQUIRED_MODULES.includes(moduleName)) {
          return null;
        }
        const mod = modules[moduleName];
        return mod.loading ? (
          <em>Loading...</em>
        ) : mod.error ? (
          <em>An error occurred: {String(mod.error)}</em>
        ) : (
          Object.keys(mod.exports).map((exportName) =>
            isPresetName(exportName) ? (
              <ExtensionOrPresetCheckbox
                key={`${`${moduleName}|${exportName ?? 'default'}`}`}
                spec={{ module: moduleName, export: exportName }}
                options={options}
                setOptions={setOptions}
                hideModuleName
                type='preset'
              />
            ) : null,
          )
        );
      })}

      {Object.keys(modules).map((moduleName) => {
        if (REQUIRED_MODULES.includes(moduleName)) {
          return null;
        }
        const mod = modules[moduleName];
        return (
          <Fragment key={moduleName}>
            <p>
              <strong>{moduleName}</strong>{' '}
              {!REQUIRED_MODULES.includes(moduleName) ? (
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
              Object.keys(mod.exports).map((exportName) =>
                isExtensionName(exportName) ? (
                  <ExtensionOrPresetCheckbox
                    key={`${`${moduleName}|${exportName ?? 'default'}`}`}
                    spec={{ module: moduleName, export: exportName }}
                    options={options}
                    setOptions={setOptions}
                    hideModuleName
                    type='extension'
                  />
                ) : isPresetName(exportName) ? (
                  <ExtensionOrPresetCheckbox
                    key={`${`${moduleName}|${exportName ?? 'default'}`}`}
                    spec={{ module: moduleName, export: exportName }}
                    options={options}
                    setOptions={setOptions}
                    hideModuleName
                    type='preset'
                  />
                ) : null,
              )
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
