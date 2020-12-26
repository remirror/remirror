import {
  Dispose,
  EditorView,
  entries,
  extension,
  findParentNode,
  findPositionOfNodeAfter,
  findPositionOfNodeBefore,
  isDomNode,
  isElementDomNode,
  isNumber,
  isUndefined,
  PlainExtension,
  ResolvedPos,
  StateUpdateLifecycleParameter,
  Static,
  throttle,
} from '@remirror/core';
import { dropPoint, insertPoint } from '@remirror/pm/transform';
import { Decoration, DecorationSet } from '@remirror/pm/view';

export interface DropCursorOptions {
  /**
   * The class name added to the block node which is directly before the drop
   * cursor.
   *
   * @default 'before-drop-cursor'
   */
  beforeClass?: string;

  /**
   * The class name added to the block node which is directly after the drop
   * cursor.
   *
   * @default 'after-drop-cursor'
   */
  afterClass?: string;

  /**
   * The class name added to the block node which contains the drop cursor.
   *
   * @default 'container-drop-cursor'
   */
  containerClass?: string;

  /**
   * The inline drop cursor class which is added to the drop cursor widget
   * within a text block.
   *
   * @default 'inline-drop-cursor'
   */
  inlineClass?: string;

  /**
   * The block drop cursor class which is added to the drop cursor widget when
   * it is between two nodes.
   *
   * @default 'block-drop-cursor'
   */
  blockClass?: string;

  /**
   * Create the inline and block HTML elements for the drop cursor widgets.
   */
  createCursorElement?: (parameter: CursorElementsParameter) => CursorElements;

  /**
   * Set the throttling delay in milliseconds. Set it to `-1` to remove any
   * throttling which is not recommended.
   *
   * @default 50
   */
  throttle?: Static<number>;
}

const BLOCK_KEY = 'drop-cursor-block';
const INLINE_KEY = 'drop-cursor-inline';
const DEFAULT_TIMEOUT = 50;

/**
 * Create a plugin that, when added to a ProseMirror instance, causes a widget
 * decoration to show up at the drop position when something is dragged over the
 * editor.
 *
 * @category Builtin Extension
 */
@extension<DropCursorOptions>({
  defaultOptions: {
    createCursorElement,
    afterClass: 'after-drop-cursor',
    beforeClass: 'before-drop-cursor',
    containerClass: 'container-drop-cursor',
    inlineClass: 'inline-drop-cursor',
    blockClass: 'block-drop-cursor',
    throttle: DEFAULT_TIMEOUT,
  },
  staticKeys: ['throttle'],
})
export class DropCursorExtension extends PlainExtension<DropCursorOptions> {
  get name() {
    return 'dropCursor' as const;
  }

  /**
   * The decoration set.
   */
  #decorationSet = DecorationSet.empty;

  /**
   * The elements attached.
   */
  #elements?: CursorElements = undefined;

  /**
   * The current derived target position. This is cached to help prevent
   * unnecessary re-rendering.
   */
  #target?: number;

  /**
   * The currently active timeout.
   */
  #timeout?: number;

  get isDragging(): boolean {
    return (
      !!this.store.view.dragging ??
      (this.#decorationSet !== DecorationSet.empty || isUndefined(this.#target))
    );
  }

  /**
   * Set up the handlers once the view is available.
   */
  onView(view: EditorView): Dispose | void {
    const element = view.dom;

    if (!isElementDomNode(element)) {
      return;
    }

    const handlers = {
      dragover: this.dragover.bind(this),
      dragend: this.dragend.bind(this),
      drop: this.drop.bind(this),
      dragleave: this.dragleave.bind(this),
    };

    if (this.options.throttle > 0) {
      handlers.dragover = throttle(this.options.throttle, this.dragover.bind(this));
    }

    element.addEventListener('dragover', handlers.dragover);
    element.addEventListener('dragend', handlers.dragend);
    element.addEventListener('drop', handlers.drop);
    element.addEventListener('dragleave', handlers.dragleave);

    return () => {
      // Remove the event handlers.
      for (const [event, handler] of entries(handlers)) {
        element.removeEventListener(event, handler);
      }
    };
  }

  /**
   * Update the elements if an active cursor is present while the state is
   * updating.
   */
  onStateUpdate(parameter: StateUpdateLifecycleParameter): void {
    const { previousState, state } = parameter;

    if (isNumber(this.#target) && !state.doc.eq(previousState.doc)) {
      // Update the cursor when the cursor is active and the doc has changed.
      // This takes care of updates that might be happening while dragging
      // content over the editor.
      // this.updateCursor(state.doc.resolve(this.#target));
    }
  }

  createDecorations(): DecorationSet {
    return this.#decorationSet;
  }

  /**
   * Removes the decoration and (by default) the current target value.
   */
  private removeDecorationSet(ignoreTarget = false) {
    if (!ignoreTarget) {
      this.#target = undefined;
    }

    this.#decorationSet = DecorationSet.empty;
    this.store.commands.updateDecorations();
  }

  /**
   * Removes the drop cursor decoration from the view after the set timeout.
   *
   * Sometimes the drag events don't automatically trigger so it's important to
   * have this cleanup in place.
   */
  private scheduleRemoval(timeout: number, ignoreTarget = false) {
    if (this.#timeout) {
      clearTimeout(this.#timeout);
    }

    this.#timeout = setTimeout(() => {
      this.removeDecorationSet(ignoreTarget);
    }, timeout) as any;
  }

  /**
   * Update the decoration set with a new position.
   */
  private updateDecorationSet() {
    const { view, commands } = this.store;
    const { blockClass, inlineClass } = this.options;

    if (!this.#target) {
      return;
    }

    if (!this.#elements) {
      this.#elements = this.options.createCursorElement({ blockClass, inlineClass, view });
    }

    const { block, inline } = this.#elements;

    const {
      state: { doc },
    } = view;
    const $pos = doc.resolve(this.#target);
    const cursorIsInline = $pos.parent.inlineContent;

    // Create the relevant decorations
    const decorations = cursorIsInline
      ? this.createInlineDecoration($pos, inline)
      : this.createBlockDecoration($pos, block);

    // Update the decoration set.
    this.#decorationSet = DecorationSet.create(doc, decorations);

    // Update all decorations.
    commands.updateDecorations();
  }

  /**
   * Called on every dragover event.
   *
   * Captures the current position and whether
   */
  private dragover(event: DragEvent) {
    const { view } = this.store;

    if (!view.editable) {
      return;
    }

    const positionAtCoords = view.posAtCoords({
      left: event.clientX,
      top: event.clientY,
    });

    if (!positionAtCoords) {
      return;
    }

    const { pos } = positionAtCoords;

    const { dragging, state } = view;
    const { doc, schema } = state;

    const target = dragging?.slice
      ? dropPoint(doc, pos, dragging.slice) ?? pos
      : insertPoint(doc, pos, schema.nodes.image) ?? pos;

    if (target === this.#target) {
      // This line resets the timeout.
      this.scheduleRemoval(DEFAULT_TIMEOUT);
      return;
    }

    this.#target = target;
    this.updateDecorationSet();
    this.scheduleRemoval(DEFAULT_TIMEOUT);
  }

  /**
   * Called when the drag ends.
   *
   * ? Sometimes this event doesn't fire, is there a way to prevent this.
   */
  private dragend(_: DragEvent) {
    this.scheduleRemoval(50);
  }

  /**
   * Called when the element is dropped.
   *
   * ? Sometimes this event doesn't fire, is there a way to prevent this.
   */
  private drop(_: DragEvent) {
    this.scheduleRemoval(DEFAULT_TIMEOUT);
  }

  /**
   * Called when the drag leaves the boundaries of the prosemirror editor dom
   * node.
   */
  private dragleave(event: DragEvent) {
    const { view } = this.store;

    if (
      event.target === view.dom ||
      (isDomNode(event.relatedTarget) && !view.dom.contains(event.relatedTarget))
    ) {
      this.scheduleRemoval(DEFAULT_TIMEOUT);
    }
  }

  /**
   * Create an inline decoration for the document which is rendered when the
   * cursor position is within a text block.
   */
  private createInlineDecoration($pos: ResolvedPos, element: HTMLElement): Decoration[] {
    const { containerClass } = this.options;
    const decorations: Decoration[] = [];

    const dropCursor = Decoration.widget($pos.pos, element, { key: INLINE_KEY });
    decorations.push(dropCursor);

    const container = findParentNode({
      selection: $pos,
      predicate: (node) => node.type.isBlock || node.type.isTextblock,
    });

    if (container) {
      const { pos, end } = container;
      const containerDecoration = Decoration.node(pos, end, { class: containerClass });
      decorations.push(containerDecoration);
    }

    return decorations;
  }

  /**
   * Create a block decoration for the document which is rendered when the
   * cursor position is between two nodes.
   */
  private createBlockDecoration($pos: ResolvedPos, element: HTMLElement): Decoration[] {
    const { beforeClass, afterClass } = this.options;
    const decorations: Decoration[] = [];

    // Create the cursor decoration.
    const dropCursor = Decoration.widget($pos.pos, element, { key: BLOCK_KEY });
    const before = findPositionOfNodeBefore($pos);
    const after = findPositionOfNodeAfter($pos);
    decorations.push(dropCursor);

    if (before) {
      const { pos, end } = before;
      const beforeDecoration = Decoration.node(pos, end, { class: beforeClass });
      decorations.push(beforeDecoration);
    }

    if (after) {
      const { pos, end } = after;
      const afterDecoration = Decoration.node(pos, end, { class: afterClass });
      decorations.push(afterDecoration);
    }

    return decorations;
  }
}

/**
 * The default cursor element creator.
 */
function createCursorElement(parameter: CursorElementsParameter): CursorElements {
  const { blockClass, inlineClass } = parameter;
  const inline = document.createElement('span');
  const block = document.createElement('div');

  inline.classList.add(inlineClass);
  block.classList.add(blockClass);

  return { inline, block };
}

export interface CursorElementsParameter {
  view: EditorView;
  inlineClass: string;
  blockClass: string;
}

export interface CursorElements {
  /**
   * The element to use for inline content. When the drag target points to a
   * textBlock. The inline element is absolutely positioned.
   */
  inline: HTMLElement;

  /**
   * The element to use for block content. This is the case when the target sits
   * between two nodes. The block element will be appended to the editor dom.
   */
  block: HTMLElement;
}

type CustomEventMap = Pick<DocumentEventMap, 'dragover' | 'dragend' | 'drop' | 'dragleave'>;

declare global {
  namespace Remirror {
    interface AllExtensions {
      dropCursor: DropCursorExtension;
    }
  }
}
