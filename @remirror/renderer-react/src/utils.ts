import { PlainObject } from '@remirror/core';
import { possibleStandardNames } from './standard-names';

export const getPossibleStandardName = (key: string): string => {
  if (!possibleStandardNames.hasOwnProperty(key)) {
    return key;
  }
  return possibleStandardNames[key] || key;
};

export const mapProps = (props: PlainObject) => {
  const transformedProps: PlainObject = {};
  for (const key in props) {
    if (!props.hasOwnProperty(key)) {
      continue;
    }
    transformedProps[getPossibleStandardName(key)] = props[key];
  }
  return transformedProps;
};
