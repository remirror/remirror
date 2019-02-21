import { RemirrorCustomStyles } from './types';

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
