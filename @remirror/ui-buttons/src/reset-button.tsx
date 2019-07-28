import { useRemirrorTheme } from '@remirror/ui';
import React, { forwardRef } from 'react';

export type ButtonProps = JSX.IntrinsicElements['button'];

/**
 * This component renders a button without any of the browser styling attached.
 */
export const ResetButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { css } = useRemirrorTheme();

  return (
    <button
      {...props}
      ref={ref}
      css={css`
        padding: 0;
        border: none;
        font: inherit;
        color: inherit;
        background-color: transparent;
        outline: none;
        cursor: pointer;
      `}
    />
  );
});
