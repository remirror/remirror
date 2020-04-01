import { MarkGroup, NodeGroup, Tag } from '@remirror/core-constants';

import {
  AnyExtension,
  ExtensionsParameter,
  GetMarkNames,
  GetName,
  GetNodeNames,
} from '../extension';
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

/**
 * The tag names that apply to any extension whether plain, node or mark. These
 * are mostly used for nodes and marks the main difference is they are added to
 * the `tags` parameter of the extension rather than within the schema.
 */
export type GeneralExtensionTags<Names extends string = string> = Record<Tag, Names[]> &
  Record<string, undefined | Names[]>;

/**
 * Provides the different mark groups which are defined in the mark extension
 * specification.
 */
export type MarkExtensionTags<MarkNames extends string = string> = Record<MarkGroup, MarkNames[]> &
  Record<string, undefined | MarkNames[]>;

/**
 * Provides an object of the different node groups `block` and `inline` which
 * are defined in the node extension specification.
 */
export type NodeExtensionTags<NodeNames extends string = string> = Record<NodeGroup, NodeNames[]> &
  Record<string, undefined | NodeNames[]>;

/**
 * The shape of the tag data stored by the extension manager.
 *
 * This data can be used by other extensions to dynamically determine which
 * nodes should affected by commands / plugins / keys etc...
 */
export interface ExtensionTags<ExtensionUnion extends AnyExtension> {
  node: NodeExtensionTags<GetNodeNames<ExtensionUnion>>;
  mark: MarkExtensionTags<GetMarkNames<ExtensionUnion>>;
  general: GeneralExtensionTags<GetName<ExtensionUnion>>;
}

/**
 * An interface with a `tags` parameter useful as a builder for parameter
 * objects.
 */
export interface ExtensionTagParameter<ExtensionUnion extends AnyExtension> {
  /**
   * The tags provided by the configured extensions.
   */
  tags: ExtensionTags<ExtensionUnion>;
}
