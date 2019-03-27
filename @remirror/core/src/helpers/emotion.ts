import { jsx } from '@emotion/core';
import { ReactNode } from 'react';
import { isArray, uniqueArray } from './base';

/**
 * Clones an element and enables the css emotion prop
 */
export const cloneElement = (element: any, props: any, ...rest: ReactNode[]) => {
  const children = uniqueArray([
    ...(isArray(props.children) ? props.children : props.children ? [props.children] : []),
    ...(isArray(rest) ? rest : rest ? [rest] : []),
  ]);
  return jsx(
    element.type,
    {
      key: element.key,
      ref: element.ref,
      ...element.props,
      ...props,
    },
    ...children,
  );
};
