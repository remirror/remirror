import { cx } from '@linaria/core';
import { InputHTMLProps, InputOptions } from 'reakit/Input/Input';

import { Components } from '@remirror/theme';

import { BootstrapRoleOptions } from './role';

export type BootstrapInputOptions = BootstrapRoleOptions & InputOptions;

export function useInputProps(
  _: BootstrapRoleOptions,
  htmlProps: InputHTMLProps = {},
): InputHTMLProps {
  return { ...htmlProps, className: cx(htmlProps.className, Components.INPUT) };
}
