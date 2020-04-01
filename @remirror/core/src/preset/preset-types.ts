import { AnyPreset } from './preset-base';

export interface PresetParameter<PresetUnion extends AnyPreset> {
  preset: PresetUnion;
}

export interface PresetsParamter<PresetUnion extends AnyPreset> {
  presets: PresetUnion[];
}
