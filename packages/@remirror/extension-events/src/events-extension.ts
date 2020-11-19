import {
  CreatePluginReturn,
  EditorState,
  EditorStateParameter,
  EditorViewParameter,
  entries,
  ErrorConstant,
  extensionDecorator,
  ExtensionPriority,
  GetHandler,
  GetMarkRange,
  getMarkRange,
  Handler,
  invariant,
  isString,
  MarkType,
  NodeType,
  NodeWithPosition,
  noop,
  PlainExtension,
  ResolvedPos,
} from '@remirror/core';

export interface EventsOptions {
  /**
   * Listens for blur events on the editor.
   *
   * Return `true` to prevent any other prosemirror listeners from firing.
   */
  blur?: Handler<(event: FocusEvent) => boolean | undefined | void>;

  /**
   * Listens for focus events on the editor.
   *
   * Return `true` to prevent any other prosemirror listeners from firing.
   */
  focus?: Handler<(event: FocusEvent) => boolean | undefined | void>;

  /**
   * Listens for mousedown events on the editor.
   *
   * Return `true` to prevent any other prosemirror listeners from firing.
   */
  mousedown?: Handler<(event: MouseEvent) => boolean | undefined | void>;

  /**
   * Listens for mouseup events on the editor.
   *
   * Return `true` to prevent any other prosemirror listeners from firing.
   */
  mouseup?: Handler<(event: MouseEvent) => boolean | undefined | void>;

  /**
   * Listens for click events and provides information which may be useful in
   * handling them properly.
   *
   * This can be used to check if a node was clicked on.
   *
   * Please note that this click handler may be called multiple times for one
   * click. Starting from the node that was clicked directly, it walks up the
   * node tree until it reaches the `doc` node.
   *
   * Return `true` to prevent any other click listeners from being registered.
   */
  click?: Handler<ClickHandler>;

  /**
   * This is similar to the `click` handler, but with better performance when
   * only capturing clicks for marks.
   */
  clickMark?: Handler<ClickMarkHandler>;
}

/**
 * The events extension which listens to events which occur within the
 * remirror editor.
 */
@extensionDecorator<EventsOptions>({
  handlerKeys: ['blur', 'focus', 'mousedown', 'mouseup', 'click', 'clickMark'],
  handlerKeyOptions: {
    blur: { earlyReturnValue: true },
    focus: { earlyReturnValue: true },
    mousedown: { earlyReturnValue: true },
    mouseup: { earlyReturnValue: true },
    click: { earlyReturnValue: true },
  },
  defaultPriority: ExtensionPriority.Low,
})
export class EventsExtension extends PlainExtension<EventsOptions> {
  get name() {
    return 'events' as const;
  }

  /**
   * Add a new lifecycle method which is available to all extensions for adding
   * a click handler to the node or mark.
   */
  onView(): void {
    for (const extension of this.store.extensions) {
      if (
        // managerSettings excluded this from running
        this.store.managerSettings.exclude?.clickHandler ||
        // Method doesn't exist
        !extension.createEventHandlers ||
        // Extension settings exclude it
        extension.options.exclude?.clickHandler
      ) {
        continue;
      }

      const eventHandlers = extension.createEventHandlers();

      for (const [key, handler] of entries(eventHandlers)) {
        // Casting to `any` needed here since I don't know how to teach
        // `TypeScript` that the object key and the handler are a valid pair.
        this.addHandler(key as any, handler);
      }
    }
  }

  /**
   * Create the plugin which manages all of the events being listened to within
   * the editor.
   */
  createPlugin(): CreatePluginReturn {
    // Since event methods can possible be run multiple times for the same event
    // outer node, it is possible that one event can be run multiple times. To
    // prevent needless potentially expensive recalculations, this weak map
    // tracks the references to an event for automatic garbage collection when
    // the reference to the event is lost.
    const eventMap: WeakMap<Event, boolean> = new WeakMap();

    return {
      props: {
        handleClickOn: (view, pos, node, nodePos, event, direct) => {
          const state = this.store.currentState;
          const { schema, doc } = state;
          const $pos = doc.resolve(pos);

          // True when the event has already been handled. In these cases we
          // should **not** run the `clickMark` handler since all that is needed
          // is the `$pos` property to check if a mark is active.
          const handled = eventMap.has(event);

          // Generate the base state which is passed to the `clickMark` handler
          // and used to create the `click` handler state.
          const baseState = createClickMarkState({ $pos, handled, view, state });
          let returnValue = false;

          if (!handled) {
            // The boolean return value for the mark click handler. This is
            // intentionally separate so that both the `clickMark` handlers and
            // the `click` handlers are run for each click. It uses the eventMap
            // to limit the ensure that it is only run once per click since this
            // method is run with the same event for every single node in the
            // `doc` tree.
            returnValue = this.options.clickMark(event, baseState) || returnValue;
          }

          // Create click state to help API consumers inspect whether the event
          // is a relevant click type.
          const clickState: ClickHandlerState = {
            ...baseState,
            pos,
            direct,
            nodeWithPosition: { node, pos: nodePos },

            getNode: (nodeType) => {
              const type = isString(nodeType) ? schema.nodes[nodeType] : nodeType;

              invariant(type, {
                code: ErrorConstant.EXTENSION,
                message: 'The node being checked does not exist',
              });

              return type === node.type ? { node, pos: nodePos } : undefined;
            },
          };

          // Store this event so that marks aren't re-run for identical events.
          eventMap.set(event, true);

          return this.options.click(event, clickState) || returnValue;
        },

        handleDOMEvents: {
          focus: (_, event) => {
            return this.options.focus(event) || false;
          },
          blur: (_, event) => {
            return this.options.blur(event) || false;
          },
          mousedown: (_, event) => {
            return this.options.mousedown(event) || false;
          },
          mouseup: (_, event) => {
            return this.options.mouseup(event) || false;
          },
        },
      },
    };
  }
}

interface CreateClickMarkStateParameter extends BaseEventState {
  /**
   * True when the event has previously been handled. In this situation we can
   * return early, since the mark can be checked directly from the current
   * position.
   */
  handled: boolean;

  /**
   * The resolved position to check for marks.
   */
  $pos: ResolvedPos;
}

/**
 * Create the click handler state for the mark.
 */
function createClickMarkState(parameter: CreateClickMarkStateParameter): ClickMarkHandlerState {
  const { handled, view, $pos, state } = parameter;
  const clickState: ClickMarkHandlerState = { getMark: noop, markRanges: [], view, state };

  if (handled) {
    return clickState;
  }

  for (const { type } of $pos.marks()) {
    const range = getMarkRange($pos, type);

    if (range) {
      clickState.markRanges.push(range);
    }
  }

  clickState.getMark = (markType) => {
    const type = isString(markType) ? state.schema.marks[markType] : markType;

    invariant(type, {
      code: ErrorConstant.EXTENSION,
      message: `The mark ${markType} being checked does not exist within the editor schema.`,
    });

    return clickState.markRanges.find((range) => range.mark.type === type);
  };

  return clickState;
}

/**
 * The click handler for events.
 */
export type ClickHandler = (
  event: MouseEvent,
  clickState: ClickHandlerState,
) => boolean | undefined | void;

export interface ClickMarkHandlerState extends BaseEventState {
  /**
   * Return the mark range if it exists for the clicked position.
   */
  getMark: (markType: string | MarkType) => GetMarkRange | undefined | void;

  /**
   * The list of mark ranges included. This is only populated when `direct` is
   * true.
   */
  markRanges: GetMarkRange[];
}

/**
 * An event solely focused on clicks on marks.
 */
export type ClickMarkHandler = (
  event: MouseEvent,
  clickState: ClickMarkHandlerState,
) => boolean | undefined | void;

/**
 * The helpers passed into the `ClickHandler`.
 */
export interface ClickHandlerState extends ClickMarkHandlerState {
  /**
   * The position that was clicked.
   */
  pos: number;

  /**
   * Returns undefined when the nodeType doesn't match. Otherwise returns the
   * node with a position property.
   */
  getNode: (nodeType: string | NodeType) => NodeWithPosition | undefined;

  /**
   * The node that was clicked with the desired position.
   */
  nodeWithPosition: NodeWithPosition;

  /**
   * When this is true it means that the current clicked node is the node that
   * was directly clicked.
   */
  direct: boolean;
}

/**
 * The return type for the `createEventHandlers` extension creator method.
 */
export type CreateEventHandlers = GetHandler<EventsOptions>;

interface BaseEventState extends EditorViewParameter, EditorStateParameter {
  /**
   * The editor state before updates from the event.
   */
  state: EditorState;
}

declare global {
  namespace Remirror {
    interface ExcludeOptions {
      /**
       * Whether to exclude the extension's `clickHandler`.
       *
       * @default undefined
       */
      clickHandler?: boolean;
    }

    interface BaseExtension {
      /**
       * Create a click handler for this extension. Returns a function which is
       * used as the click handler. The callback provided is handled via the
       * `Events` extension and comes with a helpers object
       * `ClickHandlerHelper`.
       *
       * The returned function should return `true` if you want to prevent any
       * further click handlers from being handled.
       */
      createEventHandlers?(): CreateEventHandlers;
    }
    interface AllExtensions {
      events: EventsExtension;
    }
  }
}
