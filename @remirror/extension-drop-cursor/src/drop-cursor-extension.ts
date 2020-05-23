import {
  bool,
  DefaultExtensionSettings,
  EditorView,
  findPositionOfNodeAfter,
  findPositionOfNodeBefore,
  isUndefined,
  pick,
  PlainExtension,
  PluginKey,
  ResolvedPos,
  throttle,
} from '@remirror/core';
import { Plugin } from '@remirror/pm/state';
import { dropPoint, insertPoint } from '@remirror/pm/transform';
import { Decoration, DecorationSet } from '@remirror/pm/view';

/**
 * A drop cursor plugin which adds a decoration at the active drop location. The
 * decoration has a class and can be styled however you want.
 */
export class DropCursorExtension extends PlainExtension<DropCursorSettings, DropCursorProperties> {
  public static defaultSettings: DefaultExtensionSettings<DropCursorSettings> = {
    inlineWidth: '2px',
    inlineSpacing: '10px',
    blockWidth: '100%',
    blockHeight: '10px',
    color: 'primary',
    blockClassName: 'remirror-drop-cursor-block',
    beforeBlockClassName: 'remirror-drop-cursor-before-block',
    afterBlockClassName: 'remirror-drop-cursor-after-block',
    inlineClassName: 'remirror-drop-cursor-inline',
    beforeInlineClassName: 'remirror-drop-cursor-before-inline',
    afterInlineClassName: 'remirror-drop-cursor-after-inline',
  };
  public static defaultProperties: Required<DropCursorProperties> = {
    onInit() {},
    onDestroy() {},
  };

  get name() {
    return 'dropCursor' as const;
  }

  public createHelpers = () => {
    return {
      /**
       * Check if the anything is currently being dragged over the editor.
       */
      isDragging: () => {
        return this.store.getPluginState<DropCursorState>(this.name).isDragging();
      },
    };
  };

  /**
   * Use the dropCursor plugin with provided options.
   */
  public createPlugin = (key: PluginKey) => {
    const dropCursorState = new DropCursorState(this);

    return new Plugin<DropCursorState>({
      key,
      view(editorView) {
        dropCursorState.init(editorView);
        return pick(dropCursorState, ['destroy']);
      },
      state: {
        init: () => dropCursorState,
        apply: () => dropCursorState,
      },
      props: {
        decorations: () => dropCursorState.decorationSet,
        handleDOMEvents: {
          dragover: (_, event) => {
            dropCursorState.dragover(event as DragEvent);
            return false;
          },
          dragend: () => {
            dropCursorState.dragend();
            return false;
          },
          drop: () => {
            dropCursorState.drop();
            return false;
          },
          dragleave: (_, event) => {
            dropCursorState.dragleave(event as DragEvent);
            return false;
          },
        },
      },
    });
  };
}

/**
 * This indicates whether the current cursor position is within a textblock or
 * between two nodes.
 */
export type DropCursorType = 'block' | 'inline';

export interface DropCursorProperties {
  /**
   * When the plugin is first initialized.
   */
  onInit: (parameter: {
    blockElement: HTMLElement;
    inlineElement: HTMLElement;
    extension: DropCursorExtension;
  }) => void;

  /**
   * Cleanup when the drop cursor plugin is destroyed. This happens when the
   * editor is unmounted.
   *
   * If you've attached a portal to the element then this is the place to handle
   * that.
   */
  onDestroy: (parameter: { blockElement: HTMLElement; inlineElement: HTMLElement }) => void;
}

export interface DropCursorSettings {
  /**
   * The main color of the component being rendered.
   *
   * This can be a named color from the theme such as `background`
   *
   * @defaultValue `primary`
   */
  color?: string;

  /**
   * The width of the inline drop cursor.
   *
   * @defaultValue '2px'
   */
  inlineWidth?: string | number;

  /**
   * The horizontal margin around the inline cursor.
   *
   * @defaultValue '10px'
   */
  inlineSpacing?: string | number;

  /**
   * The width of the block drop cursor.
   *
   * @defaultValue '100%'
   */
  blockWidth?: string | number;

  /**
   * The height of the block drop cursor.
   */
  blockHeight?: string | number;

  /**
   * The class name added to the block widget
   *
   * @defaultValue 'remirror-drop-cursor-block'
   */
  blockClassName?: string;

  /**
   * The class name added to the node that appears before the block drop cursor widget.
   *
   * @defaultValue 'remirror-drop-cursor-before-block'
   */
  beforeBlockClassName?: string;

  /**
   * The class name added to the node that appears after the block drop cursor widget.
   *
   * @defaultValue 'remirror-drop-cursor-after-block'
   */
  afterBlockClassName?: string;

  /**
   * The class name added to the inline drop cursor widget
   *
   * @defaultValue 'remirror-drop-cursor-inline'
   */
  inlineClassName?: string;

  /**
   * The class name added to the node that appears before the inline drop cursor widget.
   *
   * @defaultValue 'remirror-drop-cursor-before-inline'
   */
  beforeInlineClassName?: string;

  /**
   * The class name added to the node that appears after the inline drop cursor widget.
   *
   * @defaultValue 'remirror-drop-cursor-after-inline'
   */
  afterInlineClassName?: string;
}

class DropCursorState {
  /**
   * The set of all currently active decorations.
   */
  public decorationSet = DecorationSet.empty;

  /* eslint-disable @typescript-eslint/explicit-member-accessibility */
  readonly #extension: DropCursorExtension;

  /**
   * The currently active timeout. This is used when removing the drop cursor to prevent any flicker.
   */
  #timeout?: any;

  /**
   * The editor view.
   */
  #view!: EditorView;

  /**
   * The dom element which holds the block `Decoration.widget`.
   */
  #blockElement!: HTMLElement;

  /**
   * The dom element which holds the inline `Decoration.widget`.
   */
  #inlineElement!: HTMLElement;

  /**
   * The current derived target position. This is cached to help prevent unnecessary re-rendering.
   */
  #target?: number;

  /* eslint-enable @typescript-eslint/explicit-member-accessibility */

  constructor(extension: DropCursorExtension) {
    this.#extension = extension;
    this.dragover = throttle(50, this.dragover);
  }

  public init(view: EditorView) {
    const { blockClassName, inlineClassName } = this.#extension.settings;

    this.#view = view;
    this.#blockElement = document.createElement('div');
    this.#inlineElement = document.createElement('span');
    this.#blockElement.classList.add(blockClassName);
    this.#inlineElement.classList.add(inlineClassName);

    this.#extension.properties.onInit({
      blockElement: this.#blockElement,
      inlineElement: this.#inlineElement,
      extension: this.#extension,
    });
  }

  /**
   * Called when the view is destroyed
   */
  public destroy = () => {
    this.#extension.properties.onDestroy({
      blockElement: this.#blockElement,
      inlineElement: this.#inlineElement,
    });
  };

  /**
   * Check if the editor is currently being dragged around.
   */
  public isDragging = () =>
    bool(
      this.#view.dragging ??
        (this.decorationSet !== DecorationSet.empty || !isUndefined(this.#target)),
    );

  /**
   * Called on every dragover event.
   *
   * Captures the current position and whether
   */
  public dragover = (event: DragEvent) => {
    const pos = this.#view.posAtCoords({ left: event.clientX, top: event.clientY });

    if (pos) {
      const {
        dragging,
        state: { doc, schema },
      } = this.#view;

      const target = dragging?.slice
        ? dropPoint(doc, pos.pos, dragging.slice) ?? pos.pos
        : insertPoint(doc, pos.pos, schema.image) ?? pos.pos;

      if (target === this.#target) {
        // This line resets the timeout.
        this.scheduleRemoval(100);
        return;
      }

      this.#target = target;
      this.updateDecorationSet();
      this.scheduleRemoval(100);
    }
  };

  /**
   * Called when the drag ends.
   *
   * ? Sometimes this event doesn't fire, is there a way to prevent this.
   */
  public dragend = () => {
    this.scheduleRemoval(100);
  };

  /**
   * Called when the element is dropped.
   *
   * ? Sometimes this event doesn't fire, is there a way to prevent this.
   */
  public drop = () => {
    this.scheduleRemoval(100);
  };

  /**
   * Called when the drag leaves the boundaries of the prosemirror editor dom node.
   */
  public dragleave = (event: DragEvent) => {
    if (event.target === this.#view.dom || !this.#view.dom.contains(event.relatedTarget as Node)) {
      this.scheduleRemoval(100);
    }
  };

  /**
   * Dispatch an empty transaction to trigger a decoration update.
   */
  private readonly triggerDecorationSet = () => this.#view.dispatch(this.#view.state.tr);

  /**
   * Removes the decoration and (by default) the current target value.
   */
  private readonly removeDecorationSet = (ignoreTarget = false) => {
    if (!ignoreTarget) {
      this.#target = undefined;
    }

    this.decorationSet = DecorationSet.empty;
    this.triggerDecorationSet();
  };

  /**
   * Removes the drop cursor decoration from the view after the set timeout.
   *
   * Sometimes the drag events don't automatically trigger so it's important to have this cleanup in place.
   */
  private scheduleRemoval(timeout: number, ignoreTarget = false) {
    if (this.#timeout) {
      clearTimeout(this.#timeout);
    }

    this.#timeout = setTimeout(() => {
      this.removeDecorationSet(ignoreTarget);
    }, timeout);
  }

  /**
   * Update the decoration set with a new position.
   */
  private readonly updateDecorationSet = () => {
    if (!this.#target) {
      return;
    }

    const {
      state: { doc },
    } = this.#view;
    const $pos = doc.resolve(this.#target);
    const cursorIsInline = $pos.parent.inlineContent;

    this.decorationSet = DecorationSet.create(
      doc,
      cursorIsInline ? this.createInlineDecoration($pos) : this.createBlockDecoration($pos),
    );
    this.triggerDecorationSet();
  };

  /**
   * Create an inline decoration for the document which is rendered when the cursor position
   * is within a text block.
   */
  private createInlineDecoration($pos: ResolvedPos): Decoration[] {
    const dropCursor = Decoration.widget($pos.pos, this.#inlineElement, {
      key: 'drop-cursor-inline',
    });

    return [dropCursor];
  }

  /**
   * Create a block decoration for the document which is rendered when the cursor position
   * is between two nodes.
   */
  private createBlockDecoration($pos: ResolvedPos): Decoration[] {
    const { beforeBlockClassName, afterBlockClassName } = this.#extension.settings;
    const decorations: Decoration[] = [];

    const dropCursor = Decoration.widget($pos.pos, this.#blockElement, {
      key: 'drop-cursor-block',
    });
    const before = findPositionOfNodeBefore($pos);
    const after = findPositionOfNodeAfter($pos);
    decorations.push(dropCursor);

    if (before) {
      const beforeDecoration = Decoration.node(before.pos, before.end, {
        class: beforeBlockClassName,
      });
      decorations.push(beforeDecoration);
    }

    if (after) {
      const afterDecoration = Decoration.node(after.pos, after.end, {
        class: afterBlockClassName,
      });
      decorations.push(afterDecoration);
    }

    return decorations;
  }
}
