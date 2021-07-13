import { ButtonHTMLProps, ButtonOptions } from 'reakit/Button/Button';
import { cx } from '@remirror/core';
import { ComponentsTheme } from '@remirror/theme';

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
  return { ...htmlProps, className: cx(ComponentsTheme.BUTTON, htmlProps.className) };
}
