import { Node as ProsemirrorNode } from 'prosemirror-model';
import { EditorView, NodeView } from 'prosemirror-view';
import { isNumber, isString, throttle } from '@remirror/core-helpers';

type CreateElement = (props: {
  node: ProsemirrorNode;
  view: EditorView;
  getPos: () => number;
}) => HTMLElement;

/**
 * ResizableNodeView is a base NodeView for resizable element. You can resize the
 * DOM element by dragging the handle over the image.
 *
 * @param node - the node which uses this nodeView. Must have `width` and `height` in the attrs.
 * @param view - the editor view used by this nodeView.
 * @param getPos - a utility method to get the absolute cursor position of the node
 * @param createElement - a function to get the inner DOM element for this prosemirror node
 */
export class ResizableNodeView implements NodeView {
  dom: HTMLElement;
  readonly inner: HTMLElement;
  node: ProsemirrorNode;

  // cache the current element's size so that we can compare with new node's
  // size when `update` method is called.
  width = '';

  constructor({
    node,
    view,
    getPos,
    createElement,
  }: {
    node: ProsemirrorNode;
    view: EditorView;
    getPos: () => number;
    createElement: CreateElement;
  }) {
    const outer = document.createElement('div');
    outer.style.position = 'relative';
    outer.style.width = node.attrs.width;
    outer.style.maxWidth = '100%';
    outer.style.minWidth = '50px';
    outer.style.display = 'inline-block';
    outer.style.lineHeight = '0'; // necessary so the bottom right handle is aligned nicely
    outer.style.transition = 'width 0.15s ease-out, height 0.15s ease-out'; // make sure transition time is larger then mousemove event's throttle time

    const inner = createElement({ node, view, getPos });

    const handle = document.createElement('div');
    handle.style.position = 'absolute';
    handle.style.bottom = '0px';
    handle.style.right = '0px';
    handle.style.width = '16px';
    handle.style.height = '16px';
    handle.style.borderBottom = handle.style.borderRight = '4px solid #000';
    handle.style.display = 'none';
    handle.style.zIndex = '100';
    handle.style.cursor = 'nwse-resize';

    const setHandleDisplay = (visible?: true | string) => {
      visible = visible || handle.dataset.mouseover || handle.dataset.dragging;
      handle.style.display = visible ? '' : 'none';
    };

    outer.addEventListener('mouseover', () => {
      handle.dataset.mouseover = 'true';
      setHandleDisplay(true);
    });

    outer.addEventListener('mouseout', () => {
      handle.dataset.mouseover = '';
      setHandleDisplay();
    });

    handle.addEventListener('mousedown', (e: MouseEvent) => {
      e.preventDefault();

      handle.dataset.dragging = 'true';

      const startX = e.pageX;

      const startWidth = getWidthFromNode(this.node) || getSizeFromDom(inner)[0];

      const onMouseMove = throttle(100, false, (e: MouseEvent) => {
        const currentX = e.pageX;

        const diffX = currentX - startX;
        outer.style.width = `${startWidth + diffX}px`;
      });

      const onMouseUp = (e: MouseEvent) => {
        e.preventDefault();

        handle.dataset.dragging = '';
        setHandleDisplay();

        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        const transaction = view.state.tr.setNodeMarkup(getPos(), undefined, {
          src: node.attrs.src,
          width: outer.style.width,
        });

        this.width = outer.style.width;

        view.dispatch(transaction);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    outer.append(handle);
    outer.append(inner);

    this.dom = outer;
    this.inner = inner;
    this.node = node;
  }

  update(node: ProsemirrorNode): boolean {
    if (node.type !== this.node.type) {
      return false;
    }

    if (node.attrs.width && node.attrs.width !== this.width) {
      return false;
    }

    if (!isEqualWithoutAttrs(this.node, node, ['width'])) {
      return false;
    }

    node.attrs.width = this.node = node;
    this.width = node.attrs.width;

    this.inner.style.width = node.attrs.width;
    return true;
  }
}

function getWidthFromNode(node: ProsemirrorNode): number {
  const width = node.attrs.width;

  if (isNumber(width)) {
    return width;
  }

  if (isString(width)) {
    const w = width.match(/(\d+)px/)?.[0];

    if (w) {
      return Number.parseFloat(w);
    }
  }

  return 0;
}

function getSizeFromDom(element: HTMLElement | null): [number, number] {
  if (!element) {
    return [0, 0];
  }

  const rect = element.getBoundingClientRect();
  return [rect.width, rect.height];
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

  node1.attrs = { ...node1Attrs, ...deltaAttrs };
  node2.attrs = { ...node2Attrs, ...deltaAttrs };

  const same = node1.sameMarkup(node2);

  node1.attrs = node1Attrs;
  node2.attrs = node2Attrs;

  return same;
}
