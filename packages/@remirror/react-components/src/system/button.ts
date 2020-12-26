import { cx } from '@linaria/core';
import { ButtonHTMLProps, ButtonOptions } from 'reakit/Button/Button';

import { Components } from '@remirror/theme';

import { BootstrapRoleOptions } from './role';

export type BootstrapButtonOptions = BootstrapRoleOptions & ButtonOptions;

export function useButtonOptions({
  unstable_system: { fill = 'opaque', palette = 'primary', ...system } = {},
  ...options
}: BootstrapButtonOptions): BootstrapButtonOptions {
  return { unstable_system: { fill, palette, ...system }, ...options };
}

export function useButtonProps(
  _: BootstrapButtonOptions,
  htmlProps: ButtonHTMLProps = {},
): ButtonHTMLProps {
  return { ...htmlProps, className: cx(Components.BUTTON, htmlProps.className) };
}
