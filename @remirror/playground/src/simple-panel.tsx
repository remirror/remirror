import React, { FC, useCallback, useMemo } from 'react';

import { CodeOptions, ExtensionSpec } from './interfaces';

export interface SimplePanelProps {
  options: CodeOptions;
  setOptions: (newOptions: CodeOptions) => void;
  onAdvanced: () => void;
}
const knownExtensions: ExtensionSpec[] = [
  {
    module: '@remirror/core-extensions',
    export: 'BoldExtension',
  },
  {
    module: '@remirror/core-extensions',
    export: 'ItalicExtension',
  },
];

const ExtensionCheckbox: FC<{
  options: CodeOptions;
  setOptions: (newOptions: CodeOptions) => void;
  spec: ExtensionSpec;
}> = props => {
  const { options, setOptions, spec } = props;
  const existingIndex = useMemo(
    () =>
      options.extensions.findIndex(
        otherSpec => otherSpec.module === spec.module && otherSpec.export === spec.export,
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
  return (
    <div>
      <label>
        <input type='checkbox' checked={existingIndex >= 0} onChange={handleChange} /> {spec.module}{' '}
        {spec.export ? `: ${spec.export}` : ''}
      </label>
    </div>
  );
};

export const SimplePanel: FC<SimplePanelProps> = props => {
  const { options, setOptions, onAdvanced } = props;
  return (
    <div>
      <button onClick={onAdvanced}>Enter advanced mode</button>
      {knownExtensions.map(spec => (
        <ExtensionCheckbox
          key={`${`${spec.module}|${spec.export ?? 'default'}`}`}
          spec={spec}
          options={options}
          setOptions={setOptions}
        />
      ))}
    </div>
  );
};
