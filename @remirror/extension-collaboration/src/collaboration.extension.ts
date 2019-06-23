import {
  Attrs,
  CommandFunction,
  CommandParams,
  EditorState,
  Extension,
  isArray,
  isNumber,
  OnTransactionParams,
  Plugin,
  uniqueId,
} from '@remirror/core';
import debounce from 'debounce';
import { collab, getVersion, receiveTransaction, sendableSteps } from 'prosemirror-collab';
import { Step } from 'prosemirror-transform';
import { CollaborationAttrs, CollaborationExtensionOptions } from './types';

/**
 * The collaboration extension adds collaborative functionality to your editor.
 *
 * Once a central server is created the collaboration extension allos
 */
export class CollaborationExtension extends Extension<CollaborationExtensionOptions, never> {
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
  public commands({ getEditorState, schema }: CommandParams) {
    return (attrs?: Attrs): CommandFunction => (_, dispatch) => {
      if (!isValidCollaborationAttrs(attrs)) {
        throw new Error('Invalid attributes passed to the collaboration command.');
      }

      const { version, steps } = attrs;
      const state = getEditorState();

      if (getVersion(state) > version) {
        return false;
      }

      if (!dispatch) {
        return true;
      }

      dispatch(
        receiveTransaction(
          state,
          steps.map(item => Step.fromJSON(schema, item.step)),
          steps.map(item => item.clientID),
        ),
      );
      return true;
    };
  }

  /**
   * This simply returns the magical collab plugin provided by prosemirror-collab
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
  public onTransaction({ getEditorState }: OnTransactionParams) {
    this.getSendableSteps(getEditorState());
  }

  /**
   * This passes the sendable steps into the `onSendableReceived` handler defined in the
   * options when there is something to send.
   */
  private getSendableSteps = debounce((state: EditorState) => {
    const sendable = sendableSteps(state);

    if (sendable) {
      const jsonSendable = {
        version: sendable.version,
        steps: sendable.steps.map(step => step.toJSON()),
        clientID: sendable.clientID,
      };
      this.options.onSendableReceived({ sendable, jsonSendable });
    }
  }, this.options.debounce);
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
