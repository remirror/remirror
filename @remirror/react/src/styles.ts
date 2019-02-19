import { RemirrorCustomStyles } from './components';

export const defaultStyles: RemirrorCustomStyles = {
  main: {
    // caretColor: 'red',
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
