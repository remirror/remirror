import { KeyOfThemeVariant, omitUndefined, RemirrorInterpolation } from '@remirror/core';
import { useRemirrorTheme } from '@remirror/ui';
import { IconProps } from '@remirror/ui-icons';
import React, { ComponentType, forwardRef, ReactNode } from 'react';
import { ResetButton, ResetButtonProps } from './reset-button';

export type ButtonProps = ResetButtonProps & {
  variant?: KeyOfThemeVariant<'remirror:buttons'>;
  active?: boolean;
  color?: string;
  fontWeight?: string | number;
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
  styles?: RemirrorInterpolation;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      content,
      active = false,
      RightIconComponent,
      LeftIconComponent,
      leftIconProps = {},
      rightIconProps = {},
      color,
      backgroundColor,
      fontWeight = null,
      variant = 'default',
      styles,
      children,
      ...props
    },
    ref,
  ) => {
    const { sxx } = useRemirrorTheme();
    const colorStyles = omitUndefined({ color, backgroundColor });
    const otherStyles = { fontWeight: fontWeight! };

    const paddedLeftIconProps = {
      ...leftIconProps,
      styles: sxx(RightIconComponent || content ? { paddingRight: 1 } : undefined, leftIconProps.styles),
    };
    const leftIcon = LeftIconComponent && <LeftIconComponent {...colorStyles} {...paddedLeftIconProps} />;

    const paddedRightIconsProps = {
      ...rightIconProps,
      styles: sxx(LeftIconComponent || content ? { paddingLeft: 1 } : undefined, rightIconProps.styles),
    };
    const rightIcon = RightIconComponent && (
      <RightIconComponent {...colorStyles} {...paddedRightIconsProps} />
    );

    return (
      <ResetButton
        {...props}
        ref={ref}
        css={sxx(
          { variant: `remirror:buttons.${variant}` },
          active && { variant: `remirror:buttons.${variant}.:active` },
          otherStyles,
          colorStyles,
          styles,
        )}
      >
        {leftIcon}
        {content}
        {rightIcon}
        {children}
      </ResetButton>
    );
  },
);
