import React, { FC, useCallback, useMemo } from 'react';

import { CodeOptions, ExtensionSpec } from './interfaces';

export interface SimplePanelProps {
  options: CodeOptions;
  setOptions: (newOptions: CodeOptions) => void;
  onAdvanced: () => void;
}
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
  const { options, setOptions, onAdvanced } = props;
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
  const modules = Object.keys(grouped).sort();
  return (
    <div>
      <button onClick={onAdvanced}>Enter advanced mode</button>
      {modules.map((moduleName) => (
        <>
          <p>
            <strong>{moduleName}</strong>
          </p>
          {grouped[moduleName].map((spec) => (
            <ExtensionCheckbox
              key={`${`${spec.module}|${spec.export ?? 'default'}`}`}
              spec={spec}
              options={options}
              setOptions={setOptions}
              hideModuleName
            />
          ))}
        </>
      ))}
    </div>
  );
};
