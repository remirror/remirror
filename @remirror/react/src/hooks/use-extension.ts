import { useEffect, useMemo, useRef } from 'react';

import {
  AnyExtension,
  AnyExtensionConstructor,
  ExtensionFromConstructor,
  GetProperties,
  GetSettings,
  IfNoRequiredProperties,
  keys,
  uniqueArray,
} from '@remirror/core';

import { useRemirror } from './use-remirror';

/**
 * Settings Of Extension Constructor
 *
 * Written in shorthand as it's only used in this file.
 */
type SOEC<Constructor extends AnyExtensionConstructor> = GetSettings<
  ExtensionFromConstructor<Constructor>
>;

export const useExtension = <Type extends AnyExtensionConstructor>(
  Constructor: Type,
  ...[settings]: IfNoRequiredProperties<SOEC<Type>, [SOEC<Type>?], [SOEC<Type>]>
) => {
  const dependencyArray = useRef(uniqueArray([...Constructor.settingKeys, keys(settings ?? {})]))
    .current;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => Constructor.of(settings), [Constructor, ...dependencyArray]);
};

/**
 * Properties Of Extension Constructor
 *
 * Written in shorthand as it's only used in this file.
 */
type POEC<Constructor extends AnyExtensionConstructor> = GetProperties<
  ExtensionFromConstructor<Constructor>
>;

export const useExtensionProperties = <Type extends AnyExtensionConstructor>(
  Constructor: Type,
  properties: POEC<Type>,
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
