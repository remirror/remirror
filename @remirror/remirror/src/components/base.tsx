import React, { FunctionComponent } from 'react';

import cssifyObject from 'css-in-js-utils/lib/cssifyObject';
import * as CSS from 'csstype';

const wrapStyle = (uid: string, selector: string, style: CSSProperty) => {
  const styleString = cssifyObject(style);
  const space = selector && selector.startsWith(':') ? '' : ' ';
  return styleString ? `.${uid}${space}${selector}{${styleString}}` : '';
};

type CSSProperty = CSS.Properties<string | number>;

type CustomStyleProps = 'main' | 'placeholder';
export interface RemirrorCustomStyles
  extends Record<CustomStyleProps, CSSProperty>,
    Record<string, CSSProperty> {}

export interface RemirrorStyleProps {
  uid: string;
  placeholder?: { text: string; className: string };
  styles?: Partial<RemirrorCustomStyles> | null;
}

export const RemirrorStyle: FunctionComponent<RemirrorStyleProps> = ({
  uid,
  placeholder,
  styles,
}) => {
  let styleString = '';
  let placeholderStyle: CSSProperty = {};
  let placeholderSelector = '';

  if (placeholder) {
    placeholderStyle = placeholder ? { content: `"${placeholder.text}"` } : {};
    placeholderSelector = `p.${placeholder.className}:first-child::before`;
  }

  styleString = wrapStyle(uid, placeholderSelector, placeholderStyle);
  if (styles) {
    styleString = Object.entries(styles).reduce((acc, [selector, style]) => {
      if (selector === 'placeholder') {
        return style ? acc + ' ' + wrapStyle(uid, placeholderSelector, style) : acc;
      } else if (selector === 'main') {
        return style ? acc + ' ' + wrapStyle(uid, '', style) : acc;
      }
      return style ? acc + ' ' + wrapStyle(uid, selector, style) : acc;
    }, styleString);
  }

  return styleString ? <style>{styleString}</style> : null;
};
