import { AnyFunction } from '@remirror/core-types';

import { AnyPreset } from './preset-base';

export interface PresetParameter<PresetUnion extends AnyPreset> {
  preset: PresetUnion;
}

export interface PresetListParameter<PresetUnion extends AnyPreset> {
  presets: PresetUnion[];
}

/**
 * Retrieve the instance type from an ExtensionConstructor.
 */
export type PresetFromConstructor<PresetConstructor extends { of: AnyFunction }> = ReturnType<
  PresetConstructor['of']
>;
