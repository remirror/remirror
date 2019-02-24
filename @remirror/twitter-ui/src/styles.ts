import { RemirrorCustomStyles } from '@remirror/react';

export const defaultStyles: RemirrorCustomStyles = {
  placeholder: {
    color: '#aab8c2',
    fontStyle: 'normal',
    position: 'absolute',
    fontWeight: 300,
    letterSpacing: '0.5px',
  },
  ':focus': {
    outline: 'none',
  },
  p: {
    margin: 0,
    letterSpacing: '0.6px',
    color: 'black',
  },
  '*': {
    boxSizing: 'border-box',
  },
  main: {
    boxSizing: 'border-box',
    position: 'relative',
    border: '1px solid #99CFEB',
    boxShadow: '0 0 0 1px #99CFEB',
    lineHeight: '20px',
    borderRadius: '8px',
    width: '100%',
    fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif',
    fontSize: '14px',
    maxHeight: 'calc(90vh - 124px)',
    minHeight: '142px',
    padding: '8px',
    paddingRight: '31px',
    fontWeight: 400,
  },
  a: {
    textDecoration: 'none !important',
    color: '#1DA1F2',
  },
  'a.mention': {
    pointerEvents: 'none',
    cursor: 'default',
  },
  '.suggestions-dropdown': {
    alignItems: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    flexBasis: 'auto',
    flexShrink: 0,
    margin: 0,
    overflow: 'hidden',
    listStyle: 'none',
    padding: 0,
  },
  '.suggestions-item': {
    display: 'flex',
    flexDirection: 'row',
  },
  '.suggestions-item.active': {
    backgroundColor: 'rgb(245, 248, 250)',
    borderBottom: '1px solid rgb(230, 236, 240)',
  },
  '.ProseMirror-selectednode': {
    backgroundColor: 'rgb(245, 248, 250)',
  },
};
