import { AnyFunction } from '@remirror/core-types';

import { AnyPreset } from './preset-base';

export interface PresetParameter<PresetUnion extends AnyPreset> {
  preset: PresetUnion;
}

export interface PresetListParameter<PresetUnion extends AnyPreset> {
  presets: PresetUnion[];
}

/**
 * Get the extensions from any type with a `presets` property.
 */
export type GetPresetUnion<Type extends { presets: any[] }> = Type['presets'][number];
