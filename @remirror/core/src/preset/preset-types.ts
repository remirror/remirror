import {
  AnyExtension,
  ChainedFromExtensions,
  CommandsFromExtensions,
  HelpersFromExtensions,
  SchemaFromExtensionUnion,
} from '../extension';
import { GetExtensions } from '../types';
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

export type CombinedUnion<ExtensionUnion extends AnyExtension, PresetUnion extends AnyPreset> =
  | ExtensionUnion
  | PresetUnion;

export type AnyCombinedUnion = CombinedUnion<AnyExtension, AnyPreset>;

export type InferCombinedExtensions<
  Combined extends AnyCombinedUnion
> = Combined extends AnyExtension
  ? Combined
  : Combined extends AnyPreset
  ? GetExtensions<Combined>
  : never;

export type InferCombinedPresets<Combined extends AnyCombinedUnion> = Combined extends AnyPreset
  ? Combined
  : never;

export type SchemaFromCombined<Combined extends AnyCombinedUnion> = SchemaFromExtensionUnion<
  InferCombinedExtensions<Combined>
>;

export type CommandsFromCombined<Combined extends AnyCombinedUnion> = CommandsFromExtensions<
  InferCombinedExtensions<Combined>
>;

export type ChainedFromCombined<Combined extends AnyCombinedUnion> = ChainedFromExtensions<
  InferCombinedExtensions<Combined>
>;

export type HelpersFromCombined<Combined extends AnyCombinedUnion> = HelpersFromExtensions<
  InferCombinedExtensions<Combined>
>;
