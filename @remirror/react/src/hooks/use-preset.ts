import { useMemo } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';

import {
  AnyPreset,
  AnyPresetConstructor,
  PresetConstructorParameter,
  PropertiesOfConstructor,
  SettingsOfConstructor,
} from '@remirror/core';

import { useRemirror } from './use-remirror';

export const usePreset = <Type extends AnyPresetConstructor>(
  Constructor: Type,
  ...[settings]: PresetConstructorParameter<
    SettingsOfConstructor<Type>,
    PropertiesOfConstructor<Type>
  >
) => {
  return useMemo(() => Constructor.of(settings), [Constructor, settings]);
};

/**
 * Update preset properties dynamically why the editor is still running.
 */
export const usePresetProperties = <Type extends AnyPresetConstructor>(
  Constructor: Type,
  properties: PropertiesOfConstructor<Type>,
) => {
  const { manager } = useRemirror();

  const preset: AnyPreset = useMemo(() => manager.getExtension(Constructor), [
    Constructor,
    manager,
  ]);

  useDeepCompareEffect(() => {
    preset.setProperties(properties);
  }, [preset, properties]);
};
