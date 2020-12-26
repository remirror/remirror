import { cx } from '@linaria/core';
import { PopoverHTMLProps, PopoverOptions } from 'reakit/Popover/Popover';
import { PopoverArrowHTMLProps, PopoverArrowOptions } from 'reakit/Popover/PopoverArrow';

import { Components } from '@remirror/theme';

import { BootstrapRoleOptions } from './role';

export type BootstrapPopoverOptions = BootstrapRoleOptions & PopoverOptions;

export function usePopoverOptions({
  unstable_system: { palette = 'background', fill = 'opaque', ...system } = {},
  ...options
}: BootstrapPopoverOptions): BootstrapPopoverOptions {
  return {
    unstable_system: { palette, fill, ...system },
    ...options,
  };
}

export function usePopoverProps(
  _: BootstrapPopoverOptions,
  htmlProps: PopoverHTMLProps = {},
): PopoverHTMLProps {
  return { ...htmlProps, className: cx(Components.POPOVER, htmlProps.className) };
}

export type BootstrapPopoverArrowOptions = BootstrapRoleOptions & PopoverArrowOptions;

export function usePopoverArrowProps(
  _: BootstrapPopoverArrowOptions,
  htmlProps: PopoverArrowHTMLProps = {},
): PopoverArrowHTMLProps {
  return { 'data-arrow': '', ...htmlProps } as PopoverArrowHTMLProps;
}
