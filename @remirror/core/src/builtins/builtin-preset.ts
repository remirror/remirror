import { PresetFactory } from '../preset';
import { Of } from '../types';
import { AttributesExtension } from './attributes-extension';
import { CommandsExtension } from './commands-extension';
import { HelpersExtension } from './helpers-extension';
import { InputRulesExtension } from './input-rules-extension';
import { KeymapExtension } from './keymap-extension';
import { NodeViewsExtension } from './node-views-extension';
import { PasteRulesExtension } from './paste-rules-extension';
import { PluginsExtension } from './plugins-extension';
import { SchemaExtension } from './schema-extension';
import { SuggestionsExtension } from './suggestions-extension';
import { TagsExtension } from './tags-extension';

/** A list of all the builtIn extensions. */
export const builtInExtensions = [
  AttributesExtension,
  CommandsExtension,
  HelpersExtension,
  InputRulesExtension,
  KeymapExtension,
  NodeViewsExtension,
  PasteRulesExtension,
  PluginsExtension,
  SchemaExtension,
  SuggestionsExtension,
  TagsExtension,
] as const;

/**
 * Provides all the builtin extensions to the editor.
 *
 * @remarks
 *
 * This is used automatically and (at the time of writing) can't be removed from
 * the editor. If you feel that there's a compelling reason to override these
 * extensions feel free to open an [issue
 * here](https://github.com/remirror/remirror/issues) and it can be addressed.
 *
 * @builtin
 */
export const BuiltinPreset = PresetFactory.typed().preset({
  name: 'builtin',
  createExtensions() {
    return builtInExtensions.map((extension) => extension.of());
  },
});

/*
const BuiltinPreset = PresetFactory.typed<
  { excludeStrikeThrough: boolean },
  { boldWeight: number }
>().preset({
  name: 'builtin',
  defaultSettings: {
    excludeStrikeThrough: false,
  },
  defaultProperties: {
    boldWeight: 500,
  },
  createExtensions({ settings }) {
    if (settings.excludeStrikeThrough) {
    }
    return builtInExtensions.map(extension => extension.of());
  },
  onSetProperties({ getExtension, changes, previous, update }) {
    if (changes.boldWeight.changed) {

      const extension = getExtension(InputRulesExtension);
      extension.setProperties({weight: changes.boldWeight.value})
    }
  },
});
*/

/** The built in extension as a type. */
export type BuiltInExtensions = Of<typeof builtInExtensions[number]>;
