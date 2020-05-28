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

export type InferCombinedExtensions<
  Combined extends CombinedUnion<AnyExtension, AnyPreset>
> = Combined extends AnyExtension
  ? Combined
  : Combined extends AnyPreset
  ? GetExtensions<Combined>
  : never;

export type InferCombinedPresets<
  Combined extends CombinedUnion<AnyExtension, AnyPreset>
> = Combined extends AnyPreset ? Combined : never;

export type SchemaFromCombined<
  Combined extends CombinedUnion<AnyExtension, AnyPreset>
> = SchemaFromExtensionUnion<InferCombinedExtensions<Combined>>;

export type CommandsFromCombined<
  Combined extends CombinedUnion<AnyExtension, AnyPreset>
> = CommandsFromExtensions<InferCombinedExtensions<Combined>>;

export type ChainedFromCombined<
  Combined extends CombinedUnion<AnyExtension, AnyPreset>
> = ChainedFromExtensions<InferCombinedExtensions<Combined>>;

export type HelpersFromCombined<
  Combined extends CombinedUnion<AnyExtension, AnyPreset>
> = HelpersFromExtensions<InferCombinedExtensions<Combined>>;
