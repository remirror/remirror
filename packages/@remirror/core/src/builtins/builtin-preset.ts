import { GetStaticAndDynamic } from '@remirror/core-types';

import { AddCustomHandler } from '../extension/base-class';
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
import { SuggesterExtension, SuggesterOptions } from './suggester-extension';
import { TagsExtension } from './tags-extension';

/** A list of all the builtIn extensions. */
export const builtInExtensions = [
  SchemaExtension,
  TagsExtension,
  AttributesExtension,
  PluginsExtension,
  InputRulesExtension,
  PasteRulesExtension,
  NodeViewsExtension,
  SuggesterExtension,
  CommandsExtension,
  HelpersExtension,
  KeymapExtension,
] as const;

export interface BuiltinOptions extends SuggesterOptions {}

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
export class BuiltinPreset extends Preset<BuiltinOptions> {
  get name() {
    return 'builtin' as const;
  }

  protected onSetOptions(): void {
    return;
  }

  protected onAddCustomHandler: AddCustomHandler<BuiltinOptions> = ({ suggester }) => {
    if (!suggester) {
      return;
    }

    return this.getExtension(SuggesterExtension).addCustomHandler('suggester', suggester);
  };

  createExtensions() {
    return builtInExtensions.map((Extension) => new Extension());
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
