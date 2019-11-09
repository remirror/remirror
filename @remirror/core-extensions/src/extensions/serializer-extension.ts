import {
  BaseExtensionOptions,
  CommandFunction,
  EditorState,
  Extension,
  ExtensionManagerParams,
} from '@remirror/core';

/**
 * SerializerHandler establishes the signature of a callback function called when the Serialize Extension
 * action is triggered.
 */
export type SerializerHandler = (state: EditorState) => boolean;

/**
 * SerializerExtensionOptions defines the options for the SerializerExtension.
 */
export interface SerializerExtensionOptions extends BaseExtensionOptions {
  onSerialize: SerializerHandler;
}

/**
 * SerializerExtension
 */
export class SerializerExtension extends Extension<SerializerExtensionOptions> {
  get name() {
    return 'serializer' as const;
  }

  public keys({ getActions }: ExtensionManagerParams) {
    return {
      'Mod-s': () => {
        getActions('serializeState')();
        return true;
      },
    };
  }

  public commands() {
    return {
      serializeState: (): CommandFunction => (state, _) => {
        return this.options.onSerialize(state);
      },
    };
  }
}
