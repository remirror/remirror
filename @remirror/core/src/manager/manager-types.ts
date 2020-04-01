import { AnyExtension } from '../extension';
import { AnyPreset, ExtensionsParameter } from '../preset';

/**
 * The union of extensions and presets
 */
export type AnyExtensionOrPreset = AnyExtension | AnyPreset;

/**
 * Get the extensions from any type with an extension property.
 */
export type GetExtensionUnion<Type extends ExtensionsParameter> = Type['extensions'][number];

export type ExtensionsFromExtensionOrPreset<
  ExtensionPresetUnion extends AnyExtensionOrPreset = any
> = ExtensionPresetUnion extends AnyExtension
  ? ExtensionPresetUnion
  : ExtensionPresetUnion extends AnyPreset
  ? GetExtensionUnion<ExtensionPresetUnion>
  : never;
