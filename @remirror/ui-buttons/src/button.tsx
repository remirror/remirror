import { KeyOfThemeVariant, omitUndefined, RemirrorInterpolation } from '@remirror/core';
import { useRemirrorTheme } from '@remirror/ui';
import { IconProps } from '@remirror/ui-icons';
import React, { ComponentType, forwardRef, ReactNode } from 'react';
import { ResetButton, ResetButtonProps } from './reset-button';

export type ButtonProps = Omit<ResetButtonProps, 'children'> & {
  variant?: KeyOfThemeVariant<'remirror:buttons'>;
  color?: string;

  backgroundColor?: string;
  /**
   * The text string (or custom component rendered in the button)
   */
  content?: ReactNode;

  /**
   * The icon to display on the right side of the button
   */
  RightIconComponent?: ComponentType<IconProps>;

  /**
   * The icon to display on the left side of the button.
   */
  LeftIconComponent?: ComponentType<IconProps>;

  leftIconProps?: Partial<IconProps>;
  rightIconProps?: Partial<IconProps>;

  /**
   * Custom styles to add to the icon
   */
  style?: RemirrorInterpolation;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      content,
      RightIconComponent,
      LeftIconComponent,
      leftIconProps = {},
      rightIconProps = {},
      color,
      backgroundColor,
      variant = 'default',
      ...props
    },
    ref,
  ) => {
    const { sx } = useRemirrorTheme();
    const colorStyles = omitUndefined({ color, backgroundColor });
    const leftIcon = LeftIconComponent && <LeftIconComponent {...colorStyles} {...leftIconProps} />;
    const rightIcon = RightIconComponent && <RightIconComponent {...colorStyles} {...rightIconProps} />;

    return (
      <ResetButton {...props} ref={ref} css={sx({ variant: `remirror:buttons.${variant}` }, colorStyles)}>
        {leftIcon}
        {content}
        {rightIcon}
      </ResetButton>
    );
  },
);
