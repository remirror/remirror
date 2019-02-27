import { ObjectInterpolation } from '@emotion/core';

export interface PlaceholderContent {
  selector: string;
  content: string;
}

export const defaultStyles = (placeholder?: PlaceholderContent): ObjectInterpolation<any> => ({
  '.remirror-editor': {
    // caretColor: 'red',
    wordWrap: 'break-word',
    whiteSpace: 'pre-wrap',
  },
  '.remirror-editor:focus': {
    outline: 'none',
  },
  ...(placeholder
    ? {
        [placeholder.selector]: {
          position: 'absolute',
          color: '#aaa',
          pointerEvents: 'none',
          height: 0,
          fontStyle: 'italic',
        },
      }
    : {}),
});
