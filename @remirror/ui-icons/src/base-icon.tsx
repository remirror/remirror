import VisuallyHidden from '@reach/visually-hidden';
import { omitUndefined, uniqueId } from '@remirror/core-helpers';
import { KeyOfThemeVariant, RemirrorInterpolation } from '@remirror/core-types';
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
  styles?: RemirrorInterpolation;

  /**
   * The color to set the icon
   */
  color?: string;

  /**
   * The background color to set for the icon
   */
  backgroundColor?: string;

  /**
   * Whether to reverse the color and the background color of the icon.
   *
   * @defaultValue 'default'
   */
  variant?: KeyOfThemeVariant<'remirror:icons'>;
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
   * @defaultValue `true`
   */
  standalone?: boolean;
}

/**
 * Provides the icon for use throughout the rest of the application.
 *
 * Uses theme component styles under `components.remirror:icon`
 */
export const Icon = forwardRef<SVGSVGElement, BaseIconProps>(
  (
    {
      children,
      color,
      backgroundColor,
      styles,
      width,
      height,
      size = '1em',
      variant = 'default',
      name,
      standalone = false,
      ...props
    },
    ref,
  ) => {
    const { sx } = useRemirrorTheme();

    const defaultStyles = { color: 'text', backgroundColor: 'background', verticalAlign: 'middle' };
    const id = useMemo(() => uniqueId(), []);
    const extraProps = standalone ? { role: 'img', 'aria-labelledby': id } : { 'aria-hidden': true };
    const colorStyles = omitUndefined({ color, backgroundColor });

    return (
      <>
        {!standalone && <VisuallyHidden>{name}</VisuallyHidden>}
        <svg
          fill='currentColor'
          preserveAspectRatio='xMidYMid meet'
          height={height || size}
          width={width || size}
          {...extraProps}
          {...props}
          css={sx(defaultStyles, { variant: `remirror:icons.${variant}` }, colorStyles, styles)}
          ref={ref}
        >
          {standalone && <title id={id}>{name}</title>}
          {children}
        </svg>
      </>
    );
  },
);
