import { Preset } from '../preset';
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
  SchemaExtension,
  PluginsExtension,
  InputRulesExtension,
  NodeViewsExtension,
  PasteRulesExtension,
  SuggestionsExtension,
  TagsExtension,
  KeymapExtension,
  AttributesExtension,
  CommandsExtension,
  HelpersExtension,
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
export class BuiltinPreset extends Preset {
  get name() {
    return 'builtin' as const;
  }

  protected onSetOptions(): void {
    return;
  }

  public createExtensions() {
    return builtInExtensions.map((Extension) => new Extension());
  }
}
