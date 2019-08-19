import {
  EditorView,
  Extension,
  ExtensionManagerParams,
  findPositionOfNodeAfter,
  findPositionOfNodeBefore,
  isUndefined,
  pick,
  ResolvedPos,
} from '@remirror/core';
import { PortalContainer } from '@remirror/react-portals';
import { Plugin } from 'prosemirror-state';
import { dropPoint, insertPoint } from 'prosemirror-transform';
import { Decoration, DecorationSet } from 'prosemirror-view';
import React, { ComponentType } from 'react';
import throttle from 'throttleit';
import { DropCursorComponent } from './drop-cursor-component';
import { DropCursorExtensionOptions } from './drop-cursor-types';

/**
 * Create a drop cursor plugin which adds a decoration to the position that is currently being dragged over.
 */
export function dropCursorPlugin(
  params: ExtensionManagerParams,
  extension: Extension<DropCursorExtensionOptions>,
) {
  const dropCursorState = new DropCursorState(params, extension);
  return new Plugin<DropCursorState>({
    key: extension.pluginKey,
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
}

export class DropCursorState {
  private portalContainer: PortalContainer;
  private extension: Extension<DropCursorExtensionOptions>;

  /**
   * The currently active timeout. This is used when removing the drop cursor to prevent any flicker.
   */
  private timeout?: any;

  /**
   * The editor view.
   */
  private view!: EditorView;

  /**
   * The dom element which holds the block `Decoration.widget`.
   */
  private blockElement!: HTMLElement;

  /**
   * The dom element which holds the inline `Decoration.widget`.
   */
  private inlineElement!: HTMLElement;

  /**
   * The current derived target position. This is cached to help prevent unnecessary re-rendering.
   */
  private target?: number;

  /**
   * The set of all currently active decorations.
   */
  public decorationSet = DecorationSet.empty;

  constructor({ portalContainer }: ExtensionManagerParams, extension: Extension<DropCursorExtensionOptions>) {
    this.portalContainer = portalContainer;
    this.extension = extension;
  }

  public init(view: EditorView) {
    const { blockClassName, inlineClassName } = this.extension.options;

    this.view = view;
    this.blockElement = document.createElement('div');
    this.inlineElement = document.createElement('span');
    this.blockElement.classList.add(blockClassName);
    this.inlineElement.classList.add(inlineClassName);
    this.attachComponentsToElements();
  }

  /**
   * Called when the view is destroyed
   */
  public destroy = () => {
    this.portalContainer.remove(this.blockElement);
  };

  /**
   * Check if the editor is currently being dragged around.
   */
  public isDragging = () =>
    this.view.dragging || this.decorationSet !== DecorationSet.empty || !isUndefined(this.target);

  /**
   * Attach the react components to drop cursor elements.
   */
  private attachComponentsToElements() {
    createDropPlaceholder({
      container: this.blockElement,
      portalContainer: this.portalContainer,
      Component: () => (
        <DropCursorComponent options={this.extension.options} type='block' container={this.blockElement} />
      ),
    });

    createDropPlaceholder({
      container: this.inlineElement,
      portalContainer: this.portalContainer,
      Component: () => (
        <DropCursorComponent options={this.extension.options} type='inline' container={this.inlineElement} />
      ),
    });
  }

  /**
   * Dispatch an empty transaction to trigger a decoration update.
   */
  private triggerDecorationSet = () => this.view.dispatch(this.view.state.tr);

  /**
   * Removes the decoration and (by default) the current target value.
   */
  private removeDecorationSet = (ignoreTarget = false) => {
    if (!ignoreTarget) {
      this.target = undefined;
    }

    this.decorationSet = DecorationSet.empty;
    this.triggerDecorationSet();
  };

  /**
   * Removes the drop cursor decoration from the view after the set timeout.
   *
   * Sometimes the drag events don't automatically trigger so it's important to have this cleanup in place
   */
  private scheduleRemoval(timeout: number, ignoreTarget = false) {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(() => {
      this.removeDecorationSet(ignoreTarget);
    }, timeout);
  }

  /**
   * Update the decoration set with a new position.
   */
  private updateDecorationSet = () => {
    if (!this.target) {
      return;
    }

    const {
      state: { doc },
    } = this.view;
    const $pos = doc.resolve(this.target);
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
    const decorations: Decoration[] = [];

    const dropCursor = Decoration.widget($pos.pos, this.inlineElement, { key: 'drop-cursor-inline' });
    decorations.push(dropCursor);

    return decorations;
  }
  /**
   * Create a block decoration for the document which is rendered when the cursor position
   * is between two nodes.
   */
  private createBlockDecoration($pos: ResolvedPos): Decoration[] {
    const { beforeBlockClassName, afterBlockClassName } = this.extension.options;
    const decorations: Decoration[] = [];

    const dropCursor = Decoration.widget($pos.pos, this.blockElement, { key: 'drop-cursor-block' });
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

  /**
   * Called on every dragover event.
   *
   * Captures the current position and whether
   */
  public dragover = throttle((event: DragEvent) => {
    const pos = this.view.posAtCoords({ left: event.clientX, top: event.clientY });

    if (pos) {
      const {
        dragging,
        state: { doc, schema },
      } = this.view;

      const target =
        dragging && dragging.slice
          ? dropPoint(doc, pos.pos, dragging.slice) || pos.pos
          : insertPoint(doc, pos.pos, schema.image) || pos.pos;

      if (target === this.target) {
        // This line resets the timeout.
        this.scheduleRemoval(100);
        return;
      }

      this.target = target;
      this.updateDecorationSet();
      this.scheduleRemoval(100);
    }
  }, 50);

  /**
   * Called when the drag ends. This can someimes be missed.
   */
  public dragend = () => {
    this.scheduleRemoval(100);
  };

  /**
   * Called when the element is dropped.
   */
  public drop = () => {
    this.scheduleRemoval(100);
  };

  /**
   * Called when the drag leaves the boundaries of the prosemirror editor dom node.
   */
  public dragleave = (event: DragEvent) => {
    if (event.target === this.view.dom || !this.view.dom.contains(event.relatedTarget as Node)) {
      this.scheduleRemoval(100);
    }
  };
}

interface CreateDropPlaceholderParams {
  portalContainer: PortalContainer;
  Component: ComponentType<{}>;
  container: HTMLElement;
}

const createDropPlaceholder = ({ portalContainer, Component, container }: CreateDropPlaceholderParams) => {
  portalContainer.render({ render: () => <Component />, container });
};
