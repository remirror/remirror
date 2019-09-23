import { useRemirrorTheme } from '@remirror/ui';
import React, { forwardRef } from 'react';
import { DivProps } from '../social-types';

export const CharacterCountWrapper = forwardRef<HTMLDivElement, DivProps>((props, ref) => {
  const { sx } = useRemirrorTheme();

  return (
    <div
      {...props}
      ref={ref}
      css={sx({
        position: 'absolute',
        bottom: '0',
        right: '0',
        margin: '0 8px 10px 4px',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
      })}
    />
  );
});
CharacterCountWrapper.displayName = 'CharacterCountWrapper';

export const EditorWrapper = forwardRef<HTMLDivElement, DivProps>((props, ref) => {
  const { sx } = useRemirrorTheme();

  return (
    <div
      {...props}
      ref={ref}
      css={sx({
        height: '100%',
        position: 'relative',
        '& *': {
          boxSizing: 'border-box',
        },
      })}
    />
  );
});
EditorWrapper.displayName = 'EditorWrapper';
