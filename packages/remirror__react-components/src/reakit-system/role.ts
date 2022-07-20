import { RoleHTMLProps } from 'reakit';
import { PaletteRoleOptions } from 'reakit-system-palette';
import { cx } from '@remirror/core';
import { ComponentsTheme } from '@remirror/theme';

export type BootstrapRoleOptions = PaletteRoleOptions;

export function useRoleProps(
  _: BootstrapRoleOptions,
  htmlProps: RoleHTMLProps = {},
): RoleHTMLProps {
  return { ...htmlProps, className: cx(ComponentsTheme.ROLE, htmlProps.className) };
}
