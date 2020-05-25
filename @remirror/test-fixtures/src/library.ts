/**
 * Extract this into a new publicly available library @remirror/testing.
 */

import diff from 'jest-diff';

import {
  AnyExtensionConstructor,
  AnyPresetConstructor,
  BaseExtensionOptions,
  Cast,
  ErrorConstant,
  ExtensionConstructorParameter,
  invariant,
  isEqual,
  mutateDefaultExtensionOptions,
  object,
  OptionsOfConstructor,
  PresetConstructorParameter,
} from '@remirror/core';

/**
 * Validate the shape of your extension.
 */
export function isExtensionValid<Type extends AnyExtensionConstructor>(
  Extension: Type,
  ...[options]: ExtensionConstructorParameter<OptionsOfConstructor<Type>>
) {
  const extension = new Extension(options);

  let defaultOptions: BaseExtensionOptions = object();

  mutateDefaultExtensionOptions((value) => {
    defaultOptions = value;
  });

  const expectedOptions = { ...defaultOptions, ...Extension.defaultOptions, ...options };
  invariant(isEqual(extension.options, expectedOptions), {
    message: `Invalid 'defaultOptions' for '${Extension.name}'\n\n${
      diff(extension.options, expectedOptions) ?? ''
    }\n`,
    code: ErrorConstant.INVALID_EXTENSION,
  });

  return true;
}

/**
 * Validate the shape of your preset.
 */
export function isPresetValid<Type extends AnyPresetConstructor>(
  Preset: Type,
  ...[options]: PresetConstructorParameter<OptionsOfConstructor<Type>>
) {
  const extension = new Preset(options);

  const expectedOptions = { ...Preset.defaultOptions, ...options };
  invariant(isEqual(extension.options, expectedOptions), {
    message: `Invalid 'defaultOptions' for '${Preset.name}'\n\n${
      diff(extension.options, expectedOptions) ?? ''
    }\n`,
  });

  return true;
}
