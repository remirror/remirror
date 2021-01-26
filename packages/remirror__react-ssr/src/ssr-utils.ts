import {
  hasOwnProperty,
  keys,
  MarkExtensionSpec,
  NodeExtensionSpec,
  object,
  Shape,
} from '@remirror/core';

import { possibleStandardNames } from './ssr-constants';

function getPossibleStandardName(key: string): string {
  if (!hasOwnProperty(possibleStandardNames, key)) {
    return key;
  }

  return possibleStandardNames[key] ?? key;
}

/**
 * Map standard html attribute names to their react equivalents.
 *
 * TODO is there a better way of doing this.
 */
export function mapProps(props: Shape): Shape {
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

type SharedSpec = MarkExtensionSpec | NodeExtensionSpec;
type GatheredDomMethods<Spec extends SharedSpec> = Record<string, Spec['toDOM']>;

/**
 * Gather up all the toDOM methods from the provided spec object
 *
 * @param specs - the prosemirror schema specs for each node / mark
 */
export function gatherDomMethods<Spec extends SharedSpec>(
  specs: Record<string, Spec>,
): GatheredDomMethods<Spec> {
  const result: GatheredDomMethods<Spec> = object();

  for (const name in specs) {
    if (!hasOwnProperty(specs, name)) {
      continue;
    }

    const toDOM = specs[name]?.toDOM;

    if (toDOM) {
      result[name] = toDOM;
    }
  }

  return result;
}
