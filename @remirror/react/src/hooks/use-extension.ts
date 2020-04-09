import { useEffect, useMemo, useRef } from 'react';

import {
  AnyExtension,
  AnyExtensionConstructor,
  ExtensionFromConstructor,
  GetProperties,
  GetSettings,
  IfNoRequiredProperties,
} from '@remirror/core';

import { useRemirror } from './use-remirror';

/**
 * Settings Of Extension Constructor
 *
 * Written in shorthand as it's only used in this file.
 */
type SettingsOfConstructor<Constructor extends AnyExtensionConstructor> = GetSettings<
  ExtensionFromConstructor<Constructor>
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
  ExtensionFromConstructor<Constructor>
>;

export const useExtensionProperties = <Type extends AnyExtensionConstructor>(
  Constructor: Type,
  properties: PropertiesOfConstructor<Type>,
) => {
  const dependencyArray = useRef(Constructor.propertyKeys).current;
  const { manager } = useRemirror();

  const extension: AnyExtension = useMemo(() => manager.getExtension(Constructor), [
    Constructor,
    manager,
  ]);

  useEffect(() => {
    extension.setProperties(properties);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extension, ...dependencyArray]);
};
