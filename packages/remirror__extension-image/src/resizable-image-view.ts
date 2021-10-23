import { ResizableNodeView, ResizableRatioType } from 'prosemirror-resizable-view';
import { setStyle } from '@remirror/core';
import { EditorView, NodeView, ProsemirrorNode } from '@remirror/pm';

/**
 * ResizableImageView is a NodeView for image. You can resize the image by
 * dragging the handle over the image.
 */
export class ResizableImageView extends ResizableNodeView implements NodeView {
  constructor(node: ProsemirrorNode, view: EditorView, getPos: () => number) {
    super({ node, view, getPos, aspectRatio: ResizableRatioType.Fixed });
  }

  createElement({ node }: { node: ProsemirrorNode }): HTMLImageElement {
    const inner = document.createElement('img');

    inner.setAttribute('src', node.attrs.src);

    setStyle(inner, {
      width: '100%',
      minWidth: '50px',
      objectFit: 'contain', // maintain image's aspect ratio
    });

    return inner;
  }
}
