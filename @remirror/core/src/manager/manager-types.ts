import { AnyExtension, ExtensionsParameter } from '../extension';
import { AnyPreset, Preset } from '../preset';

/**
 * The union of extensions and presets
 */
export type AnyExtensionOrPreset = ExtensionOrPreset;

export type ExtensionOrPreset<ExtensionUnion extends AnyExtension = any> =
  | ExtensionUnion
  | Preset<ExtensionUnion, any, any>;

/**
 * Get the extensions from any type with an extension property.
 */
export type GetExtensionUnion<Type extends ExtensionsParameter> = Type['extensions'][number];

/**
 * Pull the extension union from the `ExtensionOrPreset` union.
 */
export type ExtensionFromExtensionOrPreset<
  ExtensionPresetUnion extends AnyExtensionOrPreset = any
> = ExtensionPresetUnion extends AnyExtension
  ? ExtensionPresetUnion
  : ExtensionPresetUnion extends AnyPreset
  ? GetExtensionUnion<ExtensionPresetUnion>
  : never;

/**
 * Pull the preset from the `ExtensionOrPreset` union.
 */
export type PresetFromExtensionOrPreset<
  ExtensionPresetUnion extends AnyExtensionOrPreset = any
> = ExtensionPresetUnion extends AnyPreset ? ExtensionPresetUnion : never;
