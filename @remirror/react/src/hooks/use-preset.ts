import { useMemo } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';

import {
  AnyPresetConstructor,
  DynamicOptionsOfConstructor,
  OptionsOfConstructor,
  PresetConstructorParameter,
} from '@remirror/core';

import { useRemirror } from './use-remirror';

export const usePresetInstance = <Type extends AnyPresetConstructor>(
  Constructor: Type,
  ...[settings]: PresetConstructorParameter<OptionsOfConstructor<Type>>
) => {
  return useMemo(() => new Constructor(settings), [Constructor, settings]);
};

/**
 * Update preset properties dynamically while the editor is still running.
 */
export const usePreset = <Type extends AnyPresetConstructor>(
  Constructor: Type,
  options: DynamicOptionsOfConstructor<Type>,
) => {
  const { manager } = useRemirror();

  const preset = useMemo(() => manager.getPreset(Constructor), [Constructor, manager]);

  useDeepCompareEffect(() => {
    preset.setOptions(options);
  }, [preset, options]);
};
