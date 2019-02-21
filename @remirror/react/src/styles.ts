import * as CSS from 'csstype';

export type CSSProperty = CSS.Properties<string | number>;
export type CustomStyleProps = 'main' | 'placeholder';
export interface RemirrorCustomStyles
  extends Record<CustomStyleProps, CSSProperty>,
    Record<string, CSSProperty> {}

export const defaultStyles: RemirrorCustomStyles = {
  main: {
    // caretColor: 'red',
    wordWrap: 'break-word',
    whiteSpace: 'pre-wrap',
  },
  ':focus': {
    outline: 'none',
  },
  placeholder: {
    position: 'absolute',
    color: '#aaa',
    pointerEvents: 'none',
    height: 0,
    fontStyle: 'italic',
  },
};
