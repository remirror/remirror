import {
  CreateExtensionPlugin,
  EditorState,
  EditorStateProps,
  EditorView,
  EditorViewProps,
  entries,
  ErrorConstant,
  extension,
  ExtensionPriority,
  GetHandler,
  GetMarkRange,
  getMarkRange,
  Handler,
  Helper,
  helper,
  invariant,
  isString,
  MarkType,
  NodeType,
  NodeWithPosition,
  noop,
  PlainExtension,
  range,
  ResolvedPos,
} from '@remirror/core';

import { getPositionFromEvent } from './events-utils';

export interface EventsOptions {
  /**
   * Listens for blur events on the editor.
   *
   * Return `true` to prevent any other prosemirror listeners from firing.
   */
  blur?: Handler<FocusEventHandler>;

  /**
   * Listens for focus events on the editor.
   *
   * Return `true` to prevent any other prosemirror listeners from firing.
   */
  focus?: Handler<FocusEventHandler>;

  /**
   * Listens to scroll events on the editor.
   *
   * Return `true` to prevent any other prosemirror listeners from firing.
   */
  scroll?: Handler<ScrollEventHandler>;

  /**
   * Listens to `copy` events on the editor.
   *
   * Return `true` to prevent any other prosemirror listeners from firing.
   */
  copy?: Handler<ScrollEventHandler>;

  /**
   * Listens to `paste` events on the editor.
   *
   * Return `true` to prevent any other prosemirror listeners from firing.
   */
  paste?: Handler<ScrollEventHandler>;

  /**
   * Listens for mousedown events on the editor.
   *
   * Return `true` to prevent any other prosemirror listeners from firing.
   */
  mousedown?: Handler<MouseEventHandler>;

  /**
   * Listens for mouseup events on the editor.
   *
   * Return `true` to prevent any other prosemirror listeners from firing.
   */
  mouseup?: Handler<MouseEventHandler>;

  /**
   * Listens for mouseenter events on the editor.
   *
   * Return `true` to prevent any other prosemirror listeners from firing.
   */
  mouseenter?: Handler<MouseEventHandler>;

  /**
   * Listens for mouseleave events on the editor.
   *
   * Return `true` to prevent any other prosemirror listeners from firing.
   */
  mouseleave?: Handler<MouseEventHandler>;

  /**
   * Handle text input.
   */
  textInput?: Handler<TextInputHandler>;

  /**
   * Listens for keypress events on the editor.
   *
   * Return `true` to prevent any other prosemirror listeners from firing.
   */
  keypress?: Handler<KeyboardEventHandler>;

  /**
   * Listens for keypress events on the editor.
   *
   * Return `true` to prevent any other prosemirror listeners from firing.
   */
  keydown?: Handler<KeyboardEventHandler>;

  /**
   * Listens for keypress events on the editor.
   *
   * Return `true` to prevent any other prosemirror listeners from firing.
   */
  keyup?: Handler<KeyboardEventHandler>;

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
  click?: Handler<ClickEventHandler>;

  /**
   * This is similar to the `click` handler, but with better performance when
   * only capturing clicks for marks.
   */
  clickMark?: Handler<ClickMarkEventHandler>;

  /**
   * Listen for contextmenu events and pass through props which detail the
   * direct node and parent nodes which were activated.
   */
  contextmenu?: Handler<ContextMenuEventHandler>;

  /**
   * Listen for hover events and pass through details of every node and mark
   * which was hovered at the current position.
   */
  hover?: Handler<HoverEventHandler>;
}

export type FocusEventHandler = (event: FocusEvent) => boolean | undefined | void;
export type ScrollEventHandler = (event: Event) => boolean | undefined | void;
export type MouseEventHandler = (event: MouseEvent) => boolean | undefined | void;
export type TextInputHandler = (props: {
  from: number;
  to: number;
  text: string;
}) => boolean | undefined | void;
export type KeyboardEventHandler = (event: KeyboardEvent) => boolean | undefined | void;
export type ClickEventHandler = (
  event: MouseEvent,
  state: ClickHandlerState,
) => boolean | undefined | void;
export type ClickMarkEventHandler = (
  event: MouseEvent,
  state: ClickMarkHandlerState,
) => boolean | undefined | void;
export type ContextMenuEventHandler = (props: MouseEventHandlerProps) => boolean | undefined | void;
export type HoverEventHandler = (props: HoverEventHandlerProps) => boolean | undefined | void;

/**
 * The events extension which listens to events which occur within the
 * remirror editor.
 */
@extension<EventsOptions>({
  handlerKeys: [
    'blur',
    'focus',
    'mousedown',
    'mouseup',
    'mouseenter',
    'mouseleave',
    'textInput',
    'keypress',
    'keyup',
    'keydown',
    'click',
    'clickMark',
    'contextmenu',
    'hover',
    'scroll',
    'copy',
    'paste',
  ],
  handlerKeyOptions: {
    blur: { earlyReturnValue: true },
    focus: { earlyReturnValue: true },
    mousedown: { earlyReturnValue: true },
    mouseleave: { earlyReturnValue: true },
    mouseup: { earlyReturnValue: true },
    click: { earlyReturnValue: true },
    hover: { earlyReturnValue: true },
    contextmenu: { earlyReturnValue: true },
    scroll: { earlyReturnValue: true },
  },
  defaultPriority: ExtensionPriority.High,
})
export class EventsExtension extends PlainExtension<EventsOptions> {
  get name() {
    return 'events' as const;
  }

  /**
   * Indicates whether the user is currently interacting with the editor.
   */
  private mousedown = false;

  /**
   * True when the mouse is within the bounds of the editor.
   */
  private mouseover = false;

  /**
   * Add a new lifecycle method which is available to all extensions for adding
   * a click handler to the node or mark.
   */
  onView(): void {
    if (
      // managerSettings excluded this from running
      this.store.managerSettings.exclude?.clickHandler
    ) {
      return;
    }

    for (const extension of this.store.extensions) {
      if (
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
  createPlugin(): CreateExtensionPlugin {
    // Since event methods can possible be run multiple times for the same event
    // outer node, it is possible that one event can be run multiple times. To
    // prevent needless potentially expensive recalculations, this weak map
    // tracks the references to an event for automatic garbage collection when
    // the reference to the event is lost.
    const eventMap: WeakMap<Event, boolean> = new WeakMap();

    return {
      props: {
        handleKeyPress: (_, event) => {
          return this.options.keypress(event) || false;
        },
        handleKeyDown: (_, event) => {
          return this.options.keydown(event) || false;
        },
        handleTextInput: (_, from, to, text) => {
          return this.options.textInput({ from, to, text }) || false;
        },
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
            this.startMouseover();
            return this.options.mousedown(event) || false;
          },

          mouseup: (_, event) => {
            this.endMouseover();
            return this.options.mouseup(event) || false;
          },

          mouseleave: (_, event) => {
            this.mouseover = false;
            return this.options.mouseleave(event) || false;
          },

          mouseenter: (_, event) => {
            this.mouseover = true;
            return this.options.mouseenter(event) || false;
          },

          keyup: (_, event) => {
            return this.options.keyup(event) || false;
          },

          mouseout: this.createMouseEventHandler(
            (props) => this.options.hover({ ...props, hovering: false }) || false,
          ),

          mouseover: this.createMouseEventHandler(
            (props) => this.options.hover({ ...props, hovering: true }) || false,
          ),

          contextmenu: this.createMouseEventHandler(
            (props) => this.options.contextmenu(props) || false,
          ),

          scroll: (_, event) => {
            return this.options.scroll(event) || false;
          },

          copy: (_, event) => {
            return this.options.copy(event) || false;
          },

          paste: (_, event) => {
            return this.options.paste(event) || false;
          },
        },
      },
    };
  }

  /**
   * Check if the user is currently interacting with the editor.
   */
  @helper()
  isInteracting(): Helper<boolean> {
    return this.mousedown && this.mouseover;
  }

  private startMouseover() {
    this.mouseover = true;

    if (this.mousedown) {
      return;
    }

    this.mousedown = true;

    this.store.document.documentElement.addEventListener(
      'mouseup',
      () => {
        this.endMouseover();
      },
      { once: true },
    );
  }

  private endMouseover() {
    if (!this.mousedown) {
      return;
    }

    this.mousedown = false;
    this.store.commands.emptyUpdate();
  }

  private readonly createMouseEventHandler = (fn: (props: MouseEventHandlerProps) => boolean) => {
    return (view: EditorView, event: MouseEvent) => {
      const eventPosition = getPositionFromEvent(view, event);

      if (!eventPosition) {
        return false;
      }

      // The nodes that are captured by the context menu. An empty array
      // means the contextmenu was trigger outside the content. The first
      // node is always the direct match.
      const nodes: NodeWithPosition[] = [];

      // The marks wrapping the captured position.
      const marks: GetMarkRange[] = [];

      const { inside } = eventPosition;

      // This handle the case when the context menu click has no corresponding
      // nodes or marks because it's outside of any editor content.
      if (inside === -1) {
        return false;
      }

      // Retrieve the resolved position from the current state.
      const $pos = view.state.doc.resolve(inside);

      // The depth of the current node (which is a direct match)
      const currentNodeDepth = $pos.depth + 1;

      // Populate the nodes.
      for (const index of range(currentNodeDepth, 1)) {
        nodes.push({
          node: index > $pos.depth && $pos.nodeAfter ? $pos.nodeAfter : $pos.node(index),
          pos: $pos.before(index),
        });
      }

      // Populate the marks.
      for (const { type } of $pos.marks()) {
        const range = getMarkRange($pos, type);

        if (range) {
          marks.push(range);
        }
      }

      return fn({
        event,
        view,
        nodes,
        marks,
        getMark: (markType) => {
          const type = isString(markType) ? view.state.schema.marks[markType] : markType;

          invariant(type, {
            code: ErrorConstant.EXTENSION,
            message: `The mark ${markType} being checked does not exist within the editor schema.`,
          });

          return marks.find((range) => range.mark.type === type);
        },
        getNode: (nodeType) => {
          const type = isString(nodeType) ? view.state.schema.nodes[nodeType] : nodeType;

          invariant(type, {
            code: ErrorConstant.EXTENSION,
            message: 'The node being checked does not exist',
          });

          const nodeWithPos = nodes.find(({ node }) => node.type === type);

          if (!nodeWithPos) {
            return;
          }

          return { ...nodeWithPos, isRoot: !!nodes[0]?.node.eq(nodeWithPos.node) };
        },
      });
    };
  };
}

interface CreateClickMarkStateProps extends BaseEventState {
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
function createClickMarkState(props: CreateClickMarkStateProps): ClickMarkHandlerState {
  const { handled, view, $pos, state } = props;
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
 * @deprecated use [[`ClickEventHandler`]] instead.
 */
export type ClickHandler = ClickEventHandler;

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
 * @deprecated use [[`ClickMarkEventHandler`]] instead.
 */
export type ClickMarkHandler = ClickMarkEventHandler;

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

interface BaseEventState extends EditorViewProps, EditorStateProps {
  /**
   * The editor state before updates from the event.
   */
  state: EditorState;
}

export interface HoverEventHandlerProps extends MouseEventHandlerProps {
  /**
   * This is true when hovering has started and false when hovering has ended.
   */
  hovering: boolean;
}

export interface MouseEventHandlerProps {
  /**
   * The editor view.
   */
  view: EditorView;

  /**
   * The marks that currently wrap the context menu.
   */
  marks: GetMarkRange[];

  /**
   * An array of nodes with their positions. The first node is the node that was
   * acted on directly, and each node after is the parent of the one proceeding.
   * Consumers of this API can check if a node of a specific type was triggered
   * to determine how to render their context menu.
   */
  nodes: NodeWithPosition[];

  /**
   * The event that triggered this.
   */
  event: MouseEvent;

  /**
   * Return the mark range if it exists for the clicked position.
   *
   *
   */
  getMark: (markType: string | MarkType) => GetMarkRange | undefined | void;

  /**
   * Returns undefined when the nodeType doesn't match. Otherwise returns the
   * node with a position property and `isRoot` which is true when the node was
   * clicked on directly.
   */
  getNode: (
    nodeType: string | NodeType,
  ) => (NodeWithPosition & { isRoot: boolean }) | undefined | void;
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
