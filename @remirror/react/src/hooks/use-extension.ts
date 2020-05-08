import { useMemo } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';

import {
  AnyExtension,
  AnyExtensionConstructor,
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
type SettingsOfConstructor<Constructor extends AnyExtensionConstructor> = GetSettings<
  Of<Constructor>
>;

export const useExtension = <Type extends AnyExtensionConstructor>(
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
 *
 * Written in shorthand as it's only used in this file.
 */
type PropertiesOfConstructor<Constructor extends AnyExtensionConstructor> = GetProperties<
  Of<Constructor>
>;

export const useExtensionProperties = <Type extends AnyExtensionConstructor>(
  Constructor: Type,
  properties: PropertiesOfConstructor<Type>,
) => {
  const { manager } = useRemirror();

  const extension: AnyExtension = useMemo(() => manager.getExtension(Constructor), [
    Constructor,
    manager,
  ]);

  useDeepCompareEffect(() => {
    extension.setProperties(properties);
  }, [extension, properties]);
};
