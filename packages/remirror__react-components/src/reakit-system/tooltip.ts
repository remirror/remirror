import { TooltipHTMLProps, TooltipOptions } from 'reakit/Tooltip/Tooltip';
import { cx } from '@remirror/core';
import { ComponentsTheme } from '@remirror/theme';

import { BootstrapRoleOptions } from './role';

export type BootstrapTooltipOptions = BootstrapRoleOptions & TooltipOptions;

export function useTooltipOptions({
  unstable_system: { palette = 'foreground', fill = 'opaque', ...system } = {},
  ...options
}: BootstrapTooltipOptions): BootstrapTooltipOptions {
  return { unstable_system: { palette, fill, ...system }, ...options };
}

export function useTooltipProps(
  _: BootstrapTooltipOptions,
  htmlProps: TooltipHTMLProps = {},
): TooltipHTMLProps {
  return { ...htmlProps, className: cx(ComponentsTheme.TOOLTIP, htmlProps.className) };
}
