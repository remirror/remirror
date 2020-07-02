import { EmbedOptions, EmbedPreset } from '@remirror/preset-embed';
import { ListPreset } from '@remirror/preset-list';
import { TableOptions, TablePreset } from '@remirror/preset-table';

import { WysiwygOptions, WysiwygPreset } from './wysiwyg-preset';

/**
 * The parameter for creating a list of presets needed to use the wysiwyg preset
 * to the full.
 */
export interface CreateWysiwygPresetListParameter {
  /**
   * The options for the wysiwyg preset.
   */
  wysiwyg?: WysiwygOptions;

  /**
   * The options for the embed preset.
   */
  embed?: EmbedOptions;

  /**
   * The options for the table preset.
   */
  table?: TableOptions;
}

/**
 * Create the wysiwyg preset and also apply the other presets as well.
 */
export function createWysiwygPresetList(
  parameter: CreateWysiwygPresetListParameter,
): WysiwygPresetCombinedUnion[] {
  const { wysiwyg, embed, table } = parameter;

  return [
    new WysiwygPreset(wysiwyg),
    new ListPreset(),
    new EmbedPreset(embed),
    new TablePreset(table),
  ];
}

export type WysiwygPresetCombinedUnion = WysiwygPreset | ListPreset | EmbedPreset | TablePreset;
