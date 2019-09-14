import { PlainObject } from '@remirror/core';
import { possibleStandardNames } from './renderer-constants';

const getPossibleStandardName = (key: string): string => {
  if (!possibleStandardNames.hasOwnProperty(key)) {
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
    if (!props.hasOwnProperty(key)) {
      continue;
    }

    const name = getPossibleStandardName(key);
    transformedProps[name] = props[key];

    if (name === 'contentEditable') {
      console.log('contentEditable found', name);
      transformedProps.suppressContentEditableWarning = true;
    }
  }
  return transformedProps;
};
