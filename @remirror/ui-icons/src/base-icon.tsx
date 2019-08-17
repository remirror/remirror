import VisuallyHidden from '@reach/visually-hidden';
import { RemirrorInterpolation, uniqueId } from '@remirror/core';
import { useRemirrorTheme } from '@remirror/ui';
import React, { forwardRef, useMemo } from 'react';

export interface IconProps {
  /**
   * The size of the icon
   */
  size?: string | number;

  /**
   * Custom styles to add to the icon
   */
  style?: RemirrorInterpolation;

  /**
   * The color to set the icon
   */
  color?: string;

  /**
   * Whether to reverse the color and the background color of the icon.
   *
   * @default false
   */
  inverse?: boolean;
}

interface BaseIconProps extends Omit<JSX.IntrinsicElements['svg'], 'style'>, IconProps {
  /**
   * The name of the icon for screen readers
   */
  name: string;

  /**
   * Determines whether this icon should be rendered standalone which adds a role of image and a title to the icon.
   *
   * When standalone is true the svg has a `role='img'`
   * @default true
   */
  standalone?: boolean;
}

/**
 * Provides the icon for use throughout the rest of the application.
 *
 * Uses theme component styles under `components.icon:simple`
 */
export const Icon = forwardRef<SVGSVGElement, BaseIconProps>(
  (
    {
      children,
      color: colorProp,
      style,
      width,
      height,
      size = '1em',
      inverse = false,
      name,
      standalone = false,
      ...props
    },
    ref,
  ) => {
    const { theme, sx, get } = useRemirrorTheme();

    const themeStyles = get('components.icon:simple', {});
    const mainColor = colorProp || get<string>('components.icon:simple.color', theme.colors.text);
    const mainBackgroundColor = get<string>(
      'components.icon:simple.backgroundColor',
      theme.colors.background,
    );

    const backgroundColor = inverse ? mainColor : mainBackgroundColor;
    const color = inverse ? mainBackgroundColor : mainColor;

    const id = useMemo(() => uniqueId(), []);
    const extraProps = standalone ? { role: 'img', 'aria-labelledby': id } : { 'aria-hidden': true };

    return (
      <>
        {!standalone && <VisuallyHidden>{name}</VisuallyHidden>}
        <svg
          css={sx(themeStyles, { verticalAlign: 'middle', color, backgroundColor }, style)}
          fill='currentColor'
          preserveAspectRatio='xMidYMid meet'
          height={height || size}
          width={width || size}
          {...extraProps}
          {...props}
          ref={ref}
        >
          {standalone && <title id={id}>{name}</title>}
          {children}
        </svg>
      </>
    );
  },
);
