import { isEmptyObject, noop, pick } from '@remirror/core-helpers';
import type { GetStaticAndDynamic } from '@remirror/core-types';

import { presetDecorator } from '../decorators';
import type { AddCustomHandler } from '../extension/base-class';
import { Preset } from '../preset';
import type { OnSetOptionsParameter } from '../types';
import { AttributesExtension } from './attributes-extension';
import { CommandsExtension } from './commands-extension';
import { HelpersExtension } from './helpers-extension';
import { InputRulesExtension, InputRulesOptions } from './input-rules-extension';
import { KeymapExtension, KeymapOptions } from './keymap-extension';
import { NodeViewsExtension } from './node-views-extension';
import { PasteRulesExtension } from './paste-rules-extension';
import {
  PersistentSelectionExtension,
  PersistentSelectionOptions,
} from './persistent-selection-extension';
import { PluginsExtension } from './plugins-extension';
import { SchemaExtension } from './schema-extension';
import { SuggestExtension, SuggestOptions } from './suggest-extension';
import { TagsExtension } from './tags-extension';

export interface BuiltinOptions
  extends SuggestOptions,
    KeymapOptions,
    PersistentSelectionOptions,
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
 * @builtin
 */
@presetDecorator<BuiltinOptions>({
  defaultOptions: {
    exitMarksOnArrowPress: KeymapExtension.defaultOptions.exitMarksOnArrowPress,
    excludeBaseKeymap: KeymapExtension.defaultOptions.excludeBaseKeymap,
    selectParentNodeOnEscape: KeymapExtension.defaultOptions.selectParentNodeOnEscape,
    undoInputRuleOnBackspace: KeymapExtension.defaultOptions.undoInputRuleOnBackspace,
    persistentSelectionClass: PersistentSelectionExtension.defaultOptions.persistentSelectionClass,
  },
  staticKeys: ['persistentSelectionClass'],
  customHandlerKeys: ['keymap', 'suggester'],
  handlerKeys: ['shouldSkipInputRule'],
  handlerKeyOptions: { shouldSkipInputRule: { earlyReturnValue: true } },
})
export class BuiltinPreset extends Preset<BuiltinOptions> {
  get name() {
    return 'builtin' as const;
  }

  protected onSetOptions(parameter: OnSetOptionsParameter<BuiltinOptions>): void {
    const { pickChanged } = parameter;
    const changedKeymapOptions = pickChanged([
      'selectParentNodeOnEscape',
      'excludeBaseKeymap',
      'undoInputRuleOnBackspace',
    ]);

    if (!isEmptyObject(changedKeymapOptions)) {
      this.getExtension(KeymapExtension).setOptions(changedKeymapOptions);
    }
  }

  protected onAddCustomHandler: AddCustomHandler<BuiltinOptions> = (handlers) => {
    const { suggester, keymap } = handlers;

    if (suggester) {
      return this.getExtension(SuggestExtension).addCustomHandler('suggester', suggester);
    }

    if (keymap) {
      return this.getExtension(KeymapExtension).addCustomHandler('keymap', keymap);
    }

    return noop;
  };

  /**
   * The order of these extension are important.
   *
   * - [[TagsExtension]] is places first because it provides tagging which is
   *   used by the schema extension.
   * - [[SchemeExtension]] goes next because it's super important to the editor
   *   functionality and needs to run before everything else which might depend
   *   on it.
   */
  createExtensions() {
    const keymapOptions = pick(this.options, [
      'excludeBaseKeymap',
      'selectParentNodeOnEscape',
      'undoInputRuleOnBackspace',
    ]);
    const persistentSelectionOptions = pick(this.options, ['persistentSelectionClass']);
    const inputRulesExtension = new InputRulesExtension();

    inputRulesExtension.addHandler('shouldSkipInputRule', this.options.shouldSkipInputRule);

    return [
      // The order of these extension is important.
      new TagsExtension(),
      new SchemaExtension(),
      new AttributesExtension(),
      new PluginsExtension(),
      inputRulesExtension,
      new PasteRulesExtension(),
      new NodeViewsExtension(),
      new SuggestExtension(),
      new CommandsExtension(),
      new HelpersExtension(),
      new KeymapExtension(keymapOptions),
      new PersistentSelectionExtension(persistentSelectionOptions),
    ];
  }
}

declare global {
  namespace Remirror {
    interface ManagerSettings {
      /**
       * The options that can be passed into the built in options.
       */
      builtin?: GetStaticAndDynamic<BuiltinOptions>;
    }
  }
}
