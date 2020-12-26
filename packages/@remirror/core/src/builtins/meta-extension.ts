import { ExtensionPriority } from '@remirror/core-constants';
import { Static } from '@remirror/core-types';

import { AnyExtension, extension, PlainExtension } from '../extension';
import { helper } from './builtin-decorators';

export interface MetaOptions {
  /**
   * Set to true to capture meta data on commands and keybindings. This creates
   * a wrapper around every command and keybinding and as a result it may lead
   * to a performance penalty.
   */
  capture?: Static<boolean>;
}

/**
 * Support meta data for commands and key bindings.
 *
 * Metadata is dded to all commands and keybindings and that information is
 * provided to the `onChange` handle whenever the state is updated.
 */
@extension<MetaOptions>({
  defaultOptions: {
    capture: process.env.NODE_ENV === 'development',
  },
  staticKeys: ['capture'],
  defaultPriority: ExtensionPriority.Highest,
})
export class MetaExtension extends PlainExtension<MetaOptions> {
  private _meta: Metadata[] = [];

  get name() {
    return 'meta' as const;
  }

  onCreate(): void {
    for (const extension of this.store.extensions) {
      this.captureCommands(extension);
      this.captureKeybindings(extension);
    }
  }

  onStateUpdate(): void {
    // Reset the meta data after each state update.
    this._meta = [];
  }

  /**
   * Intercept command names and attributes.
   */
  private captureCommands(_: AnyExtension) {}

  /**
   * Intercept command name and attributes.
   */
  private captureKeybindings(_: AnyExtension) {}
}

interface Metadata extends Remirror.Meta {}

declare global {
  namespace Remirror {
    interface Meta {}
    interface AllExtensions {
      meta: MetaExtension;
    }
  }
}
