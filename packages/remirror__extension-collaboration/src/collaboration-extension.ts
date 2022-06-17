import {
  command,
  CommandFunction,
  debounce,
  EditorState,
  extension,
  Handler,
  invariant,
  isArray,
  isNumber,
  PlainExtension,
  ProsemirrorAttributes,
  ProsemirrorPlugin,
  Shape,
  StateUpdateLifecycleProps,
  Static,
  Transaction,
  uniqueId,
} from '@remirror/core';
import { collab, getVersion, receiveTransaction, sendableSteps } from '@remirror/pm/collab';
import { Step } from '@remirror/pm/transform';

/**
 * The collaboration extension adds collaborative functionality to your editor.
 *
 * Once a central server is created the collaboration extension is good.
 */
@extension<CollaborationOptions>({
  defaultOptions: {
    version: 0,
    clientID: uniqueId(),
    debounceMs: 250,
  },
  staticKeys: ['version', 'clientID', 'debounceMs'],
  handlerKeys: ['onSendableReceived'],
})
export class CollaborationExtension extends PlainExtension<CollaborationOptions> {
  get name() {
    return 'collaboration' as const;
  }

  protected init(): void {
    this.getSendableSteps = debounce(this.options.debounceMs, this.getSendableSteps.bind(this));
  }

  /**
   * Send a collaboration update.
   */
  @command()
  sendCollaborationUpdate(attributes: CollaborationAttributes): CommandFunction {
    return ({ state, dispatch }) => {
      invariant(isValidCollaborationAttributes(attributes), {
        message: 'Invalid attributes passed to the collaboration command.',
      });

      const { version, steps } = attributes;

      if (getVersion(state) > version) {
        return false;
      }

      if (dispatch) {
        dispatch(
          receiveTransaction(
            state,
            steps.map((item) => Step.fromJSON(this.store.schema, item)),
            steps.map((item) => item.clientID),
          ),
        );
      }

      return true;
    };
  }

  createExternalPlugins(): ProsemirrorPlugin[] {
    const { version, clientID } = this.options;

    const plugin = collab({
      version,
      clientID,
    });

    return [plugin];
  }

  onStateUpdate(props: StateUpdateLifecycleProps): void {
    this.getSendableSteps(props.state);
  }

  /**
   * This passes the sendable steps into the `onSendableReceived` handler defined in the
   * options when there is something to send.
   */
  private getSendableSteps(state: EditorState) {
    const sendable = sendableSteps(state);

    if (sendable) {
      const jsonSendable = {
        version: sendable.version,
        steps: sendable.steps.map((step) => step.toJSON()),
        clientID: sendable.clientID,
      };
      this.options.onSendableReceived({ sendable, jsonSendable });
    }
  }
}

export interface Sendable {
  version: number;
  steps: readonly Step[];
  clientID: number | string;
  origins: readonly Transaction[];
}

export interface JSONSendable extends Omit<Sendable, 'steps' | 'origins'> {
  steps: Shape[];
}

export interface OnSendableReceivedProps {
  /**
   * The raw sendable generated by the prosemirror-collab library.
   */
  sendable: Sendable;

  /**
   * A sendable which can be sent to a server
   */
  jsonSendable: JSONSendable;
}

export interface CollaborationOptions {
  /**
   * The document version.
   *
   * @default 0
   */
  version?: Static<number>;

  /**
   * The unique ID of the client connecting to the server.
   */
  clientID: Static<number | string>;

  /**
   * The debounce time in milliseconds
   *
   * @default 250
   */
  debounceMs?: Static<number>;

  /**
   * Called when an an editor transaction occurs and there are changes ready to
   * be sent to the server.
   *
   * @remarks
   *
   * The callback will receive the `jsonSendable` which can be sent to the
   * server as it is. If you need more control then the `sendable` property can
   * be used to shape the data the way you require.
   *
   * Since this method is called for everyTransaction that updates the
   * jsonSendable value it is automatically debounced for you.
   *
   * @param props - the sendable and jsonSendable properties which can be sent
   * to your backend
   */
  onSendableReceived: Handler<(props: OnSendableReceivedProps) => void>;
}

export interface StepWithClientId extends Step {
  clientID: number | string;
}

export type CollaborationAttributes = ProsemirrorAttributes<{
  /**
   * The steps to confirm, combined with the clientID of the user who created the change
   */
  steps: StepWithClientId[];

  /**
   * The version of the document that these steps were added to.
   */
  version: number;
}>;

/**
 * Check that the attributes exist and are valid for the collaboration update
 * command method.
 */
const isValidCollaborationAttributes = (
  attributes: ProsemirrorAttributes,
): attributes is CollaborationAttributes => {
  return !(!attributes || !isArray(attributes.steps) || !isNumber(attributes.version));
};

declare global {
  namespace Remirror {
    interface AllExtensions {
      collaboration: CollaborationExtension;
    }
  }
}
