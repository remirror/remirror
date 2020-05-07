import { useEffect, useMemo } from 'react';

import {
  AnyPreset,
  AnyPresetConstructor,
  GetProperties,
  GetSettings,
  IfNoRequiredProperties,
  Of,
} from '@remirror/core';

import { useRemirror } from './use-remirror';

/**
 * Settings Of Extension Constructor
 *
 * Written in shorthand as it's only used in this file.
 */
type SettingsOfConstructor<Constructor extends AnyPresetConstructor> = GetSettings<Of<Constructor>>;

export const usePreset = <Type extends AnyPresetConstructor>(
  Constructor: Type,
  ...[settings]: IfNoRequiredProperties<
    SettingsOfConstructor<Type>,
    [SettingsOfConstructor<Type>?],
    [SettingsOfConstructor<Type>]
  >
) => {
  return useMemo(() => Constructor.of(settings), [Constructor, settings]);
};

/**
 * Properties Of Extension Constructor
 */
type PropertiesOfConstructor<Constructor extends AnyPresetConstructor> = GetProperties<
  Of<Constructor>
>;

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

  useEffect(() => {
    preset.setProperties(properties);
  }, [preset, properties]);
};
