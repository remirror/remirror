import { ExtensionPriority } from '@remirror/core-constants';
import type { AnyFunction, CommandFunction, Static, Transaction } from '@remirror/core-types';

import { AnyExtension, extension, PlainExtension } from '../extension';
import type { CreateExtensionPlugin } from '../types';

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
 *
 * @internalremarks
 *
 * TODO capture keybindings as well. This will be more difficult since
 * keybindings can dynamically be added to the editor.
 */
@extension<MetaOptions>({
  defaultOptions: {
    capture: process.env.NODE_ENV === 'development',
  },
  staticKeys: ['capture'],
  defaultPriority: ExtensionPriority.Highest,
})
export class MetaExtension extends PlainExtension<MetaOptions> {
  get name() {
    return 'meta' as const;
  }

  onCreate(): void {
    this.store.setStoreKey('getCommandMeta', this.getCommandMeta.bind(this));

    if (!this.options.capture) {
      return;
    }

    for (const extension of this.store.extensions) {
      this.captureCommands(extension);
      this.captureKeybindings(extension);
    }
  }

  /**
   * This is here to provide a
   */
  createPlugin(): CreateExtensionPlugin {
    return {};
  }

  /**
   * Intercept command names and attributes.
   */
  private captureCommands(extension: AnyExtension) {
    const decoratedCommands = extension.decoratedCommands ?? {};
    const createCommands = extension.createCommands;

    for (const name of Object.keys(decoratedCommands)) {
      const command: AnyFunction<CommandFunction> = (extension as any)[name];
      (extension as any)[name] =
        (...args: any[]): CommandFunction =>
        (props) => {
          const value = command(...args)(props);

          if (props.dispatch && value) {
            this.setCommandMeta(props.tr, {
              type: 'command',
              chain: props.dispatch !== props.view?.dispatch,
              name: name,
              extension: extension.name,
              decorated: true,
            });
          }

          return value;
        };
    }

    if (createCommands) {
      extension.createCommands = () => {
        const commandsObject = createCommands();

        for (const [name, command] of Object.entries(commandsObject)) {
          commandsObject[name] =
            (...args: any[]) =>
            (props) => {
              const value = command(...args)(props);

              if (props.dispatch && value) {
                this.setCommandMeta(props.tr, {
                  type: 'command',
                  chain: props.dispatch !== props.view?.dispatch,
                  name: name,
                  extension: extension.name,
                  decorated: false,
                });
              }

              return value;
            };
        }

        return commandsObject;
      };
    }
  }

  /**
   * Intercept command name and attributes.
   */
  private captureKeybindings(_: AnyExtension) {}

  /**
   * Get the command metadata.
   */
  private getCommandMeta(tr: Transaction): Metadata[] {
    return tr.getMeta(this.pluginKey) ?? [];
  }

  private setCommandMeta(tr: Transaction, update: Metadata) {
    const meta = this.getCommandMeta(tr);
    tr.setMeta(this.pluginKey, [...meta, update]);
  }
}

interface CommandMetadata {
  type: 'command';

  /**
   * Was this called as part of a chain?
   */
  chain: boolean;

  /**
   * Is this a decorated command?
   */
  decorated: boolean;

  /**
   * The name of the extension.
   */
  extension: string;

  /**
   * The name of the command that was called.
   */
  name: string;
}

interface KeyBindingMetadata {
  type: 'keyBinding';

  /**
   * The name of the extension used.
   */
  extension: string;

  /**
   * The shortcut used to invoke this keybinding.
   */
  shortcut: string;
}

export type Metadata = CommandMetadata | KeyBindingMetadata;

declare global {
  namespace Remirror {
    interface ManagerStore<Extension extends AnyExtension> {
      /**
       * Get the command metadata for the transaction.
       * @internal
       */
      getCommandMeta(tr: Transaction): Metadata[];
    }
    interface AllExtensions {
      meta: MetaExtension;
    }
  }
}
