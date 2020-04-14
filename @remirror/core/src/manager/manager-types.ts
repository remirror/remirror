import { ExtensionListParameter } from '../extension';

/**
 * Get the extensions from any type with an `extensions` property.
 */
export type GetExtensionUnion<Type extends ExtensionListParameter> = Type['extensions'][number];

/**
 * Get the extensions from any type with a `presets` property.
 */
export type GetPresetUnion<Type extends { presets: any[] }> = Type['presets'][number];
