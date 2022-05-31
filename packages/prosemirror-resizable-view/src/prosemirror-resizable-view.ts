import { Node as ProsemirrorNode } from 'prosemirror-model';
import { EditorView, NodeView } from 'prosemirror-view';
import { throttle } from '@remirror/core-helpers';
import { setStyle } from '@remirror/core-utils';

import { ResizableHandle, ResizableHandleType } from './resizable-view-handle';

const MIN_WIDTH = 50;

export enum ResizableRatioType {
  Fixed,
  Flexible,
}

interface OptionShape {
  [key: string]: any;
}
/**
 * ResizableNodeView serves as a base NodeView for resizable element,
 * and cannot be directly instantiated.
 * With this base NodeView, you can resize the DOM element by dragging the handle over the image.
 *
 * @param node - the node which uses this nodeView. Must have `width` and `height` in the attrs.
 * @param view - the editor view used by this nodeView.
 * @param getPos - a utility method to get the absolute cursor position of the node.
 * @param aspectRatio? - to determine which type of aspect ratio should be used.
 * @param options? - extra options to pass to `createElement` method.
 * @param initialSize? - initial view size.
 */
export abstract class ResizableNodeView implements NodeView {
  dom: HTMLElement;
  #element: HTMLElement;
  #node: ProsemirrorNode;
  #destroyList: Array<() => void> = [];
  readonly aspectRatio: ResizableRatioType;

  // cache the current element's size so that we can compare with new node's
  // size when `update` method is called.
  #width: number | undefined = undefined;
  #height: number | undefined = undefined;

  constructor({
    node,
    view,
    getPos,
    aspectRatio = ResizableRatioType.Fixed,
    options,
    initialSize,
  }: {
    node: ProsemirrorNode;
    view: EditorView;
    getPos: () => number;
    aspectRatio?: ResizableRatioType;
    options?: OptionShape;
    initialSize?: { width: number; height: number };
  }) {
    const outer = this.createWrapper(node, initialSize);
    const element = this.createElement({ node, view, getPos, options });

    /**
     * Only initialize `handleBottom`, `handleBottomRight`, and `handleBottomLeft` in
     * `ResizableRatioType.Flexible` mode
     */
    const types =
      aspectRatio === ResizableRatioType.Flexible
        ? [
            ResizableHandleType.Right,
            ResizableHandleType.Left,
            ResizableHandleType.Bottom,
            ResizableHandleType.BottomRight,
            ResizableHandleType.BottomLeft,
          ]
        : [ResizableHandleType.Right, ResizableHandleType.Left];

    const handles = types.map((type) => new ResizableHandle(type));

    for (const handle of handles) {
      const onMouseDown = (e: MouseEvent) => {
        this.startResizing(e, view, getPos, handle);
      };
      handle.dom.addEventListener('mousedown', onMouseDown);
      this.#destroyList.push(() => handle.dom.removeEventListener('mousedown', onMouseDown));
      outer.append(handle.dom);
    }

    const setHandleVisibe = () => {
      handles.forEach((handle) => handle.setHandleVisibility(true));
    };
    const setHandleInvisible = () => {
      handles.forEach((handle) => handle.setHandleVisibility(false));
    };

    outer.addEventListener('mouseover', setHandleVisibe);
    outer.addEventListener('mouseout', setHandleInvisible);
    this.#destroyList.push(
      () => outer.removeEventListener('mouseover', setHandleVisibe),
      () => outer.removeEventListener('mouseout', setHandleInvisible),
    );

    outer.append(element);

    this.dom = outer;
    this.#node = node;
    this.#element = element;
    this.aspectRatio = aspectRatio;
  }

  /**
   * `createElement` - a method to produce the element DOM element for this prosemirror node.
   * The subclasses have to implement this abstract method.
   */
  abstract createElement(props: {
    node: ProsemirrorNode;
    view: EditorView;
    getPos: () => number;
    options?: OptionShape;
  }): HTMLElement;

  createWrapper(
    node: ProsemirrorNode,
    initialSize?: { width: number; height: number },
  ): HTMLElement {
    const outer = document.createElement('div');
    outer.classList.add('remirror-resizable-view');
    outer.style.position = 'relative';

    if (initialSize) {
      setStyle(outer, {
        width: normalizeSize(initialSize.width),
        aspectRatio: `${initialSize.width} / ${initialSize.height}`,
      });
    } else {
      setStyle(outer, {
        width: normalizeSize(node.attrs.width),
        aspectRatio: `${node.attrs.width} / ${node.attrs.height}`,
      });
    }

    setStyle(outer, {
      maxWidth: '100%',
      minWidth: `${MIN_WIDTH}px`,

      // By default, inline-block has "vertical-align: baseline", which makes
      // the outer wrapper slightly taller than the resizable view, which will
      // causes layout shift. So we need to set `vertical-align` to avoid this.
      verticalAlign: 'bottom',
      display: 'inline-block',

      // necessary so the bottom right handle is aligned nicely
      lineHeight: '0',

      // make sure transition time is larger then mousemove event's throttle time
      transition: 'width 0.15s ease-out, height 0.15s ease-out',
    });

    return outer;
  }

  startResizing(
    e: MouseEvent,
    view: EditorView,
    getPos: () => number,
    handle: ResizableHandle,
  ): void {
    e.preventDefault();
    handle.dataSetDragging(true);
    this.#element.style.pointerEvents = 'none';

    const startX = e.pageX;
    const startY = e.pageY;
    const startWidth = this.#element?.getBoundingClientRect().width || 0;
    const startHeight = this.#element?.getBoundingClientRect().height || 0;

    const onMouseMove = throttle(100, false, (e: MouseEvent) => {
      const currentX = e.pageX;
      const currentY = e.pageY;
      const diffX = currentX - startX;
      const diffY = currentY - startY;
      let newWidth: number | null = null;
      let newHeight: number | null = null;

      if (this.aspectRatio === ResizableRatioType.Fixed && startWidth && startHeight) {
        switch (handle.type) {
          case ResizableHandleType.Right:
          case ResizableHandleType.BottomRight:
            newWidth = startWidth + diffX;
            newHeight = (startHeight / startWidth) * newWidth;
            break;
          case ResizableHandleType.Left:
          case ResizableHandleType.BottomLeft:
            newWidth = startWidth - diffX;
            newHeight = (startHeight / startWidth) * newWidth;
            break;
          case ResizableHandleType.Bottom:
            newHeight = startHeight + diffY;
            newWidth = (startWidth / startHeight) * newHeight;
            break;
        }
      } else if (this.aspectRatio === ResizableRatioType.Flexible) {
        switch (handle.type) {
          case ResizableHandleType.Right:
            newWidth = startWidth + diffX;
            break;
          case ResizableHandleType.Left:
            newWidth = startWidth - diffX;
            break;
          case ResizableHandleType.Bottom:
            newHeight = startHeight + diffY;
            break;
          case ResizableHandleType.BottomRight:
            newWidth = startWidth + diffX;
            newHeight = startHeight + diffY;
            break;
          case ResizableHandleType.BottomLeft:
            newWidth = startWidth - diffX;
            newHeight = startHeight + diffY;
            break;
        }
      }

      if (typeof newWidth === 'number' && newWidth < MIN_WIDTH) {
        if (this.aspectRatio === ResizableRatioType.Fixed && startWidth && startHeight) {
          newWidth = MIN_WIDTH;
          newHeight = (startHeight / startWidth) * newWidth;
        } else if (this.aspectRatio === ResizableRatioType.Flexible) {
          newWidth = MIN_WIDTH;
        }
      }

      if (newWidth) {
        this.#width = Math.round(newWidth);
        this.dom.style.width = `${this.#width}px`;
      }

      if (newHeight) {
        this.#height = Math.round(newHeight);
      }

      if (newWidth || newHeight) {
        this.dom.style.aspectRatio = `${this.#width} / ${this.#height}`;
      }
    });

    const onMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      handle.dataSetDragging(false);
      handle.setHandleVisibility(false);
      this.#element.style.pointerEvents = 'auto';

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      const pos = getPos();
      const tr = view.state.tr.setNodeMarkup(pos, undefined, {
        ...this.#node.attrs,
        width: this.#width,
        height: this.#height,
      });

      view.dispatch(tr);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    this.#destroyList.push(() => document.removeEventListener('mousemove', onMouseMove));
    this.#destroyList.push(() => document.removeEventListener('mouseup', onMouseUp));
  }

  /**
   * `update` will be called by Prosemirror, when the view is updating itself.
   */
  update(node: ProsemirrorNode): boolean {
    if (node.type !== this.#node.type) {
      return false;
    }

    if (
      this.aspectRatio === ResizableRatioType.Fixed &&
      node.attrs.width &&
      node.attrs.width !== this.#width
    ) {
      return false;
    }

    if (
      this.aspectRatio === ResizableRatioType.Flexible &&
      node.attrs.width &&
      node.attrs.height &&
      node.attrs.width !== this.#width &&
      node.attrs.height !== this.#height
    ) {
      return false;
    }

    if (!isEqualWithoutAttrs(this.#node, node, ['width', 'height'])) {
      return false;
    }

    this.#node = node;

    this.#width = node.attrs.width;
    this.#height = node.attrs.height;

    return true;
  }

  destroy(): void {
    this.#destroyList.forEach((removeEventListener) => removeEventListener());
  }
}

// Check if two nodes are equal by ignore some attributes
function isEqualWithoutAttrs(
  node1: ProsemirrorNode,
  node2: ProsemirrorNode,
  ignoreAttrs: string[],
): boolean {
  return (
    node1 === node2 || (sameMarkup(node1, node2, ignoreAttrs) && node1.content.eq(node2.content))
  );
}

// Compare the markup (type, attributes, and marks) of one node to those of
// another. Returns `true` if both have the same markup except some attributes.
function sameMarkup(node1: ProsemirrorNode, node2: ProsemirrorNode, ignoreAttrs: string[]) {
  const node1Attrs = node1.attrs;
  const node2Attrs = node2.attrs;
  const deltaAttrs: Record<string, null> = {};

  for (const attr of ignoreAttrs) {
    deltaAttrs[attr] = null;
  }

  // @ts-expect-error: node should be immutable
  node1.attrs = { ...node1Attrs, ...deltaAttrs };
  // @ts-expect-error: node should be immutable
  node2.attrs = { ...node2Attrs, ...deltaAttrs };

  const same = node1.sameMarkup(node2);

  // @ts-expect-error: node should be immutable
  node1.attrs = node1Attrs;
  // @ts-expect-error: node should be immutable
  node2.attrs = node2Attrs;

  return same;
}

function normalizeSize(size: string | number | null | undefined): string | undefined {
  if (typeof size === 'number') {
    return `${size}px`;
  } else if (size) {
    return size;
  } else {
    return undefined;
  }
}
