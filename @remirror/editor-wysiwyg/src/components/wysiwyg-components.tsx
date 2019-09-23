import { RemirrorInterpolation } from '@remirror/core';
import { useRemirrorTheme } from '@remirror/ui';
import { ResetButton } from '@remirror/ui-buttons';
import React, { FC, forwardRef } from 'react';
import { ButtonProps } from '../wysiwyg-types';

export const Menu = forwardRef<HTMLDivElement, JSX.IntrinsicElements['div']>((props, ref) => {
  const { sx } = useRemirrorTheme();

  return (
    <div
      {...props}
      ref={ref}
      css={sx({
        '& > button': {
          display: 'inline-block',
        },
      })}
    />
  );
});

export const Toolbar: FC = props => {
  const { sx } = useRemirrorTheme();

  return (
    <Menu
      {...props}
      css={sx({
        position: 'relative',
        padding: '1px 28px 17px',
        margin: '0 -20px',
        borderBottom: '2px solid #eee',
        marginBottom: '20px',
      })}
    />
  );
};

export interface WithPaddingProps {
  withPadding: 'horizontal' | 'right';
}

interface IconButtonProps extends ButtonProps, Partial<WithPaddingProps> {
  /**
   * The position in the menu
   */
  index?: number;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>((props, ref) => {
  const { sx } = useRemirrorTheme();

  return (
    <ResetButton
      {...props}
      ref={ref}
      css={sx(
        {
          marginLeft: props.index !== 0 ? 3 : 0,
        },
        props.css as RemirrorInterpolation,
      )}
    />
  );
});

/**
 * Allows positioners to work.
 */
export const EditorWrapper = forwardRef<HTMLDivElement, JSX.IntrinsicElements['div']>((props, ref) => {
  const { sx } = useRemirrorTheme();

  return <div {...props} ref={ref} css={sx({ position: 'relative' })} />;
});

type BubbleMenuTooltipProps = { bottom: number; left: number } & JSX.IntrinsicElements['span'];

export const BubbleMenuTooltip = forwardRef<HTMLSpanElement, BubbleMenuTooltipProps>((props, ref) => {
  const { css } = useRemirrorTheme();

  return (
    <span
      {...props}
      ref={ref}
      css={css`
        z-index: 10;
        position: absolute;
        bottom: ${props.bottom}px;
        left: ${props.left}px;
        padding-bottom: 9px;
        transform: translateX(-50%);
      `}
    />
  );
});

export const BubbleContent = forwardRef<HTMLSpanElement, JSX.IntrinsicElements['span']>((props, ref) => {
  const { css } = useRemirrorTheme();

  return (
    <span
      {...props}
      ref={ref}
      css={css`
        background: black;
        border-radius: 3px;
        color: white;
        font-size: 0.75rem;
        line-height: 1.4;
        padding: 0.75em;
        text-align: center;
        display: flex;
      `}
    />
  );
});
