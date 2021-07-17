import { DialogHTMLProps, DialogOptions } from 'reakit/Dialog/Dialog';
import { DialogBackdropHTMLProps, DialogBackdropOptions } from 'reakit/Dialog/DialogBackdrop';
import { cx } from '@remirror/core';
import { ComponentsTheme } from '@remirror/theme';

import { BootstrapRoleOptions } from './role';

export type BootstrapDialogOptions = BootstrapRoleOptions & DialogOptions;

export function useDialogOptions({
  unstable_system: { palette = 'background', fill = 'opaque', ...system } = {},
  ...options
}: BootstrapDialogOptions): BootstrapDialogOptions {
  return {
    ...options,
    unstable_system: { palette, fill, ...system },
  };
}

export function useDialogProps(
  _: BootstrapDialogOptions,
  htmlProps: DialogHTMLProps = {},
): DialogHTMLProps {
  return { ...htmlProps, className: cx(ComponentsTheme.DIALOG, htmlProps.className) };
}

export type BootstrapDialogBackdropOptions = BootstrapRoleOptions & DialogBackdropOptions;

export function useDialogBackdropProps(
  _: BootstrapDialogBackdropOptions,
  htmlProps: DialogBackdropHTMLProps = {},
): DialogBackdropHTMLProps {
  return { ...htmlProps, className: cx(ComponentsTheme.DIALOG_BACKDROP, htmlProps.className) };
}
