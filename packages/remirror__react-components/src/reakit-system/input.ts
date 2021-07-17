import { InputHTMLProps, InputOptions } from 'reakit/Input/Input';
import { cx } from '@remirror/core';
import { ComponentsTheme } from '@remirror/theme';

import { BootstrapRoleOptions } from './role';

export type BootstrapInputOptions = BootstrapRoleOptions & InputOptions;

export function useInputProps(
  _: BootstrapRoleOptions,
  htmlProps: InputHTMLProps = {},
): InputHTMLProps {
  return { ...htmlProps, className: cx(htmlProps.className, ComponentsTheme.INPUT) };
}
