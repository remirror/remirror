import {
  Attrs,
  CommandFunction,
  CommandParams,
  debounce,
  EditorState,
  Extension,
  isArray,
  isNumber,
  OnTransactionParams,
  Plugin,
  uniqueId,
} from '@remirror/core';
import { collab, getVersion, receiveTransaction, sendableSteps } from 'prosemirror-collab';
import { Step } from 'prosemirror-transform';
import { CollaborationAttrs, CollaborationExtensionOptions } from './collaboration-types';

/**
 * The collaboration extension adds collaborative functionality to your editor.
 *
 * Once a central server is created the collaboration extension is good.
 */
export class CollaborationExtension extends Extension<CollaborationExtensionOptions> {
  /**
   * Provides the name of this extension.
   */
  get name() {
    return 'collaboration' as const;
  }

  /**
   * The default options for eht extension
   */
  protected get defaultOptions() {
    return {
      version: 0,
      clientID: uniqueId(),
      debounce: 250,
    };
  }

  /**
   * This provides one command for issuing updates .
   */
  public commands({ getState, schema }: CommandParams) {
    return {
      collaborationUpdate: (attrs: CollaborationAttrs): CommandFunction => (_, dispatch) => {
        if (!isValidCollaborationAttrs(attrs)) {
          throw new Error('Invalid attributes passed to the collaboration command.');
        }

        const { version, steps } = attrs;
        const state = getState();

        if (getVersion(state) > version) {
          return false;
        }

        if (dispatch) {
          dispatch(
            receiveTransaction(
              state,
              steps.map(item => Step.fromJSON(schema, item.step)),
              steps.map(item => item.clientID),
            ),
          );
        }

        return true;
      },
    };
  }

  /**
   * This returns the collab plugin provided by `prosemirror-collab`.
   */
  public plugin(): Plugin {
    const { version, clientID } = this.options;

    return collab({
      version,
      clientID,
    });
  }

  /**
   * Called whenever a transaction occurs.
   */
  public onTransaction({ getState }: OnTransactionParams) {
    this.getSendableSteps(getState());
  }

  /**
   * This passes the sendable steps into the `onSendableReceived` handler defined in the
   * options when there is something to send.
   */
  private readonly getSendableSteps = debounce(this.options.debounce, (state: EditorState) => {
    const sendable = sendableSteps(state);

    if (sendable) {
      const jsonSendable = {
        version: sendable.version,
        steps: sendable.steps.map(step => step.toJSON()),
        clientID: sendable.clientID,
      };
      this.options.onSendableReceived({ sendable, jsonSendable });
    }
  });
}

/**
 * Check that the attributes exist and are valid for the collaboration update
 * command method.
 */
const isValidCollaborationAttrs = (attrs?: Attrs): attrs is CollaborationAttrs => {
  if (!attrs || !isArray(attrs.steps) || !isNumber(attrs.version)) {
    return false;
  }

  return true;
};
