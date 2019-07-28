import { useRemirrorTheme } from '@remirror/ui';
import React, { forwardRef } from 'react';
import { DivProps } from '../social-types';

export const CharacterCountWrapper = forwardRef<HTMLDivElement, DivProps>((props, ref) => {
  const { css } = useRemirrorTheme();

  return (
    <div
      {...props}
      ref={ref}
      css={css`
        position: absolute;
        bottom: 0;
        right: 0;
        margin: 0 8px 10px 4px;
        display: flex;
        justify-content: flex-end;
        align-items: center;
      `}
    />
  );
});

export const EmojiSmileyWrapper = forwardRef<HTMLDivElement, DivProps>((props, ref) => {
  const { css } = useRemirrorTheme();

  return (
    <div
      {...props}
      ref={ref}
      css={css`
        position: absolute;
        top: 0;
        right: 0;
        margin: 10px 8px 0 4px;
        display: flex;
        justify-content: flex-end;
        align-items: center;
      `}
    />
  );
});

export const EmojiPickerWrapper = forwardRef<HTMLDivElement, DivProps>((props, ref) => {
  const { css } = useRemirrorTheme();

  return (
    <div
      {...props}
      ref={ref}
      css={css`
        position: absolute;
        top: 0;
        right: 0;
        margin: 40px 8px 0 4px;
        display: flex;
        justify-content: flex-end;
        align-items: center;
      `}
    />
  );
});

export const EditorWrapper = forwardRef<HTMLDivElement, DivProps>((props, ref) => {
  const { css } = useRemirrorTheme();

  return (
    <div
      {...props}
      ref={ref}
      css={css`
        height: 100%;
        position: relative;
        & * {
          box-sizing: border-box;
        }
      `}
    />
  );
});
