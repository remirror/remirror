import { PlainObject, hasOwnProperty, MarkExtensionSpec, NodeExtensionSpec } from '@remirror/core';
import { possibleStandardNames } from './renderer-constants';

const getPossibleStandardName = (key: string): string => {
  if (!hasOwnProperty(possibleStandardNames, key)) {
    return key;
  }
  return possibleStandardNames[key] || key;
};

/**
 * Map standard html attribute names to their react equivalents.
 */
export const mapProps = (props: PlainObject) => {
  const transformedProps: PlainObject = {};
  for (const key in props) {
    if (!hasOwnProperty(props, key)) {
      continue;
    }

    const name = getPossibleStandardName(key);
    transformedProps[name] = props[key];

    if (name === 'contentEditable') {
      transformedProps.suppressContentEditableWarning = true;
    }
  }
  return transformedProps;
};

/**
 * Gather up all the toDOM methods from the provided spec object
 *
 * @param specs - the prosemirror schema specs for each node / mark
 */
export const gatherToDOM = <GSpec extends MarkExtensionSpec | NodeExtensionSpec>(
  specs: Record<string, GSpec>,
) => {
  const result: Record<string, GSpec['toDOM']> = {};
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
};
