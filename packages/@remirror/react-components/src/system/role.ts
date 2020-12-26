import { cx } from '@linaria/core';
import { RoleHTMLProps } from 'reakit/Role/Role';
import { PaletteRoleOptions } from 'reakit-system-palette/Role';

import { Components } from '@remirror/theme';

export type BootstrapRoleOptions = PaletteRoleOptions;

export function useRoleProps(
  { unstable_system }: BootstrapRoleOptions,
  htmlProps: RoleHTMLProps = {},
): RoleHTMLProps {
  return { ...htmlProps, className: cx(Components.ROLE, htmlProps.className) };
}
