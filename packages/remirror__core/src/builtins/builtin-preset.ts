import { pick } from '@remirror/core-helpers';
import type { GetStaticAndDynamic, ValueOf } from '@remirror/core-types';

import { AttributesExtension } from './attributes-extension';
import { CommandsExtension } from './commands-extension';
import { DecorationsExtension, DecorationsOptions } from './decorations-extension';
import { HelpersExtension } from './helpers-extension';
import { InputRulesExtension, InputRulesOptions } from './input-rules-extension';
import { KeymapExtension, KeymapOptions } from './keymap-extension';
import { NodeViewsExtension } from './node-views-extension';
import { PasteRulesExtension } from './paste-rules-extension';
import { PluginsExtension } from './plugins-extension';
import { SchemaExtension } from './schema-extension';
import { SuggestExtension, SuggestOptions } from './suggest-extension';
import { TagsExtension } from './tags-extension';

export interface BuiltinOptions
  extends SuggestOptions,
    KeymapOptions,
    DecorationsOptions,
    InputRulesOptions {}

/**
 * Provides all the builtin extensions to the editor.
 *
 * @remarks
 *
 * This is used automatically and (at the time of writing) can't be removed from
 * the editor. If you feel that there's a compelling reason to override these
 * extensions feel free to create a [discussion
 * here](https://github.com/remirror/remirror/discussions/category_choices) and
 * it can be addressed.
 *
 * @category Builtin Extension
 *
 * The order of these extension are important.
 *
 * - [[`TagsExtension`]] is places first because it provides tagging which is
 *   used by the schema extension.
 * - [[`SchemeExtension`]] goes next because it's super important to the editor
 *   functionality and needs to run before everything else which might depend
 *   on it.
 */
export function builtinPreset(options: GetStaticAndDynamic<BuiltinOptions> = {}): BuiltinPreset[] {
  const defaultOptions = {
    exitMarksOnArrowPress: KeymapExtension.defaultOptions.exitMarksOnArrowPress,
    excludeBaseKeymap: KeymapExtension.defaultOptions.excludeBaseKeymap,
    selectParentNodeOnEscape: KeymapExtension.defaultOptions.selectParentNodeOnEscape,
    undoInputRuleOnBackspace: KeymapExtension.defaultOptions.undoInputRuleOnBackspace,
    persistentSelectionClass: DecorationsExtension.defaultOptions.persistentSelectionClass,
  };

  options = { ...defaultOptions, ...options };

  const keymapOptions = pick(options, [
    'excludeBaseKeymap',
    'selectParentNodeOnEscape',
    'undoInputRuleOnBackspace',
  ]);
  const decorationsOptions = pick(options, ['persistentSelectionClass']);

  return [
    // The order of these extension is important. First come first served.
    new TagsExtension(),
    new SchemaExtension(),
    new AttributesExtension(),
    new PluginsExtension(),
    new InputRulesExtension(),
    new PasteRulesExtension(),
    new NodeViewsExtension(),
    new SuggestExtension(),
    new CommandsExtension(),
    new HelpersExtension(),
    new KeymapExtension(keymapOptions),
    new DecorationsExtension(decorationsOptions),
  ];
}

export type BuiltinPreset =
  | TagsExtension
  | SchemaExtension
  | AttributesExtension
  | PluginsExtension
  | InputRulesExtension
  | PasteRulesExtension
  | NodeViewsExtension
  | SuggestExtension
  | CommandsExtension
  | HelpersExtension
  | KeymapExtension
  | DecorationsExtension;

declare global {
  namespace Remirror {
    interface ManagerSettings {
      /**
       * The options that can be passed into the built in options.
       */
      builtin?: GetStaticAndDynamic<BuiltinOptions>;
    }

    /**
     * The builtin preset.
     */
    type Builtin = BuiltinPreset;

    /**
     * The union of every extension available via the remirror codebase.
     */
    type Extensions = ValueOf<AllExtensions>;
  }
}
