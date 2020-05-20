/**
 * Extract this into a new publicly available library @remirror/testing.
 */

import diff from 'jest-diff';

import {
  AnyExtensionConstructor,
  AnyPresetConstructor,
  BaseExtensionSettings,
  Cast,
  ErrorConstant,
  ExtensionConstructorParameter,
  invariant,
  isEqual,
  mutateDefaultExtensionSettings,
  object,
  PresetConstructorParameter,
  PropertiesOfConstructor,
  SettingsOfConstructor,
} from '@remirror/core';

/**
 * Validate the shape of your extension.
 */
export function isExtensionValid<Type extends AnyExtensionConstructor>(
  Extension: Type,
  ...[settings]: ExtensionConstructorParameter<
    SettingsOfConstructor<Type>,
    PropertiesOfConstructor<Type>
  >
) {
  const extension = new Extension(settings);

  let defaultSettings: BaseExtensionSettings = object();

  mutateDefaultExtensionSettings((value) => {
    defaultSettings = value;
  });

  const expectedSettings = { ...defaultSettings, ...Extension.defaultSettings, ...settings };
  invariant(isEqual(extension.settings, expectedSettings), {
    message: `Invalid 'defaultSettings' for '${Extension.name}'\n\n${
      diff(extension.settings, expectedSettings) ?? ''
    }\n`,
    code: ErrorConstant.INVALID_EXTENSION,
  });

  const expectedProperties = { ...Extension.defaultProperties, ...Cast(settings)?.properties };
  invariant(isEqual(extension.properties, expectedProperties), {
    message: `Invalid 'defaultProperties' for '${Extension.name}' \n\n${
      diff(extension.properties, expectedProperties) ?? ''
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
  ...[settings]: PresetConstructorParameter<
    SettingsOfConstructor<Type>,
    PropertiesOfConstructor<Type>
  >
) {
  const extension = new Preset(settings);

  const expectedSettings = { ...Preset.defaultSettings, ...settings };
  invariant(isEqual(extension.settings, expectedSettings), {
    message: `Invalid 'defaultSettings' for '${Preset.name}'\n\n${
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
