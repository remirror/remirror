import { ObjectInterpolation } from 'emotion';

export interface PlaceholderContent {
  selector: string;
  content: string;
}

export const defaultStyles = (placeholder?: PlaceholderContent): ObjectInterpolation<any> => ({
  '.remirror-editor': {
    caretColor: 'currentColor',
    wordWrap: 'break-word',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
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
