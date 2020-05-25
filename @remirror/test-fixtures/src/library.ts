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
  mutateDefaultExtensionSettings,
  object,
  OptionsOfConstructor,
  PresetConstructorParameter,
} from '@remirror/core';

/**
 * Validate the shape of your extension.
 */
export function isExtensionValid<Type extends AnyExtensionConstructor>(
  Extension: Type,
  ...[settings]: ExtensionConstructorParameter<OptionsOfConstructor<Type>>
) {
  const extension = new Extension(settings);

  let defaultOptions: BaseExtensionOptions = object();

  mutateDefaultExtensionSettings((value) => {
    defaultOptions = value;
  });

  const expectedSettings = { ...defaultOptions, ...Extension.defaultOptions, ...settings };
  invariant(isEqual(extension.options, expectedSettings), {
    message: `Invalid 'defaultOptions' for '${Extension.name}'\n\n${
      diff(extension.options, expectedSettings) ?? ''
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
  ...[settings]: PresetConstructorParameter<OptionsOfConstructor<Type>>
) {
  const extension = new Preset(settings);

  const expectedSettings = { ...Preset.defaultOptions, ...settings };
  invariant(isEqual(extension.settings, expectedSettings), {
    message: `Invalid 'defaultOptions' for '${Preset.name}'\n\n${
      diff(extension.settings, expectedSettings) ?? ''
    }\n`,
  });

  const expectedProperties = { ...Preset.defaultProperties, ...Cast(settings)?.properties };
  invariant(isEqual(extension.properties, expectedProperties), {
    message: `Invalid 'defaultProperties' for '${Preset.name}' \n\n${
      diff(extension.properties, expectedProperties) ?? ''
    }\n`,
  });

  return true;
}
