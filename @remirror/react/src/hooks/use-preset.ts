import { useMemo } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';

import {
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
  return useMemo(() => new Constructor(settings), [Constructor, settings]);
};

/**
 * Update preset properties dynamically while the editor is still running.
 */
export const usePresetProperties = <Type extends AnyPresetConstructor>(
  Constructor: Type,
  properties: PropertiesOfConstructor<Type>,
) => {
  const { manager } = useRemirror();

  const preset = useMemo(() => manager.getPreset(Constructor), [Constructor, manager]);

  useDeepCompareEffect(() => {
    preset.setProperties(properties);
  }, [preset, properties]);
};
