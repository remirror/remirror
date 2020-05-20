/**
 * Extract this into a new publicly available library @remirror/testing.
 */

import diff from 'jest-diff';

import {
  AnyExtensionConstructor,
  AnyPresetConstructor,
  Cast,
  ExtensionConstructorParameter,
  invariant,
  isEqual,
  isPlainObject,
  PresetConstructorParameter,
  PropertiesOfConstructor,
  SettingsOfConstructor,
} from '@remirror/core';

/**
 * Validate the shape of your extension.
 */
export function validateExtension<Type extends AnyExtensionConstructor>(
  Extension: Type,
  ...[settings]: ExtensionConstructorParameter<
    SettingsOfConstructor<Type>,
    PropertiesOfConstructor<Type>
  >
) {
  invariant(isPlainObject(Extension.defaultSettings), {
    message: `No static 'defaultSettings' provided for '${Extension.name}'.\n`,
  });

  invariant(isPlainObject(Extension.defaultProperties), {
    message: `No static 'defaultProperties' provided for '${Extension.name}'.\n`,
  });

  const extension = new Extension(settings);

  const expectedSettings = { ...Extension.defaultSettings, ...settings };
  invariant(isEqual(extension.settings, expectedSettings), {
    message: `Invalid 'defaultSettings' for '${Extension.name}'\n\n${
      diff(extension.settings, expectedSettings) ?? ''
    }\n`,
  });

  const expectedProperties = { ...Extension.defaultProperties, ...Cast(settings)?.properties };
  invariant(isEqual(extension.properties, expectedProperties), {
    message: `Invalid 'defaultProperties' for '${Extension.name}' \n\n${
      diff(extension.properties, expectedProperties) ?? ''
    }\n`,
  });
}

/**
 * Validate the shape of your preset.
 */
export function validatePreset<Type extends AnyPresetConstructor>(
  Preset: Type,
  ...[settings]: PresetConstructorParameter<
    SettingsOfConstructor<Type>,
    PropertiesOfConstructor<Type>
  >
) {
  invariant(isPlainObject(Preset.defaultSettings), {
    message: `No static 'defaultSettings' provided for '${Preset.name}'.\n`,
  });

  invariant(isPlainObject(Preset.defaultProperties), {
    message: `No static 'defaultProperties' provided for '${Preset.name}'.\n`,
  });

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
}
