import { cx } from '@linaria/core';
import { GroupHTMLProps, GroupOptions } from 'reakit/Group/Group';
import { ComponentsTheme } from '@remirror/theme';

import { BootstrapRoleOptions } from './role';

export type BootstrapGroupOptions = BootstrapRoleOptions & GroupOptions;

export function useGroupProps(
  _: BootstrapGroupOptions,
  htmlProps: GroupHTMLProps = {},
): GroupHTMLProps {
  return { ...htmlProps, className: cx(htmlProps.className, ComponentsTheme.GROUP) };
}
