import { cx } from '@linaria/core';
import { TooltipHTMLProps, TooltipOptions } from 'reakit/Tooltip/Tooltip';

import { Components } from '@remirror/theme';

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
  return { ...htmlProps, className: cx(Components.TOOLTIP, htmlProps.className) };
}
