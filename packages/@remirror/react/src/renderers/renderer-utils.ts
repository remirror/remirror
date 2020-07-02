import {
  hasOwnProperty,
  keys,
  MarkExtensionSpec,
  NodeExtensionSpec,
  object,
  Shape,
} from '@remirror/core';

import { possibleStandardNames } from './renderer-constants';

function getPossibleStandardName(key: string): string {
  if (!hasOwnProperty(possibleStandardNames, key)) {
    return key;
  }
  return possibleStandardNames[key] || key;
}

/**
 * Map standard html attribute names to their react equivalents.
 */
export function mapProps(props: Shape) {
  const transformedProps: Shape = object();
  for (const key of keys(props)) {
    const name = getPossibleStandardName(key);
    transformedProps[name] = props[key];

    if (name === 'contentEditable') {
      transformedProps.suppressContentEditableWarning = true;
    }
  }
  return transformedProps;
}

/**
 * Gather up all the toDOM methods from the provided spec object
 *
 * @param specs - the prosemirror schema specs for each node / mark
 */
export function gatherDomMethods<Spec extends MarkExtensionSpec | NodeExtensionSpec>(
  specs: Record<string, Spec>,
) {
  const result: Record<string, Spec['toDOM']> = object();

  for (const name in specs) {
    if (!hasOwnProperty(specs, name)) {
      continue;
    }

    const toDOM = specs[name].toDOM;

    if (toDOM) {
      result[name] = toDOM;
    }
  }

  return result;
}
