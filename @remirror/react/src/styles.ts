import { RemirrorCustomStyles } from './components';

export const defaultStyles: RemirrorCustomStyles = {
  main: {
    padding: '10px',
    background: '#fffeee',
    minHeight: '200px',
    // caretColor: 'red',
  },
  ':focus': {
    outline: 'none',
  },
  placeholder: {
    float: 'left',
    color: '#aaa',
    pointerEvents: 'none',
    height: 0,
    fontStyle: 'italic',
  },
};
