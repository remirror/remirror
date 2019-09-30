import {
  KeyOfThemeVariant,
  omitUndefined,
  RemirrorInterpolation,
  RemirrorThemeContextType,
} from '@remirror/core';
import { useRemirrorTheme } from '@remirror/ui';
import { IconProps } from '@remirror/ui-icons';
import { MinWidthProperty, WidthProperty } from 'csstype';
import React, { ComponentType, forwardRef, ReactNode } from 'react';
import { ResetButton, ResetButtonProps } from './reset-button';

export interface RenderIconParams {
  remirrorTheme: RemirrorThemeContextType;
}

export type ButtonProps = ResetButtonProps & {
  variant?: KeyOfThemeVariant<'remirror:buttons'>;
  active?: boolean;
  color?: string;
  fontWeight?: string | number;
  backgroundColor?: string;
  minWidth?: MinWidthProperty<number | string>;
  width?: WidthProperty<number | string>;
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

  /**
   * Props that will be added to the left icon.
   */
  leftIconProps?: Partial<IconProps>;

  /**
   * Props that will be added to the right icon.
   */
  rightIconProps?: Partial<IconProps>;

  /**
   * A render prop for the right icon.
   *
   * When provided `RightIconComponent` and `rightIconProps` will be ignored
   */
  renderRightIcon?(params: RenderIconParams): ReactNode;

  /**
   * A render prop for the left icon.
   *
   * When provided `LeftIconComponent` and `leftIconProps` will be ignored
   */
  renderLeftIcon?(params: RenderIconParams): ReactNode;

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
      LeftIconComponent,
      renderLeftIcon,
      leftIconProps = Object.create(null),
      RightIconComponent,
      renderRightIcon,
      rightIconProps = Object.create(null),
      color,
      backgroundColor,
      fontWeight,
      minWidth,
      width,
      variant = 'default',
      styles,
      children,
      ...props
    },
    ref,
  ) => {
    const remirrorTheme = useRemirrorTheme();
    const { sxx } = remirrorTheme;
    const colorStyles = omitUndefined({ color, backgroundColor });
    const otherStyles = { fontWeight, width, minWidth };

    const paddedLeftIconProps = {
      ...leftIconProps,
      styles: sxx(
        renderRightIcon || RightIconComponent || content ? { paddingRight: 1 } : undefined,
        leftIconProps.styles,
      ),
    };
    const leftIcon = renderLeftIcon
      ? renderLeftIcon({ remirrorTheme })
      : LeftIconComponent && <LeftIconComponent {...colorStyles} {...paddedLeftIconProps} />;

    const paddedRightIconsProps = {
      ...rightIconProps,
      styles: sxx(
        renderLeftIcon || LeftIconComponent || content ? { paddingLeft: 1 } : undefined,
        rightIconProps.styles,
      ),
    };
    const rightIcon = renderRightIcon
      ? renderRightIcon({ remirrorTheme })
      : RightIconComponent && <RightIconComponent {...colorStyles} {...paddedRightIconsProps} />;

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
