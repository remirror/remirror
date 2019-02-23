import React, { FunctionComponent } from 'react';

import cssifyObject from 'css-in-js-utils/lib/cssifyObject';
import { uniqueClass } from '../helpers';
import { defaultStyles } from '../styles';
import { CSSProperty, RemirrorCustomStyles } from '../types';

const wrapStyle = (uid: string, selector: string, style: CSSProperty, extraClasses: string[]) => {
  const prefixes = ['remirror', ...extraClasses];
  const styleString = cssifyObject(style);
  const space = selector && selector.startsWith(':') ? '' : ' ';
  const selectors = prefixes.map(prefix => `.${uniqueClass(uid, prefix)}${space}${selector}`).join(',');
  return styleString ? `${selectors}{${styleString}}` : '';
};

export interface RemirrorStyleProps {
  uid: string;
  placeholder?: { text: string; className: string };
  styles?: Partial<RemirrorCustomStyles> | null;
  extraClasses: string[];
}

export const RemirrorStyle: FunctionComponent<RemirrorStyleProps> = ({
  uid,
  placeholder,
  styles,
  extraClasses,
}) => {
  let styleString = '';
  let placeholderStyle: CSSProperty = {};
  let placeholderSelector = '';

  if (placeholder) {
    placeholderStyle = { ...defaultStyles.placeholder, content: `"${placeholder.text}"` };
    placeholderSelector = `p.${placeholder.className}:first-child::before`;
  }

  styleString = wrapStyle(uid, placeholderSelector, placeholderStyle, extraClasses);
  if (styles) {
    styleString = Object.entries(styles).reduce((acc, [selector, style]) => {
      if (selector === 'placeholder') {
        return style ? acc + ' ' + wrapStyle(uid, placeholderSelector, style, extraClasses) : acc;
      } else if (selector === 'main') {
        return style
          ? acc + ' ' + wrapStyle(uid, '', { ...defaultStyles.main, ...style }, extraClasses)
          : acc;
      }
      return style ? acc + ' ' + wrapStyle(uid, selector, style, extraClasses) : acc;
    }, styleString);
  }

  return styleString ? <style>{styleString}</style> : null;
};
