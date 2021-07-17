import { unstable_FormHTMLProps, unstable_FormOptions } from 'reakit/Form/Form';
import { unstable_FormGroupHTMLProps, unstable_FormGroupOptions } from 'reakit/Form/FormGroup';
import { unstable_FormInputOptions } from 'reakit/Form/FormInput';
import { unstable_FormLabelHTMLProps, unstable_FormLabelOptions } from 'reakit/Form/FormLabel';
import {
  unstable_FormMessageHTMLProps,
  unstable_FormMessageOptions,
} from 'reakit/Form/FormMessage';
import { unstable_FormRemoveButtonOptions } from 'reakit/Form/FormRemoveButton';
import { unstable_getIn } from 'reakit/Form/utils/getIn';
import { cx } from '@remirror/core';
import { ComponentsTheme } from '@remirror/theme';

import { BootstrapRoleOptions } from './role';

export type BootstrapFormOptions = BootstrapRoleOptions & unstable_FormOptions;

export function useFormProps(
  _: BootstrapFormOptions,
  htmlProps: unstable_FormHTMLProps = {},
): unstable_FormHTMLProps {
  return { ...htmlProps, className: cx(htmlProps.className, ComponentsTheme.FORM) };
}

export type BootstrapFormInputOptions = BootstrapRoleOptions & unstable_FormInputOptions<any, any>;

export function useFormInputOptions({
  unstable_system: { fill = 'outline', ...system } = {},
  ...options
}: BootstrapFormInputOptions): BootstrapFormInputOptions {
  const isInvalid = Boolean(
    unstable_getIn(options.touched, options.name) && unstable_getIn(options.errors, options.name),
  );
  return {
    unstable_system: {
      fill,
      ...system,
      palette: isInvalid ? 'danger' : system.palette,
    },
    ...options,
  };
}

export type BootstrapFormMessageOptions = BootstrapRoleOptions &
  unstable_FormMessageOptions<any, any>;

export function useFormMessageOptions({
  unstable_system: system = {},
  ...options
}: BootstrapFormMessageOptions): BootstrapFormMessageOptions {
  const isInvalid = Boolean(unstable_getIn(options.errors, options.name));
  return {
    unstable_system: {
      ...system,
      palette: isInvalid ? 'danger' : system.palette || 'success',
    },
    ...options,
  };
}

export function useFormMessageProps(
  _: BootstrapFormMessageOptions,
  htmlProps: unstable_FormMessageHTMLProps = {},
): unstable_FormMessageHTMLProps {
  return { ...htmlProps, className: cx(htmlProps.className, ComponentsTheme.FORM_MESSAGE) };
}

export type BootstrapFormLabelOptions = BootstrapRoleOptions & unstable_FormLabelOptions<any, any>;

export function useFormLabelProps(
  _: BootstrapFormLabelOptions,
  htmlProps: unstable_FormLabelHTMLProps = {},
): unstable_FormLabelHTMLProps {
  return { ...htmlProps, className: cx(htmlProps.className, ComponentsTheme.FORM_LABEL) };
}

export type BootstrapFormGroupOptions = BootstrapRoleOptions & unstable_FormGroupOptions<any, any>;

export function useFormGroupOptions({
  unstable_system: { fill = 'outline', ...system } = {},
  ...options
}: BootstrapFormGroupOptions): BootstrapFormGroupOptions {
  const isInvalid = Boolean(
    unstable_getIn(options.touched, options.name) && unstable_getIn(options.errors, options.name),
  );
  return {
    unstable_system: { fill, ...system, palette: isInvalid ? 'danger' : system.palette },
    ...options,
  };
}

export function useFormGroupProps(
  _: BootstrapFormGroupOptions,
  htmlProps: unstable_FormGroupHTMLProps = {},
): unstable_FormGroupHTMLProps {
  return { ...htmlProps, className: cx(htmlProps.className, ComponentsTheme.FORM_GROUP) };
}

export type BootstrapFormRemoveButtonOptions = BootstrapRoleOptions &
  unstable_FormRemoveButtonOptions<any, any>;

export function useFormRemoveButtonOptions({
  unstable_system: { palette = 'danger', ...system } = {},
  ...options
}: BootstrapFormRemoveButtonOptions): BootstrapFormRemoveButtonOptions {
  return { unstable_system: { palette, ...system }, ...options };
}
